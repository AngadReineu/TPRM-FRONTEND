from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.vendor import Vendor
from ..models.agent import Agent
from ..models.control import Control
from ..models.risk import RiskEvent
from ..schemas.dashboard import (
    DashboardSummary, RiskTrendPoint, StageDataItem, AgentRow, RiskAlert
)

STAGE_COLORS = {
    "Acquisition": "#0EA5E9",
    "Retention":   "#10B981",
    "Upgradation": "#F59E0B",
    "Offboarding": "#94A3B8",
}

AGENT_STATUS_COLORS = {
    "live":    "#10B981",
    "active":  "#0EA5E9",
    "syncing": "#F59E0B",
    "idle":    "#CBD5E1",
}


def build_dashboard(db: Session) -> DashboardSummary:
    vendors   = db.query(Vendor).all()
    agents    = db.query(Agent).all()
    controls  = db.query(Control).all()
    risks     = db.query(RiskEvent).all()

    # ── KPI counts ────────────────────────────────────────
    total_vendors   = len(vendors)
    active_agents   = sum(1 for a in agents if a.status in ("live", "active", "syncing"))
    open_risks      = sum(1 for r in risks if r.status == "Open")
    avg_score       = int(sum(v.score for v in vendors) / total_vendors) if vendors else 0

    critical = sum(1 for v in vendors if v.risk == "Critical")
    high     = sum(1 for v in vendors if v.risk == "High")
    medium   = sum(1 for v in vendors if v.risk == "Medium")
    low      = sum(1 for v in vendors if v.risk == "Low")

    controls_active = sum(1 for c in controls if c.active)
    controls_total  = len(controls)

    # ── Risk trend (static shape — would be time-series in production) ──
    risk_trend = [
        RiskTrendPoint(month="Sep", overall=62, critical=8,  high=18),
        RiskTrendPoint(month="Oct", overall=58, critical=6,  high=15),
        RiskTrendPoint(month="Nov", overall=65, critical=10, high=20),
        RiskTrendPoint(month="Dec", overall=54, critical=5,  high=12),
        RiskTrendPoint(month="Jan", overall=70, critical=12, high=22),
        RiskTrendPoint(month="Feb", overall=avg_score, critical=critical, high=high),
    ]

    # ── Stage breakdown ────────────────────────────────────
    stage_map: dict[str, list[Vendor]] = {}
    for v in vendors:
        stage_map.setdefault(v.stage, []).append(v)

    stage_breakdown = []
    for stage in ["Acquisition", "Retention", "Upgradation", "Offboarding"]:
        vs = stage_map.get(stage, [])
        stage_breakdown.append(StageDataItem(
            stage=stage,
            color=STAGE_COLORS[stage],
            count=len(vs),
            critical=sum(1 for v in vs if v.risk == "Critical"),
            high=sum(1 for v in vs if v.risk == "High"),
            medium=sum(1 for v in vs if v.risk == "Medium"),
            low=sum(1 for v in vs if v.risk == "Low"),
        ))

    # ── Agent activity ─────────────────────────────────────
    agent_activity = [
        AgentRow(
            initials=a.initials,
            color=a.color or "#0EA5E9",
            name=a.name,
            stage=a.stage,
            status=a.status.capitalize(),
            status_color=AGENT_STATUS_COLORS.get(a.status, "#CBD5E1"),
            is_active=a.status in ("live", "active"),
        )
        for a in agents[:6]
    ]

    # ── Recent risk alerts ─────────────────────────────────
    severity_styles = {
        "critical": ("#FEF2F2", "#EF4444"),
        "high":     ("#FFFBEB", "#F59E0B"),
        "medium":   ("#F0F9FF", "#0EA5E9"),
    }
    recent_alerts = []
    for r in sorted(risks, key=lambda x: x.date, reverse=True)[:5]:
        sev = r.severity.lower()
        bg, _ = severity_styles.get(sev, ("#F8FAFC", "#64748B"))
        recent_alerts.append(RiskAlert(
            type=r.category or "Risk",
            supplier=r.supplier,
            system="TPRM System",
            severity=r.severity,
            severity_bg=bg,
        ))

    return DashboardSummary(
        total_vendors=total_vendors,
        active_agents=active_agents,
        open_risks=open_risks,
        avg_risk_score=avg_score,
        critical_count=critical,
        high_count=high,
        medium_count=medium,
        low_count=low,
        controls_active=controls_active,
        controls_total=controls_total,
        risk_trend=risk_trend,
        stage_breakdown=stage_breakdown,
        agent_activity=agent_activity,
        recent_alerts=recent_alerts,
    )
