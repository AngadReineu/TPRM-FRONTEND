# Agents Page — 3 Fixes + Enhancements
## Figma Make Prompt — Update Agents.tsx + Sidebar.tsx

CONTEXT:
- Project: Kyudo TPRM Platform
- Files to edit: src/app/pages/Agents.tsx + src/app/components/layout/Sidebar.tsx
- Stack: React 18 + TypeScript + Tailwind CSS v4 + react-router (not react-router-dom) + lucide-react + sonner
- All modals centered, no side panels, no emoji, lucide-react icons only
- Toaster already in App.tsx — do not add it again
- All data mock/hardcoded — no backend

---

## FIX 1 — SIDEBAR [+] BUTTON (Sidebar.tsx)

Currently clicking [+] next to Agents navigates to `/controls/create`. Fix this.

Change the onClick of the [+] button in the AGENTS section to:
```tsx
import { useNavigate } from 'react-router'

const navigate = useNavigate()

// [+] button onClick:
onClick={() => navigate('/agents', { state: { openCreateModal: true } })}
```

This navigates to the Agents page and passes a flag to auto-open the Create Agent modal.

---

## FIX 2 — AGENTS.TSX: READ STATE FLAG + AUTO-OPEN MODAL

At the top of Agents.tsx, read the navigation state:

```tsx
import { useLocation } from 'react-router'

const location = useLocation()

useEffect(() => {
  if (location.state?.openCreateModal) {
    setShowCreateModal(true)
  }
}, [location.state])
```

---

## FIX 3 — SIDEBAR AGENT SUB-ITEMS (Sidebar.tsx)

Currently clicking A1/A2/A3 in sidebar navigates to `/agents`. Change to pass the agent id:

```tsx
// A1 sub-item:
onClick={() => navigate('/agents', { state: { openAgentDetail: 'a1' } })}
// A2:
onClick={() => navigate('/agents', { state: { openAgentDetail: 'a2' } })}
// A3:
onClick={() => navigate('/agents', { state: { openAgentDetail: 'a3' } })}
```

In Agents.tsx, read this state:
```tsx
useEffect(() => {
  if (location.state?.openAgentDetail) {
    const agent = agents.find(a => a.id === location.state.openAgentDetail)
    if (agent) {
      setSelectedAgent(agent)
      setView('detail')
    }
  }
}, [location.state])
```

---

## ENHANCEMENT 1 — AGENT DETAIL PAGE (View 2) — ADD MONITORING PANEL

Keep the existing Profile Card and 4 Action Cards. Add two NEW sections BETWEEN them.

---

### NEW SECTION A — LIVE MONITORING PANEL

Insert between Profile Card and 4 Action Cards.
`display: grid, gridTemplateColumns: 1fr 1fr, gap: 16px, padding: 0 24px, marginTop: 16px`

#### Left Card — Suppliers Being Watched
`bg-white border border-[#E2E8F0] rounded-xl p-5`

Header row:
- Eye icon 16px `#0EA5E9` + "Suppliers Monitored" 14px bold `#0F172A`
- Count chip `bg-[#EFF6FF] text-[#0EA5E9] text-11px px-2 rounded-full` showing supplier count

2–3 supplier rows. Each row:
```
display: flex, justifyContent: space-between, alignItems: center
padding: 10px 0
borderBottom: 1px solid #F8FAFC
```

Left: colored stage dot 8px + supplier name 13px bold `#334155` + stage badge pill below name (10px)
Right: status pill
- If data flowing: `bg-[#ECFDF5] text-[#10B981]` "● Flowing"
- If alert: `bg-[#FEF2F2] text-[#EF4444]` "⚠ Alert"
- If pending: `bg-[#FFFBEB] text-[#F59E0B]` "⏳ Pending"

Mock data per agent:
```
A1 suppliers:
  XYZ Corporation — Acquisition — Flowing
  GHI Technologies — Acquisition — Alert

A2 suppliers:
  ABC Services Ltd — Retention — Flowing
  JKL Consultancy — Retention — Flowing
  MNO Partners — Retention — Pending

A3 suppliers:
  DEF Limited — Upgradation — Alert
```

#### Right Card — Controls Being Enforced
`bg-white border border-[#E2E8F0] rounded-xl p-5`

Header row:
- ShieldCheck icon 16px `#8B5CF6` + "Controls Enforced" 14px bold `#0F172A`
- Count chip `bg-[#F5F3FF] text-[#8B5CF6] text-11px px-2 rounded-full`

2–4 control rows. Each row:
```
display: flex, justifyContent: space-between, alignItems: center
padding: 10px 0
borderBottom: 1px solid #F8FAFC
```

Left: control name 13px bold `#334155` + category badge below (Technical/Process/Document — 10px)
Right: result pill
- Passing: `bg-[#ECFDF5] text-[#10B981]` CheckCircle2 icon 12px + "Passing"
- Issue: `bg-[#FFFBEB] text-[#F59E0B]` AlertTriangle icon 12px + "1 Issue"
- Failed: `bg-[#FEF2F2] text-[#EF4444]` XCircle icon 12px + "Failed"

Mock data per agent:
```
A1 controls:
  MFA Enforcement — Technical — Passing
  Data Classification Policy — Document — 1 Issue
  Backup Verification — Process — Passing

A2 controls:
  Access Review Policy — Process — Passing
  Incident Response Plan — Document — Passing

A3 controls:
  Network Segmentation — Technical — Failed
  Patch Management — Process — 1 Issue
  Vulnerability Scanning — Technical — Passing
  Privileged Access Mgmt — Technical — Passing
```

---

### NEW SECTION B — AGENT REASONING FEED

Insert below the Live Monitoring Panel, above the 4 Action Cards.
`padding: 0 24px, marginTop: 16px`

Card: `bg-white border border-[#E2E8F0] rounded-xl overflow-hidden`

Header: `padding: 14px 16px, borderBottom: 1px solid #F8FAFC, display flex, justifyContent space-between, alignItems center`
- Brain/Cpu icon 16px `#0EA5E9` + "Agent Reasoning" 14px bold `#0F172A`
- Right: green ping dot 8px + "Live" 12px `#10B981` (ping animation)

4 reasoning rows. Each row:
```
display: flex, gap: 12px
padding: 12px 16px
borderBottom: 1px solid #F8FAFC
```
Last row no border.

Row structure:
- Left: timestamp column — 11px `#94A3B8`, width 70px, flexShrink 0
- Center: flex-1
  - Action line: 13px `#334155` — bold trigger + normal description
  - Reasoning text: 12px `#64748B` italic — the AI's reasoning
  - Confidence badge: `bg-[#F8FAFC] border border-[#E2E8F0] text-11px text-[#64748B] px-2 py-0.5 rounded-full` — "Confidence: XX%"
- Right: outcome icon 16px

Mock reasoning rows per agent:

**A1 reasoning:**
```
Row 1:
  Time: "2 min ago"
  Action: "MFA Check · XYZ Corporation admin accounts"
  Reasoning: "Queried Azure AD. Found 94 of 100 accounts compliant. 6 accounts flagged."
  Confidence: "94%"
  Outcome: CheckCircle2 #10B981

Row 2:
  Time: "8 min ago"
  Action: "Data Flow Alert · GHI Technologies"
  Reasoning: "No data received in 7 days. SLA breach detected. Alert triggered and Risk Manager notified."
  Confidence: "99%"
  Outcome: AlertCircle #EF4444

Row 3:
  Time: "32 min ago"
  Action: "Backup Verification · XYZ Corporation"
  Reasoning: "Backup logs reviewed. Last successful backup 18 hours ago. Within acceptable threshold."
  Confidence: "88%"
  Outcome: CheckCircle2 #10B981

Row 4:
  Time: "1 hr ago"
  Action: "Document Expiry · ISO 27001 Certificate"
  Reasoning: "Certificate expiry date extracted. Expires in 22 days. Renewal reminder sent to supplier."
  Confidence: "97%"
  Outcome: AlertTriangle #F59E0B
```

**A2 reasoning:**
```
Row 1:
  Time: "8 min ago"
  Action: "Data Alert · Call Center Ltd"
  Reasoning: "Expected daily data feed not received. Checked SFTP logs. No transfer recorded. Alert raised."
  Confidence: "96%"
  Outcome: AlertCircle #EF4444

Row 2:
  Time: "1 hr ago"
  Action: "Access Review · ABC Services Ltd"
  Reasoning: "Quarterly access review policy evaluated. All user access rights confirmed current."
  Confidence: "91%"
  Outcome: CheckCircle2 #10B981

Row 3:
  Time: "3 hrs ago"
  Action: "Incident Response · JKL Consultancy"
  Reasoning: "IR plan document reviewed. Board approval confirmed. Ransomware scenario included."
  Confidence: "85%"
  Outcome: CheckCircle2 #10B981

Row 4:
  Time: "5 hrs ago"
  Action: "SLA Check · MNO Partners"
  Reasoning: "Assessment portal link sent 30 days ago. No response received. Escalation triggered."
  Confidence: "100%"
  Outcome: AlertTriangle #F59E0B
```

**A3 reasoning:**
```
Row 1:
  Time: "just now"
  Action: "Network Check · DEF Limited"
  Reasoning: "Network segmentation control evaluated. DMZ configuration missing. Control marked Failed."
  Confidence: "92%"
  Outcome: AlertCircle #EF4444

Row 2:
  Time: "20 min ago"
  Action: "Patch Status · DEF Limited"
  Reasoning: "Last patch applied 45 days ago. SLA requires 30 days. 1 issue flagged for review."
  Confidence: "89%"
  Outcome: AlertTriangle #F59E0B

Row 3:
  Time: "2 hrs ago"
  Action: "Vulnerability Scan · DEF Limited"
  Reasoning: "Automated scan results reviewed. 0 critical vulnerabilities. Scan coverage 100%."
  Confidence: "95%"
  Outcome: CheckCircle2 #10B981

Row 4:
  Time: "4 hrs ago"
  Action: "PAM Evaluation · DEF Limited"
  Reasoning: "Privileged access management controls evaluated. JIT access confirmed active."
  Confidence: "87%"
  Outcome: CheckCircle2 #10B981
```

---

## ENHANCEMENT 2 — CREATE AGENT MODAL — 3 NEW FIELDS

Add these 3 fields to the existing Create Agent modal body, after Alert Sensitivity:

### New Field 1 — Check Frequency
Label: "Check Frequency" 13px bold `#334155`
4 pill buttons single-select (same style as Alert Sensitivity):
Hourly / Every 6hrs / Daily / Weekly
Default selected: "Daily" — `bg-[#0EA5E9] text-white`
Unselected: `border border-[#E2E8F0] bg-white text-[#64748B]`

### New Field 2 — Notify
Label: "Notify" 13px bold `#334155`
Multi-select searchable dropdown (same style as Assign Controls/Suppliers)
Options: Risk Manager / Compliance Officer / DPO / Admin / Analyst
Selected show as teal chips: `bg-[#ECFDF5] text-[#10B981] text-12px rounded-full px-2 py-0.5` with × remove
Default pre-selected: "Risk Manager"

### New Field 3 — Assign Division
Label: "Assign Division" 13px bold `#334155`
Single-select dropdown `border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-14px bg-white w-full`
Options:
- Select division... (default placeholder)
- Marketing Dept
- Technical Dept
- Operations Dept
Helper text below: "Connects this agent to your organization graph" 12px `#94A3B8`

---

## UPDATED MOCK AGENT DATA

Add new fields to existing agent objects:
```ts
const agents = [
  {
    id: 'a1', name: 'Agent A1', initials: 'A1',
    status: 'live', stage: 'Acquisition',
    controls: 3, suppliers: 2,
    gradient: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
    alerts: 2, lastActive: '2 min ago', health: 82,
    division: 'Marketing Dept',
    frequency: 'Hourly',
    notify: ['Risk Manager', 'Compliance Officer'],
  },
  {
    id: 'a2', name: 'Agent A2', initials: 'A2',
    status: 'active', stage: 'Retention',
    controls: 2, suppliers: 3,
    gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)',
    alerts: 0, lastActive: '8 min ago', health: 94,
    division: 'Operations Dept',
    frequency: 'Daily',
    notify: ['Risk Manager'],
  },
  {
    id: 'a3', name: 'Agent A3', initials: 'A3',
    status: 'syncing', stage: 'Upgradation',
    controls: 4, suppliers: 1,
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    alerts: 3, lastActive: 'just now', health: 61,
    division: 'Technical Dept',
    frequency: 'Every 6hrs',
    notify: ['Risk Manager', 'DPO', 'Admin'],
  },
]
```

Also show division and frequency in Agent Detail Profile Card below the stage badge:
- "Marketing Dept · Checks hourly" — 12px `#94A3B8`

---

## FINAL AGENT DETAIL PAGE LAYOUT (top to bottom)

```
Header (← Back to Agents | Agent Name | Status badge)
    ↓
Profile Card (avatar + name + status + stage + division + frequency + stats)
    ↓
Live Monitoring Panel (2 columns: Suppliers Monitored | Controls Enforced)
    ↓
Agent Reasoning Feed (timestamped AI decisions with confidence scores)
    ↓
4 Action Cards (Select Picture | Select Voice | Talk to Agent | Start Chat)
```

---

## CRITICAL RULES

1. Fix [+] sidebar button — must open Create Agent modal, NOT go to /controls/create
2. Fix A1/A2/A3 sidebar clicks — must open that agent's detail view
3. Agent detail page: keep existing Profile Card + 4 Action Cards, ADD monitoring panel + reasoning feed between them
4. Create Agent modal: keep all existing fields, ADD 3 new fields after Alert Sensitivity
5. All reasoning data is per-agent — use selectedAgent.id to show correct rows
6. Do not add Toaster — already in App.tsx
7. No emoji — lucide-react icons only
8. Import new icons needed: Eye, Brain, Cpu, XCircle, CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck