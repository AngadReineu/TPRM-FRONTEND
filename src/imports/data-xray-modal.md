🎯 FIGMA UPDATE PROMPT — CENTER THE DATA X-RAY MODAL
CONTEXT

We are refining the Library page of the Kyudo TPRM Platform.

Currently, when “Data X-Ray” is ON and a supplier is selected, a floating panel appears on the right side.

We want to convert this right-side panel into a centered modal overlay for better focus and clarity.

🔄 CHANGE REQUIRED

Replace the right-side floating Data X-Ray panel with:

A centered modal dialog.

🟦 MODAL BEHAVIOR

When:

Data X-Ray is ON

A supplier node is clicked

Then:

Dim entire background (overlay with black at 40% opacity).

Center modal horizontally and vertically.

Keep knowledge graph visible but muted behind overlay.

Disable graph interaction while modal is open.

Add close (X) button top-right of modal.

🟪 MODAL DESIGN

Width: 520–600px
Border radius: 16px
Shadow: Soft elevation shadow
Background: White
Padding: 24px

Maintain Tailwind styling consistency.

🧩 MODAL STRUCTURE (KEEP SAME CONTENT)

Header:
"Data X-Ray — {Supplier Name}"

Sections (unchanged):

1️⃣ Truth Match Gauge (large circular indicator)

2️⃣ Outgoing Data (Org → Supplier)

Light blue container (#EFF6FF)

Declared PII chips

3️⃣ Incoming Data (Supplier → Org)

Light green container (#ECFDF5)

Detected PII chips

4️⃣ Shadow PII (if mismatch)

Light red container (#FEF2F2)

Red bold chips

Label: "Detected but NOT declared"

5️⃣ Linked Systems

System name

Stage badge

Risk indicator

6️⃣ Stakeholders

Internal + Supplier emails

7️⃣ Export X-Ray Report button (full width)

🎯 DESIGN PRINCIPLE

The X-Ray action should feel:

Diagnostic

Focused

Intentional

High-importance

Not like a secondary sidebar.

This modal represents deep inspection, not lightweight info.

❗ DO NOT CHANGE

Knowledge graph layout

Node behavior

Stage badges

Edge logic

Truth Gap logic

Graph zoom/pan functionality

X-Ray toggle button location

Only change the panel positioning and presentation style.

✅ RESULT

When user clicks supplier in X-Ray mode:

Graph fades → Centered diagnostic modal appears → User inspects → Closes → Returns to graph.

Clean.
Focused.
Professional.