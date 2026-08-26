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
  `/lines/{id}/machines`, `/machines/{id}/sensors`, plus `GET /sensors/{id}/readings`
  (read-only until CSV ingest lands in a later phase)

## Tests

```bash
pip install -r requirements-dev.txt
python -m pytest -v
```

Tests run against an in-memory SQLite database (dependency-overridden `get_db`), so
no Postgres instance is needed to run them. `alembic upgrade head` in CI separately
verifies the migration against a real Postgres service container.

## Layout

```
app/
  main.py       FastAPI app + CORS + router registration
  config.py     Settings (reads .env)
  database.py   SQLAlchemy engine/session/Base
  deps.py       get_db() dependency, auth placeholder
  utils.py      get_or_404() helper shared by routers
  models/       One SQLAlchemy model per table
  routers/      CRUD routers, one per hierarchy level, plus readings
  schemas/      Pydantic request/response models per entity
alembic/        Migrations (0001 creates the full initial schema)
tests/          pytest suite (in-memory SQLite, no Postgres required)
```
