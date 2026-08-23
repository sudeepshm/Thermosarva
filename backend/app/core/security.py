"""
app/core/security.py — Security utilities for Thermosarva.

API key authentication stub for MVP. Extend for production auth.
"""
from typing import Optional

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_optional_api_key(
    api_key: Optional[str] = Security(api_key_header),
) -> Optional[str]:
    """Returns the API key if present. Does not enforce for MVP."""
    return api_key


async def require_api_key(
    api_key: Optional[str] = Security(api_key_header),
) -> str:
    """
    Enforces API key authentication in production.
    In development, this is a no-op.
    """
    settings = get_settings()
    if not settings.is_production:
        return "dev-bypass"

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required.",
        )

    if api_key != settings.secret_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )

    return api_key
