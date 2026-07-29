# Grounding pack — Verify

Real Twilio Verify specifics for synthetic ticket generation. Use naturally; do not list.

## Terms / SIDs
- Verify Service SID `VA…`. Channels: SMS, voice (call), email, WhatsApp, Silent Network
  Auth (SNA), TOTP/Authenticator, Push.
- Flow: start a Verification (send OTP) → check the code. Status `pending` → `approved`/`canceled`.

## Error codes
- **60200 Invalid parameter**.
- **60202 Max check attempts reached** — too many wrong code submissions.
- **60203 Max send attempts reached**.
- **60205 SMS not supported by landline phone number**.
- **60207 Max rate limits per service reached**; **60212 Too many concurrent requests for phone number**.
- **60534 SNA Downstream Carrier Error**; **60540 SNA Carrier Identified Invalid Phone Number**.
- **60550 Auto Channel Failed** — no channels selected due to validation errors.
- **60605 Verification delivery attempt blocked**.

## Common real failure modes
- OTP "sent" but never received (carrier filtering, landline, rate limit, roaming).
- Users hitting **60202** (max check attempts) after mistyping.
- SNA failing on a number the carrier flags invalid; fall back to SMS/email.
