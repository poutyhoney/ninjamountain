# attic

Read-only auditor for legacy leftovers in a Twilio Flex account. Work in progress.

The client can only send GET requests. Nothing in this package can create, change, or delete anything in your account.

## Setup

```bash
cp packages/attic/.env.example packages/attic/.env
```

Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, and `TWILIO_API_KEY_SECRET`. The account SID is needed because API keys can't look it up.

## Which API key to use

**Restricted key (recommended first run).** Give it the **list** permission for these:

- Phone Numbers: `active-numbers`
- Voice: `twiml.apps`
- Conversations Classic: `configuration.addresses`
- Studio: `flows` (list and read)
- Proxy: `services`

**Standard key (full audit).** Reads everything the rules need. It can also write, but this tool never does.

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

Without the Flex Configuration, the tool can't tell a Flex UI 1.x account from 2.x. Pass `--flex-ui 2` to run the rules that depend on it. Flex Flow checks need a Standard key.

## Error codes

- `401` with code `8021`: the key is valid but lacks one permission. The message names it.
- `401` with code `70051`: the endpoint isn't available to Restricted keys.
- `401` with code `20003`: the key SID or secret is wrong.
