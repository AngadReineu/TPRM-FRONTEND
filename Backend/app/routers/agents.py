import logging
import uuid
import subprocess
import sys
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.agent import Agent, AgentTask, AgentLog, AgentTimeline
from ..models.user import User
from ..schemas.agent import (
    AgentResponse, AgentCreate, AgentUpdate,
    AgentTaskResponse, AgentLogResponse, AgentTimelineResponse,
    AgentTaskCreate, AgentLogCreate, RunTaskPayload, AgentTaskUpdate,
)
from ..dependencies import get_current_user
from ..services.agent_stream import stream_agent_logs
from ..services import agent_service
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["agents"])


# ── Recent cross-agent activity ────────────────────────────

@router.get("/activity/recent")
def get_recent_activity(db: Session = Depends(get_db)):
    """Returns the 10 most recent log entries across all agents, no auth required."""
    rows = (
        db.query(AgentLog, Agent)
        .join(Agent, AgentLog.agent_id == Agent.id)
        .order_by(AgentLog.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "agent_name": agent.name,
            "agent_initials": agent.initials,
            "agent_color": agent.color or "#0EA5E9",
            "message": log.message,
            "log_type": log.type,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "run_id": log.run_id,
        }
        for log, agent in rows
    ]



@router.get("", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Agent).order_by(Agent.name).all()


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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
        internal_spoc=payload.internal_spoc,
        external_spoc=payload.external_spoc,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    # NO auth — also called by ConsultingAgent.py to fetch its own config
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: str,
    payload: AgentUpdate,
    db: Session = Depends(get_db),
    # NO auth — called by ConsultingAgent.py to update status during run
):
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
    db.delete(agent)  # cascade handles tasks, logs, timeline automatically
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


@router.post("/{agent_id}/tasks", response_model=AgentTaskResponse, status_code=status.HTTP_201_CREATED)
def create_agent_task(
    agent_id: str,
    payload: AgentTaskCreate,
    db: Session = Depends(get_db),
    # NO auth — called by ConsultingAgent.py when anomaly is found
):
    """
    Called by ConsultingAgent.py when it detects an anomaly.
    Creates a task visible in the Agent Tasks panel on the detail page.
    Also increments open_tasks and alerts count on the agent.
    """
    try:
        return agent_service.create_task_and_risk_event(db, agent_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{agent_id}/tasks/{task_id}", response_model=AgentTaskResponse)
def update_task(
    agent_id: str,
    task_id: str,
    payload: AgentTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(AgentTask).filter(AgentTask.id == task_id, AgentTask.agent_id == agent_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
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


# ── Logs (non-streaming) ───────────────────────────────────

@router.get("/{agent_id}/logs", response_model=List[AgentLogResponse])
def get_agent_logs(
    agent_id: str,
    view: str = "detail",
    run_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(AgentLog).filter(AgentLog.agent_id == agent_id, AgentLog.view == view)
    if run_id:
        q = q.filter(AgentLog.run_id == run_id)
    return q.order_by(AgentLog.created_at.asc()).offset(skip).limit(limit).all()





@router.post("/{agent_id}/logs", response_model=AgentLogResponse, status_code=status.HTTP_201_CREATED)
def create_agent_log(
    agent_id: str,
    payload: AgentLogCreate,
    db: Session = Depends(get_db),
    # NO auth — called by ConsultingAgent.py to stream logs live
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    log = AgentLog(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        run_id=payload.run_id,
        run_date=payload.run_date,
        view="detail",
        time=datetime.now().strftime("%H:%M:%S"),
        type=payload.type,
        message=payload.message,
        detail=payload.detail,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


# ── Run Agent ──────────────────────────────────────────────

@router.post("/{agent_id}/run")
def run_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    script_path = settings.agent_script_path

    if not os.path.exists(script_path):
        raise HTTPException(status_code=500, detail=f"Agent script not found at {script_path}.")

    subprocess.Popen(
        [sys.executable, script_path, agent_id],
        creationflags=subprocess.CREATE_NO_WINDOW,
    )

    return {"status": "started", "agent_id": agent_id}


# ── Stop Agent ─────────────────────────────────────────────

@router.post("/{agent_id}/stop")
def stop_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Write a stop signal file — the agent polls for this and exits cleanly
    stop_dir = settings.stop_signal_dir
    os.makedirs(stop_dir, exist_ok=True)
    stop_file = os.path.join(stop_dir, f"{agent_id}.stop")

    try:
        with open(stop_file, "w") as f:
            f.write(datetime.now().isoformat())
    except Exception as e:
        logger.error(f"Failed to write stop signal for agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to write stop signal")

    # Update agent status immediately
    agent.status = "idle"
    agent.current_task = "Stopped by user"

    log = AgentLog(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        run_id=None,
        view="detail",
        time=datetime.now().strftime("%H:%M:%S"),
        type="error",
        message="Agent run stopped by user",
    )
    db.add(log)
    db.commit()

    return {"status": "stopped", "agent_id": agent_id}


# ── Run Specific Task ──────────────────────────────────────



@router.post("/{agent_id}/run-task")
def run_specific_task(agent_id: str, payload: RunTaskPayload, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    script_path = settings.agent_script_path

    if not os.path.exists(script_path):
        raise HTTPException(status_code=500, detail="Agent script not found")

    subprocess.Popen(
        [sys.executable, script_path, agent_id, payload.task_name],
        creationflags=subprocess.CREATE_NO_WINDOW,
    )

    return {"status": "started", "agent_id": agent_id, "task": payload.task_name}

@router.delete("/{agent_id}/tasks", status_code=status.HTTP_204_NO_CONTENT)
def clear_agent_tasks(
    agent_id: str,
    db: Session = Depends(get_db),
    # NO auth — called from frontend clear button
):
    db.query(AgentTask).filter(AgentTask.agent_id == agent_id).delete()
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if agent:
        agent.open_tasks = 0
        agent.alerts = 0
    db.commit()


@router.delete("/{agent_id}/logs", status_code=status.HTTP_204_NO_CONTENT)
def clear_agent_logs(
    agent_id: str,
    db: Session = Depends(get_db),
    # NO auth — called from frontend clear button
):
    db.query(AgentLog).filter(AgentLog.agent_id == agent_id).delete()
    db.commit()


# ── SSE live log stream ────────────────────────────────────

@router.get("/{agent_id}/logs/runs")
def get_agent_log_runs(
    agent_id:str,
    db: Session = Depends(get_db),
):
    """return list of distinct run_ids for the agent, with their timestamps, to populate the dropdown in the frontend""",
    from sqlalchemy import func as sqlfunc
    runs = (
        db.query(
            AgentLog.run_id,
            AgentLog.run_date,
            sqlfunc.min(AgentLog.created_at).label("Started_at"),
            sqlfunc.max(AgentLog.created_at).label("Ended_at"),
            sqlfunc.count(AgentLog.id).label("log_count"),
        )
        .filter(AgentLog.agent_id == agent_id, AgentLog.run_id.isnot(None))
        .group_by(AgentLog.run_id, AgentLog.run_date)
        .order_by(sqlfunc.min(AgentLog.created_at).desc())
        .all()
    )
    return [
        {
            "run_id":r.run_id,
            "run_date": r.run_date,
            "Started_at": r.Started_at.isoformat() if r.Started_at else None,
            "Ended_at": r.Ended_at.isoformat() if r.Ended_at else None,
            "log_count": r.log_count,
        }
        for r in runs
    ]
    
@router.get("/{agent_id}/logs/runs/{run_id}", response_model=List[AgentLogResponse])
def get_logs_for_run(
    agent_id:str,
    run_id:str,
    db:Session = Depends(get_db),
    
):
    """Get all the logs for specific agent runs"""
    return(
        db.query(AgentLog)
        .filter(AgentLog.agent_id == agent_id, AgentLog.run_id == run_id)
        .order_by(AgentLog.created_at.asc())
        .all()
    )

@router.get("/{agent_id}/logs/stream")
async def stream_logs(agent_id: str, request: Request, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return StreamingResponse(
        stream_agent_logs(agent_id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )