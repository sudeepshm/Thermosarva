"""
app/main.py — Thermosarva FastAPI application factory.

Startup sequence:
  1. Configure structured logging
  2. Create SQLite/PostgreSQL tables
  3. Register CORS middleware
  4. Register global exception handlers
  5. Mount v1 API router
  6. Expose /health endpoint
"""
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import router as v1_router
from app.core.config import get_settings
from app.core.exceptions import ThermosarvaError
from app.core.logging import configure_logging, get_logger

settings = get_settings()
configure_logging(settings.environment)
logger = get_logger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info(
        "thermosarva_startup",
        version=settings.app_version,
        environment=settings.environment,
        fortyguard_mode="stub" if settings.fortyguard_stub_mode else "live",
        database=settings.database_url.split("://")[0],
    )

    # Create DB tables on startup (development / SQLite)
    try:
        from app.database.session import create_all_tables
        await create_all_tables()
        logger.info("database_tables_ready")
    except Exception as exc:
        logger.warning("database_init_failed", error=str(exc))

    yield

    logger.info("thermosarva_shutdown")


# ── App Factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Thermosarva — U.S. Environmental Intelligence API for food truck operators. "
            "Powered by FortyGuard hyperlocal thermal data."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info("cors_configured", origins=["*"])

    # ── Exception Handlers ────────────────────────────────────────────────────

    @app.exception_handler(ThermosarvaError)
    async def thermosarva_error_handler(request: Request, exc: ThermosarvaError) -> JSONResponse:
        logger.warning(
            "thermosarva_error",
            code=exc.error_code,
            message=exc.message,
            path=str(request.url),
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.to_dict()},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("unhandled_error", error=str(exc), path=str(request.url))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected server error occurred.",
                },
            },
        )

    # ── Health Endpoint ───────────────────────────────────────────────────────

    @app.get("/health", tags=["Health"])
    async def health() -> Dict[str, Any]:
        return {
            "status": "ok",
            "version": settings.app_version,
            "environment": settings.environment,
            "fortyguard_mode": "stub" if settings.fortyguard_stub_mode else "live",
            "supported_regions": ["United States"],
        }

    # ── API Router ────────────────────────────────────────────────────────────
    app.include_router(v1_router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development",
        log_level="info",
    )
