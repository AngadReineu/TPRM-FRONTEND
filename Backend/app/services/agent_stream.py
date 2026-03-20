import asyncio
import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.agent import AgentLog

# How many seconds between streamed log entries
STREAM_INTERVAL = 3.0


def _now_time() -> str:
    return datetime.now().strftime("%H:%M:%S")


# Per-agent stream queues — mirrors STREAM_QUEUES_DETAIL from the frontend mock
STREAM_QUEUES: dict[str, list[dict]] = {
    "a1": [
        {"type": "fetch",     "message": "Re-fetching API Integration for updated MFA status"},
        {"type": "evaluate",  "message": "Re-evaluating MFA Enforcement (scheduled 45-min cycle)"},
        {"type": "reasoning", "message": "Comparing current MFA coverage against last evaluation",
         "detail": "Previous: 94.2%. Current: 94.5%. 1 additional account enrolled. 2 accounts still pending."},
        {"type": "success",   "message": "MFA Enforcement: PASSED — 94.5% coverage (+0.3%)"},
        {"type": "fetch",     "message": "Polling supplier XYZ Corporation assessment portal"},
        {"type": "reasoning", "message": "Checking XYZ Corporation contract renewal window",
         "detail": "Contract expires Mar 2026 — 15 days remaining. Risk score 78 (High). Recommend: initiate renewal."},
        {"type": "warning",   "message": "XYZ Corporation contract expiring in 15 days — escalation required"},
        {"type": "action",    "message": "Contract renewal alert sent to Procurement & Risk Manager"},
        {"type": "decision",  "message": "Next: Privileged Access Mgmt re-evaluation in 30 min"},
    ],
    "a2": [
        {"type": "fetch",     "message": "Checking new assets added to Azure in last 24h"},
        {"type": "reasoning", "message": "Scanning 3 newly created Azure resources for encryption",
         "detail": "3 new Azure VMs detected. 2/3 encrypted at creation. 1 (vm-staging-09) missing encryption config."},
        {"type": "warning",   "message": "New unencrypted VM detected: vm-staging-09"},
        {"type": "action",    "message": "Auto-remediation triggered: encryption policy applied to vm-staging-09"},
        {"type": "success",   "message": "Encryption at Rest: Auto-remediated — vm-staging-09 now encrypted"},
        {"type": "fetch",     "message": "Fetching MNO Partners supplier assessment status"},
        {"type": "reasoning", "message": "Reviewing MNO Partners offboarding stage risk",
         "detail": "MNO Partners: Assessment pending for 1 day. Contract ends Apr 2026. Risk score 55 (Medium)."},
        {"type": "action",    "message": "Reminder queued for MNO Partners — pending assessment follow-up"},
    ],
    "a3": [
        {"type": "fetch",     "message": "Pulling patch deployment status from ServiceNow CMDB"},
        {"type": "evaluate",  "message": "Running evaluation: Patch Management"},
        {"type": "reasoning", "message": "Comparing installed patch versions against vendor advisories",
         "detail": "OS patch compliance: 88%. 12 servers running unpatched versions. 3 servers missing Feb 2026 rollup. SLA: 8 days remaining."},
        {"type": "warning",   "message": "Patch Management: 3 servers approaching SLA deadline (8 days)"},
        {"type": "action",    "message": "PATCH-3319 ticket escalated to P1 — assigned to SysAdmin team"},
        {"type": "decision",  "message": "Re-evaluating Patch Management in 24h unless patch deployed"},
    ],
    "a4": [
        {"type": "action",   "message": "Agent idle — next trigger at 02:00 UTC tomorrow"},
        {"type": "decision", "message": "Standby mode active — monitoring for event-driven triggers"},
    ],
    "a5": [
        {"type": "fetch",     "message": "Re-scanning Splunk CVE index for new vulnerabilities"},
        {"type": "evaluate",  "message": "Running evaluation: Vulnerability Scanning (20-min cycle)"},
        {"type": "reasoning", "message": "Checking if existing CVEs have been patched since last scan",
         "detail": "CVE-2024-7821: still unpatched (Day 12/30). CVE-2024-6634: still unpatched (Day 12/30). No new CVEs."},
        {"type": "action",    "message": "Updated ticket VULN-2851 — patch still pending (Day 12/30)"},
        {"type": "decision",  "message": "Next vulnerability scan in 20 min"},
    ],
}


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
