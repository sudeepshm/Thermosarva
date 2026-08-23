"""
app/api/v1/projects.py — Project CRUD routes (saved locations & analyses).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse)
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Create a new project."""
    from app.models.project import Project
    import uuid, datetime
    project = Project(
        id=str(uuid.uuid4()),
        name=body.name,
        description=body.description,
    )
    db.add(project)
    await db.flush()
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at.isoformat(),
    )


@router.get("/")
async def list_projects(db: AsyncSession = Depends(get_db)):
    """List all projects."""
    from sqlalchemy import select
    from app.models.project import Project
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    projects = result.scalars().all()
    return {
        "success": True,
        "data": [
            {"id": p.id, "name": p.name, "description": p.description,
             "created_at": p.created_at.isoformat()}
            for p in projects
        ],
    }
