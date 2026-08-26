import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    sensor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Numeric, nullable=False)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    batch_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("upload_batches.id", ondelete="SET NULL"), nullable=True
    )

    sensor: Mapped["Sensor"] = relationship(back_populates="readings")
    batch: Mapped["UploadBatch | None"] = relationship(back_populates="readings")
