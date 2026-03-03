🎯 FIGMA MASTER CHANGE PROMPT — LIBRARY + SUPPLIER + AGENT UPGRADE
CONTEXT

We are updating the Kyudo TPRM Platform.

This is NOT a redesign.
This is a structural intelligence upgrade.

Keep:

Knowledge graph engine

Node structure

Truth Gap logic

Drag behavior

X-Ray toggle

Color system

Dark navy sidebar (#1B2236)

Tailwind + card styling

We are enhancing:

Lifecycle visualization

Supplier stakeholder modeling

Agent intelligence targeting

Data X-Ray experience

🔵 1️⃣ LIBRARY PAGE — LIFECYCLE-AWARE KNOWLEDGE GRAPH
Add Stage Column Overlay

Add 4 vertical background lanes across full canvas:

| Acquisition | Retention | Upgradation | Offboarding |

Design rules:

Each column has subtle tinted background:

Acquisition → #EFF6FF (10% opacity)

Retention → #ECFDF5 (10%)

Upgradation → #FFFBEB (10%)

Offboarding → #F1F5F9 (10%)

Sticky stage header at top of each column

16px bold label

Small colored dot matching stage color

Column titles remain visible during pan/zoom

IMPORTANT:
This is visual grouping only.
Do NOT remove knowledge graph edges or free drag behavior.

🟣 2️⃣ ENHANCED SUPPLIER NODE DESIGN

Update Supplier node to show:

Below supplier name add:

Row of micro badges:

PII Direction (Share / Ingest / Both)

Contract End Date (small calendar icon + date)

Frequency (Hourly / Daily / Weekly)

Keep:

Risk color inner circle

PII volume outer ring

Truth Gap pulsing alert

Make supplier nodes more informative without needing click.

🟢 3️⃣ DATA FLOW EDGE ENHANCEMENT

Improve edge visualization:

Add animated directional arrow flow (subtle pulse)

Hover over edge shows tooltip:

Direction (Org → Supplier or Supplier → Org)

PII types

Frequency

Stage

If stage discrepancy:

Red glow effect behind edge

Label: "STAGE GAP"

🔴 4️⃣ DATA X-RAY MODE REDESIGN

When X-Ray toggle is ON:

All unrelated nodes fade to 8% opacity.

Only selected supplier + connected systems + divisions remain highlighted.

Show a right-side floating intelligence panel.

X-RAY PANEL STRUCTURE

Header:
"Data X-Ray — {Supplier Name}"

Sections:

Circular Truth Match Gauge (large)

Outgoing Data (Org → Supplier)

Blue container (#EFF6FF)

Declared PII chips

Incoming Data (Supplier → Org)

Green container (#ECFDF5)

Detected PII chips

Shadow PII (if mismatch)

Red container (#FEF2F2)

Red bold chips

Label: "Detected but NOT declared"

Linked Systems

List systems with stage badge

Clicking zooms graph to system

This panel replaces the current small modal for X-Ray mode.

🟡 5️⃣ ADD SUPPLIER MODAL — STAKEHOLDER MATRIX

Enhance Add Supplier modal.

Keep:

Name

Email

GST

PAN

Contract dates

Stage

Add new section:

Stakeholder Matrix

Two columns:

Internal Stakeholders:

Business Owner (Email)

Finance Contact (Email)

Project Manager (Email)

Escalation Contact (Email)

Supplier Stakeholders:

Account Manager (Email)

Supplier Finance (Email)

Supplier Escalation (Email)

Design as clean input grid.
These will be used for Agent email intelligence.

Make editable anytime from Supplier Info modal.

🟠 6️⃣ AGENT CREATE MODAL — MULTI-ROLE TARGETING

Replace current:

Internal SPOC + Supplier SPOC

With:

Email Intelligence Targeting

Section title:
"Stakeholder Communication Monitoring"

Fields grouped by:

Internal Contacts (multi-input)
Supplier Contacts (multi-input)

Allow adding multiple emails per role.

Add note:

"The agent will scan email and calendar activity between these contacts to detect contractual, financial, and operational anomalies."

Keep:

Template selection

Frequency

Alert sensitivity

Controls assignment

🟣 7️⃣ AGENT DETAIL PAGE — STAKEHOLDER NETWORK

Add new panel under Profile Card:

Stakeholder Communication Map

Visual mini graph:

Internal Contacts (left)
Supplier Contacts (right)

Show connecting lines.

Below that:
Summary card:

Last SOW signed

Last Payment detected

Last Escalation

Active Risks

This connects process intelligence to graph.

🟤 8️⃣ CONTROLS PAGE — CLEAR SEPARATION

Add visual tabs:

[ Technical Controls ] | [ Process Controls ]

Keep existing filters.

Process controls should highlight:

SOW validation

Payment checks

SLA monitoring

Technical controls:

MFA

Encryption

Access Review

Vulnerability Scanning

🟦 9️⃣ SYSTEM NODE UPGRADE

Inside System modal:

Add:

Data Direction Badge:

Receives PII

Sends PII

Bidirectional

Add:

"Operated By" → Supplier Name (clickable link)

Keep:

Stage discrepancy logic

Vulnerability gauge

Authorized PII display

🧠 DESIGN PRINCIPLES

Do NOT remove knowledge graph.

Do NOT flatten to table layout.

Keep drag functionality.

Keep pulsing alerts.

All modals remain centered.

Maintain Tailwind styling consistency.

Keep Kyudo branding.

🎯 OUTCOME

After changes:

Library becomes:
Lifecycle-Aware Data Flow Knowledge Graph.

Agents become:
Email + Process Intelligence Engines.

Suppliers become:
Multi-role accountable entities.

Platform evolves from:
Technical control tool
→
Full-spectrum TPRM intelligence system.