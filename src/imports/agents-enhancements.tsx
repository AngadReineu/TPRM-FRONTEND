# Agents Page Enhancement — Figma Make Prompt
## Update Agents.tsx only — add 4 enhancements to the dashboard view

CONTEXT:
- Project: Kyudo TPRM Platform
- File to edit: src/app/pages/Agents.tsx
- Stack: React 18 + TypeScript + Tailwind CSS v4 + lucide-react + sonner
- All modals centered, no side panels, no emoji, lucide-react icons only
- Toaster already in App.tsx — do not add it again
- Do not change routing, Shell.tsx, Sidebar.tsx, or TopBar.tsx
- All data is mock/hardcoded — no backend

---

## CHANGE REQUESTED

Enhance the Agent Dashboard view (View 1) with 4 additions. Do not change View 2 (Agent Detail) or View 3 (Create Agent Modal). Do not change mock agent data structure — only add new fields to it.

---

## ADDITION 1 — 4TH KPI CARD: OPEN ALERTS

Add a 4th KPI card to the existing 3-card row. Grid changes from `grid-cols-3` to `grid-cols-4`.

**Card 4 — Open Alerts:**
```
borderLeft: 4px solid #EF4444
```
- Number: **5** — 34px bold `#0F172A`
- Right of number: AlertCircle icon 16px `#EF4444` (not animated, static)
- Label: "Open Alerts" 13px `#64748B`
- Sub-text below label: "3 critical · 2 high" — 11px `#94A3B8`

Add to mock data at top of component:
```ts
const openAlerts = { total: 5, critical: 3, high: 2 }
```

---

## ADDITION 2 — ALERT BADGE + LAST ACTIVE ON EACH AGENT CARD

Update each agent object to include `alerts` count and `lastActive` string:

```ts
const agents = [
  {
    id: 'a1', name: 'Agent A1', initials: 'A1',
    status: 'live', stage: 'Acquisition',
    controls: 3, suppliers: 2,
    gradient: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
    alerts: 2,
    lastActive: '2 min ago'
  },
  {
    id: 'a2', name: 'Agent A2', initials: 'A2',
    status: 'active', stage: 'Retention',
    controls: 2, suppliers: 3,
    gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)',
    alerts: 0,
    lastActive: '8 min ago'
  },
  {
    id: 'a3', name: 'Agent A3', initials: 'A3',
    status: 'syncing', stage: 'Upgradation',
    controls: 4, suppliers: 1,
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    alerts: 3,
    lastActive: 'just now'
  },
]
```

**On each agent card, below the "N controls · N sup" line, add two rows:**

**Alert badge row:**
- If `alerts === 0`: show green pill `bg-[#ECFDF5] text-[#10B981]` — CheckCircle2 icon 11px + "No alerts" 11px
- If `alerts > 0`: show red pill `bg-[#FEF2F2] text-[#EF4444]` — AlertCircle icon 11px + "{N} open alerts" 11px

**Last active row:**
- Clock icon 11px `#94A3B8` + "Last active: {lastActive}" 11px `#94A3B8`
- marginTop: 4px

Both rows: `display flex, alignItems center, gap 4px, justifyContent center`

---

## ADDITION 3 — HEALTH BAR ON EACH AGENT CARD

Below the last active row, add a health/coverage bar:

Add `health` number (0–100) to each agent object:
- A1: `health: 82`
- A2: `health: 94`
- A3: `health: 61`

**Health bar component (inside each card, full width, at very bottom):**

```
marginTop: 10px
borderTop: 1px solid #F1F5F9
paddingTop: 8px
```

Row: health label left + percentage right
- "Coverage" 10px `#94A3B8` left
- "{health}%" 10px fontWeight 600 right — color based on value:
  - ≥80: `#10B981`
  - 50–79: `#F59E0B`
  - <50: `#EF4444`

Bar below label row:
```
height: 4px
borderRadius: 99px
background: #F1F5F9  (track)
width: 100%
```
Fill div inside:
```
height: 100%
borderRadius: 99px
width: {health}%
background: #10B981 if ≥80, #F59E0B if 50-79, #EF4444 if <50
transition: width 0.6s ease
```

---

## ADDITION 4 — ACTIVITY FEED STRIP (below agent grid)

Add a new section below the agent cards grid.

**Section header row:**
```
display: flex, justifyContent: space-between, alignItems: center
marginTop: 32px, marginBottom: 12px
```
- Left: "Agent Activity" 15px bold `#0F172A` + "Live feed of agent actions" 12px `#94A3B8` (below title)
- Right: "View All" link 13px `#0EA5E9` cursor pointer (non-functional, toast "Coming soon")

**Activity feed card:**
`bg-white border border-[#E2E8F0] rounded-xl overflow-hidden`

5 activity rows. Each row:
```
display: flex
alignItems: center
gap: 12px
padding: 12px 16px
borderBottom: 1px solid #F8FAFC
```
Last row: no borderBottom

Row hover: `background: #F8FAFC`

**Each row contains:**

Left: Agent avatar pill — 28px circle, agent gradient, white initials 10px bold

Middle (flex-1):
- Action text: 13px `#334155` — bold agent name + normal action description
- Timestamp: 11px `#94A3B8` below

Right: Status icon — 16px

**5 mock activity rows:**

```
Row 1:
  Avatar: A1 gradient #0EA5E9→#6366F1
  Action: "Agent A1  checked MFA compliance on XYZ Corporation"
  Time: "2 min ago"
  Icon: CheckCircle2 16px #10B981

Row 2:
  Avatar: A2 gradient #10B981→#0EA5E9
  Action: "Agent A2  raised alert: Call Center Ltd missing data"
  Time: "8 min ago"
  Icon: AlertCircle 16px #EF4444

Row 3:
  Avatar: A3 gradient #8B5CF6→#EC4899
  Action: "Agent A3  started backup verification check"
  Time: "just now"
  Icon: RefreshCw 16px #F59E0B (spinning — spin animation applied)

Row 4:
  Avatar: A1 gradient #0EA5E9→#6366F1
  Action: "Agent A1  document expiry warning: ISO 27001 cert expires in 22 days"
  Time: "15 min ago"
  Icon: AlertTriangle 16px #F59E0B

Row 5:
  Avatar: A2 gradient #10B981→#0EA5E9
  Action: "Agent A2  completed access review policy evaluation"
  Time: "1 hr ago"
  Icon: CheckCircle2 16px #10B981
```

Action text rendering: wrap in `<p>` — agent name as `<span style={{fontWeight:600, color:'#0F172A'}}>Agent AX</span>` + rest as normal text `#334155`

---

## ANIMATIONS (already in file — keep existing, add if missing)

```css
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

Apply spin to Row 3 activity icon: `style={{ animation: 'spin 1.5s linear infinite' }}`

---

## FINAL DASHBOARD LAYOUT (top to bottom)

```
Page Header (Agents title + subtitle + Create Agent button)
    ↓
4 KPI Cards (Live · Active · Syncing · Open Alerts)
    ↓
"Your Agents" label + count chip
    ↓
Agent Cards Grid (each card now has: avatar + name + status + stage + controls/sup + alert badge + last active + health bar)
    ↓
"Agent Activity" section header
    ↓
Activity Feed (5 rows)
```

---

## CRITICAL RULES

1. Only edit the dashboard view (View 1) — do not touch Agent Detail or Create Agent Modal
2. Do not change any existing functionality — only add new UI elements
3. Do not add Toaster — already in App.tsx
4. No emoji — lucide-react icons only
5. All new data is hardcoded mock — no backend calls
6. Import any new lucide icons needed: AlertCircle, CheckCircle2, Clock, AlertTriangle