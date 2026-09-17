import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FactoryBase(BaseModel):
    name: str
    location: str | None = None


class FactoryCreate(FactoryBase):
    pass


class FactoryUpdate(BaseModel):
    name: str | None = None
    location: str | None = None


class FactoryRead(FactoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_id: uuid.UUID
    created_at: datetime
