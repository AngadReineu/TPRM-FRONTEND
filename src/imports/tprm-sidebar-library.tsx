# TPRM Platform — Sidebar + Library Page
## Figma Make Prompt — React Component

Build a full-page React component with two parts: (1) the sidebar nav and (2) the Library interactive knowledge graph. The sidebar is always visible. The Library is the active page shown in the content area.

---

## PART 1 — SIDEBAR

### Layout
- Width: 240px, fixed left, full height
- Background: `#FFFFFF`
- Right border: `1px solid #E2E8F0`
- Display: flex column, justify-between top and bottom

### Top Section — Logo
Height 64px, border-bottom `1px solid #E2E8F0`, px-4, flex items-center gap-2
- Shield icon (lucide ShieldCheck), 22px, color `#0EA5E9`
- Text: "TPRM Platform" — 15px, fontWeight 700, color `#0F172A`

### Nav Items
Padding: `px-3 py-2` on the nav container. Gap 2px between items.

Each nav item: `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-14px font-500`

**Default state:** color `#64748B`, background transparent, hover `bg-[#F1F5F9]`
**Active state:** color `#0EA5E9`, background `#EFF6FF`, fontWeight 600, left border `3px solid #0EA5E9`

**Nav items in order:**

```
[LayoutDashboard icon]  Dashboard
[Shield icon]           Controls
[Bot icon]              Agents
```

Then a section group label:
`px-3 pt-4 pb-1 text-11px fontWeight-600 color-#94A3B8 letterSpacing-0.08em`
Text: "ORGANIZATION DATA FLOW"
- Small chevron-down icon right side, 14px

Under this group (indented 8px extra left padding):
```
[Database icon]   TPRM
[BookOpen icon]   Library   ← THIS IS THE ACTIVE PAGE
```

Then more items:
```
[AlertTriangle icon]  Risk Threat
[ClipboardList icon]  Audit Logs
[FileText icon]       Document RAG
[Users icon]          Roles + Access
[Settings icon]       Settings
```

Then divider line `border-t border-[#E2E8F0] my-2`

```
[ExternalLink icon]   Supplier Portal
```
This item has a small ExternalLink icon (12px) after the text label, color `#94A3B8`.

**Library is the active item** — show it with active state (blue text + blue left border + light blue bg).

### Bottom Section — User Profile
Border-top `1px solid #E2E8F0`, padding 16px, flex items-center gap-3

- Avatar: 36px circle, background `#0EA5E9`, white initials "PS" — 13px fontWeight 700
- Right of avatar: Name "Priya Sharma" — 13px fontWeight 600 `#0F172A` + Role "Risk Manager" — 12px `#64748B`
- Far right: LogOut icon 16px `#94A3B8`, hover color `#EF4444`

---

## PART 2 — LIBRARY PAGE (CONTENT AREA)

### Page Shell
- Position: left 240px (after sidebar), top 0, right 0, bottom 0
- Background: `#F8FAFC`
- Display: flex column

### Global Top Bar
Height 64px, `bg-white border-b border-[#E2E8F0] px-6`, flex items-center justify-between

Left: Page title "Library" — 18px fontWeight 700 `#0F172A`

Right:
- Bell icon (18px `#64748B`) with small red dot badge (8px `#EF4444`) top-right
- Avatar circle 34px `#0EA5E9` initials "PS" white 12px

### Content Top Bar (below global top bar)
`bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between`

Left:
- "Organization Knowledge Graph" — 18px fontWeight 700 `#0F172A`
- "Drag nodes · Scroll to zoom · Click to interact" — 12px `#94A3B8`

Right: flex gap-2 items-center
- Label "Viewing:" 13px `#64748B`
- Select dropdown: `border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-13px bg-white` — options: Current / 3 months ago / 6 months ago / 1 year ago
- Divider: `1px solid #E2E8F0` height 20px
- Three buttons (each 32px square, `border border-[#E2E8F0] rounded-lg bg-white text-16px text-[#64748B]`):
  - "+" → zoom in (onClick: zoom += 0.15)
  - "−" → zoom out (onClick: zoom -= 0.15)
  - "↺" → reset (onClick: zoom=1, pan={x:0,y:0})

---

## GRAPH CANVAS

Fills all remaining height. Position relative, overflow hidden.

Background dot grid:
```css
background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
background-size: 24px 24px;
```

Canvas is **pannable** (mousedown drag on background → update pan offset) and **zoomable** (wheel scroll → update scale). All nodes inside a single wrapper div with `transform: scale(zoom) translate(panX, panY)` applied.

All node positions are stored in React state. Nodes are **individually draggable** via onMouseDown → mousemove → mouseup on document.

SVG layer (position absolute, inset 0, pointerEvents none, overflow visible) draws all edges BEHIND nodes.

---

## NODES

### Org Root Node
- Size: 64px circle
- Fill: `#0EA5E9`, border: `3px solid #0284C7`
- Shadow: `0 4px 20px rgba(14,165,233,0.35)`
- Icon inside: white user/org SVG icon 26px
- Label below: "ABC Insurance Co." 12px bold `#0F172A`
- Sub-label: "Organization" 10px `#94A3B8`
- Initial position: center of canvas
- On hover: scale 1.08, show green + button (22px circle `#10B981`) top-right with tooltip "Add Division"
- On click + button: open Add Division modal

### Division Node
- Size: 48px circle
- Fill: `#8B5CF6`, border: `2px solid #7C3AED`
- Shadow: `0 4px 14px rgba(139,92,246,0.3)`
- Icon inside: white briefcase icon 20px
- Label below: division name 11px bold `#0F172A`
- Sub-label: "Division · N suppliers" 10px `#94A3B8`
- Auto-position: distribute around org root at 200px radius, evenly spaced by angle
- On hover: scale 1.08, show green + button top-right tooltip "Add Supplier"
- On click + button: open Add Supplier modal for this division
- On click node body: open Division Info modal

### Supplier Node — DUAL CIRCLE (most important)
Two concentric circles rendered as SVG:

**INNER CIRCLE** (risk score):
- Diameter: 36px
- Color rules (strict — only these 3 colors):
  - Score is null/undefined → `#94A3B8` gray (not assessed)
  - Score >= 50 → `#10B981` GREEN (low risk)
  - Score < 50 → `#EF4444` RED (critical)
- White 2px border

**OUTER RING** (PII data volume):
- Always color: `#EF4444` red, opacity 0.35
- ONLY the stroke-width changes:
  - piiVolume "low" → strokeWidth 3px (total ~44px)
  - piiVolume "moderate" → strokeWidth 7px (total ~52px)
  - piiVolume "high" → strokeWidth 13px (total ~64px)
- Fill: transparent

Label below node: supplier name 10px bold `#0F172A` max-width 80px truncated
Stage badge below name (tiny pill 10px):
- Acquisition: bg `#EFF6FF` text `#0EA5E9`
- Retention: bg `#ECFDF5` text `#10B981`
- Upgradation: bg `#FFFBEB` text `#F59E0B`
- Offboarding: bg `#F1F5F9` text `#64748B`

On click: open Supplier Info modal

---

## EDGES (SVG lines)

Org → Division: stroke `#CBD5E1` strokeWidth 2, with centered pill label "HAS DIVISION" (10px `#94A3B8`, white bg rect behind text)

Division → Supplier: stroke `#E2E8F0` strokeWidth 1.5, with centered pill label "SUPPLIES TO" (10px `#94A3B8`, white bg rect)

---

## MOCK DATA (pre-loaded, do not start empty)

```js
org = { id:'org', name:'ABC Insurance Co.', x:580, y:380 }

divisions = [
  { id:'d1', name:'Marketing Dept', x:400, y:200 },
  { id:'d2', name:'Technical Dept', x:350, y:500 },
  { id:'d3', name:'Operations Dept', x:760, y:480 },
]

suppliers = [
  { id:'s1', divId:'d1', name:'XYZ Email Mktg', stage:'Acquisition', riskScore:78, piiVolume:'moderate', email:'xyz@email.com', x:220, y:120 },
  { id:'s2', divId:'d1', name:'Field Agent Co.', stage:'Acquisition', riskScore:null, piiVolume:'low', email:'field@agent.com', x:380, y:80 },
  { id:'s3', divId:'d1', name:'Call Center Ltd', stage:'Retention', riskScore:22, piiVolume:'high', email:'cc@ltd.com', x:200, y:280 },
  { id:'s4', divId:'d2', name:'CloudSec Inc.', stage:'Upgradation', riskScore:82, piiVolume:'low', email:'cloud@sec.com', x:160, y:460 },
  { id:'s5', divId:'d2', name:'DataVault Co.', stage:'Retention', riskScore:35, piiVolume:'moderate', email:'data@vault.co', x:200, y:620 },
  { id:'s6', divId:'d3', name:'LogiTrack Ltd', stage:'Offboarding', riskScore:null, piiVolume:'low', email:'lt@email.com', x:660, y:640 },
  { id:'s7', divId:'d3', name:'HR Systems Co.', stage:'Acquisition', riskScore:88, piiVolume:'moderate', email:'hr@systems.co', x:880, y:560 },
]
```

Note on mock data inner colors:
- s1 riskScore 78 → GREEN inner
- s2 riskScore null → GRAY inner
- s3 riskScore 22 → RED inner
- s4 riskScore 82 → GREEN inner
- s5 riskScore 35 → RED inner
- s6 riskScore null → GRAY inner
- s7 riskScore 88 → GREEN inner

---

## MODALS

All modals: centered on screen, `bg-black/20` backdrop, `bg-white rounded-2xl shadow-2xl p-6`, scale-in animation 0.2s, X button top-right.

### Modal 1 — Add Division
Width 340px.
- Title "Add Division" 18px bold
- Subtitle "Add a department or business unit" 13px muted
- Input: "Division Name *" — text input full width, rounded-lg, border `#E2E8F0`
- Footer: Cancel ghost + "Add Division" blue primary (disabled until name filled)
- On submit: new division node added to state at angle-distributed position around org

### Modal 2 — Add Supplier
Width 480px, scrollable.
- Title "Add Supplier" 18px bold + division name purple chip below
- Amber warning banner: ⚠️ "PII configuration available after risk assessment"
  - `bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2 text-13px text-[#92400E]`
- Fields (all full-width except GST+PAN which are 50/50):
  - Supplier Name * (text input)
  - Email * (text input)
  - Contact Person (text input)
  - Phone (text input)
  - Website (text input)
  - GST Number | PAN Number (two inputs side by side)
- Service Type * — four pill buttons in a row: Acquisition / Retention / Upgradation / Offboarding
  - Unselected: `border border-[#E2E8F0] bg-white text-[#64748B]`
  - Selected Acquisition: `border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]`
  - Selected Retention: `border-[#10B981] bg-[#ECFDF5] text-[#10B981]`
  - Selected Upgradation: `border-[#F59E0B] bg-[#FFFBEB] text-[#F59E0B]`
  - Selected Offboarding: `border-[#64748B] bg-[#F1F5F9] text-[#64748B]`
- Footer: Cancel ghost + "Add Supplier →" blue primary (disabled until Name + Email + Stage filled)
- On submit: new supplier node added with riskScore=null, piiVolume='low', inner circle gray

### Modal 3 — Supplier Info (on clicking supplier node)
Width 360px.
- Top section centered: dual circle visual (56px outer, 38px inner, same color logic), supplier name 18px bold, stage badge
- Divider
- Info rows (label 11px uppercase gray + value 14px):
  - RISK SCORE: colored dot + score text (e.g. "78 / 100 — Low Risk" in green, or "Not assessed yet" in gray)
  - PII VOLUME: red dot (opacity 0.4) + volume label ("Low volume ~5–20GB" / "Moderate ~20–100GB" / "High 100GB+")
  - ASSESSMENT STATUS: ⏳ Pending
  - CONTRACT END: — Not set
  - AGENT ASSIGNED: — None yet
  - PRIMARY CONTACT: email as blue link
- Divider
- "Send Portal Link" — full width blue primary button
- "Remove Supplier" — full width, `bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]`, on click removes supplier from state and closes modal

### Modal 4 — Division Info (on clicking division node body)
Width 340px.
- Division name 18px bold
- "N suppliers connected · X Acquisition · Y Retention" 13px muted
- Footer: "Delete Division" red ghost button (removes division + all its suppliers from state) + Close ghost button

---

## LEGEND (fixed bottom-left of canvas)

`bg-white/95 border border-[#E2E8F0] rounded-xl p-4 shadow-md` width 196px, position absolute bottom-6 left-6.

```
LEGEND  (11px uppercase #94A3B8 bold)

Node Types
● #0EA5E9  Organization
● #8B5CF6  Division
○ dual     Supplier

Inner Circle
● #10B981  Score ≥ 50 (Low)
● #EF4444  Score < 50 (Critical)
● #94A3B8  Not Assessed

Outer Ring (PII Volume)
○ thin     Low
○ medium   Moderate
○ thick    High
```

Circles in legend are actual styled divs/SVGs matching real node colors.

---

## EMPTY STATE

If all divisions deleted, show centered on canvas:
- Network icon 48px `#CBD5E1`
- "Start building your graph" 16px bold `#64748B`
- "Click + on the organization node to add your first division" 13px `#94A3B8`

---

## TECHNICAL IMPLEMENTATION NOTES

```
State: { org, divisions[], suppliers[], zoom, pan{x,y}, modal }

Dragging nodes:
  onMouseDown on node → store startMouse + startNodePos
  document.onMouseMove → delta = mouse - startMouse → node.pos = startPos + delta
  document.onMouseUp → clear listeners
  moved=true if delta > 3px (to distinguish drag from click)

Canvas pan:
  onMouseDown on canvas background → store startMouse + startPan
  document.onMouseMove → pan = startPan + delta
  document.onMouseUp → clear listeners

Zoom:
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom += -e.deltaY*0.001 }, {passive:false})
  clamp zoom between 0.3 and 2.5

Transform wrapper: scale(zoom) translate(pan.x/zoom, pan.y/zoom)

Edges: SVG absolute inset-0 pointerEvents-none overflow-visible
  Draw line from node center to node center
  Mid-point pill label: white rect + text

New division position: angle = existingCount * (2π/3), radius 200, around org center
New supplier position: angle = existingInDiv * (2π/5), radius 160, around div center

No localStorage. Refresh resets to mock data.
```

---

## COMPONENT STRUCTURE

```
<App>
  <div style="display:flex height:100vh">
    <Sidebar />                          // 240px fixed left
    <div style="flex:1 display:flex flex-col">
      <GlobalTopBar />                   // 64px
      <ContentTopBar />                  // ~73px
      <GraphCanvas>                      // flex:1
        <svg edges />
        <OrgNode />
        {divisions.map(d => <DivisionNode />)}
        {suppliers.map(s => <SupplierNode />)}
        <Legend />
      </GraphCanvas>
    </div>
  </div>
  {modal === 'addDiv' && <AddDivisionModal />}
  {modal === 'addSup' && <AddSupplierModal />}
  {modal === 'supInfo' && <SupplierInfoModal />}
  {modal === 'divInfo' && <DivisionInfoModal />}
</App>
```

Font: use system font stack `'Segoe UI', -apple-system, sans-serif` — no external imports needed.
Icons: use lucide-react (already available in Figma Make).
No external graph libraries. Pure React + SVG + CSS transforms only.