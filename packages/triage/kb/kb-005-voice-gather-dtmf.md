---
id: kb-005
title: "<Gather> not capturing DTMF input correctly"
---

`<Gather>` is the TwiML verb that collects DTMF digits, speech, or both during an active call.
The attributes most often relevant to DTMF tickets are `action`, `method`, `numDigits`,
`finishOnKey`, `timeout`, and `actionOnEmptyResult`. When `<Gather>` receives digits, Twilio
sends them to the `action` URL in the `Digits` parameter; if `action` is omitted, Twilio uses
the current document URL, which can create unwanted looping behavior.

Common "DTMF not working" symptoms include empty `Digits`, truncated digits, digits submitted
earlier than the customer expected, or behavior that varies by caller device or network. Check
whether `numDigits` is causing Twilio to submit immediately after the expected count, whether
`finishOnKey` is set to a key that can appear in the caller's PIN or menu path, and whether the
application expects the finish key to be included even though Twilio does not include it in
`Digits`. If the caller enters nothing and `actionOnEmptyResult` is not `true`, the call
continues with the next TwiML instruction instead of necessarily calling the `action` URL.

Public docs also call out two practical troubleshooting cases: some VoIP phones or compressed
audio paths can interfere with DTMF tone transmission, and if the `action` URL responds with an
HTTP redirect, Twilio follows the redirect but does not resend the `Digits` parameter. For
Studio-backed call flows, verify the active Flow revision and the exact widget/TwiML that ran
before assuming the customer is testing the latest draft.

This is distinct from **11200 HTTP retrieval failure**. A `<Gather>` capture problem means the
call reached the TwiML and executed the verb; 11200 means Twilio could not retrieve or parse a
successful response from a configured webhook URL.
