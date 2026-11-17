# Email the Sensei

The Sensei has its own email inbox, powered by [AgentMail](https://www.agentmail.to).
A student emails a coding question. A script reads the inbox, asks Claude for a hint,
and replies in the same thread.

## How it works

1. `scripts/agentmail_setup.py` creates the inbox `ninja-sensei@agentmail.to`.
   It passes a `client_id`, so running it again returns the same inbox.
2. `scripts/agentmail_sensei.py` lists the inbox threads. For each thread it finds
   the newest message. If the Sensei sent it, the thread is already answered.
   If not, it sends the student's new text (`extracted_text`, no quoted history)
   to Claude and replies in the thread.
3. It adds a `replied` label so the state shows in the AgentMail console.

## Setup

From `apps/api`, with the venv active:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

Add both keys to `apps/api/.env` (gitignored):

```
AGENTMAIL_API_KEY=
ANTHROPIC_API_KEY=
```

## Run it

```bash
python scripts/agentmail_setup.py --to you@example.com
python scripts/agentmail_sensei.py
python scripts/agentmail_sensei.py --watch
```

`--watch` checks for new email every 15 seconds. Stop it with Ctrl+C.

## What I would build next

- Swap polling for a `message.received` webhook into the FastAPI app, and verify
  the webhook signature.
- Pass an `idempotency_key` on each reply so a retry can't send twice.
- Give each student their own inbox, keyed by `client_id`.
- Use a custom domain with DKIM, SPF, and DMARC set up.
