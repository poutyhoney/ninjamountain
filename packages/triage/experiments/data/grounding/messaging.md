# Grounding pack — Programmable Messaging (SMS/MMS)

Real Twilio Messaging specifics for synthetic ticket generation. Use naturally; do not list.

## Terms / SIDs
- Message SID: `SM…` (SMS), `MM…` (MMS). Messaging Service SID `MG…`. Phone number in E.164.
- Statuses: `queued` → `sending` → `sent` → `delivered`; failures end `undelivered` or `failed`.
- Delivery errors surface as `ErrorCode` in Messaging logs, the Message resource, and
  `StatusCallback` requests. `StatusCallback` webhook reports delivery events.

## Delivery error codes (carrier)
- **30004 Message blocked** — recipient blocked, opted out, landline, India DND/DLT, or
  carrier/compliance content filtering.
- **30005 Unknown destination handset** — number unknown / no longer exists.
- **30006 Landline or unreachable carrier**.
- **30007 Carrier violation** — flagged objectionable; carrier spam/content filtering.
- **30008 Unknown error** — generic carrier delivery failure (handset off, roaming).
- **30009 Missing segment** — a multi-part message segment not received.
- **21610** — attempt to message a recipient who opted out via `STOP`; they must opt back in
  with `START` / `UNSTOP`.

## Channels (WhatsApp / non-SMS)
- 63001 channel auth failed, 63003 invalid To, 63013 violates channel provider policy,
  63014 blocked by user action.

## Common real failure modes
- Outbound SMS sitting in `queued` for many minutes (delivery delay), API returned 200.
- Inbound webhook not firing (no POST to the configured Messaging Service URL).
- Messages silently filtered (30007) at scale; alphanumeric sender ID blocked in some countries.
