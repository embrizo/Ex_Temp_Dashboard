import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.factory import Factory
from app.models.production_line import ProductionLine
from app.schemas.production_line import ProductionLineCreate, ProductionLineRead, ProductionLineUpdate
from app.utils import get_or_404

router = APIRouter(tags=["lines"], dependencies=[Depends(require_auth)])


@router.post("/factories/{factory_id}/lines", response_model=ProductionLineRead, status_code=201)
def create_line(factory_id: uuid.UUID, payload: ProductionLineCreate, db: Session = Depends(get_db)):
    get_or_404(db, Factory, factory_id, "Factory")
    line = ProductionLine(factory_id=factory_id, **payload.model_dump())
    db.add(line)
    db.commit()
    db.refresh(line)
    return line


@router.get("/factories/{factory_id}/lines", response_model=list[ProductionLineRead])
def list_lines(factory_id: uuid.UUID, db: Session = Depends(get_db)):
    get_or_404(db, Factory, factory_id, "Factory")
    return (
        db.query(ProductionLine)
        .filter(ProductionLine.factory_id == factory_id)
        .order_by(ProductionLine.created_at)
        .all()
    )


@router.get("/lines/{line_id}", response_model=ProductionLineRead)
def get_line(line_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_or_404(db, ProductionLine, line_id, "Production line")


@router.patch("/lines/{line_id}", response_model=ProductionLineRead)
def update_line(line_id: uuid.UUID, payload: ProductionLineUpdate, db: Session = Depends(get_db)):
    line = get_or_404(db, ProductionLine, line_id, "Production line")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(line, field, value)
    db.commit()
    db.refresh(line)
    return line


@router.delete("/lines/{line_id}", status_code=204)
def delete_line(line_id: uuid.UUID, db: Session = Depends(get_db)):
    line = get_or_404(db, ProductionLine, line_id, "Production line")
    db.delete(line)
    db.commit()
