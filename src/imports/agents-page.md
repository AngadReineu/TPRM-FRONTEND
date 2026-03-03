# Agents Page — Figma Make Prompt
## React Component

Build the Agents section as a React component with 3 views managed by state: Agent Dashboard, Agent Detail Page, and Create Agent Modal.

---

## VIEW 1 — AGENT DASHBOARD
Default view when "Agents" is clicked in sidebar.

### Page Header
`bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between`
- Left: "Agents" 24px bold `#0F172A`
- Sub: "Monitor and manage your AI agents" 13px `#94A3B8`
- Right: "+ Create Agent" button `bg-[#0EA5E9] text-white rounded-lg px-4 py-2 text-14px font-600` — onClick opens Create Agent modal

---

### KPI Cards Row
3 equal cards, `bg-white border border-[#E2E8F0] rounded-xl p-5`, gap-4

**Card 1 — Live**
- Large number: **3** — 36px bold `#0F172A`
- Label: "Live" 13px `#64748B`
- Left accent border: 4px solid `#10B981`
- Green animated ping dot beside number: 10px circle `#10B981` with pulse animation

**Card 2 — Active**
- Number: **2** — 36px bold `#0F172A`
- Label: "Active" 13px `#64748B`
- Left accent border: 4px solid `#0EA5E9`
- Blue dot beside number

**Card 3 — Syncing**
- Number: **1** — 36px bold `#0F172A`
- Label: "Syncing" 13px `#64748B`
- Left accent border: 4px solid `#F59E0B`
- Amber spinning sync icon (RefreshCw lucide, 14px, spin animation) beside number

---

### Agent Avatars Grid
Title row: "Your Agents" 16px bold `#0F172A` + agent count chip `bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full text-12px`

Grid: `display grid, grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)), gap-5`

**Each Agent Card:**
`bg-white border border-[#E2E8F0] rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-[#0EA5E9] transition-all 0.2s`

Center-aligned content:
```
┌──────────────────────┐
│                      │
│    [Avatar Circle]   │
│      72px circle     │
│                      │
│      Agent A1        │  14px bold #0F172A
│   ● Live             │  12px status
│                      │
│  Acquisition stage   │  stage badge
│                      │
│  3 controls · 2 sup  │  12px #94A3B8
│                      │
└──────────────────────┘
```

**Avatar circle:**
- 72px diameter
- Each agent has a unique gradient background:
  - A1: `linear-gradient(135deg, #0EA5E9, #6366F1)`
  - A2: `linear-gradient(135deg, #10B981, #0EA5E9)`
  - A3: `linear-gradient(135deg, #8B5CF6, #EC4899)`
  - A4: `linear-gradient(135deg, #F59E0B, #EF4444)`
- White initials inside: "A1" "A2" "A3" — 20px bold
- Status ring around avatar:
  - Live: `3px solid #10B981`
  - Active: `3px solid #0EA5E9`
  - Syncing: `3px solid #F59E0B`
  - Idle: `3px solid #CBD5E1`

**Status dot + label below name:**
- Live: green ping dot + "Live" `#10B981`
- Active: blue dot + "Active" `#0EA5E9`
- Syncing: amber spinning icon + "Syncing" `#F59E0B`
- Idle: gray dot + "Idle" `#94A3B8`

**Stage badge:** same pill style as rest of platform
- Acquisition: `bg-[#EFF6FF] text-[#0EA5E9]`
- Retention: `bg-[#ECFDF5] text-[#10B981]`
- Upgradation: `bg-[#FFFBEB] text-[#F59E0B]`
- Offboarding: `bg-[#F1F5F9] text-[#64748B]`

**Bottom stat line:** "N controls · N suppliers" 11px `#94A3B8`

**Click anywhere on card → navigate to Agent Detail view for that agent**

---

### Mock Agent Data
```js
agents = [
  { id:'a1', name:'Agent A1', initials:'A1', status:'live', stage:'Acquisition', controls:3, suppliers:2,
    gradient:'linear-gradient(135deg, #0EA5E9, #6366F1)' },
  { id:'a2', name:'Agent A2', initials:'A2', status:'active', stage:'Retention', controls:2, suppliers:3,
    gradient:'linear-gradient(135deg, #10B981, #0EA5E9)' },
  { id:'a3', name:'Agent A3', initials:'A3', status:'syncing', stage:'Upgradation', controls:4, suppliers:1,
    gradient:'linear-gradient(135deg, #8B5CF6, #EC4899)' },
]
```

---

## VIEW 2 — AGENT DETAIL PAGE
Opens when any agent avatar card is clicked.

### Header
`bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center gap-4`
- Back arrow button (ChevronLeft icon, 20px) + "Back to Agents" 14px `#64748B` — onClick returns to dashboard view
- Divider `|`
- Agent name: "Agent A1" 18px bold `#0F172A`
- Status badge: colored pill matching status

---

### Agent Profile Card
`bg-white border border-[#E2E8F0] rounded-2xl p-8 mx-6 mt-6`
Center aligned:

**Large avatar circle:** 96px, same gradient as card, white initials 26px bold, status ring 4px
Below avatar:
- Agent name: 22px bold `#0F172A`
- Status dot + label: 14px colored
- Stage badge: colored pill
- "3 controls enforced · 2 suppliers monitored" 13px `#94A3B8`

---

### 4 Action Cards
`display grid grid-cols-2 gap-4 px-6 mt-4`

Each action card:
`bg-white border border-[#E2E8F0] rounded-xl p-5 cursor-pointer hover:border-[#0EA5E9] hover:shadow-sm transition-all`

**Card 1 — Select Picture**
- Icon: `bg-[#EFF6FF]` rounded-lg 40px square, Image icon `#0EA5E9` 20px inside
- Title: "Select Picture" 15px bold `#0F172A`
- Sub: "Change the agent's avatar image" 13px `#94A3B8`
- On click: opens image picker — show 6 preset avatar options as circles in a small modal, click to select, updates agent avatar gradient/image

**Card 2 — Select Voice**
- Icon: `bg-[#F5F3FF]` rounded-lg, Mic icon `#8B5CF6`
- Title: "Select Voice"
- Sub: "Choose how this agent speaks"
- On click: opens voice picker modal — show 4 voice options as selectable pills: "Neutral" / "Professional" / "Friendly" / "Formal" — click to select, show checkmark on selected

**Card 3 — Talk to Agent**
- Icon: `bg-[#ECFDF5]` rounded-lg, Volume2 icon `#10B981`
- Title: "Talk to Agent"
- Sub: "Speak directly with this agent"
- On click: shows a simple voice interface modal:
  - Large mic button (64px circle `#10B981`) in center
  - "Click to start talking" 14px `#64748B`
  - Mic button toggles to red `#EF4444` "Listening..." state on click
  - Cancel button below

**Card 4 — Start Chat**
- Icon: `bg-[#FFF7ED]` rounded-lg, MessageSquare icon `#F59E0B`
- Title: "Start Chat"
- Sub: "Open chat interface with agent"
- On click: opens chat modal:
  - Header: agent avatar (36px) + "Agent A1" + green dot "Online"
  - Chat area: `bg-[#F8FAFC]` with 2 mock messages:
    - Agent bubble (left): `bg-white border border-[#E2E8F0]` "Hello! I'm Agent A1. I'm currently monitoring 3 controls and 2 suppliers. How can I help?"
    - User bubble (right): `bg-[#0EA5E9] text-white` "Show me the latest alerts"
    - Agent reply: "I found 2 alerts in the last 24 hours. XYZ Corporation has a missing data event and GHI Technologies assessment is overdue."
  - Input bar at bottom: text input + Send button `bg-[#0EA5E9]`
  - New messages appended to chat on send (echo back a mock response)

---

## VIEW 3 — CREATE AGENT MODAL
Opens from "+ Create Agent" button or from "Agents [+]" in sidebar.

Fixed centered modal, `rgba(15,23,42,0.4)` backdrop blur-sm.
White card `rounded-2xl shadow-2xl` width 480px max-height 85vh scrollable.

### Modal Header
`border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between`
- "Create Agent" 18px bold `#0F172A`
- X button `bg-[#F1F5F9] rounded-lg 32px`

### Modal Body `px-6 py-5 flex flex-col gap-5`

**Agent Name ***
Label + text input full width `border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-14px`
Placeholder: "e.g., Agent A4"

**Avatar Color**
Label + row of 8 circles 28px each, click to select:
Colors: `#0EA5E9` / `#10B981` / `#8B5CF6` / `#F59E0B` / `#EF4444` / `#EC4899` / `#06B6D4` / `#6366F1`
Selected: ring `3px solid currentColor` with 4px offset

**Live avatar preview:**
Small circle 40px showing selected color gradient + initials derived from name
"A4" preview text 13px `#64748B` below

**Assign Controls**
Label + searchable multi-select dropdown
Pre-options: MFA Enforcement / Data Classification Policy / Backup Verification / Access Review Policy
Selected show as blue chips `bg-[#EFF6FF] text-[#0EA5E9]` with × remove

**Assign Suppliers**
Label + searchable multi-select
Pre-options: XYZ Corporation / ABC Services / DEF Limited / GHI Technologies
Selected show as purple chips `bg-[#F5F3FF] text-[#8B5CF6]` with × remove

**Data Flow Stage**
Label + 4 pill toggles (multi-select):
Acquisition / Retention / Upgradation / Offboarding
Selected: colored per stage, unselected: `border border-[#E2E8F0] bg-white text-[#64748B]`

**Alert Sensitivity**
Label + 4 pills single-select: Low / Medium / High / Critical Only
Default: High selected `bg-[#0EA5E9] text-white`

### Modal Footer
`border-t border-[#E2E8F0] px-6 py-4 flex items-center justify-between`
- Left: "Save as Draft" ghost button
- Right: "Cancel" ghost + "Create Agent →" `bg-[#0EA5E9] text-white rounded-lg px-5 py-2.5` disabled until Name filled

**On "Create Agent →" click:**
- 1.6s loading state: button shows spinner + "Creating..."
- Then: success state in modal:
  - CheckCircle2 icon 48px `#10B981` centered
  - "Agent Created!" 20px bold
  - Agent preview avatar (40px) + name
  - "View Agents" primary button + "Create Another" ghost
- New agent appears in dashboard grid on close

---

## STATE MANAGEMENT

```js
const [view, setView] = useState('dashboard')
// 'dashboard' | 'detail'

const [selectedAgent, setSelectedAgent] = useState(null)
const [showCreateModal, setShowCreateModal] = useState(false)
const [agents, setAgents] = useState(MOCK_AGENTS)

// Sub-modals inside detail page
const [detailModal, setDetailModal] = useState(null)
// null | 'picture' | 'voice' | 'talk' | 'chat'
```

Navigation:
- Click agent card → `setView('detail'); setSelectedAgent(agent)`
- Back button → `setView('dashboard'); setSelectedAgent(null)`
- Click + or Create Agent button → `setShowCreateModal(true)`
- Create Agent submit → add to agents array + close modal

---

## TECHNICAL NOTES

- lucide-react icons available: Bot, ChevronLeft, Mic, Volume2, MessageSquare, Image, RefreshCw, CheckCircle2, Send, X, Plus
- No external libs, pure React useState
- Ping animation for Live status: `@keyframes ping { 0%,100%{opacity:1} 50%{opacity:0.4} }`
- Spin animation for Syncing: `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`
- All modals use fixed positioning with backdrop
- Chat input: controlled input + onKeyDown Enter to send