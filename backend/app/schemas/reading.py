import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReadingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sensor_id: uuid.UUID
    ts: datetime
    value: float
    status: str | None = None
    batch_id: uuid.UUID | None = None
