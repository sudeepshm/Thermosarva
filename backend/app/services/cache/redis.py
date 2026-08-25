"""
app/services/cache/redis.py — Async Redis cache service with in-memory fallback.

Cache flow:
  Request → Redis → Found? → return cached
                           → Not found → External API → normalize → cache → return

When REDIS_FALLBACK_MEMORY=true (default), an in-memory dict is used
so the app runs without a Redis instance during local development.
"""
import asyncio
import json
from typing import Any, Dict, Optional

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── In-memory fallback ────────────────────────────────────────────────────────
_memory_cache: Dict[str, Any] = {}

# ── Redis client (lazy init) ──────────────────────────────────────────────────
_redis_client = None
_redis_available: Optional[bool] = None
_redis_lock = asyncio.Lock()


async def _get_redis():
    global _redis_client, _redis_available
    if _redis_available is False:
        return None
    if _redis_client is not None:
        return _redis_client
    async with _redis_lock:
        if _redis_available is False:
            return None
        if _redis_client is not None:
            return _redis_client
        settings = get_settings()
        try:
            import redis.asyncio as aioredis
            client = await aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=0.2,
                socket_timeout=0.2,
            )
            await client.ping()
            _redis_client = client
            _redis_available = True
            logger.info("redis_connected", url=settings.redis_url)
            return _redis_client
        except Exception as exc:
            logger.warning("redis_unavailable", error=str(exc), fallback="memory")
            _redis_client = None
            _redis_available = False
            return None


# ── Cache Key Builders ────────────────────────────────────────────────────────

def heatmap_key(lat: float, lon: float, date: str, time: str, granularity: str = "100m") -> str:
    return f"heatmap:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}:time:{time}:g:{granularity}"


def environment_key(lat: float, lon: float, date: str, time: str) -> str:
    return f"env:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}:time:{time}"


def forecast_key(lat: float, lon: float, date: str, time: str) -> str:
    return f"forecast:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}:time:{time}"


def pois_key(lat: float, lon: float, radius: int) -> str:
    return f"pois:lat:{lat:.4f}:lng:{lon:.4f}:radius:{radius}"


def satellite_key(lat: float, lon: float, date: str) -> str:
    return f"satellite:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}"


def streetview_key(lat: float, lon: float, date: str, time: str) -> str:
    return f"streetview:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}:time:{time}"


def nws_key(lat: float, lon: float) -> str:
    return f"nws:lat:{lat:.3f}:lng:{lon:.3f}"


def solar_key(lat: float, lon: float, date: str, time: str) -> str:
    return f"solar:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}:time:{time}"


def intelligence_key(lat: float, lon: float, date: str, time: str) -> str:
    return f"intel:lat:{lat:.4f}:lng:{lon:.4f}:date:{date}:time:{time}"


# ── Core Cache Operations ─────────────────────────────────────────────────────

async def get(key: str) -> Optional[Any]:
    """Retrieve cached value. Returns None on miss."""
    global _redis_client, _redis_available
    # Try Redis first
    redis = await _get_redis()
    if redis:
        try:
            raw = await redis.get(key)
            if raw is not None:
                logger.debug("cache_hit", key=key, store="redis")
                return json.loads(raw)
        except Exception as exc:
            logger.warning("redis_get_error", key=key, error=str(exc))
            _redis_available = False
            _redis_client = None

    # Fallback to memory cache
    if key in _memory_cache:
        logger.debug("cache_hit", key=key, store="memory")
        return _memory_cache[key]

    logger.debug("cache_miss", key=key)
    return None


async def set(key: str, value: Any, ttl_seconds: int = 900) -> None:
    """Store a value in cache with TTL."""
    global _redis_client, _redis_available
    serialized = json.dumps(value, default=str)

    redis = await _get_redis()
    if redis:
        try:
            await redis.set(key, serialized, ex=ttl_seconds)
            logger.debug("cache_set", key=key, ttl=ttl_seconds, store="redis")
            return
        except Exception as exc:
            logger.warning("redis_set_error", key=key, error=str(exc))
            _redis_available = False
            _redis_client = None

    # Fallback: in-memory (no TTL enforcement in memory — acceptable for dev)
    settings = get_settings()
    if settings.redis_fallback_memory:
        _memory_cache[key] = value
        logger.debug("cache_set", key=key, store="memory")


async def delete(key: str) -> None:
    """Invalidate a cache entry."""
    redis = await _get_redis()
    if redis:
        try:
            await redis.delete(key)
        except Exception:
            pass
    _memory_cache.pop(key, None)


async def get_or_fetch(key: str, fetch_fn, ttl_seconds: int = 900) -> Any:
    """
    Cache-aside helper:
      1. Check cache
      2. If miss: call fetch_fn(), cache result, return
    """
    cached = await get(key)
    if cached is not None:
        return cached

    result = await fetch_fn()
    await set(key, result, ttl_seconds)
    return result
