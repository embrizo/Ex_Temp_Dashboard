# Multi-Tenant HVAC / Sensor Dashboard — Implementation Plan

> Turning the current single-CSV temperature viewer into a hierarchical,
> multi-customer platform with an AI assistant:
> **Customer → Factory → Production Line → Machine → Sensor → Readings**,
> served by a **FastAPI + LangGraph (LLM) backend**.

---

## 1. Decisions (locked)

| Area | Decision |
|---|---|
| Storage | **Relational database (Postgres)** |
| Backend | **FastAPI (Python)** — REST API + **LangGraph agent** + **LLM** |
| AI layer | LangGraph agent that can call the DB, external APIs, and Python tools, then use an LLM to generate results |
| Data input | **CSV upload per sensor now**, designed so a **live feed** can be added per sensor later |
| Users / auth | **Single-user, no login for now** — auth is a placeholder in the request pipeline, wired later |
| Frontend | Keep **React 19 + Vite** (Netlify). Backend hosted separately |

---

## 2. The Hierarchy

```
Customer (e.g. LG, TKM)
  └─ Factory            (LG Rayong Plant, TKM Fac08 …)
       └─ Production Line  (Line 1, Assembly, Air-Wash Section …)
            └─ Machine       (Supply Fan K, Air Washer Unit 3 …)
                 └─ Sensor      (Temperature, Vibration, Belt Speed …)
                      └─ Readings  (time-series: timestamp, value, status)
```

Every level supports **Add / Rename / Delete**, and clicking an item drills into
the level below it. The leaf (**Sensor**) opens the dashboard views that already
exist today (Overview / Analysis / Heat Pattern / Alerts).

---

## 3. System Architecture

```
                        ┌───────────────────────────┐
                        │   React + Vite Frontend    │
                        │  (Netlify — static build)  │
                        └─────────────┬─────────────┘
                                      │  HTTPS (REST / JSON)
                                      │  + WebSocket (live/AI stream, later)
                                      ▼
                        ┌───────────────────────────┐
                        │          FastAPI           │
                        │  ┌─────────────────────┐   │
                        │  │  Auth (placeholder) │   │
                        │  ├─────────────────────┤   │
                        │  │  Validation         │   │  ← Pydantic schemas
                        │  ├─────────────────────┤   │
                        │  │  CRUD Routers       │   │  ← customers…sensors, readings
                        │  ├─────────────────────┤   │
                        │  │  CSV Ingest         │   │  ← pandas parse + bulk insert
                        │  ├─────────────────────┤   │
                        │  │  LangGraph Agent    │   │  ← AI assistant endpoint
                        │  └──────────┬──────────┘   │
                        └─────────────┼──────────────┘
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
      │   Postgres    │      │ External APIs │      │  Python Tools │
      │ (SQLAlchemy)  │      │  (optional)   │      │ (stats, calc) │
      └───────────────┘      └───────────────┘      └───────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │      LLM      │  ← Claude (Anthropic API)
                              │ (generate)    │
                              └───────────────┘
```

**Two ways the frontend talks to the backend:**
1. **Plain CRUD / charts** — normal REST calls to the routers (no LLM involved).
2. **AI assistant** — a request hits the **LangGraph agent**, which decides whether
   to query the database, call an external API, or run a Python tool, then feeds the
   result to the **LLM** to produce a natural-language answer / insight / report.

---

## 4. FastAPI Backend

### 4.1 Suggested project layout

```
backend/
  app/
    main.py                 # FastAPI app, CORS, router mounting
    config.py               # settings (DB URL, LLM key) via pydantic-settings / .env
    database.py             # SQLAlchemy engine + session
    models/                 # SQLAlchemy ORM models (one per table)
    schemas/                # Pydantic request/response models
    routers/
      customers.py          # CRUD
      factories.py
      lines.py
      machines.py
      sensors.py
      readings.py           # query by sensor+range; bulk insert
      ingest.py             # POST /sensors/{id}/upload  (CSV, multipart)
      assistant.py          # POST /assistant  → LangGraph agent
    agent/
      graph.py              # LangGraph state graph definition
      tools.py              # @tool functions: query_readings, get_stats, list_alerts…
      llm.py                # LLM client (Claude via Anthropic API)
    deps.py                 # shared dependencies (db session, auth placeholder)
  alembic/                  # migrations
  requirements.txt          # fastapi, uvicorn, sqlalchemy, alembic, psycopg,
                            # pandas, langgraph, langchain-anthropic, pydantic-settings
  .env                      # DATABASE_URL, ANTHROPIC_API_KEY, ALLOWED_ORIGINS
```

### 4.2 Key stack pieces

- **FastAPI + Uvicorn** — API server.
- **SQLAlchemy + Alembic** — ORM + schema migrations.
- **Pydantic** — request/response validation.
- **pandas** — server-side CSV parsing on ingest.
- **LangGraph + langchain-anthropic** — the agent + LLM binding.
- **LLM: Claude (Anthropic API)** — recommend **`claude-sonnet-5`** for the agent's
  reasoning/generation, and **`claude-haiku-4-5-20251001`** for cheap
  classification/routing steps. Key stored server-side only (never in the frontend).
- **CORS** must allow the Netlify origin(s).

### 4.3 Deployment note

FastAPI is **not** static — it needs a Python host (Render / Railway / Fly.io / a
VPS) plus a managed Postgres. The React app stays on Netlify and points at the
backend URL via a `VITE_API_BASE_URL` env var.

---

## 5. Database Schema (Postgres, via SQLAlchemy/Alembic)

```sql
-- Parent → child chain. ON DELETE CASCADE so deleting a factory
-- cleans up its lines/machines/sensors/readings.

create table customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

create table factories (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  name        text not null,
  location    text,
  created_at  timestamptz default now()
);

create table production_lines (
  id          uuid primary key default gen_random_uuid(),
  factory_id  uuid not null references factories(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

create table machines (
  id          uuid primary key default gen_random_uuid(),
  line_id     uuid not null references production_lines(id) on delete cascade,
  name        text not null,
  type        text,                    -- 'air_washer', 'fan', 'conveyor' …
  created_at  timestamptz default now()
);

create table sensors (
  id             uuid primary key default gen_random_uuid(),
  machine_id     uuid not null references machines(id) on delete cascade,
  name           text not null,
  metric         text not null default 'temperature', -- temperature | vibration | speed …
  unit           text default '°C',
  high_threshold numeric,              -- replaces the per-row "High" column
  low_threshold  numeric,              -- replaces the per-row "Low" column
  created_at     timestamptz default now()
);

-- High-volume time-series. One row per reading.
create table readings (
  id         bigserial primary key,
  sensor_id  uuid not null references sensors(id) on delete cascade,
  ts         timestamptz not null,
  value      numeric not null,
  status     text,                     -- NORMAL | HIGH | LOW (derived on ingest)
  batch_id   uuid                      -- which CSV upload this came from (nullable)
);

create index readings_sensor_ts_idx on readings (sensor_id, ts);

-- Track each CSV upload for audit / re-import / delete-by-batch
create table upload_batches (
  id          uuid primary key default gen_random_uuid(),
  sensor_id   uuid not null references sensors(id) on delete cascade,
  file_name   text,
  row_count   int,
  uploaded_at timestamptz default now()
);
```

**Notes**
- Thresholds move from *per-row* (today's `High`/`Low` CSV columns) to *per-sensor* config.
- `status` is computed at ingest time (`value > high → HIGH`, `< low → LOW`, else `NORMAL`).
- `readings` uses `bigserial` (not uuid) because it's high-volume and append-heavy.

---

## 6. Frontend Architecture

### 6.1 Routing (finally use `react-router-dom`, already installed)

```
/                                  → Customers list
/c/:customerId                     → Factories in that customer
/c/:customerId/f/:factoryId        → Production lines in that factory
/.../l/:lineId                     → Machines in that line
/.../m/:machineId                  → Sensors on that machine
/.../s/:sensorId                   → Sensor dashboard (Overview/Analysis/Heatmap/Alerts)
```

- **Breadcrumb bar**: `LG › Rayong Plant › Line 1 › Air Washer › Temp Sensor`.
- Each list page = cards/table of children + an **“+ Add”** button + per-item edit/delete.
- **AI Assistant panel** — a chat/ask box (global or per-sensor) that POSTs to
  `/assistant`; streams the LLM answer back (e.g. "why did Air Washer 3 spike yesterday?",
  "summarize this week's alerts", "which sensor has the most HIGH events?").

### 6.2 New folder layout (frontend)

```
src/
  services/            ← NEW: all backend access (FastAPI REST via fetch/axios)
    apiClient.js       ← base URL (VITE_API_BASE_URL) + error handling
    customers.js  factories.js  lines.js  machines.js  sensors.js  readings.js
    assistant.js       ← calls POST /assistant
  hooks/               ← useCustomers(), useFactories(id), useReadings(sensorId,range)…
  components/
    HierarchyList.jsx  ← generic reusable list-of-children card grid
    EntityModal.jsx    ← generic add/edit form modal
    Breadcrumb.jsx
    ConfirmDialog.jsx
    AssistantPanel.jsx ← NEW: AI chat UI
    CSVUploader.jsx    ← reuse (now uploads to POST /sensors/{id}/upload)
    Navbar.jsx         ← reuse, adapted
  pages/
    CustomersPage / FactoriesPage / LinesPage / MachinesPage / SensorsPage  (NEW)
    SensorDashboard.jsx← wraps the existing 4 views for one sensor
    OverviewPage / AnalysisPage / HeatmapPage / AlertsPage  ← reuse, fed from API
  context/
    DataContext.jsx    ← REPLACED: per-sensor data fetched via hooks, not one CSV
```

### 6.3 State / data flow

- Drop the "one global uploaded CSV" model; each list page fetches its children from the API.
- The **sensor dashboard** fetches `readings` for the selected sensor + range, then feeds
  the *existing* stats/chart code (the derived-stats logic in today's `DataContext` moves
  into a `useSensorStats(readings)` hook — reused almost verbatim).
- Keep the light/dark theme handling as-is.

---

## 7. CSV Ingestion (now) → Live Feed (later)

**Now (CSV per sensor):**
1. On a sensor page, user uploads a CSV → `POST /sensors/{id}/upload` (multipart).
2. FastAPI parses server-side with **pandas** (handles quoted headers, `="NORMAL"`
   artifacts, multiple timestamp formats — porting today's normalization logic).
3. Backend creates an `upload_batches` row, computes `status` per row against the
   sensor's thresholds, then **bulk-inserts** readings with the `batch_id`.
4. Sensor dashboard reads back via `GET /sensors/{id}/readings?from=…&to=…`.

**Later (live feed) — no schema change:**
- Same `readings` table; rows arrive via an ingestion endpoint / MQTT-to-FastAPI
  bridge / scheduled poller.
- Frontend swaps the one-shot fetch for a **WebSocket** (FastAPI `websocket` route)
  filtered by `sensor_id` → charts update live.
- Mixed sensor types (vibration, belt speed — like your `PredictiveQuality` sample)
  work via the `metric`/`unit`/threshold config on each sensor.

---

## 8. AI Assistant (LangGraph + LLM)

- **Endpoint:** `POST /assistant` `{ question, scope: {sensorId? / factoryId? …} }`.
- **LangGraph agent** decides the next step and can call **tools**:
  - `query_readings(sensor_id, range)` — pull time-series.
  - `get_stats(sensor_id, range)` — min/max/avg/stddev/alert counts.
  - `list_alerts(scope)` — HIGH/LOW events.
  - `list_hierarchy(scope)` — navigate customers→sensors.
  - (optional) `call_external_api(...)` — weather, maintenance system, etc.
- Tool results are passed to the **LLM (Claude)** to generate the final answer/report.
- **Streaming:** stream tokens back over WebSocket/SSE so the UI shows progress.
- **Safety:** LLM key lives only on the backend; agent tools are read-only by default
  (no destructive DB writes from the agent unless explicitly added later).

---

## 9. Migration From Today's App

1. The current app = "one anonymous sensor." Nothing is lost — the parse/stats/chart
   code is preserved and relocated (parsing moves server-side; stats/charts stay client-side).
2. Seed helper: "Import my old CSV" → creates a demo Customer/Factory/Line/Machine/Sensor
   and loads a `csv_data/` sample end-to-end.
3. `react-router-dom` moves from unused dependency to the navigation backbone.
4. Remove committed `dist/` from git (Netlify rebuilds it).

---

## 10. Phased Roadmap

| Phase | Deliverable | Notes |
|---|---|---|
| **0. Backend setup** | FastAPI skeleton, Postgres, SQLAlchemy models, Alembic migration, CORS, `.env` | ~1 day |
| **1. CRUD API** | Routers for customers→sensors + readings query; OpenAPI docs at `/docs` | Repetitive, quick |
| **2. Frontend data layer** | `services/*` + hooks against the API (test with dev DB) | Isolates backend |
| **3. Hierarchy UI** | Customers → Factories → Lines → Machines → Sensors list/add/edit/delete + breadcrumbs + routing | Core of the request |
| **4. Sensor dashboard** | Wire existing Overview/Analysis/Heatmap/Alerts to API readings | Heavy reuse |
| **5. CSV ingest** | `POST /sensors/{id}/upload` (pandas + bulk insert) wired to `CSVUploader` | |
| **6. AI assistant** | LangGraph agent + tools + `/assistant` endpoint + `AssistantPanel` UI | LLM layer |
| **7. Polish** | Empty states, delete confirmations, loading skeletons, error toasts | |
| **8. (Later) Live feed** | WebSocket ingestion + realtime charts | No schema change |
| **9. (Later) Auth** | Replace auth placeholder with real login; scope customers per account | |

---

## 11. Open Questions For Later

- **Deletes**: hard delete (cascade) vs soft delete (archive flag)? Plan assumes hard delete + confirm dialog.
- **Thresholds**: per-sensor only, or per-line/per-machine defaults that sensors inherit?
- **Metric types**: fixed list (temperature/vibration/speed) or free-form? Affects chart units.
- **AI scope**: should the assistant be able to write/modify data, or stay read-only?
- **Hosting**: preferred FastAPI host (Render / Railway / Fly.io / VPS) and Postgres provider?
- **When auth lands**: is a "Customer" the same as a login account, or can one account manage many customers?

---

## 12. Effort Snapshot (rough)

- The hierarchy CRUD is repetitive by design — one generic `HierarchyList` +
  `EntityModal` pair drives all five levels on the frontend, and the FastAPI routers
  follow one template per table.
- Heaviest effort: Phase 0 (backend + DB wiring), Phase 4 (reconnecting existing
  dashboards to the API), and Phase 6 (LangGraph agent + tools).
