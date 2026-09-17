import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MachineBase(BaseModel):
    name: str
    type: str | None = None


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    name: str | None = None
    type: str | None = None


class MachineRead(MachineBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    line_id: uuid.UUID
    created_at: datetime
