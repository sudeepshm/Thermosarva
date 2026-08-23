"""
app/api/v1/router.py — Master v1 API router.

Registers all feature routers under /api/v1.
"""
from fastapi import APIRouter

from app.api.v1 import alerts, analysis, locations, operations, projects, safety, thermal

router = APIRouter(prefix="/api/v1")

router.include_router(locations.router)
router.include_router(thermal.router)
router.include_router(operations.router)
router.include_router(safety.router)
router.include_router(alerts.router)
router.include_router(projects.router)
router.include_router(analysis.router)
