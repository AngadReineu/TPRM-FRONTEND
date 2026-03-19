from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Agent(Base):
    __tablename__ = "agents"

    id            = Column(String, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    initials      = Column(String, nullable=False)
    status        = Column(String, default="idle")        # live | active | syncing | idle
    stage         = Column(String, default="Acquisition")
    controls      = Column(Integer, default=0)
    suppliers     = Column(Integer, default=0)
    gradient      = Column(String, nullable=True)
    alerts        = Column(Integer, default=0)
    last_active   = Column(String, default="just now")
    health        = Column(Integer, default=100)
    division      = Column(String, nullable=True)
    frequency     = Column(String, default="Daily")
    notify        = Column(JSON, default=[])              # list of role strings
    internal_spoc = Column(String, nullable=True)
    external_spoc = Column(String, nullable=True)
    truth_match   = Column(Integer, nullable=True)

    # Detail page fields
    role          = Column(String, nullable=True)
    color         = Column(String, nullable=True)
    avatar_seed   = Column(String, nullable=True)
    uptime        = Column(String, nullable=True)
    next_eval     = Column(String, nullable=True)
    last_scan     = Column(String, nullable=True)
    open_tasks    = Column(Integer, default=0)
    current_task  = Column(Text, nullable=True)
    alert_level   = Column(String, nullable=True)
    systems       = Column(JSON, default=[])              # list of system names
    supplier_list = Column(JSON, default=[])              # list of supplier names
    control_list  = Column(JSON, default=[])              # list of control names

    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())


class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id          = Column(String, primary_key=True, index=True)
    agent_id    = Column(String, ForeignKey("agents.id"), nullable=False, index=True)
    view        = Column(String, default="list")          # list | detail — which page shows it
    title       = Column(String, nullable=False)
    supplier    = Column(String, nullable=True)
    priority    = Column(String, default="Medium")        # High | Medium | Low
    assignee    = Column(String, nullable=True)
    status      = Column(String, default="Open")          # Open | In Progress | Resolved
    due_date    = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id          = Column(String, primary_key=True, index=True)
    agent_id    = Column(String, ForeignKey("agents.id"), nullable=False, index=True)
    view        = Column(String, default="detail")        # list | detail
    time        = Column(String, nullable=False)
    type        = Column(String, nullable=False)          # fetch | evaluate | reasoning | success | warning | action | decision | error
    message     = Column(Text, nullable=False)
    detail      = Column(Text, nullable=True)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class AgentTimeline(Base):
    __tablename__ = "agent_timeline"

    id          = Column(String, primary_key=True, index=True)
    agent_id    = Column(String, ForeignKey("agents.id"), nullable=False, index=True)
    view        = Column(String, default="detail")        # list | detail
    time        = Column(String, nullable=False)
    event       = Column(Text, nullable=False)
    status      = Column(String, default="info")          # alert | info | success | warning

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
