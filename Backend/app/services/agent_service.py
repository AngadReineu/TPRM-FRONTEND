import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from ..models.agent import Agent, AgentTask
from ..models.vendor import Vendor
from ..models.risk_event import RiskEvent

logger = logging.getLogger(__name__)


def create_task_and_risk_event(db: Session, agent_id: str, payload) -> AgentTask:
    """
    Creates an SLM task for the agent.
    If priority is High or Critical, auto-creates a RiskEvent.
    Returns the created AgentTask.
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise ValueError(f"Agent {agent_id} not found")

    task = AgentTask(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        view=payload.view or "list",
        title=payload.title,
        supplier=payload.supplier or "",
        priority=payload.priority or "Medium",
        assignee="",
        status=payload.status or "Open",
        due_date=payload.due_date or datetime.now().strftime("%Y-%m-%d"),
        description=payload.description or "",
    )
    db.add(task)
    agent.open_tasks = (agent.open_tasks or 0) + 1
    agent.alerts = (agent.alerts or 0) + 1
    db.commit()
    db.refresh(task)

    if payload.priority in ["Critical", "High"]:
        _create_risk_event(db, agent_id, payload)

    return task


def _create_risk_event(db: Session, agent_id: str, payload) -> None:
    """Creates a RiskEvent from a High or Critical SLM task."""
    try:
        score_change = 18 if payload.priority == "Critical" else 10
        vendor = db.query(Vendor).filter(Vendor.name == payload.supplier).first()
        current_score = vendor.score if vendor else 50
        vendor_id = vendor.id if vendor else None

        actions = [
            {
                "id": "a1",
                "title": "Review and verify finding",
                "detail": (payload.description or "")[:200],
                "owner": "Risk Manager",
                "effort": "Low",
                "scoreReduction": -3,
            },
            {
                "id": "a2",
                "title": "Contact supplier for documentation",
                "detail": f"Request {payload.supplier} provide required documentation to resolve: {payload.title}",
                "owner": "Risk Manager",
                "effort": "Low",
                "scoreReduction": -2,
            },
            {
                "id": "a3",
                "title": "Re-run agent evaluation after remediation",
                "detail": "Once remediation steps are completed trigger agent re-evaluation to confirm issue is resolved.",
                "owner": "Agent",
                "effort": "Low",
                "scoreReduction": -5,
            },
        ]

        risk_event = RiskEvent(
            date=datetime.now().strftime("%b %d, %Y"),
            run_id=payload.run_id,
            run_date=payload.run_date,
            agent_id=agent_id,
            supplier_name=payload.supplier or "Unknown",
            supplier_id=vendor_id,
            task_name=payload.title,
            description=payload.title,
            severity=payload.priority,
            status="Open",
            score_change=score_change,
            current_score=current_score,
            category="Agent Detection",
            full_detail=payload.description,
            impact=(
                f"Risk detected during agent evaluation of {payload.supplier}. "
                f"Task: {payload.title}. Severity: {payload.priority}. "
                f"Immediate review required."
            ),
            actions=actions,
        )
        db.add(risk_event)
        db.commit()
        logger.info(f"RiskEvent created for agent {agent_id} — {payload.priority}: {payload.title}")

    except Exception as e:
        logger.error(f"Risk event creation failed for agent {agent_id}: {e}")
        db.rollback()
