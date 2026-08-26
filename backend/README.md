# Sensor Dashboard API (FastAPI)

Phase 0 backend skeleton: FastAPI app, SQLAlchemy models, Alembic migrations, CORS.
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

## Layout

```
app/
  main.py       FastAPI app + CORS
  config.py     Settings (reads .env)
  database.py   SQLAlchemy engine/session/Base
  deps.py       get_db() dependency, auth placeholder
  models/       One SQLAlchemy model per table
  routers/      API routers (added in Phase 1)
  schemas/      Pydantic request/response models (added in Phase 1)
alembic/        Migrations (0001 creates the full initial schema)
```
