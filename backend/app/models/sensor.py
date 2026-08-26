import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    machine_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    metric: Mapped[str] = mapped_column(String, nullable=False, default="temperature")
    unit: Mapped[str | None] = mapped_column(String, nullable=True, default="°C")
    high_threshold: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    low_threshold: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    machine: Mapped["Machine"] = relationship(back_populates="sensors")
    readings: Mapped[list["Reading"]] = relationship(back_populates="sensor", cascade="all, delete-orphan")
    upload_batches: Mapped[list["UploadBatch"]] = relationship(
        back_populates="sensor", cascade="all, delete-orphan"
    )
