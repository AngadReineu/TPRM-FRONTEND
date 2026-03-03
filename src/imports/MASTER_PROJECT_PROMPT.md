# Kyudo — TPRM Platform · Master Project Prompt

Use this prompt as full context before making any change to this codebase.

---

## 1. WHAT IS THIS PROJECT

**Kyudo** is an enterprise **Third-Party Risk Management (TPRM)** web platform built for insurance/healthcare organizations. It helps risk teams monitor suppliers, enforce security controls, track AI agents, and manage compliance — all in one place.

The fictional client is **ABC Insurance Co.** and the logged-in user is **Priya Sharma (Risk Manager)**.

The platform has **13 pages** accessible from a persistent sidebar. It is a **pure frontend React app** — all data is mock/hardcoded, nothing connects to a real backend. All state resets on page refresh.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | `react-router` (v7, Data Mode) — **NOT** `react-router-dom` |
| Styling | Tailwind CSS v4 + inline `style={{}}` objects |
| Charts | `recharts` (LineChart, ResponsiveContainer, etc.) |
| Icons | `lucide-react` |
| Toasts | `sonner` — `<Toaster />` is mounted once in `App.tsx`, renders bottom-right |
| Build | Vite |
| Font | Inter (via CSS), fallback system-sans |

---

## 3. FILE STRUCTURE

```
/src
  /app
    App.tsx                  ← Root. Mounts <RouterProvider> + <Toaster />
    routes.tsx               ← All routes defined with createBrowserRouter
    /pages
      Dashboard.tsx
      Controls.tsx
      CreateControl.tsx
      Agents.tsx             ← Handles Dashboard, Agent Detail + Create Modal (in-page state)
      AgentDetail.tsx        ← Legacy route file (kept but Agents.tsx handles detail now)
      Library.tsx            ← Interactive Knowledge Graph (full-bleed canvas)
      LibraryHealthcare.tsx  ← Healthcare template detail page
      TPRM.tsx               ← Supplier management table (lifecycle-grouped)
      RiskThreat.tsx         ← Risk scoring + remediation
      AuditLogs.tsx          ← Activity log table
      Documents.tsx          ← Document RAG + AI chat
      Roles.tsx              ← Permission matrix + user list
      Settings.tsx           ← Platform settings tabs
      Templates.tsx          ← Agent personality templates library (NEW - page 13)
    /components
      /layout
        Shell.tsx            ← Master layout wrapper
        Sidebar.tsx          ← Fixed 240px dark navy left nav
        TopBar.tsx           ← 64px top bar with page title + bell + avatar
```

---

## 4. LAYOUT SYSTEM — HOW ALL PAGES ARE WRAPPED

### Shell.tsx
Every page renders inside `Shell`. It sets up the three-column/row layout:
- **Sidebar** (fixed, 240px wide, left)
- A spacer div (240px) to offset content
- **Right column** = TopBar (64px) + `<main>` (flex:1, overflowY:auto, padding: 24px 32px)
- The `<Outlet />` (React Router) renders the active page inside `<main>`

**Important:** `<main>` has `padding: 24px 32px`. Most pages respect this. **Only the Library page breaks out** using `margin: -24px -32px` and `height: calc(100vh - 64px)` to achieve full-bleed canvas.

---

### Sidebar.tsx — dark navy theme

**Visual design:**
- Background: `#1B2236` (dark navy)
- Width: 240px, fixed position
- Item text (default): `#8B9CC8`
- Item text (active/hover): `#FFFFFF` / `#C8D3F5`
- Active item background: `rgba(255,255,255,0.10)`
- Dividers: `rgba(255,255,255,0.06)`
- Section labels: `#4A5680`

**Header (64px):**
- Custom SVG bullseye logo (concentric circles, blue tones)
- Text: **"Kyudo"** bold `#E2E8F0` + sub-label **"TPRM Platform"** `#4A5568`

**Navigation structure — 6 collapsible sections:**
All sections use a `<SectionLabel>` toggle header. Sections default open. State stored in `collapsed` object (`useState`).

1. **PLATFORM** — Dashboard → `/`
2. **SECURITY SCANNER** — Scanner Overview, Compliance, Findings, Scans (PlainItems — no routes yet)
3. **GOVERNANCE** — Controls Hub, Evidence Hub, Assessments (PlainItems — no routes yet)
4. **ORGANIZATION DATA FLOW** — TPRM → `/tprm`, Library → `/libraries`, Risk Threat → `/risk-threat`
5. **AGENTS** — (see detail below)
6. **POLICY** — PolicyPilot, Tenant Admin (PlainItems), Supplier Portal (external link `#`)

**Pinned item (above footer):** Settings → `/settings`

**Section 5 — AGENTS (special structure):**
- "Agents" NavLink → `/agents` with `end` (exact match)
- `[+]` button (20px circle, right of Agents label):
  ```tsx
  onClick={() => navigate('/agents', { state: { openCreateModal: true } })}
  ```
- 3 agent sub-items (dot + label, indented): A1 (`#0EA5E9`), A2 (`#10B981`), A3 (`#8B5CF6`)
  - These navigate to `/agents` with `{ state: { openAgentDetail: 'a1'|'a2'|'a3' } }`
  - These are `<div>` elements (not NavLink)
- Controls → `/controls` (Sliders icon, indented)
- **Templates → `/templates` (LayoutTemplate icon, indented)** ← NEW

**Footer — User profile card:**
- Gradient avatar 32px initials "PS"
- Name: "Priya Sharma" `#C8D3F5` bold + role "Risk Manager" `#4A5680`
- LogOut icon button right side

**Imports used in Sidebar:**
`useNavigate`, `NavLink` from `react-router`, lucide icons: `Bot, Plus, Settings, LogOut, ChevronDown, ChevronRight, Database, BookOpen, AlertTriangle, ShieldCheck, ScanLine, Scan, FolderOpen, ClipboardList, Compass, UserCog, ExternalLink, Sliders, LayoutDashboard, Link, LayoutTemplate`

---

### TopBar.tsx
- 64px tall, white, `border-bottom: 1px solid #E2E8F0`
- Left: dynamic page title (passed from Shell via `routeTitles` map)
- Right: Bell icon (with red dot badge) + Avatar "PS" (blue circle 36px)

---

## 5. ROUTING (routes.tsx)

```
/                   → Dashboard
/controls           → Controls
/controls/create    → CreateControl
/agents             → Agents  (also handles Agent Detail + Create Modal via internal state + navigation state)
/agents/:id         → AgentDetail (legacy, kept for backward compat)
/libraries          → Library (Knowledge Graph)
/libraries/healthcare → LibraryHealthcare
/tprm               → TPRM
/risk-threat        → RiskThreat
/audit-logs         → AuditLogs
/documents          → Documents
/roles              → Roles
/settings           → Settings
/templates          → Templates  ← NEW
*                   → NotFound (404)
```

All routes are children of `Shell` (the root `Component`).

---

## 6. DESIGN SYSTEM

### Colors
| Token | Hex | Use |
|---|---|---|
| Primary blue | `#0EA5E9` | CTAs, active states, links, Share PII flow |
| Dark blue | `#0284C7` | Button hover |
| Green | `#10B981` | Success, low risk, live status, Ingest PII flow |
| Amber | `#F59E0B` | Warning, medium risk, syncing |
| Red | `#EF4444` | Critical risk, error, danger, Truth Gap alerts |
| Purple | `#8B5CF6` | Controls, document, library divisions, Bidirectional PII flow |
| Slate | `#64748B` | Internal system nodes, secondary text |
| Gray text | `#64748B` | Secondary text |
| Muted text | `#94A3B8` | Placeholder, labels |
| Dark text | `#0F172A` | Primary headings |
| Body text | `#334155` | Normal text |
| Border | `#E2E8F0` | All card/input borders |
| Page bg | `#F8FAFC` | Shell background |
| White | `#FFFFFF` | Cards, inputs |
| Sidebar bg | `#1B2236` | Sidebar only |

### Stage Badges (used across ALL pages — keep consistent)
| Stage | Background | Text color |
|---|---|---|
| Acquisition | `#EFF6FF` | `#0EA5E9` |
| Retention | `#ECFDF5` | `#10B981` |
| Upgradation | `#FFFBEB` | `#F59E0B` |
| Offboarding | `#F1F5F9` | `#64748B` |

### Risk Badges
| Risk | Background | Text color |
|---|---|---|
| Critical | `#FEF2F2` | `#EF4444` |
| High | `#FFFBEB` | `#F59E0B` |
| Medium | `#F1F5F9` | `#64748B` |
| Low | `#ECFDF5` | `#10B981` |

### Card style (used everywhere)
```css
background: #fff;
border: 1px solid #E2E8F0;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.06);
```

### Modal rules — CRITICAL
- **ALL modals must be centered** (fixed position, flex center, backdrop `rgba(0,0,0,0.2)` or `rgba(15,23,42,0.4)`)
- **Never use side panels or slide-in drawers** for modals
- Standard modal: `bg-white, rounded-2xl (border-radius:16px), shadow-2xl, p-6`
- Always include an X close button (top-right)
- Scale-in animation: `@keyframes scaleIn { from {opacity:0;transform:scale(0.94)} to {opacity:1;transform:scale(1)} }`

### Toasts
- Imported from `sonner`: `import { toast } from 'sonner'`
- Use `toast.success()`, `toast.error()`, `toast()`
- `<Toaster />` is in `App.tsx` — do NOT add it elsewhere

---

## 7. EACH PAGE — WHAT IT CONTAINS

---

### PAGE 1 — Dashboard (`/`)
**File:** `src/app/pages/Dashboard.tsx`
**Purpose:** Executive overview of risk posture.

**Sections (top to bottom):**
1. **Welcome Banner** — "Good morning, Priya" + "ABC Insurance Company · Healthcare · Mumbai" + Overall Risk Posture badge "62/100 Medium"
2. **4 KPI Cards** (grid): Total Suppliers (48), High Risk Suppliers (15), Active Agents (14), Pending Assessments (23)
3. **Two-column row:** Supplier Risk by Stage (left) + Risk Score Trend Recharts LineChart (right, Aug–Feb, 3 lines)
4. **Agent Activity Strip** — 5 agents (A1–A5) with status badges

**Navigation from here:** → TPRM (via "View All"), → Risk Threat (via "Full Report →")

---

### PAGE 2 — Controls (`/controls`)
**File:** `src/app/pages/Controls.tsx`
**Purpose:** List and manage security/compliance controls with full intelligence context.

#### Control Data Model (CURRENT)
```ts
interface Control {
  id: string; name: string; desc: string;
  category: 'Technical' | 'Process' | 'Document' | 'Expected Res.';
  active: boolean; coverage: number; scope: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  lastEval: string; deps: number;
  /* Intelligence fields */
  internalSPOC?: string;      // org's relationship owner email
  externalSPOC?: string;      // supplier's account manager email
  piiFlow?: 'share' | 'ingest' | 'both';  // directional PII monitoring
  truthValidator?: boolean;   // true = this control validates PII declarations
  hasTruthGap?: boolean;      // true = detected PII ≠ declared PII
  personality?: 'Consulting' | 'Operations' | 'Security' | 'Regulatory';
}
```

**Page Header:**
- "Controls" h1 + sub-line: "{N} controls · {N} truth validators · {N} gaps detected (red) / all clear (green)"
- "+ Create Control" button → `/controls/create`

**Intelligence Summary Strip (4 cards, grid-cols-4):**
- Consulting Audits (Handshake blue `#0EA5E9`)
- Operations Checks (Truck green `#10B981`)
- Security Validators (ShieldCheck purple `#8B5CF6`)
- Regulatory Monitors (Scale amber `#F59E0B`)
- Each card: 36px icon box + count (20px bold) + label (12px gray)

**Filters row:**
- Search input
- Category filter pills: All / Technical / Process / Document / Expected Res.
- Personality filter pills: All / Consulting / Operations / Security / Regulatory (each pill uses its personality color when selected)
- "More Filters" button (SlidersHorizontal)

**Table — 12 columns (horizontally scrollable, minWidth 1100px):**

| Column | Notes |
|---|---|
| Control Name | name (bold) + desc (12px gray) |
| **Personality** | `PersonalityBadge` — small colored badge with icon (Handshake/Truck/ShieldCheck/Scale) |
| **Relational Context** | `RelationalContext` — stacked gradient avatar circles (INT + EXT), hover shows dark tooltip card with INT email (blue `#93C5FD`) + EXT email (green `#86EFAC`) and a caret arrow |
| Category | `CategoryBadge` (Technical/Process/Document/Expected Res.) |
| **PII Flow** | `PiiFlowCell` — MoveUpRight (blue, "Share") / MoveDownLeft (green, "Ingest") / Repeat2 (purple, "Both") |
| **Truth Match** | `TruthMatchCell` — N/A (gray) when `!truthValidator`; green "Validated" when no gap; red "Gap Detected" when `hasTruthGap` |
| Active | `Toggle` — functional (click toggles state + toast) |
| Coverage | progress bar (72px) + % colored (green ≥80 / amber ≥50 / red <50) |
| Risk | `RiskBadge` |
| Last Evaluated | 12px gray text |
| Deps | gray pill chip |
| Actions | Eye / Pencil / Play icon buttons → `toast()` |

**Column header colors:** Personality=`#8B5CF6`, Relational Context=`#0EA5E9`, PII Flow=`#0EA5E9`, Truth Match=`#10B981` — differentiates intelligence columns from standard ones.

**Empty state:** "No controls match your filters" (centered, 40px padding, gray)

**Mock data (10 controls — CURRENT personality + SPOC assignments):**
- MFA Enforcement: Consulting, priya@abc.co ↔ john@xyz.com, share, truthValidator+no gap
- Encryption at Rest: Security, anita@abc.co ↔ ops@abc.com, both, truthValidator+GAP
- Access Review Policy: Consulting, raj@abc.co ↔ john@xyz.com, ingest, not validator
- Network Segmentation: Security, anita@abc.co ↔ info@def.com, share, truthValidator+GAP
- Patch Management: Operations, raj@abc.co ↔ ops@abc.com, ingest, not validator
- Data Classification Policy: Regulatory, priya@abc.co ↔ john@xyz.com, both, truthValidator+no gap
- Incident Response Plan: Regulatory, raj@abc.co ↔ info@def.com, share, not validator
- Backup Verification: Operations, priya@abc.co ↔ ops@abc.com, ingest, not validator
- Vulnerability Scanning: Security, anita@abc.co ↔ info@def.com, share, truthValidator+no gap
- Privileged Access Mgmt: Security, anita@abc.co ↔ john@xyz.com, both, truthValidator+no gap

**Navigation from here:** → `/controls/create`

---

### PAGE 3 — Create Control (`/controls/create`)
**File:** `src/app/pages/CreateControl.tsx`

**6-step wizard** (steps shown in linear stepper bar at top):

#### Step 1 — Basic Info

**Control Source — 3-card selector** (1fr 1fr 1fr grid):
- **Local Control** (blue `#0EA5E9`) — Create and manage locally within Kyudo
- **Imported from Kyudo** (purple `#8B5CF6`) — Import from external Kyudo governance framework
- **Import from GRC Systems** (green `#10B981`) — Pull from ServiceNow GRC, Archer, or OneTrust
  - Selecting "Import from GRC" reveals a green `#ECFDF5` expansion panel with a **Provider dropdown** (ServiceNow GRC / Archer (RSA) / OneTrust / MetricStream / IBM OpenPages)
  - When a provider is selected, shows: "The AI Agent will map this static GRC requirement to a **Live Contextual Audit** — linking the {provider} policy definition directly to your SPOC-based email monitoring."
  - Icon used: `GitMerge` (lucide-react)

**Monitoring Personality — vertical radio card selector:**
4 options, same pattern as Agents Create Modal:
| Personality | Icon | Color | Sub |
|---|---|---|---|
| Consulting | Handshake | `#0EA5E9` | SOW & Payment Auditor |
| Operations | Truck | `#10B981` | SLA & Logistics Monitor |
| Data Security | ShieldCheck | `#8B5CF6` | PII & Encryption Watchdog |
| Regulatory | Scale | `#F59E0B` | Compliance & Audit Trail |

Each card: radio dot + icon box + title + subtitle + "Selected" badge when active.

**Control Classification * — radio card list:** Technical / Process / Document / Expected Response

**Risk Level** (select) + **Tags** (input) — 2-column grid

---

#### Step 2 — Target Asset Scope
Asset Categories checkboxes | Scope Mode (Full / Specific) | specific count input | Reference document drop zone

---

#### Step 3 — Relational Data Sources

**Data Sources** — checklist (API, SIEM/Splunk, Ticketing/ServiceNow, Uploaded Documents, Task Output, Supplier Portal, Email Monitoring)

**Email Monitoring SPOC fields** — shown ONLY when `sources.has('email')`:
- Blue `#EFF6FF` expansion box, header: Zap icon + "Relational Data Source — SPOC Targeting"
- Explanation: "The AI agent will monitor email communications between these two contacts for contractual and financial anomalies."
- 2-column grid:
  - **Internal SPOC Email *** — `priya@abc.co` placeholder, "Your org's relationship owner" hint
  - **Supplier SPOC Email *** — `john@supplier.com` placeholder, "Supplier's account manager" hint
- Amber warning if either field is empty: "Both SPOC emails are required to activate email monitoring."

**API Configuration** — shown when `sources.has('api')`: Endpoint URL, Auth method, Frequency selects

**Evidence Retention** — pill toggles: 30 days / 90 days / 1 year / 7 years

---

#### Step 4 — Trigger Config
Trigger Mode cards (Manual / Scheduled / Event-Driven) | Cron expression + presets (when Scheduled) | Webhook URL + event filter (when Event-Driven)

---

#### Step 5 — AI Behaviour

**Evaluation Instructions** — textarea (500 char max)

**Anomaly Detection Presets** — chip toggles (multi-select). 8 options:
| Preset | Severity color |
|---|---|
| SOW Date vs. Service Start Date | `#EF4444` red |
| Payment Without PO Approval | `#EF4444` red |
| Milestone Slip > 7 Days | `#F59E0B` amber |
| Silent SFTP / API Feed | `#F59E0B` amber |
| Undeclared PII in Data Stream | `#EF4444` red |
| Certification Expiry < 30 Days | `#F59E0B` amber |
| Duplicate Invoice Detection | `#64748B` gray |
| Credential Reuse Detection | `#64748B` gray |

Selected chips gain colored bg+border. Green confirmation count below when any selected.

**Confidence Threshold** — range slider 0–100, live `#0EA5E9` badge

**Auto Actions on Fail** — checkboxes: Create ServiceNow ticket / Send email alert / Notify Slack / Reduce risk score / Flag for human review / Quarantine asset

**Remediation Suggestion** — textarea

**Toggles:**
- Store evidence snapshots
- Require human approval

**Truth Gap Detection toggle** (last toggle, inside bordered box):
- OFF: `#F8FAFC` bg, `#E2E8F0` border, gray AlertTriangle icon
- ON: `#FEF2F2` bg, `#FECACA` border, red AlertTriangle icon, "Truth Gap Detection" label in `#DC2626`
- When ON: reveals 2-item explanation box (`#fff` bg, `#FECACA` border):
  1. "A pulsing red AlertTriangle will appear on the supplier node in the Knowledge Graph whenever this control fails."
  2. "The supplier's Truth Match % is automatically reduced by the agent, reflecting any declared vs. detected PII gap."

---

#### Step 6 — Dependencies

**Depends On** — dropdown selector + colored dependency chips (Blocking=red / Warning=amber, click badge to toggle)

**Impacts** — static display: "Access Review Policy · Vulnerability Scanning"

**Cascade toggle** — "When this control fails, automatically flag all dependent controls"

**Dependency Graph Preview — PII flow aware SVG (380×200px):**
- SVG `<defs>` arrowhead markers: `arrow-share` (`#0EA5E9`), `arrow-ingest` (`#10B981`), `arrow-dep` (`#94A3B8`)
- Dependency edges: gray dashed `#CBD5E1` with arrow-dep markers
- PII Share edge (blue `#0EA5E9`, `strokeDasharray: 5,3`): This Control → Supplier
- PII Ingest edge (green `#10B981`, `strokeDasharray: 5,3`): Supplier → This Control
- Nodes: This Control (blue), MFA (green/Blocking), Encrypt (amber/Warning), Supplier (slate)
- Mini legend bottom-right: Share → (blue), ← Ingest (green), Dependency (gray)

---

**Footer:** Save as Draft | Cancel | Next → (per step) | Review & Activate → (step 6)
**On Activate:** 1.6s Loader2 spinner overlay → SuccessScreen (CheckCircle2 64px, toast, "View Controls" / "Create Another")

---

### PAGE 4 — Agents (`/agents`)
**File:** `src/app/pages/Agents.tsx`
**Purpose:** Manage AI agents. Uses **in-page state switching** for 3 views.

#### Agent Data Model (CURRENT — all fields required)
```ts
interface Agent {
  id: string;
  name: string;
  initials: string;
  status: 'live' | 'active' | 'syncing' | 'idle';
  stage: 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';
  controls: number;
  suppliers: number;
  gradient: string;         // CSS gradient string (no solid colors!)
  alerts: number;
  lastActive: string;
  health: number;           // 0–100
  division: string;
  frequency: string;
  notify: string[];
  internalSPOC?: string;    // Internal contact email (e.g. priya@abc.co)
  externalSPOC?: string;    // Supplier contact email (e.g. john@xyz.com)
  truthMatch?: number;      // 0–100 PII match percentage
}
```

#### Mock Agents (3 pre-loaded — CURRENT)
```ts
A1: { id:'a1', name:'Agent A1', status:'live', stage:'Acquisition',
      controls:3, suppliers:2, alerts:2, lastActive:'2 min ago', health:82,
      division:'Marketing Dept', frequency:'Hourly',
      notify:['Risk Manager','Compliance Officer'],
      internalSPOC:'priya@abc.co', externalSPOC:'john@xyz.com', truthMatch:50 }

A2: { id:'a2', name:'Agent A2', status:'active', stage:'Retention',
      controls:2, suppliers:3, alerts:0, lastActive:'8 min ago', health:94,
      division:'Operations Dept', frequency:'Daily',
      notify:['Risk Manager'],
      internalSPOC:'raj@abc.co', externalSPOC:'ops@abc.com', truthMatch:100 }

A3: { id:'a3', name:'Agent A3', status:'syncing', stage:'Upgradation',
      controls:4, suppliers:1, alerts:3, lastActive:'just now', health:61,
      division:'Technical Dept', frequency:'Every 6hrs',
      notify:['Risk Manager','DPO','Admin'],
      internalSPOC:'anita@abc.co', externalSPOC:'info@def.com', truthMatch:0 }
```

#### Navigation State (from Sidebar)
`useLocation` + `useEffect` reads `location.state` on mount:
- `location.state.openCreateModal === true` → auto-opens Create Agent modal
- `location.state.openAgentDetail === 'a1'|'a2'|'a3'` → navigates to that agent's Detail view

---

#### View 1 — Dashboard (default)

1. **Header row** — "Agents" h1 + subtitle + "+ Create Agent" button
2. **4 KPI Cards** (`grid-cols-4`): Live, Active, Syncing, Open Alerts (5 total: 3 critical · 2 high)
3. **Agent Cards Grid** (`auto-fill, minmax(180px,1fr)`): avatar, name, StatusIndicator, stage badge, controls/suppliers, alert pill, last active, health bar
4. **"+ New Agent" dashed card** → opens Create modal
5. **Agent Activity Feed** (5 rows with timestamps)

---

#### View 2 — Agent Detail

1. **Detail Header bar** — Back button | agent name | status pill
2. **Profile Card** (centered, `padding:32px`, `textAlign:center`):
   - 96px gradient avatar
   - Name (22px bold)
   - StatusIndicator
   - Stage badge pill
   - "N controls enforced · N suppliers monitored"
   - "{division} · Checks {frequency.toLowerCase()}"
   - **Truth Match gauge pill** (green 100% / amber ≥50% / red <50%) — conditional on `truthMatch` field
   - **Stakeholder Context section** (below a divider, 2-column grid): ← NEW
     - Left tile: "INTERNAL SPOC" label + `internalSPOC` email (blue `#0EA5E9`) + "Risk Manager" role
     - Right tile: "SUPPLIER SPOC" label + `externalSPOC` email (purple `#8B5CF6`) + "Account Manager" role
     - Full-width note: "These contacts serve as the audit targets for the Agent Reasoning feed..."
     - Only rendered when `agent.internalSPOC || agent.externalSPOC` is truthy

3. **Live Monitoring Panel** (2-column grid):
   - Left: Suppliers Monitored (Eye icon `#0EA5E9`) — per-agent rows
   - Right: Controls Enforced (ShieldCheck icon `#8B5CF6`) — per-agent rows

4. **Agent Reasoning Feed** (Cpu icon `#0EA5E9` + "Live" green ping dot):
   Each row: timestamp | action · trigger | reasoning (italic) | confidence badge | outcome icon
   - **A1 has 6 rows** including 2 SPOC-based Process Audit rows:
     - "Detected SOW signature (Feb 10) occurs after service start date (Feb 5) in priya@abc.co emails. Anomaly: Contractual Risk." — confidence 91%
     - "Payment of ₹10L detected. No PO approval found in conversation history between priya@abc.co and john@xyz.com. Anomaly: Financial Leak." — confidence 88%
   - A2 has 4 rows (standard operational checks)
   - A3 has 4 rows (standard technical checks)

5. **4 Action Cards** (2×2 grid): Select Picture → PictureModal | Select Voice → VoiceModal | Talk to Agent → TalkModal | Start Chat → ChatModal

---

#### View 3 — Create Agent Modal (centered, 480px, maxHeight 85vh, scrollable)

**Fields (in order):**

1. **Monitoring Template** — vertical radio card list (NEW — replaces old 2-column grid):
   - 4 options as radio cards: Consulting (Handshake `#0EA5E9`), Operations (Truck `#10B981`), Data Security (ShieldCheck `#8B5CF6`), Custom (Plus `#64748B`)
   - Each card: radio dot + icon + title + subtitle
   - Selecting a non-Custom template auto-fills: frequency, alertLevel, controls, and shows SPOC fields pre-populated
   - "Custom" clears pre-fills for bespoke configuration

2. **Internal SPOC + Supplier SPOC fields** (2-column grid) — shown only when a non-Custom template is selected; pre-filled from template defaults

3. **Agent Name** * — text input

4. **Avatar Gradient** — 6 color circles + live 40px preview with initials (no solid colors — gradients only)

5. **Assign Controls** — MultiSelect, blue chips

6. **Assign Suppliers** — MultiSelect, purple chips

7. **Data Flow Stage** — colored pill toggles (multi-select)

8. **Alert Sensitivity** — single-select pills: Low / Medium / High / Critical Only — default "High"

9. **Check Frequency** — single-select pills: Hourly / Daily / Every 6hrs — default "Daily"

10. **Notify** — MultiSelect, purple chips — default pre-selected: "Risk Manager"

11. **Division** — text input

**Footer:** Save as Draft | Cancel | Create Agent → (disabled until name filled)
**On submit:** 1.6s spinner → success state → "View Agents" / "Create Another"

**Template pre-fill defaults:**
- Consulting: frequency=Daily, alertLevel=High, controls=[MFA Enforcement, Data Classification Policy], internalSPOC=priya@abc.co, externalSPOC=john@xyz.com
- Operations: frequency=Every 6hrs, alertLevel=Critical Only, controls=[Backup Verification, Access Review Policy], internalSPOC=raj@abc.co
- Data Security: frequency=Hourly, alertLevel=Critical Only, controls=[MFA Enforcement, Backup Verification], internalSPOC=anita@abc.co

---

### PAGE 5 — Library (`/libraries`)
**File:** `src/app/pages/Library.tsx`
**Purpose:** Interactive organization knowledge graph. Full-bleed canvas page.

**LAYOUT:** Uses `margin: -24px -32px` and `height: calc(100vh - 64px)` to break out of Shell's padding.

#### Types

```ts
type Stage       = 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';
type PiiVolume   = 'low' | 'moderate' | 'high';
type PiiFlow     = 'share' | 'ingest' | 'both';
type DragType    = 'canvas' | 'org' | 'div' | 'sup' | 'sys';

interface Supplier {
  id: string; divisionId: string; x: number; y: number;
  name: string; email: string; contact: string; phone: string; website: string; gst: string; pan: string;
  stage: Stage; riskScore: number | null; piiVolume: PiiVolume;
  piiFlow?: PiiFlow;            // 'share' | 'ingest' | 'both'
  piiTypes?: string[];          // e.g. ['Aadhar', 'Phone', 'Email']
  hasTruthGap?: boolean;        // true when declaredPII ≠ detectedPII
  declaredPII?: string[];       // what supplier self-reported
  detectedPII?: string[];       // what AI agent actually found
  internalSPOC?: string;
  externalSPOC?: string;
}

interface SystemNode { id: string; divisionId: string; x: number; y: number; name: string;
  type: 'crm' | 'infra' | 'db';
  dataSource?: string; piiTypes?: string[]; vulnScore?: number;
  /* Lifecycle + Human Audit fields */
  stage?: Stage;                   // Lifecycle step this system belongs to
  internalSPOC?: string;           // Employee responsible for data integrity
  authorizedPII?: string[];        // Fields employees ONLY should enter at this step
  hasStageDiscrepancy?: boolean;   // True when employees entered wrong-stage PII
  discrepancyFields?: string[];    // The specific unauthorized fields detected
  agentReasoning?: {               // AI reasoning entry for the discrepancy
    timestamp: string;
    action: string;
    trigger: string;
    reasoning: string;
    confidence: number;
    outcome: 'alert';
  };
}
```

#### Mock Data
- 3 Divisions: Marketing Dept (d1), Technical Dept (d2), Operations Dept (d3)
- 7 Suppliers (s1–s7) across divisions with `piiFlow`, `piiTypes`, `hasTruthGap`, `declaredPII`, `detectedPII`, `internalSPOC`, `externalSPOC`
  - **s3 (Call Center Ltd)** and **s5 (DataVault Co.)** have `hasTruthGap: true`
- 2 System Nodes:
  - `sys1`: Salesforce CRM (d1), **`linkedSupplierId:'s2'`** (Field Agent Co.), `stage:'Acquisition'`, `internalSPOC:'priya@abc.co'`, `authorizedPII:['Name','Phone','Email','DOB']`, `hasStageDiscrepancy:true`, `discrepancyFields:['Bank Balance','Aadhar']`, `vulnScore:82`, `agentReasoning:{...confidence:94}`
  - `sys2`: AWS Infra (d2), **`linkedSupplierId:'s4'`** (CloudSec Inc.), `stage:'Upgradation'`, `internalSPOC:'anita@abc.co'`, `authorizedPII:['Credentials','Financial','PAN']`, `hasStageDiscrepancy:false`, `vulnScore:61`
  - **Graph chain (blood bank pattern):** Marketing Dept → Field Agent Co. (s2) → Salesforce CRM (sys1)

#### Page Header Controls
- **Data X-Ray toggle** (Eye/EyeOff icon, left of Viewing dropdown):
  - OFF: standard view
  - ON: clicking a node dims all unrelated nodes/edges to `opacity: 0.08`. Clicking a **supplier** node in X-Ray mode opens the **X-Ray Detail Modal** (not the standard Supplier Info modal)
- Viewing dropdown (Current / 3mo / 6mo / 1yr) — non-current shows toast
- Zoom +/− buttons + Reset button

#### Node Types

**Org Node** (blue circle 64px, Building2 icon):
- Hover: green `+` button → "Add Division" modal

**Division Nodes** (purple circle 48px, Briefcase icon):
- Hover: green `+` button → **"Add Asset" choice modal** (NOT directly "Add Supplier")
- Click: Division Info modal

**Supplier Nodes** (dual SVG circle):
- Inner circle: `#10B981` (score≥50) / `#EF4444` (score<50) / `#94A3B8` (null)
- Outer ring: strokeWidth 3/7/13 for low/moderate/high PII volume, `#EF4444` at 0.35 opacity
- `hasTruthGap: true` → pulsing red `AlertTriangle` badge at top-right of node (`@keyframes ping`)
- Click (X-Ray OFF): Supplier Info modal
- Click (X-Ray ON): X-Ray Detail Modal

**System Nodes** (slate rounded rectangle 68×44px, Database/Smartphone icon):
- Draggable
- **`hasStageDiscrepancy: false`** — normal state: `#64748B` bg, `#475569` border
- **`hasStageDiscrepancy: true`** — alert state: `#7F1D1D` (dark red) bg, `#EF4444` border, `box-shadow: 0 2px 14px rgba(239,68,68,0.4)`, icon color `#FCA5A5`
- **Pulsing AlertTriangle badge** (top-right, 16px, separate click target) when `hasStageDiscrepancy`:
  - Clickable independently (`stopPropagation`)
  - Click → opens `sysReasoning` modal
  - The ping animation ring: `rgba(239,68,68,0.25)`
- **Stage badge** under system name (colored mini pill, same `STAGE_CLR` colors)
- Node label text is `#DC2626` red when `hasStageDiscrepancy`, else `#0F172A`
- Regular node click → opens `sysInfo` modal

#### SVG Edges

SVG `<defs>` arrowhead markers:
- `arrow-share` (`#0EA5E9`) — PII flow: share
- `arrow-ingest` (`#10B981`) — PII flow: ingest
- `arrow-both` (`#8B5CF6`) — PII flow: both
- `arrow-gray` (`#CBD5E1`) — org→division, division→system (fallback), supplier→system (clean)
- `arrow-alert` (`#EF4444`) — supplier→system when `hasStageDiscrepancy: true` ← NEW

Each supplier edge is colored by its `piiFlow` type and shows a pill label with `piiTypes` overlaid on the SVG line.

**System Edge logic (NEW — replaces old "Division → System always"):**
- If `sys.linkedSupplierId` → draw **Supplier → System** edge:
  - `edgeColor = sys.hasStageDiscrepancy ? '#EF4444' : '#64748B'`
  - `edgeDash  = sys.hasStageDiscrepancy ? '4,3' : '5,3'`
  - If discrepancy: red glow line (strokeWidth:6, opacity:0.12) behind main edge + `arrow-alert` marker
  - Edge label pill: `'GAP !'` in red (discrepancy) OR `'USES SYS'` in gray
- If no `linkedSupplierId` → fallback: Division → System (dashed gray, "INTERNAL" label)

#### ModalState — ALL 9 types
```ts
type ModalState =
  | null
  | { type: 'addDiv' }
  | { type: 'chooseAsset'; divisionId: string }   // NEW — choose Supplier vs System
  | { type: 'addSup';  divisionId: string }
  | { type: 'addSys';  divisionId: string }        // NEW — add internal system
  | { type: 'supInfo'; supplierId: string }
  | { type: 'xrayInfo'; supplierId: string }       // NEW — X-Ray mode click
  | { type: 'sysInfo'; systemId: string }          // EXPANDED
  | { type: 'sysReasoning'; systemId: string }   // NEW — AlertTriangle badge click
  | { type: 'divInfo'; divisionId: string };
```

#### Modal Details

**chooseAsset modal (380px):**
- 2 large choice cards: "Add Supplier" (purple, Briefcase icon, "External vendor") vs "Add System" (slate, Database icon, "Internal CRM/App")
- Clicking either navigates to `addSup` or `addSys` modal

**addSup modal (480px, scrollable) — CONTRACT DATES ADDED:**
- Supplier Stage selection (FIRST, 2×2 grid)
- Text inputs: Supplier Name, Email, Contact Person, Phone, Website
- GST + PAN numbers (2-column grid)
- **Contract Period section** (blue accent bar, NEW):
  - "Contract Start Date" + "Contract End Date" — side-by-side date inputs (`type="date"`)
  - `contractEnd` has `min={contractStart}` to prevent backwards dates
  - When both dates set, shows green computed duration: "Contract duration: N days"
- PII Locked banner (amber, bottom)
- Footer: Cancel | Add Supplier → (disabled unless name + email + stage)
- `addSupplier` saves: `contractStart`, `contractEnd` to the Supplier node

**addSys modal (460px, scrollable) — 5 sections (Relational Link prepended):**
- `divSuppliers = suppliers.filter(s => s.divisionId === addSysDiv.id)` — computed inside render
- `canSubmit = !!(sysForm.name && sysForm.stage && sysForm.linkedSupplierId)` — ALL THREE required
- System Name text input (mandatory)
- System Type pills: CRM/App | Infrastructure | Database
- **Relational Link * section** (FIRST, purple `#8B5CF6` accent bar):
  - Header: "Relational Link *" + right chip "Supplier → System"
  - Copy explains graph edge direction change
  - No suppliers in division → amber AlertTriangle warning "Add at least one supplier first"
  - Else: **selectable card row per division supplier** (Briefcase avatar + name + stage badge + email)
    - Selected card: `#F5F3FF` bg, `#8B5CF6` 2px border, `CheckCircle2` right badge
    - Below selection: green "Edge will render: {supplier} → {system}" confirmation
    - Unselected + suppliers exist: amber "Required — select the supplier that operates this system"
  - `addSystem` positions new node at linked supplier's coords + 140px offset (not division center)
- System Type selector pills: CRM/App | Infrastructure | Database
- **Section 1 — Lifecycle Stage *** (blue accent bar):
  - 2×2 pill-button grid (same STAGE_CLR colors as supplier stage selector)
  - Selected pill shows colored dot + bold label + 2px border
  - Warning hint if no stage selected: amber AlertTriangle + "Required — stage mapping drives the Truth Gap detection logic"
- **Section 2 — Data Source & Physical Location** (purple accent bar):
  - Single text input, `monospace` font, `#F8FAFC` bg
  - Placeholder: "e.g., AWS S3 Bucket (us-east-1/crm-prod) or SQL DB (prod-db.internal:5432)"
  - Hint: "Used to identify the physical data trail for audit evidence."
- **Section 3 — Authorized PII at this Step** (green accent bar):
  - Options: Name, Email, Phone, Aadhar, PAN, Balance (6 toggle chips)
  - Selected: green `#ECFDF5` bg + `#10B981` border (2px) + CheckCircle2 icon
  - Counter below: "N fields authorized — all other PII will be flagged" (green)
  - Empty state: "No fields selected — AI will monitor all PII without baseline enforcement"
- **Section 4 — Target Vulnerability Score** (amber accent bar):
  - Left: 64px SVG mini gauge (animated, green≥75 / amber≥50 / red<50)
  - Right: range input 0–100, `accentColor` changes dynamically
  - Range labels: "0 — Critical" | "100 — Secure"
  - Status text below: contextual description per score range
  - Default: 75
- Footer: "Cancel" | "Register System →" (slate, disabled unless name + stage filled)
- `addSystem` passes: name, type, stage, dataSource, authorizedPII (array), piiTypes (same as authorizedPII), vulnScore, hasStageDiscrepancy=false

**Supplier Info modal (400px):**
- Dual circle visual + stage badge + Truth Gap alert banner (if `hasTruthGap`)
- Info rows: Risk Score, PII Volume, Internal SPOC, External SPOC, Truth Match (100% or "⚠ Mismatch")
- Send Portal Link + Remove Supplier buttons

**X-Ray Detail Modal (460px) — shown ONLY when X-Ray mode is ON:**
- Header: Eye icon + "Data X-Ray — {supplier.name}"
- **Circular Truth Match gauge** (SVG, r=36, colored fill based on %):
  - `#10B981` for 100%, `#F59E0B` for ≥60%, `#EF4444` for <60%
- **Bi-directional PII flow section:**
  - Blue block `#EFF6FF`: "Org → Supplier (Shared)" — declared PII chips
  - Green block `#ECFDF5`: "Supplier → Org (Ingested)" — detected PII chips (non-shadow only)
  - Red block `#FEF2F2`: **"Shadow PII Alerts"** — fields in `detectedPII` but NOT in `declaredPII`:
    - Header: AlertTriangle + "SHADOW PII ALERTS"
    - Red bold chips + note "Detected in data logs but NOT declared in supplier assessment"
- "Export X-Ray Report" button

**System Info modal (420px, scrollable) — FULLY EXPANDED with lifecycle context:**
- Header: Database icon (dark red bg `#7F1D1D` + red border if discrepancy, else slate) + name + sub-row (type · division)
- **Lifecycle Stage section** (below header):
  - "LIFECYCLE STAGE" label
  - Colored stage pill (same STAGE_CLR, larger 5px vertical padding) with dot indicator
  - Sub-note: "Customer data entry is expected to occur at this step."
- **Stage Discrepancy alert box** (if `hasStageDiscrepancy`):
  - `#FEF2F2` bg, `#FECACA` border, pulsing AlertTriangle
  - "Stage Discrepancy Detected" heading (red)
  - "Employee(s) entered PII that does not belong to the {stage} step:"
  - Red chip pills for each `discrepancyField`
  - "View Agent Reasoning →" link button (Cpu icon) → opens `sysReasoning` modal
- **Vulnerability gauge** (SVG r=28) + Data Source Location (monospace box)
- **Internal SPOC** section (gray `#F8FAFC` box): email in blue + "Responsible for ensuring employees enter only authorized PII at this step"
- **Authorized PII at this Step**: green `#ECFDF5` chips with CheckCircle2 icon + context "At the {stage} step, employees must only fill:"
- **AI Monitored PII Fields**: blue `#EFF6FF` chips
- "Run System Scan" button

**sysReasoning modal (480px) — NEW:**
- Header: Cpu icon (red) + "Agent Reasoning — {system.name}"
- Sub: "Explaining the Stage Discrepancy detected on this internal system"
- **Stage context strip** (`#F8FAFC` box): Mapped Stage badge (colored) + SPOC email (right-aligned)
- **Single reasoning entry card** (`#FEF2F2` bg, `#FECACA` border):
  - Timestamp + action (bold red) + trigger text + AlertTriangle icon
  - Reasoning text (italic, `#7F1D1D`, with left `#FECACA` border-left 3px)
  - Flagged fields row: red chips for each `discrepancyField`
  - Confidence badge (gray pill) + "ALERT — Stage Discrepancy" label (red, right-aligned)
- **Authorized PII reminder** (`#ECFDF5` box with CheckCircle2 green chips)
- Footer: "View System Details" (ghost, → sysInfo modal) | "Escalate to SPOC" (red solid, → toast success)

**Division Info modal (360px):**
- Division name + supplier count + system count
- System name chips (gray)
- Stage breakdown chips
- Close + Delete Division buttons

#### Legend (fixed bottom-left, 200px)
- Node Types: Org (blue), Division (purple), Supplier (dual circle), Internal System (slate rect)
- **Stage Discrepancy System: dark red rect `#7F1D1D` with red border** — NEW
- PII Flow Direction: Share (blue line) / Ingest (green line) / Bidirectional (purple line)
- Supplier Score: green/red/gray inner circles
- Truth Gap: AlertTriangle icon (supplier)
- Stage Discrepancy: dark red rect label (system)

#### Animations
```css
@keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
@keyframes ping    { 0%,100%{opacity:1} 50%{opacity:0.25} }
```

---

### PAGE 6 — Library Healthcare (`/libraries/healthcare`)
**File:** `src/app/pages/LibraryHealthcare.tsx`
**Purpose:** Healthcare/Insurance template detail view with 4-stage pipeline.
**Navigation:** "← Back" → `/libraries`

---

### PAGE 7 — TPRM (`/tprm`)
**File:** `src/app/pages/TPRM.tsx`
**Purpose:** Master supplier management table — lifecycle-grouped.

#### Supplier Data Model (CURRENT)
```ts
interface Supplier {
  id: string; name: string; email: string;
  stage: string; stageColor: string;
  score: number; risk: string; riskColor: string;
  assessment: 'complete' | 'overdue' | 'pending';
  pii: { configured: boolean; icons?: string[]; method?: string };
  piiFlow?: 'share' | 'ingest' | 'both';   // directional PII icon
  contractEnd: string; contractWarning?: boolean;
  agent: string; lastActivity: string;
  internalSPOC?: string; externalSPOC?: string;
}
```

**Header:** "Third Party Risk Management" + search + Stage filter + Risk filter

**Table — Lifecycle Grouped (CURRENT):**
Table body is rendered in 3 lifecycle groups, each with a colored group header row:
- **Customer Acquisition** (`#0EA5E9`/`#EFF6FF`) — Acquisition stage suppliers
- **Customer Retention** (`#10B981`/`#ECFDF5`) — Retention stage suppliers
- **Operations** (`#64748B`/`#F8FAFC`) — Upgradation + Offboarding suppliers

Groups are rendered with `React.Fragment` and only shown if `rows.length > 0`.

**Table columns:** Supplier | Stage | Risk Score | Assessment | PII Sharing | Contract End | Agent | Last Activity | Actions

**PIIColumn component (CURRENT):**
- Shows directional flow icon inline:
  - `MoveUpRight` blue `#0EA5E9` = "Share" (Org → Supplier)
  - `MoveDownLeft` green `#10B981` = "Ingest" (Supplier → Org)
  - `Repeat2` purple `#8B5CF6` = "Both" (Bidirectional)
- **Configure → link is LOCKED** (`disabled, cursor: not-allowed, color: #CBD5E1`) unless `assessment === 'complete'`
  - Tooltip: "Available after assessment is complete"

**Supplier Detail Modal** (centered, 680px) — clicked via Eye button:
- Score banner, risk badge, agent, contract
- PII Sharing section (configure if complete, locked if not)
- Assessment Actions (if overdue/pending)
- Footer: Refresh Assessment + Close

**Mock suppliers (8):** XYZ Corporation (Acquisition/share), ABC Services Ltd (Retention/ingest), DEF Limited (Upgradation/both), GHI Technologies (Acquisition/share), JKL Consultancy (Retention/ingest), MNO Partners (Offboarding), PQR Systems (Acquisition/share), STU Analytics (Upgradation/both)

---

### PAGE 8 — Risk Threat (`/risk-threat`)
**File:** `src/app/pages/RiskThreat.tsx`

**Sections:** Risk Score Trend Chart (Recharts) | Risk Events Table | Supplier Risk Detail Modal (with live projected score + remediation checklist)

---

### PAGE 9 — Audit Logs (`/audit-logs`)
**File:** `src/app/pages/AuditLogs.tsx`

**Sections:** Header + Export | Search + status filter | Log Table (8 mock entries, Feb 24–27 2026)

---

### PAGE 10 — Documents RAG (`/documents`)
**File:** `src/app/pages/Documents.tsx`

**Two-panel layout:** Left (~60%) = document library table | Right (~40%) = AI chat interface with keyword-matched mock responses

---

### PAGE 11 — Roles + Access (`/roles`)
**File:** `src/app/pages/Roles.tsx`

**Two sections:** Permission Matrix (6 roles × 10 modules) | Users Table (6 mock users)

---

### PAGE 12 — Settings (`/settings`)
**File:** `src/app/pages/Settings.tsx`

**6 tabs:** Organization | Integrations | Notifications | Compliance | AI Config | Portal Settings

---

### PAGE 13 — Templates (`/templates`) ← NEW
**File:** `src/app/pages/Templates.tsx`
**Purpose:** Browse and deploy pre-built agent personality templates.

#### Template Data Shape
```ts
interface Template {
  id: string; title: string; subtitle: string; description: string;
  icon: LucideIcon; color: string; bg: string; border: string;
  frequency: string; alertLevel: string; controls: string[];
  capabilities: string[];
  badge: string; badgeBg: string; badgeColor: string;
  logic: Array<{
    trigger: string;    // anomaly name
    detail: string;     // explanation of detection logic
    severity: 'critical' | 'high' | 'medium';
  }>;
}
```

#### 4 Template Cards + 1 Custom Card

| Template | Icon | Color | Badge | Frequency | Alert |
|---|---|---|---|---|---|
| Consulting | Handshake | `#0EA5E9` | Finance | Daily | High |
| Operations | Truck | `#10B981` | Ops | Every 6hrs | Critical Only |
| Data Security | ShieldCheck | `#8B5CF6` | Security | Hourly | Critical Only |
| Regulatory | Scale | `#F59E0B` | Regulatory | Daily | High |

Each card has:
- 4px color accent bar at top
- Icon (52px square, rounded, bg-tinted)
- Title + badge + subtitle
- Description paragraph
- 4 capabilities with CheckCircle2 icons
- Meta chips: frequency (Clock), alert level (Zap), controls count (ShieldCheck), triggers count (AlertTriangle)
- **Footer with TWO buttons:**
  - **"View Logic"** (Eye icon, bordered) → opens `AnomalyPreviewModal`
  - **"Deploy →"** (filled, colored) → shows 1.8s `DeployedOverlay` then navigates to `/agents` with `state: { openCreateModal: true, templatePreset: {...} }`

**Custom Personality card (dashed border, at end of grid):**
- Dashed `2px dashed #CBD5E1` border, hover darkens to `#94A3B8`
- Pencil icon (24px)
- "+ Start from scratch" button
- Click → navigates to `/agents` with `state: { openCreateModal: true, templatePreset: { name: 'Custom Agent' } }`

#### AnomalyPreviewModal (520px, centered)
- Header: template icon + "Title — AI Logic" + subtitle + X button
- Intro: "These are the specific anomaly patterns this agent personality is trained to detect and escalate"
- 4 trigger rows, each with:
  - AlertTriangle icon (colored by severity) + trigger name + severity badge pill
  - Detail explanation text
- Severity colors: critical=`#EF4444`, high=`#F59E0B`, medium=`#64748B`
- Footer: "Got it" button (template color)

#### Consulting trigger logic (4 rows):
1. SOW vs Service Start Date — critical
2. Payment Without PO Approval — critical
3. Milestone Slip Detection — high
4. Duplicate Invoice Check — medium

#### Operations trigger logic (4 rows):
1. SLA Breach Window — critical
2. Silent Feed Detection — high
3. Delivery Lag > 3 Days — high
4. Escalation Chain Compliance — medium

#### Data Security trigger logic (4 rows):
1. PII Truth Gap — critical
2. Encryption Standard Drift — critical
3. Anomalous Access Pattern — high
4. Credential Reuse Detection — medium

#### Regulatory trigger logic (4 rows):
1. Certification Expiry < 30 Days — high
2. DPDPA Consent Gap — critical
3. Regulatory Filing Deadline — high
4. Audit Evidence Missing — medium

---

## 8. CROSS-PAGE NAVIGATION MAP

```
Dashboard
  ├── "View All →"                → /tprm
  └── "Full Report →"            → /risk-threat

Controls
  └── "+ Create Control"         → /controls/create

CreateControl
  └── "← Back" / cancel          → /controls

Sidebar [+] next to Agents       → /agents  (state: { openCreateModal: true })
Sidebar A1/A2/A3 sub-items       → /agents  (state: { openAgentDetail: 'a1'|'a2'|'a3' })
Sidebar Templates link            → /templates

Templates
  ├── "Deploy →" button           → /agents  (state: { openCreateModal: true, templatePreset: {...} })
  ├── "+ Create Custom" card      → /agents  (state: { openCreateModal: true, templatePreset: { name: 'Custom Agent' } })
  └── "View Logic" button         → AnomalyPreviewModal (centered modal, stays on /templates)

Agents (dashboard view)
  ├── agent card click            → Agent Detail (in-page state)
  └── "+ New Agent" card click   → Create Agent modal
  Agent Detail
  └── "← Back to Agents"        → Agents dashboard view (in-page state)

Library
  └── (self-contained graph — no cross-page nav)

LibraryHealthcare
  └── "← Back"                   → /libraries

TPRM, RiskThreat, AuditLogs, Documents, Roles, Settings
  └── (self-contained — no cross-nav)

All sidebar items                 → their respective routes
```

---

## 9. KEY PATTERNS & RULES

### State management
- All state is local `useState` — no Redux, no Context, no Zustand
- No localStorage — everything resets on refresh
- Modals use local boolean/object state within their parent page
- Navigation state (`useLocation().state`) is used to pass flags between sidebar and pages

### Navigation state pattern (Sidebar → Page)
```tsx
// In Sidebar.tsx — passing flags via navigate
navigate('/agents', { state: { openCreateModal: true } })
navigate('/agents', { state: { openAgentDetail: 'a1' } })

// In Agents.tsx — reading flags on mount
const location = useLocation();
useEffect(() => {
  if (location.state?.openCreateModal) setShowCreate(true);
  if (location.state?.openAgentDetail) {
    const found = agents.find(a => a.id === location.state.openAgentDetail);
    if (found) { setSelectedAgent(found); setView('detail'); }
  }
}, [location.state]);
```

### Contextual Mock Data (Supplier / Agent relationships)
Every supplier and agent has `internalSPOC` (business owner email, e.g. `priya@abc.co`) and `externalSPOC` (supplier lead email, e.g. `john@xyz.com`). These power:
- SPOC Audit rows in the Agent Reasoning Feed
- Stakeholder Context panel in Agent Detail
- X-Ray modal SPOC display

### Truth Gap Logic
```ts
// hasTruthGap is true when declaredPII ≠ detectedPII
const shadowPII = detectedPII.filter(p => !declaredPII.includes(p));
// Shown as red "Shadow PII" chips in X-Ray Detail Modal
```

### PII Flow Direction
```ts
piiFlow: 'share'  → MoveUpRight  blue  #0EA5E9  (Org → Supplier)
piiFlow: 'ingest' → MoveDownLeft green #10B981  (Supplier → Org)
piiFlow: 'both'   → Repeat2      purple #8B5CF6 (Bidirectional)
```

### No solid colors on agent avatars
- Agent avatars use **gradient backgrounds** only (not solid colors)
- 6 available gradients defined in `AVATAR_GRADIENTS` array
- Gradient stored as CSS string in agent object

### Drag-and-drop (Library page only)
- Pure React + SVG + CSS transforms — no external graph library
- Canvas pan: `onMouseDown` on background → `window.addEventListener('mousemove')`
- Node drag: `onMouseDown` on node with `stopPropagation()` → same window listener
- `dragMovedRef = useRef(false)` distinguishes click from drag (threshold: 3px)
- Zoom: native `wheel` event listener with `passive: false` + zoom-toward-cursor pan adjustment
- DragType includes `'sys'` for SystemNode dragging

### Circular SVG Gauge pattern (used in Library)
```tsx
// Used for: Vulnerability Score (System Info) + Truth Match (X-Ray modal)
const r = 28;  // or 36 for larger
const circ = 2 * Math.PI * r;
const dash = circ * (1 - score / 100);
// <circle strokeDasharray={circ} strokeDashoffset={dash} transform="rotate(-90 cx cy)" />
```

### Recharts usage
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Always wrap in <ResponsiveContainer width="100%" height={220}>
```

### Icons
```tsx
import { IconName } from 'lucide-react';
// Never use emoji as icons — lucide-react icons only
```

### Toast
```tsx
import { toast } from 'sonner';
// <Toaster /> is ALREADY in App.tsx — do NOT add it again
```

### Animations (injected via `<style>` tag in JSX)
```css
@keyframes ping    { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
```

### Stage/Risk badge pattern
```tsx
// Reused in every page — always inline styles, never Tailwind for these
const STAGE_CLR = {
  Acquisition: ['#EFF6FF', '#0EA5E9'],
  Retention:   ['#ECFDF5', '#10B981'],
  Upgradation: ['#FFFBEB', '#F59E0B'],
  Offboarding: ['#F1F5F9', '#64748B'],
};
```

### MultiSelect component (reusable, in Agents.tsx)
```tsx
// Props: label, options, selected (Set<string>), onToggle, chipColor ([bg, text])
// Chip display area + dropdown with checkbox rows
// Closes on outside click via document mousedown listener + useRef
```

---

## 10. THINGS THAT MUST NEVER CHANGE

1. **"Kyudo"** is the platform name — shown in Sidebar logo. Never revert to "TPRM Platform"
2. **`<Toaster />`** lives only in `App.tsx` — never add it to individual pages
3. **All modals are centered** — never implement a right-side drawer/panel
4. **No emoji** anywhere in page content (lucide-react icons only)
5. **No solid color for agent avatars** — gradients only (`AVATAR_GRADIENTS` array)
6. The **Library page** is a knowledge graph, NOT a template list
7. Routing uses **`react-router`** package — never `react-router-dom`
8. The **Sidebar [+] button** next to Agents opens the Create Agent modal (not `/controls/create`)
9. **Sidebar A1/A2/A3 sub-items** navigate to `/agents` with state — they are `<div>` elements, NOT `<NavLink>`
10. **Agent Detail** is inside `Agents.tsx` via in-page state — `AgentDetail.tsx` is a legacy file
11. The **Agent interface** requires: `id, name, initials, status, stage, controls, suppliers, gradient, alerts, lastActive, health, division, frequency, notify` — plus optional `internalSPOC, externalSPOC, truthMatch`
12. **Library + button on Division** opens `chooseAsset` modal (Supplier vs System choice) — NOT directly `addSup`
13. **X-Ray Mode** is a toggle in Library header — when ON, clicking a supplier node opens `xrayInfo` modal, not `supInfo`
14. **TPRM table** is lifecycle-grouped (Customer Acquisition / Customer Retention / Operations) — do not flatten back to a single list
15. **Configure → link** in TPRM PII column is disabled unless `assessment === 'complete'`
16. **Templates page** lives at `/templates` and is linked from Sidebar under AGENTS section (LayoutTemplate icon)

---

## 11. HOW TO MAKE A CHANGE — PROMPT TEMPLATE

When asking an AI to make a change, include this block at the start of your prompt:

```
CONTEXT:
- Project: Kyudo TPRM Platform (13 pages)
- Stack: React 18 + TypeScript + Tailwind CSS v4 + react-router (not react-router-dom) + recharts + lucide-react + sonner
- Layout: Shell.tsx wraps all pages (Sidebar 240px dark navy #1B2236 + TopBar 64px + main padding 24px 32px)
- Sidebar: 6 collapsible sections; AGENTS section includes: Agents NavLink, [+] button, A1/A2/A3 sub-items (div, not NavLink), Controls, Templates
- All modals must be centered (never side panels)
- Toaster is already in App.tsx — do not add it again
- No emoji in content — lucide-react icons only
- Platform name is "Kyudo" — do not change it
- All data is mock/hardcoded — no backend
- Agent avatars: gradients only (AVATAR_GRADIENTS array)
- Library + button on Division → chooseAsset modal (Supplier vs System)
- X-Ray mode toggle in Library header — ON = xrayInfo modal on supplier click
- TPRM table is lifecycle-grouped (3 sections)
- Configure → in TPRM PII column is locked unless assessment === 'complete'
- Master prompt location: /src/imports/MASTER_PROJECT_PROMPT.md (update after major changes)
- File to edit: src/app/pages/[PageName].tsx

CHANGE REQUESTED:
[describe your change here]
```

---

*Last updated: March 2, 2026 — reflects typr-platform-upgrade.md (structural intelligence upgrade):*
*• Controls.tsx — `[ ⬡ Technical Controls ]` | `[ ⟳ Process Controls ]` primary tab switcher above filters (Technical=blue `#0EA5E9`, Process=green `#10B981`); tab logic gates `filtered` before category/personality sub-filters.*
*• Agents.tsx — Create Agent modal: single SPOC inputs replaced with "Stakeholder Communication Monitoring" section (multi-email dynamic lists per side, blue/purple, dashed add-contact buttons, template pre-fills updated); Agent Detail: Stakeholder Communication Map (SVG 3-col network with AI center node) + Process Intelligence Summary (2×2 grid: Last SOW, Last Payment, Last Escalation, Active Risks) added above Live Monitoring Panel.*
*• Library.tsx — (1) Lifecycle Lane Overlay: 4 fixed vertical columns outside transform wrapper (`zIndex:0`), tinted STAGE_CLR backgrounds at 38% opacity, stage pill labels at top; (2) Supplier Micro Badges: PII direction arrow + contract date (YYYY-MM) + frequency below stage badge on canvas; (3) X-Ray redesigned: clicking supplier in X-Ray mode sets selectedId only (no modal); floating 304px right-side panel renders with Truth Match gauge, PII sections, Linked Systems list, Stakeholders table, Export button; (4) Add Supplier modal: Stakeholder Matrix section (2-col, 4 internal + 3 supplier email inputs, blue/purple tinted); (5) sysInfo modal: Data Direction Badge (Sends/Receives/Bidirectional based on linked supplier piiFlow) + "Operated By {supplier} ↗" clickable chip opening supInfo modal.*