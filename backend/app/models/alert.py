"""
app/models/alert.py — Alert model (generated critical condition alerts).
"""
import uuid

from sqlalchemy import Float, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class Alert(Base, TimestampMixin):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    alert_type: Mapped[str] = mapped_column(String(64), nullable=False)
    # "CRITICAL" | "WARNING" | "INFO"
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    message: Mapped[str] = mapped_column(String(512), nullable=False)

    # Location where alert was triggered
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    address: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Environmental values that triggered this alert
    trigger_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ISO 8601 timestamp of when the condition was detected
    condition_timestamp: Mapped[str | None] = mapped_column(String(32), nullable=True)

    def __repr__(self) -> str:
        return f"<Alert id={self.id} type={self.alert_type} severity={self.severity}>"
