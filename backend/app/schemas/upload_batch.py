import uuid
from datetime import datetime

from pydantic import BaseModel


class UploadResult(BaseModel):
    batch_id: uuid.UUID
    sensor_id: uuid.UUID
    file_name: str | None = None
    row_count: int
    skipped_count: int
    first_ts: datetime | None = None
    last_ts: datetime | None = None
