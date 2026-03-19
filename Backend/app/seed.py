"""
seed.py — run once on startup (or manually) to populate all tables
with the mock data that mirrors the frontend's .data.ts files.
"""
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .models.user        import User
from .models.vendor      import Vendor
from .models.agent       import Agent, AgentTask, AgentLog, AgentTimeline
from .models.control     import Control
from .models.risk        import RiskEvent, RiskAction
from .models.audit_log   import AuditLog
from .models.template    import Template
from .models.library     import Organisation, Division, SupplierNode, SystemNode
from .models.settings_model import OrgSettings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def already_seeded(db: Session) -> bool:
    return db.query(User).count() > 0


def seed_all(db: Session) -> None:
    if already_seeded(db):
        return
    _seed_users(db)
    _seed_vendors(db)
    _seed_agents(db)
    _seed_agent_tasks(db)
    _seed_agent_logs(db)
    _seed_agent_timeline(db)
    _seed_controls(db)
    _seed_risks(db)
    _seed_templates(db)
    _seed_library(db)
    _seed_settings(db)
    db.commit()
    print("✅  Database seeded successfully.")


# ── Users ──────────────────────────────────────────────────

def _seed_users(db: Session):
    users = [
        User(id="u1", name="Priya Sharma",   email="priya@abc.co",   role="Risk Manager",       status="Active", hashed_password=pwd_context.hash("password123")),
        User(id="u2", name="Raj Mehta",      email="raj@abc.co",     role="Compliance Officer", status="Active", hashed_password=pwd_context.hash("password123")),
        User(id="u3", name="Anita Patel",    email="anita@abc.co",   role="DPO",                status="Active", hashed_password=pwd_context.hash("password123")),
        User(id="u4", name="Kiran Desai",    email="kiran@abc.co",   role="Viewer",             status="Active", hashed_password=pwd_context.hash("password123")),
        User(id="u5", name="IT Admin",       email="it-admin@abc.co",role="Admin",              status="Active", hashed_password=pwd_context.hash("password123")),
    ]
    db.add_all(users)


# ── Vendors ────────────────────────────────────────────────

def _seed_vendors(db: Session):
    vendors = [
        Vendor(id="1", name="XYZ Corporation",   email="contact@xyz.com",  stage="Acquisition",  stage_color="#0EA5E9", score=78, risk="High",     risk_color="#F59E0B", assessment="complete", pii={"configured": True,  "icons": ["ID","Email","Mobile","Doc","Location"], "method": "API"},   pii_flow="share",  contract_end="Mar 2026", contract_warning=True,  agent_id="a1", last_activity="2 min ago",  internal_spoc="priya@abc.co",  external_spoc="john@xyz.com"),
        Vendor(id="2", name="ABC Services Ltd",  email="ops@abc.com",      stage="Retention",    stage_color="#10B981", score=42, risk="Low",      risk_color="#10B981", assessment="complete", pii={"configured": True,  "icons": ["Email","Mobile"],                       "method": "SFTP"}, pii_flow="ingest", contract_end="Dec 2027",                         agent_id="a2", last_activity="1 hr ago",   internal_spoc="raj@abc.co",    external_spoc="ops@abcsvc.com"),
        Vendor(id="3", name="DEF Limited",       email="info@def.com",     stage="Upgradation",  stage_color="#F59E0B", score=62, risk="Medium",   risk_color="#64748B", assessment="overdue",  pii={"configured": False},                                                              pii_flow="both",   contract_end="Jun 2025", contract_warning=True,  agent_id="a3", last_activity="2 hrs ago",  internal_spoc="anita@abc.co",  external_spoc="info@def.com"),
        Vendor(id="4", name="GHI Technologies",  email="bd@ghi.com",       stage="Acquisition",  stage_color="#0EA5E9", score=91, risk="Critical", risk_color="#EF4444", assessment="overdue",  pii={"configured": False},                                                              pii_flow="share",  contract_end="Sep 2026",                         agent_id="a1", last_activity="5 hrs ago",  internal_spoc="priya@abc.co",  external_spoc="bd@ghi.com"),
        Vendor(id="5", name="JKL Consultancy",   email="admin@jkl.com",    stage="Retention",    stage_color="#10B981", score=35, risk="Low",      risk_color="#10B981", assessment="complete", pii={"configured": True,  "icons": ["Email"],                                "method": "Email"},pii_flow="ingest", contract_end="Jan 2028",                         agent_id="a4", last_activity="3 hrs ago",  internal_spoc="raj@abc.co",    external_spoc="admin@jkl.com"),
        Vendor(id="6", name="MNO Partners",      email="contact@mno.com",  stage="Offboarding",  stage_color="#94A3B8", score=55, risk="Medium",   risk_color="#64748B", assessment="pending",  pii={"configured": False},                                                                              contract_end="Apr 2026", contract_warning=True,  agent_id="a2", last_activity="1 day ago"),
        Vendor(id="7", name="PQR Systems",       email="info@pqr.com",     stage="Acquisition",  stage_color="#0EA5E9", score=67, risk="Medium",   risk_color="#64748B", assessment="pending",  pii={"configured": False},                                                              pii_flow="share",  contract_end="Nov 2027",                         agent_id="a5", last_activity="6 hrs ago"),
        Vendor(id="8", name="STU Analytics",     email="hello@stu.com",    stage="Upgradation",  stage_color="#F59E0B", score=22, risk="Low",      risk_color="#10B981", assessment="complete", pii={"configured": False, "method": "configure"},                                       pii_flow="both",   contract_end="Jul 2028",                         agent_id="a2", last_activity="4 hrs ago"),
    ]
    db.add_all(vendors)


# ── Agents ─────────────────────────────────────────────────

def _seed_agents(db: Session):
    agents = [
        Agent(id="a1", name="Agent Aria",  initials="A1", status="live",    stage="Acquisition",  controls=4, suppliers=2, gradient="linear-gradient(135deg,#0EA5E9,#6366F1)", alerts=2,  last_active="2 min ago",  health=82, division="Marketing Dept",   frequency="Hourly",     notify=["Risk Manager","Compliance Officer"], internal_spoc="priya@abc.co", external_spoc="john@xyz.com",  truth_match=50,  role="Contract & Process Compliance Specialist", color="#0EA5E9", avatar_seed="Aria",  uptime="99.1%", next_eval="In 45 min",   last_scan="09:14 AM", open_tasks=3, current_task="Auditing SOW signatures and contractual obligation timelines for XYZ Corporation", alert_level="High",    systems=["Email","API","ServiceNow"],   supplier_list=["XYZ Corporation","GHI Technologies"],             control_list=["MFA Enforcement","Privileged Access Mgmt","Vulnerability Scanning"]),
        Agent(id="a2", name="Agent Blake", initials="A2", status="active",  stage="Retention",    controls=3, suppliers=3, gradient="linear-gradient(135deg,#10B981,#0EA5E9)",  alerts=0,  last_active="8 min ago",  health=94, division="Operations Dept",  frequency="Daily",      notify=["Risk Manager"],                     internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",   truth_match=100, role="SLA & Supplier Process Monitor",          color="#10B981", avatar_seed="Blake", uptime="98.7%", next_eval="In 2 hrs",    last_scan="08:52 AM", open_tasks=1, current_task="Verifying SLA adherence and invoice approval workflows across 3 suppliers",          alert_level="",        systems=["Email","API","Slack"],        supplier_list=["ABC Services Ltd","MNO Partners","STU Analytics"], control_list=["Encryption at Rest","Data Classification Policy"]),
        Agent(id="a3", name="Agent Casey", initials="A3", status="syncing", stage="Upgradation",  controls=4, suppliers=1, gradient="linear-gradient(135deg,#8B5CF6,#EC4899)",  alerts=3,  last_active="just now",   health=61, division="Technical Dept",   frequency="Every 6hrs", notify=["Risk Manager","DPO","Admin"],        internal_spoc="anita@abc.co", external_spoc="info@def.com",  truth_match=0,   role="Network & Access Review Auditor",         color="#8B5CF6", avatar_seed="Casey", uptime="97.3%", next_eval="In 1 hr",     last_scan="08:30 AM", open_tasks=5, current_task="Running quarterly access review across Active Directory",                            alert_level="High",    systems=["API","ServiceNow"],          supplier_list=["DEF Limited"],                                    control_list=["Access Review Policy","Network Segmentation","Patch Management","Incident Response Plan"]),
        Agent(id="a4", name="Agent Dana",  initials="A4", status="idle",   stage="Retention",    controls=1, suppliers=2, gradient="linear-gradient(135deg,#F59E0B,#EF4444)",  alerts=0,  last_active="yesterday",  health=100,division="Operations Dept",  frequency="Daily",      notify=["Risk Manager"],                     internal_spoc="raj@abc.co",                                  truth_match=None,role="Backup & Recovery Monitor",               color="#F59E0B", avatar_seed="Dana",  uptime="100%",  next_eval="Tomorrow 02:00",last_scan="Yesterday", open_tasks=0, current_task="Idle — waiting for scheduled trigger at 02:00 UTC",                               alert_level="",        systems=["Email"],                     supplier_list=["JKL Consultancy"],                                control_list=["Backup Verification"]),
        Agent(id="a5", name="Agent Ellis", initials="A5", status="active", stage="Acquisition",  controls=2, suppliers=1, gradient="linear-gradient(135deg,#EF4444,#EC4899)",  alerts=2,  last_active="5 min ago",  health=88, division="Technical Dept",   frequency="Every 20min",notify=["Risk Manager"],                     internal_spoc="anita@abc.co",                                truth_match=None,role="Vulnerability & Patch Intelligence",       color="#EF4444", avatar_seed="Ellis", uptime="99.8%", next_eval="In 20 min",   last_scan="09:22 AM", open_tasks=2, current_task="Scanning for unpatched CVEs in production environment",                             alert_level="",        systems=["API","Splunk"],              supplier_list=["PQR Systems"],                                    control_list=["Vulnerability Scanning","Patch Management"]),
    ]
    db.add_all(agents)


# ── Agent Tasks ────────────────────────────────────────────

def _seed_agent_tasks(db: Session):
    tasks = [
        # a1 detail view
        AgentTask(id="t1",  agent_id="a1", view="detail", title="MFA Enrollment — 2 Pending Admin Accounts",         supplier="XYZ Corporation", priority="High",   assignee="priya@abc.co",    status="Open",        due_date="2026-03-07", description="Two admin accounts have not completed MFA enrollment. Breach risk in 4 days."),
        AgentTask(id="t2",  agent_id="a1", view="detail", title="Critical CVE Patch — CVE-2024-4711",                supplier="GHI Technologies",priority="High",   assignee="anita@abc.co",    status="In Progress", due_date="2026-03-06", description="Critical vulnerability approaching 30-day SLA. Patch available upstream."),
        AgentTask(id="t3",  agent_id="a1", view="detail", title="Contract Renewal Reminder — XYZ Corp",              supplier="XYZ Corporation", priority="Medium", assignee="",                status="Open",        due_date="2026-03-15", description="Contract expires in 15 days. Procurement to initiate renewal."),
        # a1 list view
        AgentTask(id="tl1", agent_id="a1", view="list",   title="SOW Signed After Service Start — XYZ Corporation",  supplier="XYZ Corporation", priority="High",   assignee="priya@abc.co",    status="Open",        due_date="2026-03-07", description="SOW signed Feb 10, but service delivery started Feb 5. Contractual risk — legal review required."),
        AgentTask(id="tl2", agent_id="a1", view="list",   title="Unapproved Payment of ₹10L — No PO Found",         supplier="XYZ Corporation", priority="High",   assignee="anita@abc.co",    status="In Progress", due_date="2026-03-06", description="₹10L payment detected with no corresponding PO approval in email thread."),
        AgentTask(id="tl3", agent_id="a1", view="list",   title="ISO 27001 Certificate Renewal — 22 Days Remaining", supplier="XYZ Corporation", priority="Medium", assignee="",                status="Open",        due_date="2026-03-26", description="Certificate expires Mar 26. Supplier to submit renewal proof within 15 days per contract terms."),
        AgentTask(id="tl4", agent_id="a1", view="list",   title="TPRA Overdue — GHI Technologies",                   supplier="GHI Technologies",priority="High",   assignee="priya@abc.co",    status="Open",        due_date="2026-03-05", description="Annual Third-Party Risk Assessment 3 days overdue. Last score: Medium Risk (48/100)."),
        # a2 detail
        AgentTask(id="t4",  agent_id="a2", view="detail", title="Encrypt vm-staging-09",                             supplier="ABC Services Ltd",priority="Medium", assignee="raj@abc.co",      status="In Progress", due_date="2026-03-08", description="New Azure VM created without encryption. Auto-remediation triggered but requires verification."),
        # a2 list
        AgentTask(id="tl5", agent_id="a2", view="list",   title="SLA Breach — ABC Services Uptime 98.1% vs 99.5%",  supplier="ABC Services Ltd",priority="High",   assignee="raj@abc.co",      status="In Progress", due_date="2026-03-08", description="SLA breach of 1.4% in Feb 2026. Penalty clause applicable."),
        AgentTask(id="tl6", agent_id="a2", view="list",   title="MNO Partners Onboarding — 3 Items Missing",        supplier="MNO Partners",    priority="Medium", assignee="raj@abc.co",      status="Open",        due_date="2026-03-12", description="BCP document, cyber insurance cert, and sub-processor list not yet submitted. Checklist at 62%."),
        AgentTask(id="tl7", agent_id="a2", view="list",   title="DPA Sub-Processor Annex — JKL Consultancy",        supplier="JKL Consultancy", priority="Medium", assignee="",                status="Open",        due_date="2026-03-14", description="DPA missing sub-processor annex per GDPR Article 28(2)."),
        # a3 detail + list (shared)
        AgentTask(id="t5",  agent_id="a3", view="detail", title="Revoke Access — 3 Orphaned Accounts",               supplier="DEF Limited",     priority="High",   assignee="it-admin@abc.co", status="In Progress", due_date="2026-03-05", description="Accounts U1042, U1098, U1187 belong to terminated employees with active access."),
        AgentTask(id="t6",  agent_id="a3", view="detail", title="Patch 3 Servers — Feb 2026 Security Rollup",        supplier="DEF Limited",     priority="High",   assignee="sysadmin@abc.co", status="Open",        due_date="2026-03-10", description="3 servers missing Feb 2026 security rollup. SLA breach in 8 days."),
        AgentTask(id="t7",  agent_id="a3", view="detail", title="Document Approved VLAN Exceptions",                 supplier="DEF Limited",     priority="Low",    assignee="",                status="Open",        due_date="2026-03-20", description="2 cross-VLAN firewall exceptions approved in ServiceNow. Audit documentation required."),
        AgentTask(id="t8",  agent_id="a3", view="detail", title="Access Review Sign-off by Dept Heads",              supplier="DEF Limited",     priority="Medium", assignee="hr@abc.co",       status="Open",        due_date="2026-03-12", description="Quarterly access review results require department head sign-off."),
        AgentTask(id="t9",  agent_id="a3", view="detail", title="Update Insider Threat Runbook",                     supplier="DEF Limited",     priority="Low",    assignee="",                status="Open",        due_date="2026-03-25", description="IR Plan references outdated escalation contacts. Update required."),
        # a5
        AgentTask(id="t10", agent_id="a5", view="detail", title="Patch CVE-2024-7821 (CVSS 5.5)",                   supplier="PQR Systems",     priority="Medium", assignee="sysadmin@abc.co", status="In Progress", due_date="2026-03-18", description="18 days remaining in SLA. Patches available upstream. Deployment pending."),
        AgentTask(id="t11", agent_id="a5", view="detail", title="Patch CVE-2024-6634 (CVSS 6.1)",                   supplier="PQR Systems",     priority="Medium", assignee="sysadmin@abc.co", status="Open",        due_date="2026-03-18", description="18 days remaining in SLA. Patches available upstream."),
    ]
    db.add_all(tasks)


# ── Agent Logs ─────────────────────────────────────────────

def _seed_agent_logs(db: Session):
    logs = [
        AgentLog(id="l1",  agent_id="a1", view="detail", time="09:14 AM", type="fetch",     message="Connecting to API Integration endpoint"),
        AgentLog(id="l2",  agent_id="a1", view="detail", time="09:13 AM", type="fetch",     message="Pulling MFA status from Active Directory (89 assets)"),
        AgentLog(id="l3",  agent_id="a1", view="detail", time="09:12 AM", type="evaluate",  message="Running evaluation: MFA Enforcement"),
        AgentLog(id="l4",  agent_id="a1", view="detail", time="09:11 AM", type="reasoning", message="Analyzing authentication logs across 847 assets", detail="Found 3 admin accounts with MFA disabled. Coverage calculated at 94.2%. Threshold is 90% — currently passing. Flagging 3 accounts for remediation advisory."),
        AgentLog(id="l5",  agent_id="a1", view="detail", time="09:10 AM", type="success",   message="MFA Enforcement: PASSED — 94% coverage (847 assets)"),
        AgentLog(id="l6",  agent_id="a1", view="detail", time="09:09 AM", type="action",    message="Advisory email sent: 3 accounts flagged for MFA enrollment"),
        AgentLog(id="l7",  agent_id="a1", view="detail", time="09:05 AM", type="fetch",     message="Connecting to Splunk SIEM for vulnerability data"),
        AgentLog(id="l8",  agent_id="a1", view="detail", time="09:04 AM", type="evaluate",  message="Running evaluation: Vulnerability Scanning"),
        AgentLog(id="l9",  agent_id="a1", view="detail", time="09:03 AM", type="reasoning", message="Parsing Splunk vulnerability index for CVE entries", detail="12 open CVEs detected. 2 Critical (CVSS ≥ 9.0): CVE-2024-4711, CVE-2024-3890. Patch SLA is 30 days — both are 26 days old. Breach in 4 days."),
        AgentLog(id="l10", agent_id="a1", view="detail", time="09:02 AM", type="warning",   message="Vulnerability Scanning: HIGH RISK — 2 critical CVEs near SLA breach"),
        AgentLog(id="l11", agent_id="a1", view="detail", time="09:01 AM", type="action",    message="ServiceNow ticket created: VULN-2847 (P1)"),
        AgentLog(id="l12", agent_id="a1", view="detail", time="09:00 AM", type="action",    message="Email alert dispatched → Risk Manager, Compliance Officer"),
        # a2
        AgentLog(id="l13", agent_id="a2", view="detail", time="08:52 AM", type="fetch",     message="Fetching storage inventory from Azure Blob & S3"),
        AgentLog(id="l14", agent_id="a2", view="detail", time="08:51 AM", type="evaluate",  message="Running evaluation: Encryption at Rest"),
        AgentLog(id="l15", agent_id="a2", view="detail", time="08:50 AM", type="reasoning", message="Scanning 312 Azure assets for AES-256 encryption status", detail="312 Azure assets checked. 206/312 (66%) encrypted. 106 assets on legacy config — not AES-256. Coverage below 70% threshold."),
        AgentLog(id="l16", agent_id="a2", view="detail", time="08:49 AM", type="warning",   message="Encryption at Rest: BELOW THRESHOLD — 67% (need 70%)"),
        AgentLog(id="l17", agent_id="a2", view="detail", time="08:48 AM", type="action",    message="Ticket raised: ENC-1104 — 106 assets require encryption upgrade"),
        # a3
        AgentLog(id="l18", agent_id="a3", view="detail", time="08:30 AM", type="fetch",     message="Pulling Active Directory user list (quarterly review cycle)"),
        AgentLog(id="l19", agent_id="a3", view="detail", time="08:29 AM", type="evaluate",  message="Running evaluation: Access Review Policy"),
        AgentLog(id="l20", agent_id="a3", view="detail", time="08:28 AM", type="reasoning", message="Cross-referencing AD users against HR offboarding records", detail="1,240 user accounts reviewed. 8 accounts belong to employees terminated in last 90 days. 3 still have active resource access. Immediate revocation required."),
        AgentLog(id="l21", agent_id="a3", view="detail", time="08:27 AM", type="warning",   message="Access Review: 3 orphaned accounts with active access detected"),
        AgentLog(id="l22", agent_id="a3", view="detail", time="08:26 AM", type="action",    message="Auto-revocation initiated for accounts: U1042, U1098, U1187"),
    ]
    db.add_all(logs)


# ── Agent Timeline ─────────────────────────────────────────

def _seed_agent_timeline(db: Session):
    entries = [
        AgentTimeline(id="tl1",  agent_id="a1", view="detail", time="09:14 AM", event="MFA audit completed — 94.5% coverage across 847 assets",                         status="success"),
        AgentTimeline(id="tl2",  agent_id="a1", view="detail", time="09:08 AM", event="ServiceNow ticket VULN-2847 auto-created for critical CVE patch",                 status="alert"),
        AgentTimeline(id="tl3",  agent_id="a1", view="detail", time="09:05 AM", event="Email dispatched to Risk Manager & Compliance Officer re: CVE breach risk",       status="warning"),
        AgentTimeline(id="tl4",  agent_id="a1", view="detail", time="08:55 AM", event="JIT access session audit completed — 14 sessions, 0 standing access",             status="success"),
        AgentTimeline(id="tl5",  agent_id="a1", view="detail", time="08:40 AM", event="Supplier XYZ Corporation contract expiry flagged — 15 days remaining",            status="warning"),
        AgentTimeline(id="tl6",  agent_id="a1", view="detail", time="08:20 AM", event="MFA enrollment advisory sent to 3 non-compliant admin accounts",                  status="info"),
        AgentTimeline(id="tl7",  agent_id="a2", view="detail", time="08:52 AM", event="Auto-remediation applied: vm-staging-09 encryption policy enforced",              status="success"),
        AgentTimeline(id="tl8",  agent_id="a2", view="detail", time="08:48 AM", event="Unencrypted Azure VM detected: vm-staging-09",                                    status="alert"),
        AgentTimeline(id="tl9",  agent_id="a2", view="detail", time="08:35 AM", event="Data classification audit: 91% M365 assets labelled (156 total)",                 status="success"),
        AgentTimeline(id="tl10", agent_id="a3", view="detail", time="08:30 AM", event="Orphaned account revocation initiated — U1042, U1098, U1187",                     status="alert"),
        AgentTimeline(id="tl11", agent_id="a3", view="detail", time="08:25 AM", event="PATCH-3319 escalated to P1 — 3 servers missing Feb 2026 rollup",                  status="warning"),
        AgentTimeline(id="tl12", agent_id="a3", view="detail", time="08:10 AM", event="Network segmentation confirmed — VLAN 10/20 isolation verified",                  status="success"),
        AgentTimeline(id="tl13", agent_id="a4", view="detail", time="02:04 AM", event="Backup verification complete — 14/14 snapshots validated",                        status="success"),
        AgentTimeline(id="tl14", agent_id="a4", view="detail", time="02:02 AM", event="Restore test confirmed — 4.2 hrs (within 6 hr SLA)",                              status="success"),
        AgentTimeline(id="tl15", agent_id="a5", view="detail", time="09:22 AM", event="No new CVEs detected in latest Splunk scan (650 endpoints)",                      status="success"),
        AgentTimeline(id="tl16", agent_id="a5", view="detail", time="09:18 AM", event="Ticket VULN-2851 updated — CVE-2024-7821 & CVE-2024-6634 still unpatched",        status="warning"),
    ]
    db.add_all(entries)


# ── Controls ───────────────────────────────────────────────

def _seed_controls(db: Session):
    controls = [
        Control(id="p1",  name="SLA Adherence Policy",            desc="Monitor supplier uptime vs contracted SLA thresholds",                       category="Process",  active=True,  coverage=91, scope="Full",    risk="High",     last_eval="8 min ago",  deps=2, internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",  pii_flow="ingest", truth_validator=True,  has_truth_gap=False, personality="Operations"),
        Control(id="p2",  name="Invoice Approval Workflow",        desc="Verify every payment has a corresponding approved PO",                        category="Process",  active=True,  coverage=78, scope="Partial", risk="Critical", last_eval="15 min ago", deps=3, internal_spoc="priya@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=True,  personality="Consulting"),
        Control(id="p3",  name="Supplier Onboarding Checklist",    desc="Ensure all onboarding items completed before go-live",                        category="Process",  active=True,  coverage=62, scope="Partial", risk="High",     last_eval="30 min ago", deps=1, internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",  pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Operations"),
        Control(id="p4",  name="Contractual Obligation Review",    desc="Track active obligations and flag overdue deliverables",                      category="Process",  active=True,  coverage=85, scope="Full",    risk="Critical", last_eval="2 min ago",  deps=4, internal_spoc="priya@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=True,  personality="Consulting"),
        Control(id="p5",  name="Access Revocation on Exit",        desc="Remove all access within 24hrs of supplier staff offboarding",               category="Process",  active=True,  coverage=88, scope="Full",    risk="High",     last_eval="1 hr ago",   deps=2, internal_spoc="anita@abc.co", external_spoc="info@def.com", pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Security"),
        Control(id="p6",  name="Third-Party Risk Assessment",      desc="Annual TPRA due date monitoring and escalation",                             category="Process",  active=True,  coverage=74, scope="Partial", risk="High",     last_eval="45 min ago", deps=2, internal_spoc="priya@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=False, personality="Consulting"),
        Control(id="p7",  name="Patch Management SLA",             desc="OS patching within 30-day SLA window",                                       category="Process",  active=False, coverage=72, scope="Partial", risk="Medium",   last_eval="2 hrs ago",  deps=2, internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",  pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Operations"),
        Control(id="p8",  name="Quarterly Access Review",          desc="Review all active user accounts every 90 days",                              category="Process",  active=True,  coverage=88, scope="Full",    risk="Medium",   last_eval="1 hr ago",   deps=1, internal_spoc="raj@abc.co",   external_spoc="john@xyz.com", pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Consulting"),
        Control(id="p9",  name="Escalation Response Time",         desc="Critical alerts must be acknowledged within 2 hours",                        category="Process",  active=True,  coverage=94, scope="Full",    risk="Critical", last_eval="5 min ago",  deps=3, internal_spoc="anita@abc.co", external_spoc="ops@abc.com",  pii_flow="both",   truth_validator=True,  has_truth_gap=False, personality="Operations"),
        Control(id="p10", name="Change Management Process",        desc="All system changes require approved change request",                          category="Process",  active=True,  coverage=81, scope="Full",    risk="Medium",   last_eval="3 hrs ago",  deps=2, internal_spoc="raj@abc.co",   external_spoc="info@def.com", pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Operations"),
        Control(id="d1",  name="SOW Signature Verification",       desc="SOW must be signed before service delivery commences",                        category="Document", active=True,  coverage=83, scope="Full",    risk="Critical", last_eval="10 min ago", deps=3, internal_spoc="priya@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=True,  personality="Consulting"),
        Control(id="d2",  name="ISO 27001 Certificate Review",     desc="Track cert validity and trigger renewal 30 days before expiry",              category="Document", active=True,  coverage=91, scope="Full",    risk="High",     last_eval="20 min ago", deps=1, internal_spoc="anita@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=False, personality="Regulatory"),
        Control(id="d3",  name="Data Processing Agreement (DPA)",  desc="GDPR Art. 28 DPA in place with all data processors",                         category="Document", active=True,  coverage=79, scope="Partial", risk="Critical", last_eval="1 hr ago",   deps=2, internal_spoc="anita@abc.co", external_spoc="ops@abc.com",  pii_flow="both",   truth_validator=True,  has_truth_gap=True,  personality="Regulatory"),
        Control(id="t1",  name="MFA Enforcement",                  desc="All supplier-facing accounts must use multi-factor authentication",           category="Technical",active=True,  coverage=94, scope="Full",    risk="Critical", last_eval="5 min ago",  deps=2, internal_spoc="anita@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=False, personality="Security"),
        Control(id="t2",  name="Encryption at Rest",               desc="All supplier data stores must be AES-256 encrypted",                         category="Technical",active=True,  coverage=67, scope="Partial", risk="High",     last_eval="8 min ago",  deps=3, internal_spoc="anita@abc.co", external_spoc="info@def.com", pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Security"),
        Control(id="t3",  name="Data Classification Policy",       desc="All M365 and cloud assets must carry approved classification labels",         category="Technical",active=True,  coverage=91, scope="Full",    risk="Medium",   last_eval="8 min ago",  deps=1, internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",  pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Operations"),
        Control(id="t4",  name="Vulnerability Scan Cadence",       desc="Weekly automated vulnerability scans on all supplier-connected systems",      category="Technical",active=True,  coverage=88, scope="Full",    risk="High",     last_eval="20 min ago", deps=2, internal_spoc="anita@abc.co", external_spoc="john@xyz.com", pii_flow="share",  truth_validator=True,  has_truth_gap=False, personality="Security"),
        Control(id="t5",  name="Access Review Policy",             desc="Quarterly review of all user access rights across supplier systems",          category="Technical",active=True,  coverage=88, scope="Full",    risk="Medium",   last_eval="30 min ago", deps=2, internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",  pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Operations"),
        Control(id="t6",  name="Backup Verification",              desc="Daily backup integrity checks with monthly restore tests",                    category="Technical",active=True,  coverage=100,scope="Full",    risk="Medium",   last_eval="2 hrs ago",  deps=1, internal_spoc="raj@abc.co",   external_spoc="ops@abc.com",  pii_flow="ingest", truth_validator=False, has_truth_gap=False, personality="Operations"),
    ]
    db.add_all(controls)


# ── Risk Events ────────────────────────────────────────────

def _seed_risks(db: Session):
    events = [
        RiskEvent(id="r1", date="2026-03-04", supplier="XYZ Corporation",   desc="SOW signed after service delivery commenced",                    severity="critical", score_change="+18", status="Open",     current_score=78, category="Contractual", full_detail="SOW was signed on Feb 10 but service delivery began Feb 5. This creates a 5-day contractual exposure window.", impact="Legal liability, contract enforceability risk"),
        RiskEvent(id="r2", date="2026-03-03", supplier="XYZ Corporation",   desc="Unapproved payment of ₹10L with no PO found",                   severity="critical", score_change="+12", status="Open",     current_score=78, category="Financial",   full_detail="Payment of ₹10L was processed without a corresponding purchase order in the system.",                          impact="Financial control breach, potential fraud risk"),
        RiskEvent(id="r3", date="2026-03-02", supplier="GHI Technologies",  desc="Annual TPRA overdue by 3 days",                                  severity="high",     score_change="+8",  status="Open",     current_score=91, category="Compliance",  full_detail="Annual Third-Party Risk Assessment was due Mar 1. No submission received as of Mar 4.",                        impact="Regulatory non-compliance, unassessed risk exposure"),
        RiskEvent(id="r4", date="2026-02-28", supplier="ABC Services Ltd",  desc="SLA uptime breach — 98.1% vs 99.5% contracted",                  severity="high",     score_change="+5",  status="Open",     current_score=42, category="SLA",         full_detail="ABC Services reported 98.1% uptime for February 2026 against a contracted 99.5% SLA.",                       impact="Service reliability risk, penalty clause triggered"),
        RiskEvent(id="r5", date="2026-02-25", supplier="DEF Limited",       desc="3 orphaned accounts with active access to supplier systems",      severity="high",     score_change="+10", status="Open",     current_score=62, category="Access",      full_detail="Accounts U1042, U1098, U1187 belong to terminated employees but still have active system access.",             impact="Insider threat, data breach risk"),
        RiskEvent(id="r6", date="2026-02-20", supplier="MNO Partners",      desc="Onboarding checklist incomplete — 3 critical items missing",     severity="medium",   score_change="+6",  status="Open",     current_score=55, category="Compliance",  full_detail="MNO Partners onboarding is at 62%. Missing: BCP document, cyber insurance cert, sub-processor list.",          impact="Operational risk, incomplete due diligence"),
        RiskEvent(id="r7", date="2026-02-15", supplier="JKL Consultancy",   desc="DPA missing sub-processor annex — GDPR Article 28 breach",       severity="medium",   score_change="+4",  status="Open",     current_score=35, category="Legal",       full_detail="Data Processing Agreement with JKL Consultancy is missing the sub-processor annex required by GDPR Art. 28.", impact="GDPR non-compliance, regulatory penalty risk"),
        RiskEvent(id="r8", date="2026-01-10", supplier="STU Analytics",     desc="PII configuration not completed for data sharing",               severity="medium",   score_change="+3",  status="Resolved", current_score=22, category="PII",         full_detail="STU Analytics shares PII but the configuration in the TPRM portal is not completed.",                         impact="Data governance gap, untracked PII exposure"),
    ]
    db.add_all(events)
    db.flush()

    actions = [
        RiskAction(id="ra1",  risk_event_id="r1", title="Obtain legal sign-off on retroactive SOW",     detail="Engage legal team to assess retroactive contract enforceability",              score_reduction=8,  owner="priya@abc.co",    effort="High"),
        RiskAction(id="ra2",  risk_event_id="r1", title="Implement SOW pre-check in onboarding flow",  detail="Add system control to block service initiation until SOW is countersigned",   score_reduction=6,  owner="anita@abc.co",    effort="Medium"),
        RiskAction(id="ra3",  risk_event_id="r2", title="Finance Controller investigation",            detail="Review full payment chain and identify authorization gap",                     score_reduction=6,  owner="finance@abc.co",  effort="Medium"),
        RiskAction(id="ra4",  risk_event_id="r2", title="Enforce PO gating in payment system",        detail="Block payments above ₹1L without linked PO number",                           score_reduction=5,  owner="raj@abc.co",      effort="High"),
        RiskAction(id="ra5",  risk_event_id="r3", title="Escalate TPRA overdue notice",               detail="Send formal escalation to GHI Technologies SPOC and legal team",               score_reduction=4,  owner="priya@abc.co",    effort="Low"),
        RiskAction(id="ra6",  risk_event_id="r3", title="Complete risk assessment using last data",    detail="Use previous TPRA data to produce interim risk score while awaiting update",   score_reduction=3,  owner="priya@abc.co",    effort="Medium"),
        RiskAction(id="ra7",  risk_event_id="r4", title="Issue SLA penalty notice",                   detail="Trigger contractual penalty clause per Section 8.2 of MSA",                   score_reduction=2,  owner="raj@abc.co",      effort="Low"),
        RiskAction(id="ra8",  risk_event_id="r5", title="Immediate account revocation",               detail="IT Admin to disable U1042, U1098, U1187 within 2 hours",                      score_reduction=8,  owner="it-admin@abc.co", effort="Low"),
        RiskAction(id="ra9",  risk_event_id="r5", title="Audit all offboarded employee accounts",     detail="Run full HR-to-AD cross-reference for past 6 months",                          score_reduction=5,  owner="raj@abc.co",      effort="Medium"),
    ]
    db.add_all(actions)


# ── Templates ──────────────────────────────────────────────

def _seed_templates(db: Session):
    templates = [
        Template(id="tmpl1", name="ISO 27001 Assessment",         description="Full information security management system assessment",   category="Security",    deployed=True,  vendor_count=4, question_count=42, tags=["ISO","Security","Annual"],    anomalies=[{"type": "Gap", "field": "Asset Register", "severity": "high", "desc": "Missing formal asset register for 2 vendors"}]),
        Template(id="tmpl2", name="GDPR Supplier Questionnaire",  description="Data processing and privacy compliance assessment",        category="Compliance",  deployed=True,  vendor_count=6, question_count=28, tags=["GDPR","Privacy","DPA"],       anomalies=[{"type": "Missing", "field": "Sub-processor List", "severity": "critical", "desc": "JKL Consultancy has not submitted sub-processor annex"}]),
        Template(id="tmpl3", name="Annual TPRA",                  description="Comprehensive third-party risk assessment questionnaire",   category="Risk",        deployed=False, vendor_count=0, question_count=55, tags=["Annual","Risk","TPRA"],       anomalies=[]),
        Template(id="tmpl4", name="SOC 2 Readiness",              description="Service organization control readiness evaluation",        category="Security",    deployed=False, vendor_count=0, question_count=34, tags=["SOC2","Controls","Audit"],    anomalies=[]),
        Template(id="tmpl5", name="Onboarding Checklist",         description="Standard supplier onboarding requirements checklist",      category="Process",     deployed=True,  vendor_count=2, question_count=18, tags=["Onboarding","Checklist"],     anomalies=[{"type": "Incomplete", "field": "BCP Document", "severity": "medium", "desc": "MNO Partners missing business continuity plan"}]),
        Template(id="tmpl6", name="PII Data Mapping",             description="Personal data inventory and data flow questionnaire",      category="Privacy",     deployed=False, vendor_count=0, question_count=22, tags=["PII","Data Mapping","DPIA"],  anomalies=[]),
    ]
    db.add_all(templates)


# ── Library Graph ──────────────────────────────────────────

def _seed_library(db: Session):
    org = Organisation(id="org", name="ABC Corp", canvas_x=580, canvas_y=380)
    db.add(org)

    divs = [
        Division(id="d1",  name="Marketing Dept",  canvas_x=400,  canvas_y=200, lifecycle_stage=None),
        Division(id="d2",  name="Technical Dept",  canvas_x=350,  canvas_y=500, lifecycle_stage=None),
        Division(id="d3",  name="Operations Dept", canvas_x=760,  canvas_y=480, lifecycle_stage=None),
        Division(id="ld1", name="Growth & Leads",  canvas_x=200,  canvas_y=130, lifecycle_stage="Acquisition"),
        Division(id="ld3", name="Customer Success",canvas_x=600,  canvas_y=130, lifecycle_stage="Retention"),
        Division(id="ld5", name="Product Upgrades",canvas_x=1000, canvas_y=130, lifecycle_stage="Upgradation"),
        Division(id="ld7", name="Churn Prevention",canvas_x=1400, canvas_y=130, lifecycle_stage="Offboarding"),
    ]
    db.add_all(divs)
    db.flush()

    supplier_nodes = [
        SupplierNode(id="s1",   division_id="d1",  canvas_x=220,  canvas_y=120, name="XYZ Email Mktg",    stage="Acquisition", risk_score=78,   pii_volume="moderate", pii_flow="share",  pii_types=["Aadhar","Phone","Email"],  has_truth_gap=False, declared_pii=["Aadhar","Phone","Email"],  detected_pii=["Aadhar","Phone","Email"],  email="xyz@email.com",   internal_spoc="priya@abc.co", external_spoc="john@xyz.com",   frequency="Daily",  contract_end="2026-12-31", lifecycles=["Acquisition","Retention"], stakeholders={"businessOwner":"priya@abc.co","accountManager":"john@xyz.com"}),
        SupplierNode(id="s2",   division_id="d1",  canvas_x=380,  canvas_y=80,  name="Field Agent Co.",   stage="Acquisition", risk_score=None, pii_volume="low",      pii_flow="ingest", pii_types=["Email"],                   has_truth_gap=False, declared_pii=["Email"],                  detected_pii=["Email"],                  email="field@agent.com", internal_spoc="priya@abc.co", external_spoc="leads@field.com",frequency="Weekly", contract_end="2026-06-30", lifecycles=["Acquisition"], stakeholders={"businessOwner":"priya@abc.co"}),
        SupplierNode(id="s3",   division_id="d1",  canvas_x=200,  canvas_y=280, name="Call Center Ltd",   stage="Retention",   risk_score=22,   pii_volume="high",     pii_flow="both",   pii_types=["Aadhar","Phone"],          has_truth_gap=True,  declared_pii=["Phone"],                  detected_pii=["Aadhar","Phone","Location"],email="cc@ltd.com",      internal_spoc="raj@abc.co",   external_spoc="ops@ccltd.com",  frequency="Hourly", contract_end="2025-12-31", lifecycles=["Retention","Upgradation"]),
        SupplierNode(id="s4",   division_id="d2",  canvas_x=160,  canvas_y=460, name="CloudSec Inc.",     stage="Upgradation", risk_score=82,   pii_volume="low",      pii_flow="share",  pii_types=["Credentials"],             has_truth_gap=False, declared_pii=["Credentials"],            detected_pii=["Credentials"],            email="cloud@sec.com",   internal_spoc="anita@abc.co", external_spoc="cto@cloudsec.io",frequency="Daily",  contract_end="2027-03-31", lifecycles=["Upgradation"]),
        SupplierNode(id="s5",   division_id="d2",  canvas_x=200,  canvas_y=620, name="DataVault Co.",     stage="Retention",   risk_score=35,   pii_volume="moderate", pii_flow="both",   pii_types=["Financial","PAN"],         has_truth_gap=True,  declared_pii=["Financial"],              detected_pii=["Financial","PAN","Aadhar"],email="data@vault.co",   internal_spoc="anita@abc.co", external_spoc="dpo@datavault.co",frequency="Hourly",contract_end="2026-09-30", lifecycles=["Retention","Offboarding"]),
        SupplierNode(id="ls1",  division_id="ld1", canvas_x=90,   canvas_y=230, name="AdReach Pro",       stage="Acquisition", risk_score=72,   pii_volume="moderate", pii_flow="share",  pii_types=["Name","Email","Phone"],    has_truth_gap=False, declared_pii=["Name","Email","Phone"],    detected_pii=["Name","Email","Phone"],    email="ads@adreach.io",  internal_spoc="priya@abc.co", external_spoc="sam@adreach.io", frequency="Daily",  contract_end="2026-12-31", lifecycles=["Acquisition"]),
        SupplierNode(id="ls2",  division_id="ld1", canvas_x=330,  canvas_y=230, name="LeadGen Solutions", stage="Acquisition", risk_score=None, pii_volume="low",      pii_flow="ingest", pii_types=["Email"],                   has_truth_gap=False, declared_pii=["Email"],                  detected_pii=["Email"],                  email="info@leadgen.co", internal_spoc="priya@abc.co", frequency="Weekly", contract_end="2026-09-30", lifecycles=["Acquisition"]),
        SupplierNode(id="ls5",  division_id="ld3", canvas_x=500,  canvas_y=230, name="NPS Track Co.",     stage="Retention",   risk_score=68,   pii_volume="moderate", pii_flow="both",   pii_types=["Phone","Email"],           has_truth_gap=False, declared_pii=["Phone","Email"],          detected_pii=["Phone","Email"],          email="nps@track.io",    internal_spoc="raj@abc.co",   frequency="Daily",  contract_end="2026-10-31", lifecycles=["Retention"]),
        SupplierNode(id="ls6",  division_id="ld3", canvas_x=730,  canvas_y=230, name="Call Center Ltd",   stage="Retention",   risk_score=22,   pii_volume="high",     pii_flow="both",   pii_types=["Aadhar","Phone"],          has_truth_gap=True,  declared_pii=["Phone"],                  detected_pii=["Aadhar","Phone","Location"],email="cc@ltd.com",      internal_spoc="raj@abc.co",   external_spoc="ops@ccltd.com",  frequency="Hourly", contract_end="2025-12-31", lifecycles=["Retention"]),
        SupplierNode(id="ls9",  division_id="ld5", canvas_x=900,  canvas_y=230, name="UpSell AI",         stage="Upgradation", risk_score=76,   pii_volume="moderate", pii_flow="share",  pii_types=["Financial","PAN"],         has_truth_gap=False, declared_pii=["Financial","PAN"],        detected_pii=["Financial","PAN"],        email="api@upsellai.com",internal_spoc="anita@abc.co", frequency="Daily",  contract_end="2026-12-31", lifecycles=["Upgradation"]),
        SupplierNode(id="ls13", division_id="ld7", canvas_x=1300, canvas_y=230, name="Churn Analytics",   stage="Offboarding", risk_score=50,   pii_volume="moderate", pii_flow="ingest", pii_types=["Phone","Email"],           has_truth_gap=False, declared_pii=["Phone","Email"],          detected_pii=["Phone","Email"],          email="ops@churnai.io",  internal_spoc="kiran@abc.co", frequency="Daily",  contract_end="2026-07-31", lifecycles=["Offboarding"]),
        SupplierNode(id="ls14", division_id="ld7", canvas_x=1530, canvas_y=230, name="WinBack Mktg",      stage="Offboarding", risk_score=40,   pii_volume="low",      pii_flow="share",  pii_types=["Email"],                   has_truth_gap=False, declared_pii=["Email"],                  detected_pii=["Email"],                  email="wb@winback.in",   internal_spoc="kiran@abc.co", frequency="Weekly", contract_end="2025-12-31", lifecycles=["Offboarding"]),
    ]
    db.add_all(supplier_nodes)
    db.flush()

    system_nodes = [
        SystemNode(id="sys1",  division_id="d1",  canvas_x=480,  canvas_y=100, name="Salesforce CRM", type="crm",   data_source="AWS S3 Bucket (us-east-1/crm-prod)",       pii_types=["Name","Email","Phone","DOB"],    vuln_score=82, stage="Acquisition", internal_spoc="priya@abc.co", authorized_pii=["Name","Phone","Email","DOB"], has_stage_discrepancy=True,  discrepancy_fields=["Bank Balance","Aadhar"], linked_supplier_id="s2", agent_reasoning={"timestamp":"09:14 AM","action":"Stage PII Audit","trigger":"Salesforce CRM · Acquisition Step","reasoning":"Detected 'Bank Balance' and 'Aadhar' fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step.","confidence":94,"outcome":"alert"}),
        SystemNode(id="sys2",  division_id="d2",  canvas_x=120,  canvas_y=560, name="AWS Infra",       type="infra", data_source="SQL DB (prod-db.internal:5432)",           pii_types=["Credentials","Financial","PAN"], vuln_score=61, stage="Upgradation", internal_spoc="anita@abc.co", authorized_pii=["Credentials","Financial","PAN"], has_stage_discrepancy=False, linked_supplier_id="s4"),
        SystemNode(id="lsys1", division_id="ld1", canvas_x=215,  canvas_y=320, name="Salesforce CRM", type="crm",   data_source="AWS S3 (us-east-1/crm-prod)",              pii_types=["Name","Email","Phone","DOB"],    vuln_score=82, stage="Acquisition", internal_spoc="priya@abc.co", authorized_pii=["Name","Phone","Email"],       has_stage_discrepancy=True,  discrepancy_fields=["Bank Balance","Aadhar"], linked_supplier_id="ls2", agent_reasoning={"timestamp":"09:14 AM","action":"Stage PII Audit","trigger":"Salesforce CRM · Acquisition Step","reasoning":"Detected 'Bank Balance' and 'Aadhar' fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step.","confidence":94,"outcome":"alert"}),
        SystemNode(id="lsys3", division_id="ld3", canvas_x=615,  canvas_y=320, name="Zendesk CRM",    type="crm",   data_source="AWS RDS (ap-south-1/zendesk-prod)",        pii_types=["Name","Email","Phone"],          vuln_score=79, stage="Retention",   internal_spoc="raj@abc.co",   authorized_pii=["Name","Email","Phone"],       has_stage_discrepancy=False, linked_supplier_id="ls5"),
        SystemNode(id="lsys5", division_id="ld5", canvas_x=1015, canvas_y=320, name="Policy Engine",  type="infra", data_source="AWS S3 (ap-south-1/policy-engine)",        pii_types=["Financial","PAN","DOB"],         vuln_score=65, stage="Upgradation", internal_spoc="anita@abc.co", authorized_pii=["Financial","PAN","DOB"],      has_stage_discrepancy=False, linked_supplier_id="ls9"),
        SystemNode(id="lsys7", division_id="ld7", canvas_x=1415, canvas_y=320, name="Churn Dashboard",type="crm",   data_source="GCP BigQuery (project/churn-metrics)",     pii_types=["Phone","Email"],                 vuln_score=70, stage="Offboarding", internal_spoc="kiran@abc.co", authorized_pii=["Phone","Email"],              has_stage_discrepancy=False, linked_supplier_id="ls13"),
    ]
    db.add_all(system_nodes)


# ── Settings ───────────────────────────────────────────────

def _seed_settings(db: Session):
    s = OrgSettings(
        id="global",
        org_name="ABC Corp",
        org_industry="Financial Services",
        org_country="India",
        org_timezone="Asia/Kolkata",
        notify_email=True,
        notify_slack=False,
        notify_critical_only=False,
        ai_model="claude-sonnet-4-6",
        ai_temperature="0.3",
        ai_reasoning_visible=True,
        compliance_frameworks=["ISO 27001", "GDPR", "SOC 2"],
        portal_accent_color="#0EA5E9",
        portal_welcome_msg="Welcome to the ABC Corp Supplier Portal. Please complete your assessment.",
        integrations=[
            {"name": "Slack",      "connected": False, "config": {}},
            {"name": "ServiceNow", "connected": False, "config": {}},
            {"name": "Jira",       "connected": False, "config": {}},
            {"name": "Email",      "connected": True,  "config": {"smtp": "smtp.abc.co"}},
        ],
    )
    db.add(s)
