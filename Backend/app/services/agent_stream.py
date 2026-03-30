import asyncio
import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.agent import AgentLog

# How many seconds between streamed log entries
STREAM_INTERVAL = 3.0


def _now_time() -> str:
    return datetime.now().strftime("%H:%M:%S")



async def stream_agent_logs(agent_id: str, db: Session):
    """
    SSE generator — yields initial DB logs then cycles through the
    stream queue, exactly mirroring the frontend's useAgentLogStream hook.
    """
    # 1. Yield all stored logs for this agent first
    initial_logs = (
        db.query(AgentLog)
        .filter(AgentLog.agent_id == agent_id, AgentLog.view == "detail")
        .order_by(AgentLog.created_at.asc())
        .all()
    )

    for log in initial_logs:
        data = {
            "id": log.id,
            "time": log.time,
            "type": log.type,
            "message": log.message,
            "detail": log.detail,
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(0.05)   # small gap to avoid flooding

    # 2. Stream live entries from the database on a timer
    last_created_at = initial_logs[-1].created_at if initial_logs else None
    
    while True:
        await asyncio.sleep(STREAM_INTERVAL)
        query = db.query(AgentLog).filter(AgentLog.agent_id == agent_id, AgentLog.view == "detail")
        if last_created_at:
            query = query.filter(AgentLog.created_at > last_created_at)
            
        new_logs = query.order_by(AgentLog.created_at.asc()).all()
        for log in new_logs:
            data = {
                "id": log.id,
                "time": log.time,
                "type": log.type,
                "message": log.message,
                "detail": log.detail,
            }
            yield f"data: {json.dumps(data)}\n\n"
            last_created_at = log.created_at
            await asyncio.sleep(0.05)
