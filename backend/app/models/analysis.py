"""
app/models/analysis.py — Analysis model (normalized analysis history).

Raw external API responses are cached in Redis, not stored here.
Only the normalized Thermosarva output is persisted.
"""
import uuid

from sqlalchemy import Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class Analysis(Base, TimestampMixin):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    analysis_type: Mapped[str] = mapped_column(
        String(64), nullable=False
    )  # e.g., "dashboard", "thermal", "safety"

    # Location context
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str | None] = mapped_column(String(512), nullable=True)
    analysis_date: Mapped[str | None] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    analysis_time: Mapped[str | None] = mapped_column(String(5), nullable=True)   # HH:MM

    # Normalized result payload — not raw external API data
    result_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Which external sources were unavailable during this analysis
    unavailable_sources: Mapped[list | None] = mapped_column(JSON, nullable=True)

    project: Mapped["Project | None"] = relationship(  # type: ignore[name-defined]
        "Project", back_populates="analyses"
    )

    def __repr__(self) -> str:
        return f"<Analysis id={self.id} type={self.analysis_type}>"
