from collections.abc import Generator

from sqlalchemy.orm import Session

from app.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_auth() -> None:
    """Placeholder auth dependency. No-op until Phase 9 (auth) is implemented."""
    return None
