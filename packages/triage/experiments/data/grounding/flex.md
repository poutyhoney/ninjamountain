# Grounding pack — Flex

Real Twilio Flex specifics for synthetic ticket generation (DATASET_GENERATION.md §4).
Sourced from Twilio docs via the twilio-docs MCP. Use naturally; do not list verbatim.

## General / versions / SIDs
- Flex UI versions in the wild: `1.31`, `1.32`, `2.x` (e.g. `2.7.1`). Plugin Library requires 2.x.
- SID prefixes: Workspace `WS…`, Worker `WK…`, Reservation `WR…`, Activity `WA…`,
  TaskQueue `WQ…`, Workflow `WW…`, Task `WT…`, TaskChannel `TC…`, Configuration / Release SIDs.
- Browsers: agents typically on Chrome / Edge (e.g. Chrome 124, Edge 124).

## desktop (Agent Desktop / UI)
- Error codes: **45600 "Flex UI error"** (a JavaScript error thrown within Flex UI — init
  issue, bad config, or custom plugin code); **45601 "Custom Flex UI error"** (thrown by a
  customer's own plugin code).
- Mechanisms: the `FlexError` class (extends JS Error); the `flexError` event
  (`manager.events.addListener("flexError", …)`); the **Status Report** (formerly Debugger UI,
  since 1.32) for downloadable error reports; `Flex.Monitor.getErrors()` / `getLogs()`.
- **Degraded mode**: from UI 1.31, Flex initializes with limited capability if an SDK
  (TaskRouter, Conversations, Voice, Sync) is down — e.g. Voice incident but messaging tasks
  still work. Init failures show "Log in failed. Please contact your administrator…".
- Typical console errors: `Cannot read properties of undefined (reading 'channel')`.

## plugins
- Managed with the **Flex Plugins CLI**: `twilio flex:plugins:list:plugins`,
  `:list:releases`, `:describe:configuration --sid …`, `:release --configuration-sid …`,
  `:release --disable-plugin <name>`, `:diff`.
- Model: a **Plugin** has **Plugin Versions**; a **Configuration** bundles versions; a
  **Release** activates one Configuration (only one active per account). Rollback = release a
  prior `configuration_sid`.
- Common failure: a bad plugin version deployed in last night's Release breaks the desktop
  for all agents → rollback to a prior configuration_sid.

## actions (Actions & Notifications Framework)
- Actions invoked via `Flex.Actions.invokeAction("SomeAction", payload)`; a failed Action
  rejects with a `FlexError` (which can wrap a backend error).
- Common: a `beforeAcceptTask` / action override that throws, blocking task acceptance.

## taskrouter (TaskRouter in Flex)
- Worker events (TaskRouter.js): `ready`, `activity.update`, `attributes.update`,
  `reservation.created/accepted/rejected/timeout/canceled/rescinded`, `token.expired`.
- Activities: Available / Unavailable / Reserved / wrap-up; `worker.update({ActivitySid: "WA…"})`.
- Error **14218 "Dial→Queue: Could not update worker to provided activity"** — invalid or
  already-accepted `reservationSid` on a call bridge.
- **Tasks are auto-canceled after 10 rejections.** Reservation timeout re-evaluates the task
  (`task_re_evaluated_reason: reservation_timeout`).

## wrapup (WrapUp & Activities)
- Post-task wrap-up state and timers; `DequeuePostWorkActivitySid` sets the activity after a
  dequeue. Common: wrap-up timer not auto-advancing the worker to the next activity.

## conversations (Conversations in Flex)
- Messaging tasks backed by the Conversations SDK; transcripts; TaskChannel `chat`.
- Common: transcript not loading, or inbound message not creating a task.

## voice (Voice in Flex)
- Voice tasks via the Voice SDK; caller ID on outbound; warm/cold transfers
  (`transfer_mode: COLD`/`WARM`), conference. Common: wrong caller ID on outbound, transfer
  failures.

## sso (SSO / admin config)
- SAML 2.0 SSO with an IdP (e.g. Okta); configured in Flex SSO settings vs. OAuth in console.
- Roles/permissions: agent / supervisor / admin.

## insights (Insights / reporting)
- Flex Insights dashboards, historical reporting, data export; adherence/WFM reporting.

## billing (Flex seat billing)
- Billed by active users / named users (seats); charges for active-user hours.
