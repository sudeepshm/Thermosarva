"""app/api/dependencies.py — Shared FastAPI dependencies."""
from app.database.session import get_db  # re-export for convenience

__all__ = ["get_db"]
