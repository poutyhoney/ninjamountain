# Grounding pack — Studio

Real Twilio Studio specifics for synthetic ticket generation. Use naturally; do not list.

## Terms / SIDs
- Studio Flow SID `FW…`, Execution `FN…`. Triggers: Incoming Message, Incoming Call, REST API.
- Widgets: Send Message, Send & Wait for Reply, Gather Input on Call, Make HTTP Request,
  Run Function, Split Based On, Set Variables, Connect Call To. Revision History per Flow.
- Debugging: Flow **Logs** / Execution log, **Debugging Information** and **Flow Data** panels.

## Error codes / limits
- **84002 Workflow execution failed** — a widget failed mid-Execution. Common causes: a
  **Run Function** returning 4xx/5xx, taking >10s, or a body >64 KB; a **Make HTTP Request**
  endpoint failing, timing out (>10s), or returning >64 KB.
- **81026 Flow exceeds maximum allowed widgets** — cumulative widgets (incl. Subflows) over 2,000.
- Hard limits: Run Function / Make HTTP Request **10-second timeout** and **64 KB** response cap.

## Common real failure modes
- Execution failing at a Make HTTP Request widget (downstream timeout) with no failure-transition.
- Run Function widget exceeding the 10s limit under load.
- A recent Flow revision introducing a failure; revert via Revision History.
