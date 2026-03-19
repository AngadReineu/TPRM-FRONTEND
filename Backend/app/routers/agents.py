from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.agent import Agent, AgentTask, AgentLog, AgentTimeline
from ..models.user import User
from ..schemas.agent import AgentResponse, AgentCreate, AgentUpdate, AgentTaskResponse, AgentLogResponse, AgentTimelineResponse
from ..dependencies import get_current_user
from ..services.agent_stream import stream_agent_logs

router = APIRouter(prefix="/agents", tags=["agents"])


# ── Agent list & detail ────────────────────────────────────

@router.get("", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Agent).order_by(Agent.name).all()


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Generate initials if not provided
    initials = payload.initials
    if not initials and payload.name:
        initials = payload.name.strip()[:2].upper()

    agent = Agent(
        id=str(uuid.uuid4()),
        name=payload.name,
        initials=initials,
        status=payload.status,
        stage=payload.stage,
        controls=payload.controls,
        suppliers=payload.suppliers,
        gradient=payload.gradient,
        alerts=payload.alerts,
        last_active="just now",
        health=100,
        division=payload.division,
        frequency=payload.frequency,
        notify=payload.notify,
        role="Custom Agent",
        color="#0EA5E9",
        avatar_seed=payload.name,
        uptime="100%",
        next_eval="—",
        last_scan="—",
        open_tasks=0,
        current_task="Idle",
        alert_level=payload.alert_level,
        control_list=payload.control_list,
        supplier_list=payload.supplier_list,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: str, payload: AgentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)

    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Delete related records first
    db.query(AgentTask).filter(AgentTask.agent_id == agent_id).delete()
    db.query(AgentLog).filter(AgentLog.agent_id == agent_id).delete()
    db.query(AgentTimeline).filter(AgentTimeline.agent_id == agent_id).delete()

    db.delete(agent)
    db.commit()


# ── Tasks ──────────────────────────────────────────────────

@router.get("/{agent_id}/tasks", response_model=List[AgentTaskResponse])
def get_agent_tasks(
    agent_id: str,
    view: str = "detail",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AgentTask)
        .filter(AgentTask.agent_id == agent_id, AgentTask.view == view)
        .order_by(AgentTask.due_date.asc())
        .all()
    )


@router.patch("/{agent_id}/tasks/{task_id}", response_model=AgentTaskResponse)
def update_task(
    agent_id: str,
    task_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(AgentTask).filter(AgentTask.id == task_id, AgentTask.agent_id == agent_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in payload.items():
        if hasattr(task, k):
            setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


# ── Timeline ───────────────────────────────────────────────

@router.get("/{agent_id}/timeline", response_model=List[AgentTimelineResponse])
def get_agent_timeline(
    agent_id: str,
    view: str = "detail",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AgentTimeline)
        .filter(AgentTimeline.agent_id == agent_id, AgentTimeline.view == view)
        .order_by(AgentTimeline.created_at.desc())
        .all()
    )


# ── Initial logs (non-streaming) ───────────────────────────

@router.get("/{agent_id}/logs", response_model=List[AgentLogResponse])
def get_agent_logs(
    agent_id: str,
    view: str = "detail",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AgentLog)
        .filter(AgentLog.agent_id == agent_id, AgentLog.view == view)
        .order_by(AgentLog.created_at.asc())
        .all()
    )


# ── SSE live log stream — replaces useAgentLogStream hook ──

@router.get("/{agent_id}/logs/stream")
async def stream_logs(agent_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Server-Sent Events endpoint. The frontend connects here and receives
    one JSON event per log entry, then live entries every 3 seconds.
    No auth required on SSE so the EventSource browser API works without headers.
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return StreamingResponse(
        stream_agent_logs(agent_id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",       # tells nginx not to buffer SSE
        },
    )
