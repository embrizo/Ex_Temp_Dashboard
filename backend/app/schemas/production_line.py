import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductionLineBase(BaseModel):
    name: str
    description: str | None = None


class ProductionLineCreate(ProductionLineBase):
    pass


class ProductionLineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ProductionLineRead(ProductionLineBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    factory_id: uuid.UUID
    created_at: datetime
