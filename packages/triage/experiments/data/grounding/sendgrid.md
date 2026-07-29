# Grounding pack — SendGrid email

Real Twilio SendGrid specifics for synthetic ticket generation. Use naturally; do not list.

## Terms / IDs
- `sg_message_id`, `sg_event_id`, message `category`. Event Webhook posts delivery events.
- Delivery events: `processed`, `delivered`, `deferred`, `bounce`, `blocked`, `dropped`,
  `spamreport`, `open`, `click`, `unsubscribe`.

## Concepts
- **Bounce classifications**: Invalid Address, Technical, Content, Reputation, Frequency/Volume,
  Mailbox Unavailable, Unclassified.
- **Deferred**: temporary rejection by the receiving server; SendGrid retries for **72 hours**,
  then moves the address to the **Block** suppression list.
- **Dropped** reasons: Invalid SMTPAPI header, Spam Content, Unsubscribed Address, Bounced
  Address, Spam Reporting Address, Invalid Address, recipient list over package quota.
- **Suppression lists**: bounces, blocks, spam reports, unsubscribes, invalid emails.
- **Sender authentication**: SPF, DKIM, DMARC, domain authentication; dedicated IP + **IP warmup**.

## Common real failure modes
- Emails bouncing/blocked due to reputation or missing domain authentication (SPF/DKIM/DMARC).
- High deferral rate during IP warmup; legit recipients on the suppression list.
- Event Webhook not delivering events to the customer's endpoint.
