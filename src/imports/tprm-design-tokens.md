# TPRM Platform — Figma Design Prompt
## All Internal Pages (Excluding Supplier Portal)

---

## HOW TO USE THIS IN FIGMA

1. Create a new Figma file
2. Set up a frame for each page listed below at **1440 × 900px** (desktop)
3. Use the color tokens, typography, and component specs defined in Section 1
4. Design each page in the order listed — Dashboard first, then outward
5. The Supplier Portal is a **separate Figma file** — do not include it here

---

# SECTION 1 — DESIGN SYSTEM

## Colors

| Token | Hex | Use |
|---|---|---|
| Primary Blue | `#0EA5E9` | Buttons, active states, links, primary badges |
| Primary Blue Hover | `#0284C7` | Button hover |
| Blue Light BG | `#EFF6FF` | Active nav background, selected card background |
| Blue Mid BG | `#DBEAFE` | Info banners |
| Text Strong | `#0F172A` | Page titles, headings |
| Text Body | `#334155` | Labels, bold field names |
| Text Secondary | `#64748B` | Subtitles, table column headers, muted descriptions |
| Text Muted | `#94A3B8` | Placeholders, hints, disabled labels |
| Border Light | `#E2E8F0` | Card borders, dividers, input borders |
| Border Medium | `#CBD5E1` | Stronger dividers, dashed upload zones |
| Page Background | `#F8FAFC` | Main page background |
| White | `#FFFFFF` | All cards, panels, inputs |
| Success Green | `#10B981` | Active/complete states, low risk, coverage ≥80% |
| Success BG | `#ECFDF5` | Green banner backgrounds |
| Warning Amber | `#F59E0B` | High risk, pending states, coverage 50–79% |
| Warning BG | `#FFFBEB` | Amber banner backgrounds |
| Error Red | `#EF4444` | Critical risk, failed, overdue, coverage <50% |
| Error BG | `#FEF2F2` | Red banner backgrounds |
| Purple | `#8B5CF6` | Document category badge, supplier chips |
| Purple BG | `#F5F3FF` | Purple badge backgrounds |

## Typography

**Font:** Inter (Google Fonts)

| Style | Size | Weight | Color | Use |
|---|---|---|---|---|
| Page Title | 24px | 700 | `#0F172A` | H1 on every page |
| Page Subtitle | 14px | 400 | `#64748B` | Under page title |
| Card Title | 16px | 600 | `#0F172A` | Card headings |
| Section Label | 12px | 500 | `#94A3B8` | Uppercase tracking-wide section headers |
| Body Strong | 14px | 600 | `#334155` | Field labels, row names |
| Body | 14px | 400 | `#334155` | General body text |
| Body Muted | 13px | 400 | `#64748B` | Descriptions, subtitles |
| Small | 12px | 400 | `#94A3B8` | Timestamps, hints |
| KPI Number | 32px | 700 | varies | Dashboard KPI card numbers |

## Spacing

- Page padding: `32px` left/right, `24px` top/bottom
- Card padding: `24px`
- Gap between cards in a row: `16px`
- Gap between rows: `24px`
- Input padding: `12px 16px`
- Border radius — cards: `12px`, inputs: `8px`, badges/pills: `6px`, buttons: `8px`

## Elevation / Shadow

- Cards: `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Panels (slide-in): `box-shadow: -4px 0 24px rgba(0,0,0,0.12)`
- Modals: `box-shadow: 0 20px 60px rgba(0,0,0,0.15)`

## Core Components to Build as Figma Components

Build these as reusable components before designing pages:

1. **NavItem** — icon + label, active state (blue left border + blue bg), inactive (gray)
2. **KPI Card** — number + trend label + sparkline + sub-text
3. **Badge/Pill** — category badges: Technical (blue), Process (green), Document (purple), Expected Response (amber)
4. **Risk Badge** — Critical (red), High (amber), Medium (gray), Low (green)
5. **Stage Badge** — Acquisition (blue), Retention (green), Upgradation (amber), Offboarding (gray)
6. **Assessment Badge** — Complete (green), Pending (amber), Overdue (red)
7. **Toggle Switch** — ON: `#0EA5E9`, OFF: `#CBD5E1`
8. **Coverage Bar** — 6px height, rounded, colored by percentage
9. **Avatar Pill** — colored circle with 2-letter initials
10. **Action Button Row** — small icon buttons (Eye / Edit / Play / Trash)
11. **Input Field** — label + input + optional helper text
12. **Textarea** — same as input, taller
13. **Primary Button** — `#0EA5E9` fill, white text, 8px radius
14. **Ghost Button** — white fill, `#E2E8F0` border, `#334155` text
15. **Slide-in Panel** — 560px wide, white, right shadow, header + scrollable body + sticky footer
16. **Step Badge** — Completed (green fill + checkmark), Current (blue fill + number), Future (white + gray border + gray number)
17. **Table Row** — with hover state `#F8FAFC`
18. **Supplier Card** — 4 states: Pending / Overdue / Complete-not-configured / Fully-active

---

# SECTION 2 — LAYOUT SHELL

## Sidebar

**Width:** 240px expanded, 64px collapsed
**Background:** `#FFFFFF`
**Right border:** `1px solid #E2E8F0`

**Top:** Logo area — Shield icon (`#0EA5E9`) + "TPRM Platform" text (16px bold `#0F172A`)

**Navigation items** (in order):

```
📊 Dashboard          → /
🛡 Controls           → /controls
🤖 Agents             → /agents
─────────────────────────────────  (divider)
  Organization Data Flow  (group label, collapsible)
    └─ 📋 TPRM        → /tprm
    └─ 📚 Library     → /libraries
─────────────────────────────────
⚠️ Risk Threat        → /risk-threat
📋 Audit Logs         → /audit-logs
📄 Document RAG       → /documents
👥 Roles + Access     → /roles
⚙️ Settings           → /settings
─────────────────────────────────
🌐 Supplier Portal    → external link (new tab)
```

**Active nav item:** `bg-[#EFF6FF]`, `text-[#0EA5E9]`, 3px left blue border
**Inactive nav item:** `text-[#64748B]`, hover `bg-[#F1F5F9]`
**Icon size:** 18px
**Label:** 14px, 500 weight

**Bottom of sidebar:** User avatar + name + role + logout icon

## Main Content Area

- Left: sidebar (240px)
- Right: remaining width (1200px at 1440 total)
- Background: `#F8FAFC`
- Top bar: 64px height, white, bottom border `#E2E8F0`
  - Left: page title (dynamically changes per route)
  - Right: notification bell + user avatar

---

# SECTION 3 — DASHBOARD PAGE

**Frame name:** `Dashboard`
**Route:** `/`

## Row 1 — Welcome Banner

Full width. White card, light border, 16px radius, `px-6 py-4`.

- Left: "Good morning, Priya 👋" — 18px bold `#0F172A`
  Under it: "ABC Insurance Company · Healthcare · Mumbai" — 14px `#64748B`
- Right: "Overall Risk Posture: 62 / 100" + colored badge "🟡 Medium"
  Badge: `bg-[#FFFBEB] text-[#F59E0B]` pill, 12px

## Row 2 — 4 KPI Cards

4 equal-width white cards in a row. Each card: `p-6 rounded-xl border border-[#E2E8F0]`

**Card 1 — Total Suppliers**
- Top: "Total Suppliers" label, 12px uppercase muted
- Number: **48**, 32px bold `#0F172A`
- Sparkline: thin blue SVG line across the bottom of the number area (12 points, color `#0EA5E9`)
- Trend: "+12% vs last quarter" — 12px green `#10B981` with TrendingUp icon

**Card 2 — High Risk Suppliers**
- Label: "High Risk Suppliers"
- Number: **15**, 32px bold `#EF4444`
- Sub-text: "3 require immediate attention" — 13px `#64748B` with AlertCircle icon amber
- Thin red progress bar at bottom of card: 31% filled, `#EF4444` on `#FEE2E2`, 4px height

**Card 3 — Active Agents**
- Label: "Active Agents"
- Number: **14** — 32px bold `#0F172A`, beside it a green animated ping dot + "Live" green pill
- Sub-text: "12 monitoring · 2 idle" — 13px `#64748B`
- 14-segment mini bar: 12 green squares + 2 gray squares, 4px height each, 2px gap

**Card 4 — Pending Assessments**
- Label: "Pending Assessments"
- Number: **23** — 32px bold `#F59E0B`
- Sub-text: "5 overdue >30 days" — 13px `#64748B` with AlertCircle icon
- Amber progress bar at 48%: `#F59E0B` on `#FFFBEB`

## Row 3 — Two Columns

### Left Column (60%) — Supplier Risk by Stage

White card. Title: "Supplier Risk by Stage" bold 16px + "View All →" link top right (14px `#0EA5E9`).

4 stage rows inside, each row:
- Left: colored circle dot + stage name bold 14px `#334155`
- Middle: mini horizontal bar (width proportional to supplier count vs total, 8px height, rounded)
  - Bar color: gradient from green to amber based on risk distribution
- Right: supplier count "18 suppliers" — 14px `#64748B`
- Below bar: small colored text "2 Critical · 4 High · 8 Medium · 4 Low" — 12px
  - Critical: `#EF4444`, High: `#F59E0B`, Medium: `#64748B`, Low: `#10B981`
- Right edge: `→` chevron, becomes `#0EA5E9` on row hover
- Row hover: `bg-[#F8FAFC]`
- Divider between rows: `border-b border-[#E2E8F0]`

**4 stage rows data:**

| Stage | Dot Color | Count | Breakdown |
|---|---|---|---|
| Acquisition | `#0EA5E9` blue | 18 | 2 Critical · 4 High · 8 Medium · 4 Low |
| Retention | `#10B981` green | 14 | 1 Critical · 3 High · 6 Medium · 4 Low |
| Upgradation | `#F59E0B` amber | 10 | 0 Critical · 2 High · 5 Medium · 3 Low |
| Offboarding | `#94A3B8` gray | 6 | 1 Critical · 1 High · 2 Medium · 2 Low |

### Right Column (40%) — Action Required

White card. Title: "Action Required" bold 16px + badge "3 items" — `bg-[#FEF2F2] text-[#EF4444]` pill.

3 action items, each:
- Top-left: colored dot (red or amber)
- Supplier name: 14px bold `#334155`
- Issue description: 13px `#64748B`
- Stage label: 12px muted chip (e.g., "Acquisition stage")
- Bottom-right: one action button — ghost style, small

**3 mock action items:**

| Dot | Supplier | Issue | Stage | Button |
|---|---|---|---|---|
| 🔴 | GHI Technologies | Assessment overdue · 32 days | Acquisition | Send Reminder |
| 🟡 | Supplier D (Call Center Co.) | ISO 27001 cert expires in 22 days | Retention | View |
| 🟡 | MNO Partners | No data received · 7 days | Offboarding | Investigate |

Divider line between items: `border-b border-[#E2E8F0]`

## Row 4 — Agent Activity Strip

Full-width white card. Slim — just enough height for 5 rows.

Header: "🤖 Agent Activity" bold 14px + "● 5 agents live" — green ping dot + green text, right-aligned.

5 agent rows. Each row:
- Avatar pill (colored circle, 28px, white initials 11px)
- Agent name bold 13px `#334155`
- Stage badge (colored pill, 11px)
- Status icon + status text 13px `#64748B`
- Row hover `bg-[#F8FAFC]`, cursor pointer

**5 mock rows:**

| Avatar | Color | Name | Stage | Status |
|---|---|---|---|---|
| A1 | `#0EA5E9` | Agent A1 | Acquisition | ✅ 3 checks complete · 1 ⚠️ alert open |
| A2 | `#10B981` | Agent A2 | Retention | 🔄 Running · Last active 8 min ago |
| A3 | `#8B5CF6` | Agent A3 | Upgradation | ✅ All clear · Last active 1 hr ago |
| A4 | `#F59E0B` | Agent A4 | Retention | 💤 Idle · Last active 3 hrs ago |
| A5 | `#EF4444` | Agent A5 | Acquisition | ✅ 2 checks complete · No alerts |

---

# SECTION 4 — CONTROLS PAGE

**Frame name:** `Controls List`
**Route:** `/controls`

## Page Header
- Left: "Controls" — 24px bold `#0F172A`
- Under: "10 controls configured" — 14px `#64748B`
- Right: "+ Create Control" — primary blue button with Plus icon

## Search + Filter Bar
- Search input full width (minus filter button): placeholder "Search controls...", Search icon inside left, `bg-white border border-[#E2E8F0] rounded-lg`
- Right: "Filters" button with SlidersHorizontal icon, white bg, border

## Controls Table

White card, full width, `border border-[#E2E8F0] rounded-xl`

**Column headers** (12px uppercase `#64748B`, `bg-[#F8FAFC]`, `border-b border-[#E2E8F0]`):
Control Name | Category | Active | Coverage | Scope | Risk | Last Evaluated | Dependencies | Actions

**10 data rows:**

| Name + Description | Category | Active | Coverage | Scope | Risk | Last Eval | Deps |
|---|---|---|---|---|---|---|---|
| MFA Enforcement / Multi-factor auth on all admin accounts | Technical 🔵 | ON | 94% 🟢 | Full | Critical 🔴 | 2 min ago | 3 |
| Encryption at Rest / AES-256 on all storage volumes | Technical 🔵 | ON | 67% 🟡 | Partial | High 🟡 | 15 min ago | 2 |
| Access Review Policy / Quarterly access review | Process 🟢 | ON | 88% 🟢 | Full | Medium ⚫ | 1 hr ago | 1 |
| Network Segmentation / VLAN isolation prod vs staging | Technical 🔵 | ON | 45% 🔴 | Sparse | High 🟡 | 30 min ago | 4 |
| Patch Management / OS patching within 30-day SLA | Process 🟢 | OFF | 72% 🟡 | Partial | Medium ⚫ | 2 hrs ago | 2 |
| Data Classification Policy / All data assets classified | Document 🟣 | ON | 91% 🟢 | Full | Low 🟢 | 45 min ago | 0 |
| Incident Response Plan / Documented IR with runbooks | Document 🟣 | ON | 85% 🟢 | Full | Critical 🔴 | 3 hrs ago | 5 |
| Backup Verification / Weekly backup integrity test | Expected Res. 🟠 | ON | 56% 🟡 | Partial | High 🟡 | 1 hr ago | 1 |
| Vulnerability Scanning / Automated weekly assessments | Technical 🔵 | ON | 78% 🟡 | Full | Medium ⚫ | 20 min ago | 2 |
| Privileged Access Mgmt / JIT access for admin ops | Technical 🔵 | ON | 82% 🟢 | Full | Critical 🔴 | 5 min ago | 3 |

**Category badge colors:**
- Technical → `bg-[#EFF6FF] text-[#0EA5E9]`
- Process → `bg-[#ECFDF5] text-[#10B981]`
- Document → `bg-[#F5F3FF] text-[#8B5CF6]`
- Expected Response → `bg-[#FFFBEB] text-[#F59E0B]`

**Coverage bar:** 6px, rounded-full, track `#E2E8F0`
- ≥80%: `#10B981`
- 50–79%: `#F59E0B`
- <50%: `#EF4444`

**Actions:** Eye + Pencil + Play icons — `#94A3B8`, hover `#0EA5E9`

**Pagination footer:** "Showing 1–10 of 10 controls" left | prev/next buttons right

---

# SECTION 5 — CREATE CONTROL (6-STEP WIZARD)

**Frame names:** `Create Control — Step 1` through `Create Control — Step 6` + `Create Control — Review` + `Create Control — Success`
**Route:** `/controls/create`

## Header Area (all steps)
- Back arrow + "Back to Controls" — `#64748B`, hover `#0EA5E9`
- Title: "Create Control" 24px bold
- Subtitle: "Configure a new governance control" 14px muted

## Top Stepper Bar

White card, `p-6 rounded-xl border border-[#E2E8F0] mb-6`

6 steps connected by lines:
```
① Basic Info — ② Target Asset Scope — ③ Data Source — ④ Trigger Config — ⑤ AI Behaviour — ⑥ Dependencies
```

**Step badge states:**
- Completed: 32px circle, `bg-[#10B981]`, white checkmark inside
- Current: 32px circle, `bg-[#0EA5E9]`, white number inside
- Future: 32px circle, `bg-white border-2 border-[#E2E8F0]`, `#94A3B8` number

**Connector lines:** 2px height, flex-1
- Completed segment: `#10B981`
- Remaining: `#E2E8F0`

**Labels:** 12px below each badge
- Current: `#0EA5E9` bold
- Others: `#94A3B8`

## Step Content Card

White card, `p-8 rounded-xl border border-[#E2E8F0]`

## Step 1 — Basic Info

Fields (full-width unless noted, 24px gap between fields):

**Control Name** — label + text input, placeholder "e.g., MFA Enforcement Policy"

**Description** — label + textarea 4 rows, placeholder "Describe the purpose and scope..."

**Control Source** — label + two option cards side by side (50/50):
- Card 1: "Local Control" bold + "Create and manage locally" muted subtitle
- Card 2: "Imported from Kyudo" bold + "Import from external framework" muted subtitle
- Selected state: `border-2 border-[#0EA5E9] bg-[#EFF6FF]`
- Unselected: `border border-[#E2E8F0] bg-white`

**Control Classification** — label + 4 radio cards stacked:
- Technical — "Automated technical checks on systems and infrastructure"
- Process — "Operational procedures and SLA adherence"
- Document — "Policy documents and certification validity"
- Expected Response — "Behavioral outcomes and response timelines"
- Radio circle left + text block + selected: blue border + light blue bg

**Risk Level** — label + dropdown: Critical / High / Medium / Low, default High

**Tags** — label + chip input, placeholder "Add tag..."

**Bottom navigation:** "Next →" blue button right-aligned, disabled until Name + Classification filled

## Step 2 — Target Asset Scope

**Asset Categories** (checkbox list with count + status):
```
☑ Azure                Microsoft Cloud       312 assets   ● Connected
☑ GCP                  Google Cloud          185 assets   ● Connected
☑ Microsoft 365        Productivity          156 assets   ● Connected
☑ Active Directory     Identity & Access      89 assets   ● Connected
☐ ServiceNow           IT Service Mgmt        67 assets   ● Connected
☐ Splunk               Security & SIEM        38 assets   ⚠ Degraded
☑ Suppliers            Third-party vendors    48 suppliers ● Connected
```

**Scope Mode** — two radio cards:
- "Full Scope" — "All assets in selected categories auto-included" (default selected)
- "Select Specific Assets" — "Hand-pick individual assets"

**Coverage Preview Banner** — green banner: "Total Available: 847 Assets · Auto-selected · All assets in selected categories"

**Optional Document Upload** — dashed border zone: "Drop reference document here or browse" — 12px muted text + Upload icon

## Step 3 — Data Source

**Multi-select checkboxes:**
```
☑ API Integration            Connect via REST or GraphQL
☐ Logs / SIEM (Splunk)       Ingest from log sources
☑ Ticketing (ServiceNow)     Pull from ticket systems        Recommended badge
☐ Uploaded Documents         Manual evidence upload
☐ Task Output                Output from agent tasks
☐ Supplier Portal            Responses from assessments
☐ Email Monitoring           Track supplier communications
```

**Conditional API config** (slides in when API Integration selected):
- Endpoint URL — text input
- Auth Method — select: OAuth 2.0 / API Key / JWT Bearer
- Poll Frequency — select: Hourly / Every 6 hrs / Daily / Weekly

**Evidence Retention** — label + 4 pill options: 30 days / 90 days / 1 year / 7 years
- Active: `bg-[#0EA5E9] text-white`
- Inactive: `bg-white border border-[#E2E8F0] text-[#64748B]`

## Step 4 — Trigger Config

**Trigger Mode** — 3 large radio cards:
- Manual — "Trigger evaluation on demand"
- Scheduled — "Run on a recurring schedule" (default)
- Event-Driven — "Trigger via webhook event"

**If Scheduled selected (conditional):**
- Cron expression input: `0 0 * * *` with human-readable label beside ("Every day at midnight UTC")
- Quick presets row: Every hour / Every 6 hrs / Daily / Weekly / Monthly — pill buttons
- First Evaluation: date + time picker

**If Event-Driven selected (conditional):**
- Webhook URL field (read-only, with Copy icon)
- Event Filter text input
- Debounce period select

## Step 5 — AI Behaviour

**Evaluation Instructions** — label + large textarea (6 rows, 500 char limit shown), placeholder "Describe in natural language how the AI should evaluate this control..."

**Confidence Threshold** — label + horizontal slider 0–100%, current value shown in blue badge beside slider. Default: 75%. Description: "Below this threshold, AI will flag for human review instead of auto-deciding."

**Auto Actions on Fail** — label + checkbox list:
```
☑ Create ticket in ServiceNow
☑ Send email alert
☐ Notify via Slack / Teams
☐ Reduce supplier risk score automatically
☑ Flag for human review
☐ Quarantine asset / data
```

**Remediation Suggestion** — textarea, placeholder "What should the agent recommend when this control fails?"

**Evidence Collection** — toggle + label "Store evidence snapshots for each evaluation" — default ON

**Human Review Required** — toggle + label "Require human approval before marking as compliant" — default OFF

## Step 6 — Dependencies

**Depends On** — searchable input + selected controls shown as chips with dependency type per chip:
- Chip: control name + dropdown "Blocking" or "Warning"
- Blocking chip: `bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]`
- Warning chip: `bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]`

**Impacts** (read-only section) — label + chips showing controls that depend on this one, `bg-[#F8FAFC]`

**Failure Cascade** — toggle + label "When this control fails, automatically flag all dependent controls" — default OFF

**Dependency Graph Preview** — SVG visual:
- This control: center blue circle node
- Parent controls: above, green if passing, red if failing
- Child controls: below
- Connecting lines: `#E2E8F0`

## Review & Activate Screen

2-column summary grid showing all 6 steps in grouped cards.

Bottom: "Estimated Coverage" green banner with asset count.

Two buttons:
- "Save as Draft" ghost left
- "Activate Control" blue primary right → on click: button shows spinning Loader2 icon + "Activating..." for 1.6s → transitions to Success screen

## Success Screen

Centered, white card:
- CheckCircle2 icon, 64px, `#10B981`
- "Control Activated!" — 24px bold
- "MFA Enforcement Policy is now live and monitoring 847 assets" — 14px muted
- Two buttons: "View Controls" (primary) + "Create Another" (ghost)

---

# SECTION 6 — AGENTS PAGE

**Frame name:** `Agents`
**Route:** `/agents`

## Page Header
- "Agents" — 24px bold
- "5 agents configured · 4 active" — 14px muted
- "+ Create Agent" — primary blue button

## Agents Table

White card, full width.

**Columns:** Avatar + Name | Status | Controls | Suppliers | Systems | Alerts | Uptime | Last Active | Actions

**5 mock rows:**

| Avatar | Color | Name | Status | Controls | Suppliers | Systems | Alerts | Uptime | Last |
|---|---|---|---|---|---|---|---|---|---|
| A1 | `#0EA5E9` | Agent A1 | ● Active | 3 controls chip | 2 suppliers chip | Mail+Zap | 12 🟡 | 99.1% | 2 min |
| A2 | `#10B981` | Agent A2 | ● Active | 2 controls chip | 3 suppliers chip | Mail+Zap+SN | 4 | 98.7% | 8 min |
| A3 | `#8B5CF6` | Agent A3 | ● Active | 4 controls chip | 1 supplier chip | Zap+Activity | 7 🟡 | 97.3% | 1 hr |
| A4 | `#F59E0B` | Agent A4 | ○ Idle | 1 control chip | 2 suppliers chip | Mail | 0 | 100% | 3 hrs |
| A5 | `#EF4444` | Agent A5 | ● Active | 2 controls chip | 1 supplier chip | Zap+SN+Activity | 2 | 99.8% | 15 min |

- Controls chip: `bg-[#EFF6FF] text-[#0EA5E9]` pill
- Suppliers chip: `bg-[#F5F3FF] text-[#8B5CF6]` pill
- Active status: green ping dot + "Active"
- Idle status: gray circle + "Idle"

## Create Agent Slide-in Panel

560px wide, slides in from right. White bg, left shadow.

**Panel Header:** "Create Agent" bold 18px + X close button

**3 sections with uppercase gray section labels:**

**SECTION 1 — AGENT IDENTITY**
- Agent Name* — text input
- Description — textarea 3 rows
- Avatar Color — 8 colored circles (blue/green/purple/amber/red/cyan/pink/slate), click to select
- Live preview pill: shows initials from name in selected color

**SECTION 2 — MONITORING SCOPE**
- Assign Controls* — searchable multi-select, selected show as blue chips with X remove
  - Pre-selected: "MFA Enforcement" + "Data Classification Policy"
- Assign Suppliers — searchable multi-select, selected show as purple chips with X
  - Pre-selected: "XYZ Corporation"
- Data Flow Stages — 4 toggle pills: Acquisition / Retention / Upgradation / Offboarding
  - Active: `bg-[#0EA5E9] text-white`
  - Inactive: `bg-white border border-[#E2E8F0] text-[#64748B]`
  - Pre-active: Acquisition + Retention

**SECTION 3 — INTEGRATIONS & ALERTS**
- Connected Systems* — checkboxes:
  ```
  ☑ Organization Email (SMTP/IMAP)
  ☑ API Integrations
  ☐ ServiceNow (Tickets)
  ☐ Slack / Teams
  ☐ Splunk Logs
  ```
- Alert Sensitivity — 4 pills: Low / Medium / High / Critical Only — default: High active
- Notify Who — multi-select chips: Risk Manager / Compliance Officer / DPO / Admin / Analyst
- Auto Actions on Alert — checkboxes:
  ```
  ☑ Create ServiceNow ticket
  ☑ Send email notification
  ☐ Reduce supplier risk score automatically
  ☐ Escalate to senior management
  ```

**Panel Footer** (sticky, `border-t border-[#E2E8F0] p-4 bg-white`):
- Left: "Save Draft" ghost button
- Right: "Cancel" ghost + "Activate Agent" primary blue button

**Success state** (replaces panel body):
- CheckCircle2 48px `#10B981` centered
- "Agent Created!" bold 18px
- Agent preview pill (initials + name)
- "View Agents" primary button + "Create Another" ghost

---

# SECTION 7 — LIBRARY PAGE

**Frame name:** `Library`
**Route:** `/libraries`

## Page Header
- "Library" — 24px bold
- "Industry templates to jumpstart your TPRM setup" — 14px muted

## Template Cards Grid (2-column)

**Card 1 — Healthcare / Insurance (ACTIVE)**

White card, `border border-[#E2E8F0] rounded-xl p-6`

- Top: 🏥 emoji icon in `bg-[#EFF6FF]` rounded square, 40px
- Title: "Healthcare / Insurance" bold 16px
- Description: "Pre-built data flow template for insurance and healthcare organizations" — 14px muted
- Tags row: "4 stages" · "8 systems" · "6 supplier roles" · "IRDAI / DPDPA aligned" — small gray chips
- Bottom: "Preview" ghost button + "Use Template →" primary blue button

**Cards 2–7 — Coming Soon (LOCKED):**
Finance/Banking · Retail/E-commerce · Manufacturing · SaaS/Technology · Government · Custom

Each locked card: same layout but `opacity-60`, "Coming Soon" amber badge top-right, buttons disabled/hidden

---

# SECTION 8 — LIBRARY TEMPLATE FILL PAGE (HEALTHCARE)

**Frame name:** `Library — Healthcare Template`
**Route:** `/libraries/healthcare`

## Page Header
- Back arrow + "Back to Library"
- "Healthcare / Insurance Template" bold 24px
- "Fill in your systems and suppliers for each stage" muted 14px
- Top-right: "Save & Apply Template" primary blue button

## 4-Column Grid

Full-width white card. 4 equal columns separated by vertical dividers.

### Column Headers (sticky)

Each column header:
- Stage name bold 14px `#334155`
- Colored dot matching stage color
- Count chip showing number of items

```
🔵 Acquisition  |  🟢 Retention  |  🟡 Upgradation  |  ⚫ Offboarding
```

### "+ Add Process/System" Button (above each column)

Dashed border button, full column width, 40px height:
- `border-dashed border-2 border-[#E2E8F0]` rounded-lg
- `+` icon + "Add Process/System" — `#94A3B8` text
- Hover: `border-[#0EA5E9] text-[#0EA5E9] bg-[#EFF6FF]`

### System Cards (inside each column, top section)

Each system card — `bg-white border border-[#E2E8F0] rounded-lg p-3 mb-2`
- System name bold 13px `#334155`
- Method badge: small pill (e.g., "Mobile App" blue, "Branch" amber, "Portal" purple, "Internal" gray)
- On hover: Edit + Remove icons appear top-right

**Pre-populated systems:**

Acquisition: Insurance Sales App (Mobile App) · Branch Walk-in (Branch) · CRM Portal (Portal)
Retention: Email Campaign System (Email) · Call Center (Phone) · Customer Portal (Portal)
Upgradation: Loyalty Platform (Portal)
Offboarding: Account Closure (Internal) · Data Archival (Internal)

### Divider Line

A subtle horizontal rule `border-t border-dashed border-[#E2E8F0] my-3` separates systems from suppliers within each column.

### "+ Add Supplier" Button (below divider in each column)

Same dashed style as system button:
- `+` icon + "Add Supplier" — `#94A3B8`
- Hover: purple border + purple text: `border-[#8B5CF6] text-[#8B5CF6] bg-[#F5F3FF]`

### Supplier Cards (4 states)

**State 1 — Assessment Pending:**
`bg-white border border-[#E2E8F0] rounded-lg p-3`
- Name bold 13px
- "⏳ Assessment Pending" — amber badge
- "Score: —" muted
- "Portal sent X days ago" — 12px muted
- Actions: "Send Reminder" ghost small + Eye icon

**State 2 — Assessment Overdue:**
`bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3`
- Name bold 13px
- "🔴 Assessment Overdue" — red badge
- "X days since invite" — 12px red
- Actions: "Send Reminder" red ghost + Eye icon

**State 3 — Complete, PII Not Configured:**
`bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-3`
- Name bold 13px
- "✅ Assessment Complete" — green badge
- Risk score colored: e.g., "Score: 78 🟡 High"
- "Configure Data Sharing →" — blue link 12px bold

**State 4 — Fully Active:**
`bg-white border border-[#E2E8F0] rounded-lg p-3`
- Name bold 13px
- "✅ Active" — green badge
- Score + level
- PII icons row: 🪪 ✉️ 📱 (whichever apply)
- "API · Daily" or "SFTP · Weekly" — 12px muted tag
- "Agent: A1" — 12px muted

**Pre-populated supplier cards:**

Acquisition: Field Agent Mgmt Co (State 3 - score 78) · Doc Verify Service (State 1 - pending)
Retention: XYZ Email Marketing (State 4 - score 42 active) · Call Center Outsourcing (State 2 - overdue)
Upgradation: Upsell Campaign Manager (State 1 - pending)
Offboarding: (empty — internal only)

## Add Supplier Slide-in Panel (560px)

Opens when any "+ Add Supplier" is clicked.

**Header:** "Add Supplier" bold 18px + X button
**Sub-header:** Stage chip auto-set — e.g., "Retention stage" purple chip

**Step indicator:** 2 dots — Step 1 filled blue, Step 2 gray

**Step 1 — Company Information:**

| Field | Type |
|---|---|
| Supplier Name* | Text input |
| Email (primary contact)* | Text input |
| Contact Person | Text input |
| Phone | Text input |
| Website | Text input |
| GST Number | Text input |
| PAN Number | Text input |
| TAN Number | Text input |
| Contract Start Date | Date picker |
| Contract End Date | Date picker |
| Service Type | Read-only chip showing stage |

"Next →" button enabled only when Name + Email filled.

**Step 2 — Review & Initiate:**

Summary card showing all entered details in key-value rows.

"Initiate Supplier Onboarding" — full-width primary blue button

On click → 1.6s spinner → Success state:
- CheckCircle 48px green
- "Supplier Initiated!"
- "A portal link has been sent to [email]. They have 30 days to complete."
- Reminder notice: Day 7 / 15 / 25 / 30

**Important note in panel (amber banner):** "PII configuration will be available after the supplier completes their risk assessment."

## Configure Data Sharing Panel (560px)

Opens when "Configure Data Sharing →" is clicked on a State 3 supplier card.

**Header:** "Configure Data Sharing" bold 18px + supplier name sub-header
**Risk score banner:** "Risk Score: 78 — High · Assessment completed Mar 1, 2026" — amber bg

**Fields:**

What PII are we sending?* — multi-checkbox grid (2 columns):
```
☑ Full Name           ☐ Aadhar / National ID
☑ Email Address       ☐ PAN Number
☑ Phone Number        ☐ Financial Information
☐ Physical Address    ☐ Health Records
☐ Biometric Data      ☐ Login Credentials
```

Authorized by* — Name text input + Role select (Risk Manager / DPO / Compliance Officer / Admin)

Transfer Method* — 3 cards:
- "API Integration" — Zap icon
- "Excel Sheet" — FileSpreadsheet icon
- "Database Dump" — Database icon
- Selected: `border-2 border-[#0EA5E9] bg-[#EFF6FF]`

Conditional: If API → show Endpoint URL + Auth Method
Conditional: If Excel → show Delivery Method (Email / SFTP)

Transfer Frequency* — select: Real-time / Hourly / Daily / Weekly / Monthly / On-demand

Transfer Start Date* — date picker

Transfer End Date — date picker (optional)

Max records per transfer — number input (optional)

**Footer:** "Cancel" ghost + "Save Configuration" primary blue

---

# SECTION 9 — TPRM PAGE

**Frame name:** `TPRM — Supplier List`
**Route:** `/tprm`

## Page Header
- "Third Party Risk Management" — 24px bold
- "8 suppliers across 4 stages" — 14px muted
- Right: search input + filter dropdowns (Stage / Risk Level / Status / Agent) + View toggle (Table/Grid)

## Suppliers Table

White card, full width.

**Column headers:** Supplier | Stage | Risk Score | Assessment | PII Sharing | Contract End | Agent | Last Activity | Actions

**8 mock rows:**

| Supplier + Email | Stage | Score | Assessment | PII | Contract | Agent | Last |
|---|---|---|---|---|---|---|---|
| XYZ Corporation / contact@xyz | Acquisition 🔵 | 78 🟡 High | ✅ Complete | 🪪✉️📱📄📍 API | Mar 2026 ⚠️ | A1 | 2 min ago |
| ABC Services Ltd / ops@abc | Retention 🟢 | 42 🟢 Low | ✅ Complete | ✉️📱 SFTP | Dec 2027 | A2 | 1 hr ago |
| DEF Limited / info@def | Upgradation 🟡 | 62 ⚫ Medium | 🔴 Overdue | 🔒 Assessment required | Jun 2025 ⚠️ | A3 | 2 hrs ago |
| GHI Technologies / bd@ghi | Acquisition 🔵 | 91 🔴 Critical | 🔴 Overdue | 🔒 Assessment required | Sep 2026 | A1 | 5 hrs ago |
| JKL Consultancy / admin@jkl | Retention 🟢 | 35 🟢 Low | ✅ Complete | ✉️ Email | Jan 2028 | A4 | 3 hrs ago |
| MNO Partners / contact@mno | Offboarding ⚫ | 55 ⚫ Medium | ⏳ Pending | 🔒 Assessment required | Apr 2026 ⚠️ | A2 | 1 day ago |
| PQR Systems / info@pqr | Acquisition 🔵 | 67 ⚫ Medium | ⏳ Pending | 🔒 Assessment required | Nov 2027 | A5 | 6 hrs ago |
| STU Analytics / hello@stu | Upgradation 🟡 | 22 🟢 Low | ✅ Complete | Configure → | Jul 2028 | A2 | 4 hrs ago |

**PII column rendering:**
- Assessment pending/overdue: 🔒 lock icon + "Assessment required" muted 12px
- Complete, not configured: "Configure →" blue link 13px
- Complete, configured: PII type icons + transfer method tag

**Actions per row:** Eye (view detail) / Bell (send reminder) / RefreshCw (resend portal) / Trash2 (remove)

---

# SECTION 10 — OTHER PAGES (WIREFRAME LEVEL)

These pages need wireframe frames in Figma. Less detail needed — layout and key components only.

## Risk Threat — `/risk-threat`

3 sections:
1. Line chart (recharts): 3 lines, 7 months Aug–Feb — Overall Risk / Critical / High
2. Risk Events Timeline: table with Date / Supplier / Description / Severity / Score Change / Status
3. AI Recommendations Panel: lightbulb icon + list of AI-generated recommendations

## Audit Logs — `/audit-logs`

Full-width table: Timestamp / User avatar+name+role / Action badge / Entity / Description / IP / Status
Filters bar: date range + user + action type + entity type
Export button: CSV / PDF / JSON

## Document RAG — `/documents`

- Top: upload zone (dashed) + email forwarding address shown
- Document list table: Category / Supplier / Upload date / Expiry date / AI status
- Right panel or bottom: AI chat interface with question input + response area with citations

## Roles + Access — `/roles`

- Tab for Roles + Tab for Users
- Permission matrix: rows = roles, columns = modules, cells = R/W/None badges

## Settings — `/settings`

Left nav tabs: Organization / Integrations / Notifications / Compliance / AI Config / Portal Settings
Each tab shows relevant form fields

---

# SECTION 11 — GLOBAL TERMINOLOGY

| Term to Use | Term to Avoid |
|---|---|
| Customer Offboarding | Exit / Deletion / Customer Exit |
| Library | List/Libraries |
| TPRM | Supplier List (TPRM is the page name) |
| Supplier Risk Score | Risk Number |
| Configure Data Sharing | PII Config / Map PII |
| Assessment Pending | Not Assessed |
| Assessment Complete | Done / Finished |

---

# SECTION 12 — FRAME LIST FOR FIGMA

Create one frame per screen below at **1440 × 900px**:

```
01. Dashboard
02. Controls — List
03. Create Control — Step 1 (Basic Info)
04. Create Control — Step 2 (Asset Scope)
05. Create Control — Step 3 (Data Source)
06. Create Control — Step 4 (Trigger Config)
07. Create Control — Step 5 (AI Behaviour)
08. Create Control — Step 6 (Dependencies)
09. Create Control — Review & Activate
10. Create Control — Success
11. Agents — List
12. Agents — Create Agent Panel (overlay)
13. Agents — Create Agent Success (overlay)
14. Library — Templates List
15. Library — Healthcare Template (empty)
16. Library — Healthcare Template (filled)
17. Library — Add Supplier Panel (overlay)
18. Library — Configure Data Sharing Panel (overlay)
19. TPRM — Supplier List
20. TPRM — Supplier Detail (Overview tab)
21. Risk Threat
22. Audit Logs
23. Document RAG
24. Roles + Access
25. Settings
```

**Prototype flows to connect:**
- Dashboard Action Required item → TPRM supplier detail
- Dashboard Stage row → TPRM filtered
- Controls → Create Control flow (steps 1–6 → Review → Success)
- Agents → Create Agent panel overlay → Success
- Library → Healthcare Template → Add Supplier panel → Success
- Library supplier card "Configure Data Sharing" → Configure panel
- TPRM "Configure →" → Configure Data Sharing panel

---

*End of Main Platform Figma Prompt*
*Supplier Portal is in a separate Figma file — see FIGMA_PROMPT_SUPPLIER_PORTAL.md*