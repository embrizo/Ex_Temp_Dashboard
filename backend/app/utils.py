from fastapi import HTTPException
from sqlalchemy.orm import Session


def get_or_404(db: Session, model, id_, name: str):
    obj = db.get(model, id_)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{name} not found")
    return obj
