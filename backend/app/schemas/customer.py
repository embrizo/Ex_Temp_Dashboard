import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CustomerBase(BaseModel):
    name: str


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
