import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.reading import Reading
from app.models.sensor import Sensor
from app.schemas.reading import ReadingRead
from app.utils import get_or_404

router = APIRouter(tags=["readings"], dependencies=[Depends(require_auth)])


@router.get("/sensors/{sensor_id}/readings", response_model=list[ReadingRead])
def list_readings(
    sensor_id: uuid.UUID,
    from_ts: datetime | None = Query(None, alias="from"),
    to_ts: datetime | None = Query(None, alias="to"),
    limit: int = Query(5000, le=20000, gt=0),
    db: Session = Depends(get_db),
):
    get_or_404(db, Sensor, sensor_id, "Sensor")
    query = db.query(Reading).filter(Reading.sensor_id == sensor_id)
    if from_ts is not None:
        query = query.filter(Reading.ts >= from_ts)
    if to_ts is not None:
        query = query.filter(Reading.ts <= to_ts)
    return query.order_by(Reading.ts).limit(limit).all()
