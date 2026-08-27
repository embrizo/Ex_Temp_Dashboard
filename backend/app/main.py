from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.deps import get_db
from app.routers import customers, factories, lines, machines, readings, sensors

app = FastAPI(title="Sensor Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customers.router)
app.include_router(factories.router)
app.include_router(lines.router)
app.include_router(machines.router)
app.include_router(sensors.router)
app.include_router(readings.router)


@app.get("/")
def root():
    return {"service": "sensor-dashboard-api", "env": settings.app_env}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}
