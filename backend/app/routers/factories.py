import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.customer import Customer
from app.models.factory import Factory
from app.schemas.factory import FactoryCreate, FactoryRead, FactoryUpdate
from app.utils import get_or_404

router = APIRouter(tags=["factories"], dependencies=[Depends(require_auth)])


@router.post("/customers/{customer_id}/factories", response_model=FactoryRead, status_code=201)
def create_factory(customer_id: uuid.UUID, payload: FactoryCreate, db: Session = Depends(get_db)):
    get_or_404(db, Customer, customer_id, "Customer")
    factory = Factory(customer_id=customer_id, **payload.model_dump())
    db.add(factory)
    db.commit()
    db.refresh(factory)
    return factory


@router.get("/customers/{customer_id}/factories", response_model=list[FactoryRead])
def list_factories(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    get_or_404(db, Customer, customer_id, "Customer")
    return (
        db.query(Factory)
        .filter(Factory.customer_id == customer_id)
        .order_by(Factory.created_at)
        .all()
    )


@router.get("/factories/{factory_id}", response_model=FactoryRead)
def get_factory(factory_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_or_404(db, Factory, factory_id, "Factory")


@router.patch("/factories/{factory_id}", response_model=FactoryRead)
def update_factory(factory_id: uuid.UUID, payload: FactoryUpdate, db: Session = Depends(get_db)):
    factory = get_or_404(db, Factory, factory_id, "Factory")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(factory, field, value)
    db.commit()
    db.refresh(factory)
    return factory


@router.delete("/factories/{factory_id}", status_code=204)
def delete_factory(factory_id: uuid.UUID, db: Session = Depends(get_db)):
    factory = get_or_404(db, Factory, factory_id, "Factory")
    db.delete(factory)
    db.commit()
