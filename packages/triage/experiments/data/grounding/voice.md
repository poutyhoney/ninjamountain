# Grounding pack — Programmable Voice / TwiML

Real Twilio Voice specifics for synthetic ticket generation. Use naturally; do not list.

## Terms / SIDs
- Call SID `CA…`, Recording `RE…`, Conference `CF…`. Numbers in E.164.
- TwiML verbs: `<Dial>`, `<Gather>` (`numDigits`, `finishOnKey`, `action`), `<Say>`,
  `<Conference>`, `<Record>`, `<Sip>`.
- `<Dial>` cannot initiate a call — it only adds a party to an active call. Outbound calls
  start with an API request to the Calls resource (needs `to`, `from`, and `url`/`twiml`/`applicationSid`).

## Error codes
- **11200 HTTP retrieval failure** — Twilio's request to your webhook/TwiML URL got a non-2xx,
  a timeout, a redirect to an unreachable host, wrong `Content-Type`, or `POST` not allowed.
- **21200 Calls resource** — missing `to`/`from`, no `url`/`twiml`/`applicationSid`, invalid
  caller ID, or non-absolute callback URL.
- **13247 Dial: Invalid From number (caller ID)**, **13248 Dial: Invalid callerID, too long**.
- **13239/13240 Dial→Conference** invalid trim / whisper SID.
- **13243 Dial→SIP Invalid SIP URI**, 13254 SIP URI DNS does not resolve.
- **13310 / 13311 Gather: Invalid finishOnKey value**.

## Common real failure modes
- `<Gather>` not capturing DTMF (truncated/empty digits), worse on certain carriers.
- Conference recording not starting; transcription callback not received.
- Webhook returning 11200 intermittently (WAF/firewall, timeout).
- Wrong caller ID on outbound calls.
