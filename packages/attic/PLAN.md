# attic: design and build plan

A read-only command line tool that audits a Twilio account for legacy Flex
leftovers and hygiene problems. It prints a report grouped by severity. Each
finding comes with the commands a person can run to fix it. The tool never
changes or deletes anything.

Working name: `attic`. See Positioning.

## Status

- Done: Phase 0 (groundwork), Phase 1 (read-only client), Phase 2 (snapshot).
- Phase 3 in progress: R7, R10, and R3 are done. R4 is next to commit.
- Not started: Phase 4 (report), Phase 5 (live run and docs).

## Why this exists

Accounts that started on Flex 1.x and moved to Flex UI 2.x often keep the old
routing pieces around. A typical example is an account on Flex UI 2.18 that
still has:

- Proxy routing on phone numbers
- several legacy Flex Flows
- many old API keys
- leftovers from retired products
- a Studio Trigger whose Incoming Conversation output is not connected

Inbound SMS to Flex can break without any error being logged.

Every one of those problems is visible through read-only API calls. They are
hard to spot because they live in different products. This tool does that
cross-check, so a person with an old account gets a list in a minute instead
of an afternoon.

## 1. Packaging

Two options were compared.

| | Twilio CLI plugin (oclif) | TypeScript package |
|---|---|---|
| How a user runs it | `twilio plugins:install <name>`, then `twilio attic:audit` | `npx attic` (after publishing to npm), or `npm run scan --workspace packages/attic` in this repo |
| Auth | Reuses the active `twilio profiles` login | Reads env vars or a `.env` file |
| Moving parts | oclif commands, flags, plugin manifest, CLI core APIs, plus the rules | Plain Node and TypeScript, plus the rules |
| Testing | oclif test helpers, plugin loading quirks | Vitest |
| Reach | Feels native to Twilio CLI users | Works without the Twilio CLI installed |

**Decision: a TypeScript package at `packages/attic`.**

- The rules are the valuable part. Keep them free of any CLI framework so they
  stay pure functions that are easy to test.
- Node 22 already has `fetch`, `util.parseArgs`, and `process.loadEnvFile`.
  The tool ships with zero runtime dependencies.
- A Twilio CLI plugin can come later as a thin wrapper around the same rules.

The package is `"private": true` for now. Publishing is a later step.

The command is the `scan` script, not `audit`, because `npm audit` is a
built-in npm command.

### Architecture

Three stages. Only the first one touches the network.

```
collect  ->  snapshot.json  ->  rules  ->  findings  ->  report
(GET only)   (plain data)      (pure)     (typed)      (text or JSON)
```

```
packages/attic/
  package.json
  tsconfig.json
  vitest.config.ts
  .env.example
  README.md
  PLAN.md
  src/
    cli.ts            # parse flags, wire the stages together
    config.ts         # load credentials from .env or the environment
    client.ts         # tiny HTTP client: GET only, Basic auth, typed errors
    paginate.ts       # listAll() for both Twilio paging styles
    collect.ts        # calls each API, builds the Snapshot
    redact.ts         # consistent fake numbers and SIDs for sharing
    snapshot.ts       # Snapshot type: everything the rules can see
    findings.ts       # Finding, Severity, RuleResult, Rule types
    rules/
      index.ts        # list of all rules
      ngrok-twiml-apps.ts
      draft-studio-flows.ts
      address-flow-missing.ts
      conversation-trigger-missing.ts
      ...one file per rule
    report/
      text.ts         # human report grouped by severity
      json.ts         # machine report for CI or support tickets
  scripts/
    ping.ts           # smoke check: one API call
    probe.ts          # which endpoints the current key can read
    collect-summary.ts
  fixtures/
    healthy-2x/snapshot.json
    legacy-mess/snapshot.json
  test/
    helpers.ts        # loadFixture()
    rules/*.test.ts
    client.test.ts
    redact.test.ts
    fixtures.test.ts  # rejects real-looking SIDs and phone numbers
```

Key ideas:

- **Snapshot first.** `collect` writes everything to one JSON object. Rules read
  only that object. Every rule is testable with fixtures and no network.
- **`--from-snapshot <file>` replays offline.** A customer can save a redacted
  snapshot and send the file to support. Support runs the rules on it.
- **Read-only by construction.** The client has one method, `get()`. There is
  no code path that sends POST or DELETE. A unit test asserts this.
- **Missing permission is not a pass.** Each snapshot section is either
  `{ available: true, data }` or `{ available: false, reason }`. A rule that
  needs an unavailable section returns `skipped` with the reason. A rule that
  can do part of its job says what it could not check.

## 2. Auth

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_API_KEY_SID=SK...
TWILIO_API_KEY_SECRET=...
```

The account SID must be passed in. API keys cannot call
`GET /2010-04-01/Accounts.json` to discover it.

### Restricted key (default)

Probed with `npm run probe --workspace packages/attic`:

| Endpoint | Restricted key | Notes |
|---|---|---|
| Phone numbers | yes | `phone-numbers/active-numbers` list |
| TwiML Apps | yes | `voice/twiml.apps` list |
| Conversations Addresses | yes | `conversations-classic/configuration.addresses` list |
| Studio flows, list and fetch | yes | Fetching one flow is a separate permission from listing |
| Proxy services | yes | Not in Twilio's docs list, but it works |
| Flex Configuration | no | Error 8021. The Console offers no such permission |
| Flex Flows | no | Error 70051. Not part of Restricted keys at all |

Without the Flex Configuration, the tool can't tell Flex UI 1.x from 2.x. A
`--flex-ui 2` flag lets R1 run anyway. R2 needs a Standard key.

### Standard key (full audit)

Reads everything the MVP rules need. It can also write, which is why the
read-only promise lives in the code (GET only), not just in the key.

### Error handling

Restricted keys report a missing permission as **401**, not 403.

| Status and code | Meaning | What the collector does |
|---|---|---|
| 401, code 8021 | Valid key, missing one permission. The message names it | Section unavailable, message kept as the reason |
| 401, code 70051 | Endpoint not available to Restricted keys | Section unavailable |
| 403 or 404 | Product not enabled or not found | Section unavailable |
| 401, code 20003 | Wrong key SID or secret | Stop the run |

### API keys and subaccounts

Standard and Restricted keys can't read `/Accounts` or `/Keys` (error 70004).
So these checks are:

- An optional `--main-key` mode. If a Main key or the Auth Token is supplied,
  run the key and subaccount rules. The README warns that this credential can
  do anything, and suggests rotating the token after.
- Otherwise, print a manual Console checklist in the report: "Open Settings >
  API keys & tokens. Delete keys you don't recognize. Check for suspended
  subaccounts."

Never log, print, or store any secret. The snapshot stores the key SID only.

## 3. Rule catalog

Severity levels:

- **critical**: breaks or can silently break customer traffic now.
- **warning**: risk, cost, or error noise. Fix soon.
- **info**: hygiene. Safe to batch.

Shared inputs most rules use (collected once):

| Data | Call |
|---|---|
| Flex UI version | `GET https://flex-api.twilio.com/v1/Configuration` (`ui_version`) |
| Phone numbers | `GET /2010-04-01/Accounts/{AC}/IncomingPhoneNumbers.json` (`phone_number`, `sms_url`, `sms_application_sid`, `voice_url`) |
| Flex Flows (legacy Addresses) | `GET https://flex-api.twilio.com/v1/FlexFlows` (`contact_identity`, `channel_type`, `integration_type`, `integration.flow_sid`) |
| Conversations Addresses | `GET https://conversations.twilio.com/v1/Configuration/Addresses` (`address`, `type`, `auto_creation.type`, `auto_creation.studio_flow_sid`) |
| Studio flows | `GET https://studio.twilio.com/v2/Flows`, then `GET /v2/Flows/{FW}` for `definition` |
| TwiML Apps | `GET /2010-04-01/Accounts/{AC}/Applications.json` |
| Proxy services | `GET https://proxy.twilio.com/v1/Services`, then `/Services/{KS}/PhoneNumbers` |

"2.x account" means the major part of `ui_version` is 2 or higher. The value
can carry a range prefix, such as `~2.18.0`.

Pagination differs by API. The 2010 API returns `next_page_uri` (relative).
The v1 and v2 APIs return `meta.next_page_url` (absolute). `paginate.ts`
handles both.

### R1. SMS URL points at Proxy on a 2.x account (critical, MVP)

- **Needs:** Flex UI version (or `--flex-ui`), phone numbers, Proxy services
  and their phone numbers.
- **Decides:** account is 2.x, and a number's `sms_url` contains `/Proxy/KS`
  or the number sits in a Proxy pool. On 2.x, Flex messaging runs through
  Conversations Addresses. A Proxy SMS URL sends inbound texts down the 1.x
  path.
- **Remediation:** clear the SMS URL so the Conversations Address takes over.
  `twilio api:core:incoming-phone-numbers:update --sid PN... --sms-url ""`.
  Detaching a number from the Proxy pool does not change its URL.

### R2. Flex Flows on a 2.x account (critical or warning, MVP)

- **Needs:** Flex UI version, Flex Flows, Conversations Addresses. Flex Flows
  need a Standard key.
- **Decides:**
  - critical when a Flex Flow's `contact_identity` matches a Conversations
    Address `address` (same number, two routers).
  - warning for any other Flex Flow on a 2.x account.
- **Remediation:** list first, then remove.
  `twilio api:flex:v1:flex-flows:list`, then
  `twilio api:flex:v1:flex-flows:remove --sid FO...`. Link Twilio's
  "Migrate from Legacy Messaging" guide.

### R3. Address points at a Studio flow that is missing or unpublished (critical, MVP, done)

- **Needs:** Conversations Addresses, Studio flows. Skips if either is
  unavailable.
- **Decides:** for each Address with auto-creation enabled and type `studio`,
  look up `studio_flow_sid`. No flow set, missing from the flow list (deleted),
  or `status` of `draft` (unpublished) each produce a finding.
- **Remediation:** publish the flow in the Console, or update the Address to a
  published flow:
  `twilio api:conversations:v1:configuration:addresses:update --sid IG... --auto-creation.studio-flow-sid FW...`.

### R4. Address flow has no Incoming Conversation transition (critical, MVP)

The "Studio ran, no widgets, no task" bug.

- **Needs:** Conversations Addresses, Studio flow definitions.
- **Decides:** for each published flow used by an Address, find the state with
  `type == "trigger"`. Look for a transition with
  `event == "incomingConversationMessage"` and a `next`. If it's missing,
  flag it once per flow and list the Addresses that use it. If
  `incomingMessage` is wired but `incomingConversationMessage` isn't, say so:
  that's the 1.x wiring. If the definition couldn't be read, report info
  instead of staying silent. Missing and draft flows are left to R3.
- **Remediation:** Console step. Open the flow, connect the Trigger's
  **Incoming Conversation** output to Send to Flex, publish. No safe CLI
  one-liner, since it means editing the definition JSON.

### R5. Proxy pools with outside numbers or open Sessions (warning)

- **Needs:** Proxy services, `/Services/{KS}/PhoneNumbers`,
  `/Services/{KS}/Sessions`, phone numbers.
- **Decides:** a pool number not in IncomingPhoneNumbers (released or ported),
  or Sessions whose `status` is not `closed`. Open Sessions block removing the
  number (error 80611).
- **Remediation:** in order: remove Sessions, then pool numbers, then the
  service. `...:proxy:v1:services:sessions:remove`, then
  `...:proxy:v1:services:phone-numbers:remove`, then
  `...:proxy:v1:services:remove`. Order matters, and the report prints it that
  way.

### R6. Leftovers from retired products (warning)

Autopilot and Google Business Messages are retired. Programmable Chat for Flex
reached end of life on 2026-06-01.

- **Needs:** TwiML Apps, Conversations Services
  (`GET https://conversations.twilio.com/v1/Services`), Conversations
  Addresses, Flex Flows.
- **Decides:**
  - TwiML App or Conversations Service whose name or URLs mention
    `autopilot`.
  - Address or Flex Flow whose type or channel is GBM. Confirm the exact type
    string against a real response before trusting this check.
- **Remediation:** remove commands for each SID, plus a note to check nothing
  still references it.

### R7. TwiML Apps with ngrok URLs (warning, MVP, done)

- **Needs:** TwiML Apps.
- **Decides:** `voice_url`, `sms_url`, or `status_callback` matches an ngrok
  domain (`ngrok.io`, `ngrok.app`, `ngrok.dev`, and the `-free` variants).
  Tunnel URLs stop working when the machine running ngrok goes offline.
- **Remediation:** update the URL to a real host, or remove the app if unused.
- **Later:** add `voice_fallback_url` and `sms_fallback_url` to the snapshot,
  and run the same check on phone number URLs.

### R8. Workspace Event Callback URL returns errors (warning)

- **Needs:** `GET https://taskrouter.twilio.com/v1/Workspaces/{WS}`
  (`event_callback_url`), and Monitor Alerts
  (`GET https://monitor.twilio.com/v1/Alerts`, last 7 days, `error_code`
  11200).
- **Decides:** default mode uses alerts only. Flag when 11200 alerts have a
  `request_url` equal to the callback URL. Optional `--probe-urls` sends one
  GET to the URL and flags a 404. Probing is off by default because it calls a
  host the customer owns.
- **Remediation:** fix the endpoint, or clear it:
  `twilio api:taskrouter:v1:workspaces:update --sid WS... --event-callback-url ""`.

### R9. Functions services that back inactive plugins (info)

- **Needs:** Serverless Services (`GET https://serverless.twilio.com/v1/Services`),
  their Environments (`domain_name`), Flex Plugin Releases
  (`GET https://flex-api.twilio.com/v1/PluginService/Releases`), and the plugins
  in the newest release's configuration
  (`GET /v1/PluginService/Configurations/{FJ}/Plugins`).
- **Decides:** a service that looks like a plugin backend (name matches a
  plugin name, or its domain hosts plugin assets) but the plugin is not in the
  active release. This is a heuristic, so it stays at info and says "review".
- **Remediation:** `twilio api:serverless:v1:services:remove --sid ZS...`,
  only after confirming nothing calls it.

### R10. Studio flows that are drafts only (info, MVP, done)

- **Needs:** Studio flows. Reads Addresses, Flex Flows, and phone numbers for
  references, and still runs when some of them are unavailable.
- **Decides:** `status == "draft"` and not referenced by any number webhook,
  Address, or Flex Flow. A referenced draft is R3's finding, not R10's. When a
  reference section was unavailable, the finding says which one.
- **Remediation:** `twilio api:studio:v2:flows:remove --sid FW...`.

### R11. API keys and subaccounts (info, `--main-key` only)

- **Needs:** `GET /2010-04-01/Accounts/{AC}/Keys.json`,
  `GET /2010-04-01/Accounts.json`.
- **Decides:** key count, keys older than a year, suspended or closed
  subaccounts.
- **Without a Main key:** print the manual Console checklist from section 2.

### MVP (6 rules)

| # | Rule | Why it's in the MVP |
|---|---|---|
| R1 | SMS URL points at Proxy | Root cause of silent inbound SMS failure |
| R2 | Flex Flows on 2.x, overlap with Address | Same number, two routers |
| R3 | Address flow missing or unpublished | Silent break, cheap to check |
| R4 | No Incoming Conversation transition | Flow runs but never creates a task |
| R7 | TwiML Apps with ngrok URLs | Simple string rule, sets the pattern |
| R10 | Draft-only Studio flows | Uses data already collected for R3 and R4 |

R5, R6, R8, R9, and R11 come after the MVP.

## 4. Output

The types in `src/findings.ts`:

```ts
type Severity = "critical" | "warning" | "info";

interface Finding {
  ruleId: string;       // "R3"
  severity: Severity;
  title: string;        // one line
  resourceSid: string;  // the thing to fix
  detail: string;       // plain-language reason
  fix: string;          // command or Console step
}

type RuleResult =
  | { status: "ran"; findings: Finding[] }
  | { status: "skipped"; reason: string };
```

Text report (default), grouped by severity, critical first. Sample with fake
values:

```
Legacy Flex audit: AC...0000 (Flex UI 2.18)
2 critical, 1 warning, 1 info, 1 skipped

CRITICAL
  [R3] Address "Old WhatsApp sandbox" points at Studio flow FW...0098, which no longer exists
       Why: inbound messages start a Conversation, but no published flow runs,
            so no task reaches Flex.
       Fix: twilio api:conversations:v1:configuration:addresses:update --sid IG...0099 --auto-creation.studio-flow-sid FW...

SKIPPED
  [R2] Flex Flows: 401 code 70051. Run with a Standard key to include.

Nothing was changed. Review each command before you run it.
```

Flags:

- `--save-snapshot <file>` writes the snapshot. Done.
- `--redact` replaces phone numbers, the account SID, and the key SID with
  consistent fakes. Done.
- `--from-snapshot <file>` runs rules offline.
- `--flex-ui <major>` supplies the Flex UI version when the key can't read it.
- `--format json` for CI, scripts, or attaching to a support ticket.
- `--fail-on critical` exits non-zero when that level is found.

Rules about commands:

- The tool prints commands. It never runs them.
- Each fix starts with a list or fetch command where that helps, so the person
  sees the current state first.
- When order matters (Proxy cleanup), the steps are numbered.
- SIDs in the printed commands are the real ones from the account being
  audited. Sample output in docs and tests uses fake ones.

## 5. Testing

**Unit tests with fixtures. No live account in CI.**

- Vitest.
- Each scenario is one file: `fixtures/<scenario>/snapshot.json`.
- Every fixture uses fake data:
  - SIDs: two-letter prefix, 28 zeros, then a 4-character counter, such as
    `FW00000000000000000000000000000001`. Planted leftovers use `0099`,
    `0098`, and so on.
  - Phone numbers: the `555-0100` to `555-0199` fiction range, such as
    `+12025550100`.
  - Hosts: `example-0000.twil.io` or `example.com`.
- `test/fixtures.test.ts` scans every fixture and fails if it finds a SID or
  phone number outside those formats. It reports counts only, so a failure
  never prints real values.
- Scenarios:
  - `healthy-2x`: clean 2.x account. Every MVP rule returns nothing.
  - `legacy-mess`: the healthy account plus one planted problem per MVP rule.
    Every MVP rule fires once.
  - `flex-1x`: UI 1.x. R1 and R2 must stay quiet, since Proxy and Flex Flows are
    correct there.
  - `restricted-key`: Flex Configuration and Flex Flows unavailable. R2 reports
    skipped. R1 reports skipped unless `--flex-ui` is given.
- Each rule gets at least one "fires" test, one "stays quiet" test, and one
  "skips when unavailable" test.
- `client.test.ts` checks pagination for both styles, the typed error, and that
  the client has no method other than `get`.

**One manual run against a real account** after the MVP passes its tests. To
prove the rules work live, make one safe, reversible change (for example, point
a TwiML App at a fake ngrok URL), run the audit, see R7 fire, and undo it.
Never commit a live report or an unredacted snapshot. Save them outside the
repo.

## 6. Positioning

**Open source. Customers run it themselves.** The tool runs on their machine,
with their key. Nothing is sent anywhere except Twilio's own API (and the
optional `--probe-urls` request to their own callback URL).

**Name.** No Twilio branding in the package or command name. That also means no
"Flex", since that is a Twilio product name. The README can say "works with
Twilio accounts" and must include "Not affiliated with or endorsed by Twilio."

npm availability (checked 2026-11-24):

- `attic`: taken
- `routecheck`: taken
- `leftover-audit`: free

The internal name stays `@ninjamountain/attic`. Pick the public name at
publish time.

**License.** MIT, so customers and support teams can use it freely.

### Existing tooling (checked 2026-11-24)

| Tool | What it does | Overlap |
|---|---|---|
| [Flex System checkup](https://www.twilio.com/docs/flex/admin-guide/setup/system-checkup) (Console, Flex > Tools and resources) | Checks common Flex config items against a standard setup, offers a Fix button | Checks that the Conversations service is registered for Flex. Does not cross-check numbers, Proxy, Flex Flows, and Studio triggers |
| [Migrate from Legacy Messaging](https://www.twilio.com/docs/flex/admin-guide/setup/conversations/migrate-from-legacy-messaging) | Manual guide, one Address at a time | Says "make sure the Incoming Conversation trigger is mapped." This tool checks that automatically (R4) |
| [Migrate from Programmable Chat to Flex Conversations](https://www.twilio.com/docs/flex/developer/conversations/programmable-chat-to-flex-conversations) | Manual guide, step 1 is "map your addresses, flows, and numbers" | This tool produces that map |
| [brianschmitt/plugin-audit](https://github.com/brianschmitt/plugin-audit) | Community Twilio CLI plugin. Broad account health report (keys, Studio, TaskRouter, Proxy, 38 flags) | General hygiene, not legacy Flex cross-references. No license file, so don't copy code from it. Link it as a complement |

No Twilio-published tool was found that audits for legacy Flex leftovers
across products. Re-check before publishing.

## 7. Build steps

One PR per phase. Run every install from the repo root on Node 22.

Stacked branches: this repo does not delete head branches on merge, so GitHub
does not retarget a stacked PR when its base merges. Open each phase's PR
against `main` after the previous one merges, and rebase onto `origin/main`
first.

### Phase 0: groundwork (done)

1. Branch `feat/attic-scaffold`.
2. Check package names on npm.
3. `packages/attic/package.json`: private, `"type": "module"`, scripts
   `scan`, `test`, `typecheck`.
4. `tsconfig.json`, `vitest.config.ts`, one smoke test.
5. Root scripts `test:attic` and `typecheck:attic`.

### Phase 1: read-only client (done)

6. Restricted API key with read permissions. Credentials in
   `packages/attic/.env` (git-ignored), names in `.env.example`.
7. `src/config.ts` and `src/client.ts`: `get(url)` with Basic auth and a
   `TwilioApiError` that keeps Twilio's error code. `scripts/ping.ts` checks it.
8. `src/paginate.ts` for both paging styles. `test/client.test.ts` with a fake
   `fetch`.
9. `scripts/probe.ts` checks each endpoint with the Restricted key. Results are
   in section 2 and the README.

### Phase 2: snapshot (done)

10. `src/snapshot.ts` and `src/findings.ts` (types only).
11. `src/collect.ts` for the MVP data. 8021, 70051, 403, and 404 mark a section
    unavailable. 20003 stops the run.
12. `src/redact.ts`, plus `--save-snapshot` and `--redact` in `src/cli.ts`.
13. `healthy-2x` fixture from a redacted snapshot, hand-edited to fake SIDs and
    hosts. `test/fixtures.test.ts` guards it.

### Phase 3: MVP rules (in progress)

For each rule: plant its problem in `legacy-mess`, write the rule, then write
the tests.

14. R7 ngrok TwiML Apps. Done.
15. R10 draft-only Studio flows. Done.
16. R3 Address flow missing or unpublished. Done.
17. R4 no Incoming Conversation transition. Reads the definition JSON.
18. R2 Flex Flows on 2.x and Address overlap. Adds a helper that turns
    `ui_version` into a major version number.
19. R1 SMS URL points at Proxy.
20. `flex-1x` and `restricted-key` fixtures. Check R1 and R2 stay quiet on 1.x,
    and skipped shows up correctly.

Check after each: `npm run test:attic` and `npm run typecheck:attic`.

### Phase 4: report

21. `src/report/text.ts`, and wire the rules into `src/cli.ts` with
    `--from-snapshot`. Check against `legacy-mess` and the sample in section 4.
22. `src/report/json.ts`, `--format json`, and `--fail-on`. Check: `echo $?` is
    1 when a critical finding exists.
23. `--flex-ui`, the "Nothing was changed" footer, and the manual key checklist.

### Phase 5: live run and docs

24. Manual run against a real account. Do the safe ngrok test from section 5,
    then undo it.
25. Expand `README.md`: what it finds, install, auth, sample output (fake
    values), "not affiliated" line, links to existing tooling.
26. Add explanatory comments to the source files.

### After the MVP

27. R5 Proxy pools and Sessions, R6 retired products, R8 event callback, R9
    plugin backends, R11 `--main-key`.
28. Decide on publishing: npm from the monorepo, or a separate public repo with
    an MIT license.
29. Optional: a thin Twilio CLI plugin wrapper that calls the same rules.

## Open questions

- The exact `type` string for GBM Addresses and Flex Flow channels (R6).
- Whether the newest Plugin Release is always the active one, or whether there
  is an "active" lookup in the Plugins API (R9).
- Whether a Proxy-routed number always has `/Proxy/KS` in its `sms_url`, or
  only sometimes. R1 also checks pool membership, so it works either way.
- Whether the Proxy `/Services/{KS}/PhoneNumbers` call works with a Restricted
  key. The probe only covered the services list.

Answered: which endpoints a Restricted key can read (section 2).
