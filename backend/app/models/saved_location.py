"""
app/models/saved_location.py — SavedLocation model (bookmarked U.S. locations).
"""
import uuid

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class SavedLocation(Base, TimestampMixin):
    __tablename__ = "saved_locations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True
    )
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(String(512), nullable=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    state: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # Country always "US" — enforced by validator
    country: Mapped[str] = mapped_column(String(2), default="US", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    project: Mapped["Project | None"] = relationship(  # type: ignore[name-defined]
        "Project", back_populates="saved_locations"
    )

    def __repr__(self) -> str:
        return f"<SavedLocation id={self.id} lat={self.latitude} lon={self.longitude}>"
