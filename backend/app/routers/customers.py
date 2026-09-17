import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.utils import get_or_404

router = APIRouter(prefix="/customers", tags=["customers"], dependencies=[Depends(require_auth)])


@router.post("", response_model=CustomerRead, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.created_at).all()


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_or_404(db, Customer, customer_id, "Customer")


@router.patch("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: uuid.UUID, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = get_or_404(db, Customer, customer_id, "Customer")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    customer = get_or_404(db, Customer, customer_id, "Customer")
    db.delete(customer)
    db.commit()
