# Sensor Dashboard API (FastAPI)

FastAPI app, SQLAlchemy models, Alembic migrations, CORS, and CRUD routers for the
full hierarchy (customers → factories → production lines → machines → sensors → readings).
See `../ImplementationPlan.md` for the full architecture and roadmap.

## Setup

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # then edit DATABASE_URL to point at your Postgres
```

## Run migrations

```bash
alembic upgrade head
```

## Run the API

```bash
uvicorn app.main:app --reload
```

- `GET /` — service info
- `GET /health` — checks the database connection
- `GET /docs` — interactive OpenAPI docs
- CRUD for `/customers`, `/customers/{id}/factories`, `/factories/{id}/lines`,
  `/lines/{id}/machines`, `/machines/{id}/sensors`
- `GET /sensors/{id}/readings` — query readings (`from`/`to`/`limit`)
- `POST /sensors/{id}/upload` — upload a CSV (multipart `file`) of readings for that
  sensor. Needs a `TimeStamp` column and a value column (matched against the sensor's
  `metric`, falling back to `Temperature`/`AirFlow`/`Value`/`Reading`). An optional
  `Status` column is used as-is; otherwise status is computed from the sensor's
  `high_threshold`/`low_threshold`. Unparseable rows are skipped and counted in the
  response rather than failing the whole upload.
- `POST /assistant` — `{question, scope_sensor_id?}` -> `{answer}`. A LangGraph
  ReAct agent (Claude via `langchain-anthropic`) with four read-only tools
  (`list_customers`, `find_sensor`, `get_sensor_stats`, `list_alerts`) that let it
  look up real data before answering instead of guessing. Requires
  `ANTHROPIC_API_KEY` in `.env` - without it, the endpoint returns `503` rather than
  failing unpredictably. Everything else works fine with no key set.

## Tests

```bash
pip install -r requirements-dev.txt
python -m pytest -v
```

Tests run against an in-memory SQLite database (dependency-overridden `get_db`), so
no Postgres instance is needed to run them. `alembic upgrade head` in CI separately
verifies the migration against a real Postgres service container.

## Deploy (self-hosted with Docker, e.g. on a Raspberry Pi)

Runs Postgres and the API together via `docker-compose.yml` - no separate hosting
account needed.

```bash
cp .env.docker.example .env    # set a real POSTGRES_PASSWORD and your Netlify origin(s)
docker compose up -d --build
curl http://localhost:8000/health
```

`docker compose` reads `.env` automatically; it's gitignored, so the real password
never gets committed. The backend container runs `alembic upgrade head` before
starting `uvicorn` on every boot, so the schema is always current.

**Note:** the Dockerfile uses `python:3.11-slim`, which has official multi-arch
images including `linux/arm64` (Raspberry Pi 5), and every dependency in
`requirements.txt` ships prebuilt `manylinux`/`aarch64` wheels - so no compiler
should be needed. This hasn't been build-tested on real ARM hardware; if a package
fails to install with a compiler error, switch the base image to `python:3.11`
(not `-slim`) or `apt-get install -y gcc` in the Dockerfile before `pip install`.

### Exposing it to the internet (Cloudflare Tunnel)

Netlify needs a public URL for `VITE_API_BASE_URL` - your Pi likely isn't directly
reachable from the internet (no static IP / behind NAT), so use a tunnel instead of
port forwarding.

**Quick start (no domain, no Cloudflare account needed):**

```bash
# ARM64 (Raspberry Pi 5):
curl -L -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
chmod +x cloudflared
./cloudflared tunnel --url http://localhost:8000
```

This prints a random `https://<something>.trycloudflare.com` URL - set that as
`VITE_API_BASE_URL` in Netlify's environment variables and trigger a rebuild.
The URL changes every time this command restarts, so this is for testing, not a
lasting setup.

**Stable setup (once you have a domain added to Cloudflare):** create a *named*
tunnel instead (`cloudflared tunnel create sensor-dashboard-api`), route a subdomain
to it (`cloudflared tunnel route dns sensor-dashboard-api api.yourdomain.com`), and
run it as a service (`cloudflared service install`) so the URL never changes across
Pi reboots.

## Layout

```
app/
  main.py       FastAPI app + CORS + router registration
  config.py     Settings (reads .env)
  database.py   SQLAlchemy engine/session/Base
  deps.py       get_db() dependency, auth placeholder
  utils.py      get_or_404() helper shared by routers
  models/       One SQLAlchemy model per table
  routers/      CRUD routers, one per hierarchy level, plus readings/ingest/assistant
  schemas/      Pydantic request/response models per entity
  agent/        LangGraph agent: tools.py (DB-backed, read-only), llm.py (ChatAnthropic
                factory, returns None with no API key), graph.py (builds the ReAct agent)
alembic/        Migrations (0001 creates the full initial schema)
tests/          pytest suite (in-memory SQLite, no Postgres required)
```
