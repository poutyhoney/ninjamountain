---
id: kb-004
title: "SMS/MMS delivery failures and carrier error codes"
---

Outbound Message resources move through statuses after creation. Without a Messaging Service,
the initial status is usually `queued`; with a Messaging Service, an immediate message may
start as `accepted` before moving to `queued`, and scheduled messages start as `scheduled`.
After queuing, successful sends move through `sent` and then `delivered`; failures typically
end as `failed` or `undelivered`. The Message resource, Messaging logs, and `StatusCallback`
webhooks can include an `ErrorCode` when the final status is `failed` or `undelivered`.

Common delivery-related codes to know: **30003 Unreachable destination handset** (the handset
is off or unavailable), **30004 Message blocked** (the destination is blocked from receiving
the message, such as blocklisting), **30005 Unknown destination handset** (the destination
number is unknown or may no longer exist), **30006 Landline or unreachable carrier**,
**30007 Message filtered / carrier violation** (carrier content, spam, or objectionable-content
filtering), **30008 Unknown error** (generic delivery failure), and **30009 Missing inbound
segment** for multipart inbound message assembly. **21610** is separate from carrier delivery:
the recipient has opted out by sending `STOP` or another opt-out keyword and must opt back in
with `START` or another supported opt-in keyword before Twilio can send to them again.

A message sitting in `queued`, `accepted`, or `sending` after a 2xx API response is not the
same as an API authentication or validation failure: Twilio accepted or created the Message
resource, and the next step is to inspect the message status, sender configuration, throughput,
logs, callbacks, and any downstream carrier result. This is also distinct from an **inbound
webhook not firing**. For inbound webhook issues, confirm that Twilio received an inbound
message in the logs, then check the phone number or Messaging Service inbound webhook URL,
method, and recent response codes.
