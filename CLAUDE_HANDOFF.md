# CLAUDE_HANDOFF.md — DEMO Temperature Dashboard

**Last Updated:** 2026-08-27 10:21
**Workspace:** `Dashboard` (repo: `embrizo/Ex_Temp_Dashboard`)
**Primary Language/Runtime:** JavaScript (React 19 + Vite 8) frontend, Python (FastAPI) backend

---

## 1. Project Goal & Overview

Sensor-monitoring dashboard, evolving from a single-CSV viewer toward a multi-tenant hierarchy (Customer→Factory→Line→Machine→Sensor) per `ImplementationPlan.md`. **Full detail in `ANTIGRAVITY_HANDOFF.md` — read that first**, this file just orients a Claude Code session fast.

---

## 2. Architecture Summary

Three divergent lines of work exist right now, none merged to `main`:

- **`main`** — original single-CSV app. Baseline.
- **`docs/multi-tenant-implementation-plan`** (PR #1, live on Netlify prod) — client-side multi-sensor + AirFlow support, added by *another tool* (commit `cc683e0`), not by Claude Code. Purely in-browser, no backend.
- **`feat/fastapi-backend-setup`** (PR #2) + **`feat/frontend-hierarchy-ui`** (PR #3) — the actual `ImplementationPlan.md` architecture: FastAPI + Postgres backend (`backend/`) and a React hierarchy UI (`src/pages/hierarchy/`, `src/components/hierarchy/`, `src/services/`, `src/hooks/`), built this session.

These two "handle multiple sensors" approaches (docs-branch vs. fastapi-branches) are **incompatible and unreconciled**. Don't merge either assuming the other doesn't exist.

Key files if you need to go deeper:
- `backend/app/models/*.py` — the 7-table schema (customers→readings)
- `backend/app/routers/*.py` — CRUD per hierarchy level
- `src/components/hierarchy/HierarchyListPage.jsx` — the one shared list/add/edit/delete component every hierarchy page configures
- `src/App.jsx` (on `feat/frontend-hierarchy-ui`) — router root; legacy app lives at `/legacy`

---

## 3. Quick Run Commands

```bash
npm install && npm run dev              # frontend, :5173

cd backend
pip install -r requirements-dev.txt
alembic upgrade head                    # needs real Postgres in .env
uvicorn app.main:app --reload           # :8000
python -m pytest -v                     # no Postgres needed, uses in-memory SQLite
```

---

## 4. Key Decisions & Technical Notes

- SQLAlchemy models use the generic `sa.Uuid` type, not `postgresql.UUID` — deliberate, so the pytest suite can run against SQLite without a live Postgres. Alembic's migration still targets Postgres explicitly (that part is correct/unchanged).
- `EntityModal.jsx` omits blank optional fields from the payload entirely rather than sending `null` — some fields (e.g. `sensor.metric`) are non-nullable with only a server-side default, so an explicit `null` 422s. Omitting lets create fall back to the default and update leave the field unchanged.
- `apiClient.js` flattens FastAPI's two error shapes (string `detail` from `HTTPException`, array of `{loc,msg}` from a 422) into one message — don't revert to `throw new Error(detail)` directly, it prints `[object Object]` for validation errors.
- Netlify's production branch is currently `docs/multi-tenant-implementation-plan`, not `main` — found mid-session, not set deliberately by this work. Worth confirming with the user before assuming `main` is what's live.
- Backend CI (`.github/workflows/backend-ci.yml`) only triggers on `backend/**` changes — a frontend-only PR won't run it (Netlify's own build check is what covers those).

---

## 5. Next Steps / TODOs

- [ ] **Blocking**: decide/reconcile the two multi-sensor directions (docs-branch client-side vs. fastapi-branches server-side) before merging any of the 3 open PRs.
- [ ] Untangle PR #1 (docs commit + unrelated feature commit both on that branch).
- [ ] Confirm Netlify's production-branch setting with the user.
- [ ] Phase 4: wire legacy chart pages to real `readings` from the API.
- [ ] Phase 5: CSV ingest endpoint (`POST /sensors/{id}/upload`).
- [ ] Phase 6: LangGraph agent + LLM assistant endpoint.
- [ ] Deploy backend + Postgres somewhere real; set `VITE_API_BASE_URL` on Netlify.
