1. Agent Detail: Stakeholder Context
The profile section is updated to provide the necessary "human context" for the AI's reasoning engine.

Stakeholder Context Section: Added directly beneath the Agent initials and department line.

Internal SPOC: Displays priya@abc.co (Risk Manager) to identify the internal owner.

Supplier SPOC: Displays john@xyz.com (Account Manager) to identify the external point of contact.

Contextual Link: These emails serve as the "targets" for the Agent Reasoning feed, explaining whose conversations the AI is auditing for anomalies.

2. Knowledge Graph: System Metadata & Enhanced View
The System info popup () is expanded to match the technical depth found in the registration workflow.

Metadata Integration: The popup now mirrors the data fields from the "Register New System" modal.

Data Source Location: Displays the specific infrastructure path, such as AWS S3 Bucket or SQL DB.

PII Chips: Visual chips/icons show exactly which data fields (Name, Email, Aadhar, etc.) are being monitored in that system.

Vulnerability Score: A circular 0–100 gauge showing the real-time security health of the system.

3. Add Supplier Modal: PII Gating
The onboarding flow is updated to reflect the policy that data sharing is a "gated" feature.

Prominent Service Type: The selection for Acquisition, Retention, Upgradation, or Offboarding is moved to the top and styled as high-visibility pill buttons.

PII Locked State: A new UI state for the PII configuration section.

Visual Warning: An amber banner clearly states: "Data sharing configuration is disabled until the initial risk assessment and AI scan are complete."

4. Agent Templates: Previews & Customization
The template library () now allows users to inspect the "AI Logic" before deployment.

Custom Personality Card: A new dashed card at the end of the grid for "+ Create Custom Personality".

View Logic Button: Each card features a "View Logic" button next to "Deploy".

Anomaly Preview Modal: Clicking "View Logic" opens a modal detailing the specific triggers the template uses (e.g., for Consulting, it highlights "SOW vs. Service Start Date" mismatches).

5. Create Agent Modal: Streamlined Selection
The creation workflow is updated to prioritize clarity and pre-filled context.

Clean Layout: Replaced the cluttered dropdown () with the vertical Radio Card layout for monitoring templates.

Custom Option: Includes a "Custom" radio card to allow for bespoke monitoring parameters.

SPOC Pre-filling: When arriving from the Template Library, the Internal and Supplier SPOC emails are pre-populated based on the selected relationship.

🔍 The X-Ray Detail Modal (New Feature)
When X-Ray Mode is active in the Knowledge Graph (), clicking a node opens a specialized "Data X-Ray" Modal rather than a standard info card.

Truth Match Gauge: Displays the % Match between the supplier’s self-reported data and the AI Agent's findings.

Bi-Directional Flow:

Org → Supplier: Lists PII shared with them (e.g., Aadhar, Phone).

Supplier → Org: Lists PII ingested from them (e.g., Lead generation data).

Shadow PII Alerts: Highlighted in red, these are fields the Agent detected in data logs that the supplier did not declare in their assessment.