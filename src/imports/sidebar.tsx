# Sidebar Update — Figma Make Prompt
## Update Sidebar.tsx only — do not touch any other file

CONTEXT:
- Project: Kyudo TPRM Platform
- File to edit: src/app/components/layout/Sidebar.tsx
- Stack: React 18 + TypeScript + Tailwind CSS v4 + react-router (not react-router-dom) + lucide-react
- All modals centered, Toaster in App.tsx, no emoji, platform name is "Kyudo"
- Do not change any page files, routes, Shell.tsx, or TopBar.tsx

---

## CHANGE REQUESTED

Rebuild Sidebar.tsx completely with the following structure and visual style. Keep all existing NavLink routing for functional pages. Non-functional items are plain divs with no onClick/href.

---

## VISUAL STYLE

### Container
- Width: 240px, fixed left, height 100vh
- Background: `#1B2236`
- Box-shadow: `2px 0 12px rgba(0,0,0,0.3)`
- Display: flex, flexDirection: column
- No right border

### Nav item base
```
display: flex
alignItems: center
gap: 10px
padding: 8px 12px
borderRadius: 6px
fontSize: 13px
fontWeight: 500
color: #8B9CC8
cursor: pointer
transition: all 0.15s
marginBottom: 2px
userSelect: none
```
Hover (functional items only): `color: #C8D3F5, background: rgba(255,255,255,0.06)`

Active state (NavLink isActive): 
```
color: #FFFFFF
background: rgba(255,255,255,0.1)
fontWeight: 600
```

Non-functional items (Kyudo-only): same base style, no hover, cursor: default, opacity: 0.7

Icon size: 16px, color: inherit, flexShrink: 0

Sub-items (A1/A2/A3 and Controls): paddingLeft: 28px, fontSize: 12px

### Section label
```
fontSize: 11px
fontWeight: 700
color: #4A5680
letterSpacing: 0.08em
padding: 12px 12px 4px
display: flex
justifyContent: space-between
alignItems: center
cursor: pointer
userSelect: none
```
Right: ChevronUp/ChevronDown icon 13px `#4A5680` — toggles on click

### Divider
`borderTop: 1px solid rgba(255,255,255,0.06), margin: 4px 0`

---

## LOGO

Height 64px, `padding: 0 20px`, display flex, alignItems center, gap 10px
`borderBottom: 1px solid rgba(255,255,255,0.07)`

Icon: inline SVG bullseye/target — two concentric circles + crosshair lines, 26px, stroke `#38BDF8` strokeWidth 1.5 fill none:
```jsx
<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
  <circle cx="13" cy="13" r="11" stroke="#38BDF8" strokeWidth="1.5"/>
  <circle cx="13" cy="13" r="6" stroke="#38BDF8" strokeWidth="1.5"/>
  <circle cx="13" cy="13" r="2" fill="#38BDF8"/>
  <line x1="13" y1="2" x2="13" y2="6" stroke="#38BDF8" strokeWidth="1.5"/>
  <line x1="13" y1="20" x2="13" y2="24" stroke="#38BDF8" strokeWidth="1.5"/>
  <line x1="2" y1="13" x2="6" y2="13" stroke="#38BDF8" strokeWidth="1.5"/>
  <line x1="20" y1="13" x2="24" y2="13" stroke="#38BDF8" strokeWidth="1.5"/>
</svg>
```

Text: "Ky**ū**do" — render as `Ky<span>ū</span>do` or just "Kyūdo" string — 20px fontWeight 800 `#FFFFFF` letterSpacing `-0.02em`

---

## FULL NAV STRUCTURE

### 1. Dashboard (functional — NavLink to "/")
```
[LayoutDashboard icon] Dashboard
```
marginTop: 12px

Divider

### 2. SECURITY SCANNER (non-functional section, collapsible)
Section label: "SECURITY SCANNER" + chevron

Sub-items (non-functional, no NavLink, plain divs):
- [ScanLine icon] Scanner Overview
- [ShieldCheck icon] Compliance  
- [AlertCircle icon] Findings
- [Scan icon] Scans

Divider

### 3. GOVERNANCE (non-functional section, collapsible)
Section label: "GOVERNANCE" + chevron

Sub-items (non-functional):
- [ShieldCheck icon] Controls Hub
- [FolderOpen icon] Evidence Hub
- [ClipboardList icon] Assessments

Divider

### 4. ORGANIZATION DATA FLOW (functional section, collapsible)
Section label: "ORGANIZATION DATA FLOW" + chevron

Sub-items (functional NavLinks, paddingLeft 28px):
- [Database icon] TPRM → "/tprm"
- [BookOpen icon] Library → "/libraries"
- [AlertTriangle icon] Risk Threat → "/risk-threat"

Divider

### 5. AGENTS (functional section, collapsible)
Section label: "AGENTS" + chevron

Sub-items:

**Agents row** (functional):
```
display: flex, alignItems: center, justifyContent: space-between
paddingLeft: 12px, paddingRight: 8px
```
Left: NavLink to "/agents" — [Bot icon] "Agents" — active/hover styles apply
Right: [+] button
```
width: 20px, height: 20px, borderRadius: 50%
background: rgba(255,255,255,0.08)
border: 1px solid rgba(255,255,255,0.15)
color: #8B9CC8, fontSize: 14px
cursor: pointer, display flex, alignItems center, justifyContent center
```
Hover [+]: `background: rgba(56,189,248,0.2), color: #38BDF8`
onClick [+]: navigate to "/controls/create" (use useNavigate)

**Agent sub-items** (functional NavLinks, paddingLeft 36px, fontSize 12px):
Each: colored dot (8px circle) + agent name
- A1: dot `#0EA5E9` + "Agent A1" → "/agents" (sets selectedAgent state — just navigate to /agents for now)
- A2: dot `#10B981` + "Agent A2" → "/agents"
- A3: dot `#8B5CF6` + "Agent A3" → "/agents"

**Controls** (functional NavLink, paddingLeft 28px):
- [Sliders icon] Controls → "/controls"

Divider

### 6. POLICY (non-functional section, collapsible)
Section label: "POLICY" + chevron

Sub-items (non-functional plain divs except Supplier Portal):
- [Compass icon] PolicyPilot
- [UserCog icon] Tenant Admin
- [ExternalLink icon] Supplier Portal
  - Render as: `<a href="#" target="_blank">` styled as nav item
  - After "Supplier Portal" text: tiny ExternalLink icon 11px `rgba(139,156,200,0.5)`
  - No active state

Divider

### 7. Settings (functional — NavLink to "/settings") PINNED BOTTOM
```
[Settings icon] Settings
```
marginBottom: 4px

---

## BOTTOM USER PROFILE

`borderTop: 1px solid rgba(255,255,255,0.07)`
`padding: 12px 16px`
`display: flex, alignItems: center, gap: 10px`

- Avatar: 32px circle, `background: linear-gradient(135deg, #0EA5E9, #6366F1)`, white "PS" 11px bold, borderRadius 50%
- Text block:
  - "Priya Sharma" 12px fontWeight 600 `#C8D3F5`
  - "Risk Manager" 11px `#4A5680`
- Far right: LogOut icon 14px `#4A5680`, hover `#EF4444`, cursor pointer

---

## COLLAPSE STATE

```tsx
const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

const toggle = (section: string) => 
  setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))

// Usage per section:
// chevron: collapsed['AGENTS'] ? <ChevronDown /> : <ChevronUp />
// items: !collapsed['AGENTS'] && <div>...items...</div>
```

All sections default expanded (not in collapsed state initially).

---

## IMPORTS NEEDED

```tsx
import { NavLink, useNavigate } from 'react-router'
import {
  LayoutDashboard, ScanLine, ShieldCheck, AlertCircle, Scan,
  FolderOpen, ClipboardList, Database, BookOpen, AlertTriangle,
  Bot, Plus, Sliders, Compass, UserCog, ExternalLink,
  Settings, LogOut, ChevronUp, ChevronDown
} from 'lucide-react'
import { useState } from 'react'
```

---

## CRITICAL RULES

1. Do NOT change Shell.tsx, TopBar.tsx, or any page file
2. Do NOT change any routes in routes.tsx
3. Non-functional items (Security Scanner, Governance, Policy sub-items) have NO NavLink, NO onClick navigation — they are display only
4. Functional NavLinks keep their exact existing routes
5. Platform name stays "Kyudo" — render "Kyūdo" in logo with ū character
6. No emoji anywhere — lucide-react icons only
7. Toaster stays in App.tsx — do not touch it
8. All existing page functionality is unaffected — only Sidebar.tsx changes