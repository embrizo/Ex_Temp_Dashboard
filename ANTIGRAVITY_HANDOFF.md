# ANTIGRAVITY_HANDOFF.md — DEMO Temperature Dashboard

**Last Updated:** 2026-08-27 10:21
**Workspace:** `Dashboard` (repo: `embrizo/Ex_Temp_Dashboard`)
**Tech Stack:** React 19 + Vite 8 + Tailwind v4 (frontend); FastAPI + SQLAlchemy + Alembic + Postgres (backend, in progress)

---

## 1. Project Goal & Overview

A dashboard for monitoring HVAC/sensor time-series data (temperature, air flow, etc.), originally a single-CSV-upload viewer for one factory line. The long-term goal (see `ImplementationPlan.md`) is to turn it into a **multi-tenant hierarchy**: Customer → Factory → Production Line → Machine → Sensor, each level addable/editable, backed by a real database, with an eventual LangGraph/LLM assistant layer. That target architecture is mid-implementation and **not yet merged to `main`**.

**⚠️ Read section 5 before touching this repo — there are currently two incompatible directions for "supporting multiple sensors" live in this repo, built by different tools, and nobody has reconciled them yet.**

---

## 2. Architecture & Key Components

There are three genuinely different pieces of work coexisting right now:

### A. `main` branch — original app (baseline, unmerged-PR-free)
Single-CSV-upload viewer. One global `DataContext` holds one parsed CSV's rows. Pages: Upload → Overview → Analysis → Heatmap → Alerts. No persistence, no multi-sensor concept. This is the actual current `main`.

### B. `docs/multi-tenant-implementation-plan` branch — client-side multi-sensor (built by another tool, currently what's live in production)
On top of `main` plus `ImplementationPlan.md`, another tool (not this Claude Code session) added a commit `cc683e0` — "Add Multi-Sensor support, AirFlow type, and CSV Templates tab" — authored under the repo owner's own git identity, likely via an external agent/tool (possibly Netlify's own "Run an agent on this branch" feature seen on a PR comment). This:
- Changes `DataContext` to hold an array of `sensors` (each with its own parsed rows, `type`: `'Temperature' | 'AirFlow'`, unit, stats) instead of one global dataset.
- Adds `HomePage.jsx` ("Sensors & Projects") — a card grid of uploaded sensors, add/remove.
- Adds `TemplatesPage.jsx` ("Example CSVs") — downloadable sample CSVs per sensor type.
- Still **entirely client-side**, still CSV-upload-driven, no backend, no real persistence (refresh = data gone).
- **This branch is what Netlify's production site (`https://demo-temperature.netlify.app/`) actually builds from** — Netlify's production branch is set to `docs/multi-tenant-implementation-plan`, not `main`. This was a surprise discovered mid-session, not a deliberate choice by this session.
- This branch is also the base of open [PR #1](https://github.com/embrizo/Ex_Temp_Dashboard/pull/1), which was opened to merge *only* `ImplementationPlan.md` into `main` — it now unintentionally also carries this multi-sensor feature commit.

### C. `feat/fastapi-backend-setup` + `feat/frontend-hierarchy-ui` branches — the actual planned architecture (built this session, unmerged)
This is the real implementation of `ImplementationPlan.md`'s hierarchy, built server-side:
- **Backend** (`backend/`, FastAPI + SQLAlchemy + Alembic + Postgres): full CRUD for `customers → factories → production_lines → machines → sensors → readings`. See `backend/README.md`. Open as [PR #2](https://github.com/embrizo/Ex_Temp_Dashboard/pull/2), branched from `main` (does **not** include the multi-sensor client-side work from branch B).
- **Frontend** (`src/services/`, `src/hooks/`, `src/components/hierarchy/`, `src/pages/hierarchy/`): a full Customer→Factory→Line→Machine→Sensor navigation UI wired to that API via `react-router-dom`. The original single-CSV app is preserved untouched behind `/legacy`. Open as [PR #3](https://github.com/embrizo/Ex_Temp_Dashboard/pull/3), branched from `main` (also does **not** include branch B's multi-sensor work).
- Sensors in this architecture have no data yet — CSV ingest into the `readings` table (Phase 5) and the LangGraph/LLM assistant (Phase 6) are still unbuilt. See `ImplementationPlan.md` section 10 for the full phase roadmap.

**The core conflict:** branches B and C both solve "handle more than one sensor," completely differently (in-browser array vs. server-side DB hierarchy), and neither knows the other exists. Merging both as-is would leave the app in a contradictory state.

---

## 3. Directory Layout & Key Files

```
Dashboard/
├── ImplementationPlan.md        # the target architecture (FastAPI + LangGraph, hierarchy)
├── TKMDashboard.md               # older, now-stale 3-page plan doc (predates ImplementationPlan.md)
├── src/
│   ├── App.jsx                   # router root (on feat/frontend-hierarchy-ui: hierarchy routes + /legacy)
│   ├── context/DataContext.jsx   # single-CSV on main; multi-sensor array on docs/... branch (diverged)
│   ├── pages/                    # legacy CSV pages: Upload, Overview, Analysis, Heatmap, Alerts
│   │   └── hierarchy/            # NEW (feat/frontend-hierarchy-ui only): Customers..SensorDetail pages
│   ├── components/hierarchy/     # NEW (feat/frontend-hierarchy-ui only): HierarchyListPage, EntityModal,
│   │                              #   ConfirmDialog, Breadcrumb, TopBar — one generic list UI reused per level
│   ├── services/                 # NEW (feat/frontend-hierarchy-ui only): fetch wrappers per entity + apiClient.js
│   ├── hooks/                    # NEW (feat/frontend-hierarchy-ui only): useApi + per-entity list/get hooks
│   └── styles/hierarchy.css      # NEW (feat/frontend-hierarchy-ui only)
├── backend/                      # NEW (feat/fastapi-backend-setup only): FastAPI app, does not exist on main
│   ├── app/
│   │   ├── main.py                # FastAPI app + CORS + router registration
│   │   ├── models/                # SQLAlchemy models: Customer, Factory, ProductionLine, Machine, Sensor, Reading, UploadBatch
│   │   ├── routers/                # CRUD routers, one per hierarchy level, plus readings (read-only)
│   │   └── schemas/                 # Pydantic request/response models
│   ├── alembic/versions/0001_initial_schema.py   # creates all 7 tables (Postgres-targeted)
│   └── tests/                    # pytest suite against in-memory SQLite (no Postgres needed to run it)
├── .github/workflows/backend-ci.yml   # runs on backend/** changes: pytest + real-Postgres migration check
└── csv_data/                     # sample CSVs (temperature format; one unrelated vibration/belt-speed sample)
```

---

## 4. Key Execution & Verification Commands

```bash
# Frontend (any branch)
npm install
npm run dev              # Vite dev server, http://localhost:5173
npm run build            # production build -> dist/

# Backend (only exists on feat/fastapi-backend-setup)
cd backend
python -m venv .venv && .venv/Scripts/activate      # Windows
pip install -r requirements-dev.txt
cp .env.example .env     # then point DATABASE_URL at a real Postgres for `alembic upgrade head`
alembic upgrade head     # applies 0001_initial_schema.py
uvicorn app.main:app --reload
python -m pytest -v      # runs against in-memory SQLite, no Postgres required

# Frontend <-> backend together (manual local check)
# set VITE_API_BASE_URL=http://localhost:8000 in a frontend .env
# .claude/launch.json already defines a "dev" config for `npm run dev` at port 5173
```

CI: `.github/workflows/backend-ci.yml` runs pytest + a real-Postgres-service-container migration check, scoped to `backend/**` changes only. There is no frontend CI beyond Netlify's own build check on PRs.

---

## 5. Current State & Known Invariants

- **Nothing is merged to `main` right now.** Three PRs are open: [#1](https://github.com/embrizo/Ex_Temp_Dashboard/pull/1) (docs, but see below), [#2](https://github.com/embrizo/Ex_Temp_Dashboard/pull/2) (backend), [#3](https://github.com/embrizo/Ex_Temp_Dashboard/pull/3) (frontend hierarchy UI).
- **PR #1 is contaminated**: it was meant to be `ImplementationPlan.md` only, but its branch (`docs/multi-tenant-implementation-plan`) has since had the multi-sensor/AirFlow commit (`cc683e0`) pushed onto it by another tool. Do not merge PR #1 assuming it's docs-only without addressing this.
- **Netlify's production branch is `docs/multi-tenant-implementation-plan`, not `main`** — this was discovered, not configured, by this session. Confirm this is intentional before relying on it; it means the live public URL currently shows work that was never reviewed as a PR into `main`.
- **PR #2 and #3 do not include branch B's multi-sensor/AirFlow work** — they were branched from `main` before that commit existed on the docs branch, and are unaware of it.
- **Backend requires a real Postgres to actually run** (SQLite works for the pytest suite and one-off manual checks via `Base.metadata.create_all()`, but the committed Alembic migration is Postgres-specific by design — see `ImplementationPlan.md` section 5 for why).
- **No auth anywhere yet** — by design, deferred to a later phase (see roadmap).
- **Invariant**: the hierarchy backend uses SQLAlchemy's generic `Uuid` type (not `postgresql.UUID`) specifically so tests can run against SQLite. Don't switch this back to a Postgres-specific type without also updating how tests get a DB.

---

## 6. Next Steps

- [ ] **Decide the multi-sensor direction (blocking)**: reconcile or choose between branch B (client-side multi-sensor + AirFlow, live in prod) and branch C (server-side DB hierarchy, PR #2/#3). This is a product decision, not a technical one — flag to the human before any merge.
- [ ] **Untangle PR #1**: decide whether to split the `ImplementationPlan.md` commit from the `cc683e0` feature commit before merging, or merge both deliberately.
- [ ] **Confirm Netlify's production branch setting** with the project owner — it currently does not point at `main`, which may not be intended.
- [ ] **Phase 4** (per `ImplementationPlan.md`): wire the existing Overview/Analysis/Heatmap/Alerts charts to real per-sensor `readings` from the FastAPI backend, once the direction above is settled.
- [ ] **Phase 5**: CSV ingest endpoint (`POST /sensors/{id}/upload`, pandas-based) so hierarchy sensors actually hold data.
- [ ] **Phase 6**: LangGraph agent + LLM assistant endpoint.
- [ ] **Deploy the backend somewhere real** (Render/Railway/Fly.io/VPS) with a provisioned Postgres, then point the frontend's `VITE_API_BASE_URL` at it.
