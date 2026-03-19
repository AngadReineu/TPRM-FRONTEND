from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import engine, SessionLocal
from app.models import (
    User, Vendor, Agent, AgentTask, AgentLog, AgentTimeline,
    Control, RiskEvent, RiskAction, AuditLog, Document,
    Template, Organisation, Division, SupplierNode, SystemNode, OrgSettings,
)
from app.database import Base
from app.seed import seed_all
from app.routers import (
    auth_router, vendors_router, agents_router, controls_router,
    risks_router, dashboard_router, audit_logs_router, documents_router,
    roles_router, templates_router, library_router, settings_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables that don't exist yet
    Base.metadata.create_all(bind=engine)

    # Seed mock data on first run
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()

    yield  # app is running

    # Shutdown — nothing to clean up for now


app = FastAPI(
    title="TPRM Backend API",
    description="Third-Party Risk Management platform backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS — allow the Vite dev server ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://localhost:5174",   # Vite alternate port
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount uploads so documents can be served statically ───
os.makedirs("app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

# ── Register all routers under /api prefix ─────────────────
PREFIX = "/api"

app.include_router(auth_router,       prefix=PREFIX)
app.include_router(vendors_router,    prefix=PREFIX)
app.include_router(agents_router,     prefix=PREFIX)
app.include_router(controls_router,   prefix=PREFIX)
app.include_router(risks_router,      prefix=PREFIX)
app.include_router(dashboard_router,  prefix=PREFIX)
app.include_router(audit_logs_router, prefix=PREFIX)
app.include_router(documents_router,  prefix=PREFIX)
app.include_router(roles_router,      prefix=PREFIX)
app.include_router(templates_router,  prefix=PREFIX)
app.include_router(library_router,    prefix=PREFIX)
app.include_router(settings_router,   prefix=PREFIX)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "tprm-backend"}
