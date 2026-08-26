import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SensorBase(BaseModel):
    name: str
    metric: str = "temperature"
    unit: str | None = "°C"
    high_threshold: float | None = None
    low_threshold: float | None = None


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseModel):
    name: str | None = None
    metric: str | None = None
    unit: str | None = None
    high_threshold: float | None = None
    low_threshold: float | None = None


class SensorRead(SensorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    machine_id: uuid.UUID
    created_at: datetime
