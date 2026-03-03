🎯 FIGMA MASTER UPDATE — ORGANIZATION DATA FLOW + AGENT + CONTROLS
CONTEXT

We are evolving the Kyudo TPRM Platform.

This is NOT a feature change.
This is a structured UI + configuration refinement.

Keep:

Knowledge graph engine

PII flow logic

Truth Gap detection

Drag behavior

Zoom / pan

Risk scoring

Data X-Ray logic

Tailwind styling

Dark sidebar (#1B2236)

We are updating:

Knowledge Graph layout → Lifecycle-first view

Agent creation → Control segmentation

Create Control → Personality expansion with selectable checks

🟦 1️⃣ RENAME PAGE

Rename:

Organization Knowledge Graph
→
Organization Data Flow

🟦 2️⃣ DEFAULT VIEW — LIFECYCLE STRUCTURED LAYOUT

On page load, show 4 vertical lifecycle swimlanes:

Customer Acquisition

Customer Retention

Customer Upgradation

Customer Offboarding

These are editable labels.

🎨 VISUAL STYLE (Premium, Clean)

No heavy background tint

Use subtle vertical divider lines (#E5E7EB at 40% opacity)

Minimal floating column headers

14px semibold text

Small colored dot per stage:

Acquisition → Blue

Retention → Green

Upgradation → Amber

Offboarding → Slate

Keep dotted graph background visible.

Elegant. Enterprise. Not colorful blocks.

🏗 STRUCTURE INSIDE COLUMNS

Inside each lifecycle column:

Division Node (same purple style as current)
↓
Suppliers (same circular risk style)
↓
Systems (same rectangular style)

No root org node.

Divisions are created inside a lifecycle column.

Suppliers belong to division.

Systems belong to supplier.

All PII direction, Truth Gap, and edges remain unchanged.

🔄 RESET BEHAVIOR

Add button top-right:

🔄 Switch to Graph View

When clicked:

Vertical separators fade out

Nodes animate smoothly into relational free graph layout

Full drag freedom across canvas

Same as current knowledge graph behavior

No data changes.
Only layout engine changes.

🧠 MULTI-LIFECYCLE LOGIC

Supplier can belong to multiple lifecycles.

In supplier configuration:

Add:

Lifecycle Mapping (checkboxes)
☑ Acquisition
☑ Retention
☐ Upgradation
☐ Offboarding

For each selected lifecycle:
Authorized PII defined separately.

In Lifecycle View:

Supplier appears in each applicable column.

This is visual representation only.
No duplicate data objects.

🟧 3️⃣ AGENT CREATION — CONTROL SEGMENTATION

In Agent Create Page:

Segment control selection into tabs:

[ Process Controls ] | [ Technical Controls ]

Process tab appears first.

When Process selected:
Only Process controls visible.

When Technical selected:
Only Technical controls visible.

Keep:

Supplier selection

Stakeholder email targeting

Frequency

Alert sensitivity

This aligns platform as Process-first intelligence system.

🟩 4️⃣ CREATE CONTROL — PERSONALITY EXPANSION

Currently personality is a single selector.

Now update:

When a personality is selected,
expand predefined selectable checks below it.

Example:

If “Consulting” selected:

Show checkbox list:

☑ SOW validation
☑ Payment mismatch detection
☑ Invoice discrepancy
☑ SLA breach monitoring
☑ Approval chain anomaly
☐ Custom check (Add new)

If “Data Security” selected:

☑ Undeclared PII detection
☑ Encryption enforcement
☑ Access misuse
☑ Data retention violation
☐ Custom check

If “Operations” selected:

☑ SLA timing
☑ Volume mismatch
☑ Delivery delay
☐ Custom check

If “Regulatory” selected:

☑ Certification expiry
☑ Audit documentation missing
☑ Compliance breach
☐ Custom check

User can:

Select multiple checks

Add custom checks

Save as part of control

Personality now acts as a preset bundle of anomaly logic.

🟨 REMOVE EMAIL FROM CONTROLS

Ensure:

SPOC emails are NOT captured in Control creation.

Stakeholders belong to:

Supplier configuration
AND
Agent configuration

Controls remain reusable rule definitions.

🟥 DATA X-RAY (KEEP CENTERED MODAL)

Keep Data X-Ray as centered modal.

Overlay dark background (40% opacity).

Modal width 520–600px.
16px radius.
Soft shadow.

Do not dock to side.

🧠 DESIGN PRINCIPLES

Lifecycle-first business clarity

Process-first intelligence

Technical controls secondary

Graph engine untouched

Clean enterprise look

No heavy background colors

No clutter

Smooth transitions between views

🎯 FINAL OUTCOME

Default:
Structured lifecycle-based Organization Data Flow.

Switch:
Full relational knowledge graph.

Agents:
Process-first monitoring with segmented controls.

Controls:
Configurable personality-based anomaly presets.

Platform now clearly positions as:

Lifecycle-aware Supplier Intelligence + TPRM System.