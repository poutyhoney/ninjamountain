---
id: kb-010
title: "Verify OTP: codes not received or rejected"
---

Twilio Verify creates a Verification through channels such as SMS, voice/call, email,
WhatsApp, Silent Network Auth, TOTP, Push/Silent Device Approval, and Passkeys depending on
the product configuration. A typical OTP Verification starts as `pending` and becomes
`approved` when the correct code is checked, or `canceled`/failed when the flow expires or is
stopped.

For "user never received the code," separate delivery/channel eligibility from user-entry
problems. Relevant documented send-side causes include **60205** when SMS is not supported by a
landline phone number, **60207** when a Service-level rate limit is reached, **60212** when
there are too many concurrent requests for the same phone number, **60203** when the maximum
send attempts for a Verification has been reached, disabled delivery channels, and invalid or
poorly validated recipient numbers. Check the Verify logs, Service configuration, selected
channel, rate limits, and recipient line type before assuming a carrier outage.

**60202 Max check attempts reached** is a check-side failure: the user or application submitted
too many incorrect code checks for the same Verification. That should be handled differently
from delivery because resending the same code does not fix the lockout condition. **60203 Max
send attempts reached** is the send-side abuse guard and means Verify blocked additional send
attempts for that Verification.

For **Silent Network Auth**, error codes in the **605xx** range should usually trigger fallback
to another channel, but **60540** is special: Twilio's SNA guidance says it indicates the carrier
identified the phone number as invalid, so SMS fallback is not recommended for that number.
**60534** is a downstream carrier error, not proof that the phone number is invalid. **60550
Auto Channel Failed** means `channel=auto` could not select a valid delivery path because
available channels failed validation; check the Console Debugger, enabled channels, SNA access
and configuration, SMS fallback availability, and whether the request included the fields
needed for automatic channel selection.
