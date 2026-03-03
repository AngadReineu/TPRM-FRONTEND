# Library Page — Interactive Knowledge Graph
## Figma Make Prompt (Single Page Only)

---

## CONTEXT

This is the Library page of a TPRM (Third Party Risk Management) platform. It shows an interactive knowledge graph of an organization's divisions and their suppliers. The graph is built with React state — interactions work live but reset on page refresh. This is acceptable.

---

## PAGE LAYOUT

Full page, no inner scroll. Uses the existing sidebar + top bar shell from the rest of the platform.

**Background:** `#F8FAFC`
**Content area:** full remaining width and height after sidebar (240px) and top bar (64px)

### Top Bar (inside content area, not the global top bar)

`bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between`

**Left:**
- Title: "Organization Knowledge Graph" — 20px bold `#0F172A`
- Subtitle: "Click a node to expand. Hover to interact." — 13px `#64748B`

**Right — controls row:**
- Time slider label: "Viewing:" 13px `#64748B` + dropdown showing "Current ▼" with past options: "3 months ago / 6 months ago / 1 year ago" — ghost select input
- Divider `|`
- Zoom In button: `+` icon, white bg, `border border-[#E2E8F0]` rounded, 32px square
- Zoom Out button: `-` icon, same style
- Reset View button: "Reset" text + RotateCcw icon, same style

---

## THE GRAPH CANVAS

Full remaining height and width. `bg-[#F8FAFC]` with subtle dot-grid pattern:
```
background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px)
background-size: 24px 24px
```

The graph is **pannable** (drag canvas to move) and **zoomable** (scroll to zoom). Nodes are **draggable** individually.

---

## GRAPH INITIAL STATE

When the page first loads, the graph shows **one single node** in the center of the canvas:

### Org Root Node

- Circle: 64px diameter
- Fill: `#0EA5E9`
- Border: 3px solid `#0284C7`
- Shadow: `0 4px 16px rgba(14,165,233,0.35)`
- Label below node: org name "ABC Insurance Co." — 13px bold `#0F172A`, centered
- Label below name: "Organization" — 11px `#94A3B8`

**On hover over Org Root Node:**
- Node scales to 1.08x (CSS transform scale)
- A `+` button appears floating above-right of the node:
  - 24px circle, `bg-[#10B981]` green, white `+` icon 14px
  - `box-shadow: 0 2px 8px rgba(16,185,129,0.4)`
  - Tooltip: "Add Division"

---

## INTERACTION 1 — ADDING A DIVISION

**Trigger:** Click the `+` button on the Org Root Node

**What happens:**
A small inline modal appears near the node:

```
┌─────────────────────────────┐
│  Add Division               │
│                             │
│  Division Name*             │
│  ┌─────────────────────┐    │
│  │ e.g., Technical Dept│    │
│  └─────────────────────┘    │
│                             │
│  [Cancel]    [Add Division] │
└─────────────────────────────┘
```

Modal style:
- `bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-lg`
- Width: 240px
- Input: `border border-[#E2E8F0] rounded-lg px-3 py-2 text-14px w-full`
- Cancel: ghost small button
- Add Division: `bg-[#0EA5E9] text-white` small button, disabled until name typed

**On "Add Division" click:**
- Modal closes
- New **Division Node** appears on canvas connected to Org Root with an animated line
- Node animates in: scale 0 → 1 with ease-out 0.3s
- Edge (line) draws from org root to new division node

### Division Node Visual

- Circle: 48px diameter
- Fill: `#8B5CF6` purple
- Border: 2px solid `#7C3AED`
- Shadow: `0 4px 12px rgba(139,92,246,0.3)`
- Label below: division name — 12px bold `#0F172A`
- Label below name: "Division" — 11px `#94A3B8`

**Edge (line) from Org Root → Division:**
- Stroke: `#CBD5E1`, 2px, straight line
- Edge label centered on line: "HAS DIVISION" — 10px `#94A3B8` on `bg-white` small pill

**On hover over Division Node:**
- Scales 1.08x
- Green `+` button appears above-right: "Add Supplier"

**Multiple divisions:** Each new division node positions itself at a natural angle around the org root (auto-positioned using simple angle distribution: 1st division at 0°, 2nd at 120°, 3rd at 240°, etc. at radius 200px from center).

---

## INTERACTION 2 — ADDING A SUPPLIER

**Trigger:** Click the `+` button on any Division Node

**What happens:**
A larger modal opens (centered on screen, with backdrop):

```
┌──────────────────────────────────────────┐
│  Add Supplier                          × │
│  ┌──────────────────┐                    │
│  │ Technical Dept   │  ← division chip   │
│  └──────────────────┘                    │
│                                          │
│  Supplier Name *                         │
│  ┌────────────────────────────────────┐  │
│  │ e.g., XYZ Corporation              │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Email (primary contact) *               │
│  ┌────────────────────────────────────┐  │
│  │ contact@company.com                │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Contact Person                          │
│  ┌────────────────────────────────────┐  │
│  │ Full name                          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Phone                                   │
│  ┌────────────────────────────────────┐  │
│  │ +91 98765 43210                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Website                                 │
│  ┌────────────────────────────────────┐  │
│  │ https://example.com                │  │
│  └────────────────────────────────────┘  │
│                                          │
│  GST Number          PAN Number          │
│  ┌──────────────┐    ┌──────────────┐   │
│  │              │    │              │   │
│  └──────────────┘    └──────────────┘   │
│                                          │
│  Service Type *                          │
│  ┌────────────────────────────────────┐  │
│  │ Select stage...                  ▼ │  │
│  │ ─────────────────────────────────  │  │
│  │ Acquisition                        │  │
│  │ Retention                          │  │
│  │ Upgradation                        │  │
│  │ Offboarding                        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ⚠️ PII configuration will be available  │
│  after the supplier completes their      │
│  risk assessment.                        │
│                                          │
│  [Cancel]          [Add Supplier →]      │
└──────────────────────────────────────────┘
```

**Modal style:**
- `bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6`
- Width: 480px, max-height: 80vh, scrollable inside
- Backdrop: `bg-black/20` full screen behind modal
- X close button top-right

**Warning banner:**
`bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2 text-13px text-[#92400E]`
⚠️ "PII configuration will be available after the supplier completes their risk assessment."

**Add Supplier button:**
- Disabled (opacity-40) until Supplier Name + Email + Service Type filled
- Enabled: `bg-[#0EA5E9] text-white hover:bg-[#0284C7]`

**On "Add Supplier →" click:**
- Modal closes
- New **Supplier Node** appears connected to the division node it was added from
- Animates in: scale 0 → 1, ease-out 0.3s

### Supplier Node Visual (Dual Circle)

The supplier node is two concentric circles:

**Outer ring (always red, size = PII risk):**
- For new suppliers (no assessment yet): thin ring, 52px total diameter
- Stroke: `#EF4444`, stroke-width: 4px, fill: transparent
- Represents: PII data volume (grows when configured later)

**Inner circle (color = risk score):**
- 36px diameter
- Fill: `#94A3B8` gray — for unassessed suppliers
- Fill: `#10B981` green — for Low risk (score 76-100)
- Fill: `#F59E0B` amber — for High risk (score 26-50)
- Fill: `#EF4444` red — for Critical (score 0-25)
- Border: 2px solid white

**Label below node:**
- Supplier name — 11px bold `#0F172A`, max 16 chars then "..."
- Stage badge below name — tiny pill:
  - Acquisition: `bg-[#EFF6FF] text-[#0EA5E9]`
  - Retention: `bg-[#ECFDF5] text-[#10B981]`
  - Upgradation: `bg-[#FFFBEB] text-[#F59E0B]`
  - Offboarding: `bg-[#F8FAFC] text-[#94A3B8]`

**Edge (line) from Division → Supplier:**
- Stroke: `#E2E8F0`, 1.5px
- Edge label: "SUPPLIES TO" — 10px `#94A3B8` pill on white bg

**Supplier positions:** Auto-distributed around their division node at radius 160px.

---

## INTERACTION 3 — CLICKING A SUPPLIER NODE

**Trigger:** Click on any supplier node

**What happens:**
- Node gets a blue highlight ring: `outline: 3px solid #0EA5E9`
- A **side info panel** slides in from the right (320px wide)

### Supplier Info Panel

```
┌────────────────────────────────┐
│  ×                             │
│                                │
│  [Dual circle visual 48px]     │
│  XYZ Corporation               │
│  Acquisition stage badge       │
│                                │
│  ─────────────────────────────  │
│                                │
│  Risk Score                    │
│  ● Not assessed yet            │
│  Gray inner circle             │
│                                │
│  PII Volume                    │
│  Not configured                │
│                                │
│  Assessment Status             │
│  ⏳ Pending                     │
│                                │
│  Contract End                  │
│  — Not set                     │
│                                │
│  Agent Assigned                │
│  — None yet                    │
│                                │
│  ─────────────────────────────  │
│                                │
│  [Send Portal Link]            │
│  (primary blue, full width)    │
│                                │
│  [Remove Supplier]             │
│  (red ghost, full width)       │
└────────────────────────────────┘
```

Panel style:
- `bg-white border-l border-[#E2E8F0] shadow-xl`
- Slides in: `transform translateX(100%) → translateX(0)` 0.3s ease
- Sticky to right edge of content area, full height
- X button top-right closes it

**Dual circle visual inside panel:**
- Mini version of the node: 48px outer, 34px inner
- Same color logic as graph node

---

## INTERACTION 4 — CLICKING A DIVISION NODE

**Trigger:** Click on a division node (not the + button, the node itself)

**What happens:**
- Division node gets purple highlight ring
- Small tooltip card appears near node:

```
┌─────────────────────────┐
│  Technical Department   │
│  3 suppliers connected  │
│  2 Acquisition · 1 Ret  │
│                         │
│  [Rename]  [Delete]     │
└─────────────────────────┘
```

Tooltip style: `bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-13px`

---

## MOCK DATA — INITIAL LOADED STATE

**Do not start empty.** Load the graph with this pre-built state so the page looks populated on first load:

**Org Root:** "ABC Insurance Co."

**3 Division nodes:**
1. "Marketing Dept" (purple) — connected to org root
2. "Technical Dept" (purple) — connected to org root
3. "Operations Dept" (purple) — connected to org root

**Suppliers under Marketing Dept (3 nodes):**
1. "XYZ Email Mktg" — Acquisition stage — inner: `#F59E0B` amber (score 78) — outer ring medium
2. "Field Agent Co." — Acquisition stage — inner: `#94A3B8` gray (not assessed) — outer ring thin
3. "Call Center Ltd" — Retention stage — inner: `#EF4444` red (score 91 critical) — outer ring large

**Suppliers under Technical Dept (2 nodes):**
1. "CloudSec Inc." — Upgradation stage — inner: `#10B981` green (score 42 low) — outer ring thin
2. "DataVault Co." — Retention stage — inner: `#F59E0B` amber (score 67) — outer ring medium

**Suppliers under Operations Dept (2 nodes):**
1. "LogiTrack Ltd" — Offboarding stage — inner: `#94A3B8` gray (not assessed) — outer ring thin
2. "HR Systems Co." — Acquisition stage — inner: `#10B981` green (score 35 low) — outer ring thin

**Outer ring sizes:**
- Thin ring (stroke-width 3px): low PII volume
- Medium ring (stroke-width 6px): moderate PII volume
- Large ring (stroke-width 10px): high PII volume

---

## LEGEND CARD

Fixed bottom-left of the canvas. `bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-md` width 200px.

```
LEGEND

Node Types:
● Blue (64px)    Organization
● Purple (48px)  Division
● Dual ring      Supplier

Inner Circle (Risk Score):
● Green    Low Risk
● Amber    High Risk
● Red      Critical
● Gray     Not Assessed

Outer Ring (PII Volume):
○ Thin     Low volume
○ Medium   Moderate
○ Thick    High volume
```

All legend circles are actual small circle divs matching the real colors.

---

## TIME SLIDER BEHAVIOUR

The "Viewing:" dropdown in the top bar is **display only for now** — selecting a past date shows a toast notification: "Historical view coming soon" — amber toast bottom-center, auto-dismisses after 2s.

Toast style: `bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] px-4 py-2 rounded-lg text-13px`

---

## EMPTY STATE (if all divisions deleted)

If user removes all divisions, show centered message on canvas:

```
[Network icon, 48px, #CBD5E1]
"Start building your organization graph"
"Click the + button on the organization node to add your first division"
[color: #94A3B8, 14px centered]
```

---

## TECHNICAL NOTES FOR FIGMA MAKE

- Use **React useState** to store: divisions array + suppliers array (keyed by division id)
- Use **SVG** for drawing edges (lines between nodes)
- Use **absolute positioning** within a relative canvas div for node placement
- Node positions stored in state so they can be dragged
- Dragging: onMouseDown → track delta → update node position in state
- Zoom: CSS transform scale on the canvas wrapper
- Pan: track mouse drag on canvas background
- No external graph library needed — pure React + SVG + CSS transforms
- All data resets on refresh (no localStorage)
- Modal uses React portal or simple conditional render with backdrop div

---

## FRAME SIZE

1440 × 900px. The graph canvas fills: `calc(100vw - 240px)` width × `calc(100vh - 64px - 73px)` height (minus sidebar, topbar, and page header bar).

---

*This is the Library page only. All other pages (Dashboard, Controls, Agents, TPRM, Supplier Portal) are already built separately.*