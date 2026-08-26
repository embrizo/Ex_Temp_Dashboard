import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.machine import Machine
from app.models.sensor import Sensor
from app.schemas.sensor import SensorCreate, SensorRead, SensorUpdate
from app.utils import get_or_404

router = APIRouter(tags=["sensors"], dependencies=[Depends(require_auth)])


@router.post("/machines/{machine_id}/sensors", response_model=SensorRead, status_code=201)
def create_sensor(machine_id: uuid.UUID, payload: SensorCreate, db: Session = Depends(get_db)):
    get_or_404(db, Machine, machine_id, "Machine")
    sensor = Sensor(machine_id=machine_id, **payload.model_dump())
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor


@router.get("/machines/{machine_id}/sensors", response_model=list[SensorRead])
def list_sensors(machine_id: uuid.UUID, db: Session = Depends(get_db)):
    get_or_404(db, Machine, machine_id, "Machine")
    return db.query(Sensor).filter(Sensor.machine_id == machine_id).order_by(Sensor.created_at).all()


@router.get("/sensors/{sensor_id}", response_model=SensorRead)
def get_sensor(sensor_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_or_404(db, Sensor, sensor_id, "Sensor")


@router.patch("/sensors/{sensor_id}", response_model=SensorRead)
def update_sensor(sensor_id: uuid.UUID, payload: SensorUpdate, db: Session = Depends(get_db)):
    sensor = get_or_404(db, Sensor, sensor_id, "Sensor")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sensor, field, value)
    db.commit()
    db.refresh(sensor)
    return sensor


@router.delete("/sensors/{sensor_id}", status_code=204)
def delete_sensor(sensor_id: uuid.UUID, db: Session = Depends(get_db)):
    sensor = get_or_404(db, Sensor, sensor_id, "Sensor")
    db.delete(sensor)
    db.commit()
