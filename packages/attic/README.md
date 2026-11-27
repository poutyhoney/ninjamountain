# attic

Read-only auditor for legacy leftovers in a Twilio account that runs Flex.

Older Flex setups leave configuration behind: Proxy SMS URLs, Flex Flows, Studio
flows wired only for Flex UI 1.x. On a Flex UI 2.x account these break messaging
without an error. Texts arrive, but no task reaches an agent. This tool reads
the account, cross-checks numbers, Addresses, Studio flows, and Proxy, and
prints a report with the command to fix each problem.

It never changes anything. The client can only send GET requests, and the
report prints fix commands without running them.

Works with Twilio accounts. Not affiliated with or endorsed by Twilio.

## What it finds

| Rule | Severity | Finds                                                                                   |
| ---- | -------- | --------------------------------------------------------------------------------------- |
| R1   | critical | A number's SMS URL points at Proxy on a 2.x account, so inbound texts take the 1.x path |
| R1   | warning  | A number still sits in a Proxy pool after its SMS URL was cleared                       |
| R2   | critical | A Flex Flow and a Conversations Address both route the same sender                      |
| R2   | warning  | Any other Flex Flow left on a 2.x account                                               |
| R3   | critical | An Address points at a Studio flow that was deleted, never set, or is still a draft     |
| R4   | critical | A published flow used by an Address has no Incoming Conversation transition             |
| R7   | warning  | A TwiML App points at an ngrok tunnel                                                   |
| R10  | info     | A draft-only Studio flow that nothing points at                                         |

R1 and R2 stay quiet on Flex UI 1.x accounts, where Proxy and Flex Flows are the
correct setup.

## Quick start

Use Node 22 and install from the repo root:

```bash
nvm use
node -v
npm install
```

Add credentials:

```bash
cp packages/attic/.env.example packages/attic/.env
```

Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, and `TWILIO_API_KEY_SECRET`.
The account SID is needed because API keys can't look it up. `.env` is
gitignored. Never commit it.

Run a scan:

```bash
npm run --silent scan --workspace packages/attic
```

`--silent` keeps npm's own banner out of the output, which matters when you pipe
JSON.

## Flags

| Flag                     | What it does                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `--flex-ui <major>`      | Supplies the Flex UI major version when the key can't read it. Use `--flex-ui 2` with a Restricted key |
| `--format json`          | Prints the report as JSON for scripts, CI, or a support ticket                                         |
| `--fail-on <level>`      | Exits 1 if any finding is at `critical`, `warning`, or `info` or above                                 |
| `--save-snapshot <file>` | Writes everything collected to a JSON file                                                             |
| `--redact`               | Replaces phone numbers, the account SID, and the key SID with consistent fakes                         |
| `--from-snapshot <file>` | Runs the rules on a saved snapshot. No credentials needed                                              |

## Sample output

Fake values. A Restricted key run with one Proxy number and one ngrok app:

```text
Legacy Flex audit: AC...0000 (Flex UI 2)
1 critical, 1 warning, 0 info, 1 skipped

CRITICAL
  [R1] +12025550196 sends inbound SMS to Proxy
       Why: Its SMS URL is https://webhooks.twilio.com/v1/Accounts/AC00000000000000000000000000000000/Proxy/KS00000000000000000000000000000099/Webhooks/Message. On Flex UI 2.x, messaging runs through Conversations Addresses, so texts to this number take the 1.x path instead.
       Fix: Clear the SMS URL so the Conversations Address takes over: twilio api:core:incoming-phone-numbers:update --sid PN00000000000000000000000000000098 --sms-url ""

WARNING
  [R7] TwiML App "Voice JS Quickstart" points at an ngrok tunnel
       Why: Tunnel URLs stop working when the laptop running ngrok closes: https://a1b2c3d4.ngrok.io/voice
       Fix: Point the URLs at a real host, or remove the app if nothing uses it: twilio api:core:applications:remove --sid AP00000000000000000000000000000099

SKIPPED
  [R2] Flex Flows on a Flex UI 2.x account: 401 code 70051: Authorization Error: no requested permission

MANUAL CHECKS
  - API keys: this tool can't list them (error 70004). In the Console, open API keys & tokens and delete keys you don't recognize.
  - Subaccounts: this tool can't list them either. In the Console, look for suspended or closed subaccounts you no longer need.

Nothing was changed. Review each command before you run it.
```

The SIDs in a real report are the real ones from your account, so the commands
can be copied as they are. Read each one before you run it.

## Exit codes

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| 0    | Finished. Nothing at or above the `--fail-on` level              |
| 1    | `--fail-on` matched at least one finding                         |
| 2    | Bad input: an unknown flag value or a file that isn't a snapshot |

In CI:

```bash
npm run --silent scan --workspace packages/attic -- --flex-ui 2 --fail-on critical
```

## Snapshots

Save what was collected, with phone numbers and account IDs replaced:

```bash
npm run --silent scan --workspace packages/attic -- --save-snapshot ~/attic-snapshots/account.json --redact
```

Run the rules on it later, offline:

```bash
npm run --silent scan --workspace packages/attic -- --from-snapshot ~/attic-snapshots/account.json
```

Paths are relative to the folder you ran `npm run` from. Keep snapshots outside
the repo. Without `--redact` the file holds real numbers and SIDs, and the tool
says so when it saves one.

## Which API key to use

**Restricted key (recommended first run).** Give it the **list** permission for these:

- Phone Numbers: `active-numbers`
- Voice: `twiml.apps`
- Conversations Classic: `configuration.addresses`
- Studio: `flows` (list and read)
- Proxy: `services`

**Standard key (full audit).** Reads everything the rules need, including the
Flex Configuration and Flex Flows. It can also write, but this tool never does.

## What a Restricted key can read

Checked on 2026-11-24 with `npm run probe --workspace packages/attic`.

| Endpoint                     | Restricted key | Notes                                             |
| ---------------------------- | -------------- | ------------------------------------------------- |
| Phone numbers                | yes            |                                                   |
| TwiML Apps                   | yes            |                                                   |
| Conversations Addresses      | yes            |                                                   |
| Studio flows, list and fetch | yes            | Fetching one flow is a separate permission        |
| Proxy services               | yes            | Not in Twilio's docs list, but it works           |
| Flex Configuration           | no             | Error 8021. The Console offers no such permission |
| Flex Flows                   | no             | Error 70051. Not part of Restricted keys at all   |

Without the Flex Configuration, the tool can't tell a Flex UI 1.x account from
2.x. Pass `--flex-ui 2` to run the rules that depend on it. R2 needs a Standard
key, and the report lists it under SKIPPED otherwise.

## Error codes

- `401` with code `8021`: the key is valid but lacks one permission. The message names it.
- `401` with code `70051`: the endpoint isn't available to Restricted keys.
- `401` with code `20003`: the key SID or secret is wrong. The scan stops.

A missing permission doesn't stop the scan. That section is marked unavailable,
and any rule that needs it is reported as skipped with the reason.

## Development

```bash
npm run test:attic
npm run typecheck:attic
```

Tests run against fixtures in `fixtures/`, never a live account:

- `healthy-2x`: a clean 2.x account. Every rule is quiet.
- `legacy-mess`: the healthy account plus planted problems for every rule.
- `flex-1x`: the mess on Flex UI 1.x. R1 and R2 stay quiet.
- `restricted-key`: the mess without Flex Configuration or Flex Flows. R1 and R2 skip.

Fixtures hold fake data only. A guard test fails on any SID outside the
`XX` + 28 zeros + 4 characters format, any phone number outside 555-0100 to
555-0199, and any duplicate SID within a section. To turn a redacted snapshot
into fixture data:

```bash
npm run fake-sids --workspace packages/attic -- <input.json> <output.json>
```

## Related tools

- [Flex System checkup](https://www.twilio.com/docs/flex/admin-guide/setup/system-checkup):
  in the Console under Flex > Tools and resources. Checks Flex config against a
  standard setup. It doesn't cross-check numbers, Proxy, Flex Flows, and Studio
  triggers.
- [Migrate from Legacy Messaging](https://www.twilio.com/docs/flex/admin-guide/setup/conversations/migrate-from-legacy-messaging):
  the manual guide. R4 automates its Incoming Conversation check.
- [Migrate from Programmable Chat to Flex Conversations](https://www.twilio.com/docs/flex/developer/conversations/programmable-chat-to-flex-conversations):
  step 1 asks you to map addresses, flows, and numbers. This tool's report is
  that map.
- [brianschmitt/plugin-audit](https://github.com/brianschmitt/plugin-audit):
  a community Twilio CLI plugin for general account health.
