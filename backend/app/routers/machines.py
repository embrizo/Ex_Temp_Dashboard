import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.machine import Machine
from app.models.production_line import ProductionLine
from app.schemas.machine import MachineCreate, MachineRead, MachineUpdate
from app.utils import get_or_404

router = APIRouter(tags=["machines"], dependencies=[Depends(require_auth)])


@router.post("/lines/{line_id}/machines", response_model=MachineRead, status_code=201)
def create_machine(line_id: uuid.UUID, payload: MachineCreate, db: Session = Depends(get_db)):
    get_or_404(db, ProductionLine, line_id, "Production line")
    machine = Machine(line_id=line_id, **payload.model_dump())
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


@router.get("/lines/{line_id}/machines", response_model=list[MachineRead])
def list_machines(line_id: uuid.UUID, db: Session = Depends(get_db)):
    get_or_404(db, ProductionLine, line_id, "Production line")
    return db.query(Machine).filter(Machine.line_id == line_id).order_by(Machine.created_at).all()


@router.get("/machines/{machine_id}", response_model=MachineRead)
def get_machine(machine_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_or_404(db, Machine, machine_id, "Machine")


@router.patch("/machines/{machine_id}", response_model=MachineRead)
def update_machine(machine_id: uuid.UUID, payload: MachineUpdate, db: Session = Depends(get_db)):
    machine = get_or_404(db, Machine, machine_id, "Machine")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(machine, field, value)
    db.commit()
    db.refresh(machine)
    return machine


@router.delete("/machines/{machine_id}", status_code=204)
def delete_machine(machine_id: uuid.UUID, db: Session = Depends(get_db)):
    machine = get_or_404(db, Machine, machine_id, "Machine")
    db.delete(machine)
    db.commit()
