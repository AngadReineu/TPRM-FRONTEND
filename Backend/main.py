from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

from app.database import engine, SessionLocal
from app.models import (
    User, Vendor, Agent, AgentTask, AgentLog, AgentTimeline,
    Control, RiskEvent, AuditLog, Document,
    Template, Organisation, Division, SupplierNode, SystemNode, OrgSettings,
)
from app.database import Base
from app.routers import (
    auth_router, vendors_router, agents_router, controls_router,
    risks_router, dashboard_router, audit_logs_router, documents_router,
    roles_router, templates_router, library_router, settings_router,
    portal_router,
)


from sqlalchemy import text
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    try:
        with SessionLocal() as db:
            db_name = db.execute(text("SELECT current_database();")).scalar()
            logging.info(f"")
            logging.info(f"====== DATABASE CONNECTION INFO ======")
            logging.info(f"1) Loaded .env URL: {settings.database_url}")
            logging.info(f"2) Actual Active DB: '{db_name}'")
            logging.info(f"======================================")
            logging.info(f"")
    except Exception as e:
        logging.error(f"Failed to check active database: {e}")
        
    yield


app = FastAPI(
    title="TPRM Backend API",
    description="Third-Party Risk Management platform backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

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
app.include_router(portal_router,     prefix=PREFIX)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "tprm-backend"}