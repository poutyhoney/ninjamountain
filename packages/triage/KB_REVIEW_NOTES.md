# KB Article Review Notes

Day 7 of the 14-day plan called for the knowledge base to reflect real support expertise, not
just plausible-sounding drafts. I (Claude) wrote the first pass of all 15 articles in
`kb/`, grounded in the existing Twilio grounding packs
(`packages/triage/experiments/data/grounding/*.md`). Tom then reviewed every article against
Twilio's public documentation and revised each one — correcting claims that weren't actually
documented, adding coverage the first draft missed, and toning down unsupported "most common"
framing into defensible triage guidance. This doc preserves *why* each change was made, since
the reasoning is worth more than the diff.

## kb-001 — Auth errors (20003 / 20403)

- **20003:** Kept the original list but aligned it more closely with the public error page,
  including OAuth tokens and product-specific prerequisites.
- **Credential rotation:** Changed "single most common" to "very high-signal operational
  question" — useful triage advice without an unsupported statistical claim.
- **20403:** Clarified it's about account/resource permission; kept the documented Restricted
  API key and Auth Token propagation cases.
- **Checklist:** Added account status, key type, Region, and proxy/header checks so the article
  is complete enough for first-response triage.

## kb-002 — Unrecognized charges

- **Charge categories:** Kept the useful examples but generalized them to match the public
  billing/Usage docs, since not every account has the same line items.
- **Carrier fees:** Added the documented nuance that Messaging `price` can include carrier fees
  and may not populate immediately.
- **Unexpected volume:** Replaced "two realistic explanations" with a fuller triage branch
  (recurring/pass-through fees, application loops, compromise).
- **Auto-recharge:** Tied the complaint to the documented behavior that a zero balance can
  suspend Twilio usage.

## kb-003 — Account suspended

- **Error behavior:** Replaced "every request returns 20003 or 20403" with the broader,
  documented set of account-inactive and product-specific errors (10001, 30002, etc.).
- **Causes:** Added documented billing, parent-account, subaccount, fraud, abuse, and policy
  causes instead of only a billing/compliance shorthand.
- **Severity:** Kept high-severity guidance but tied it to production impact rather than an
  absolute statement about every account state.
- **Closed accounts:** Preserved the distinction that closure ≠ suspension.

## kb-004 — SMS/MMS delivery failures

- **Status lifecycle:** Added `accepted` and `scheduled`, since Messaging Services change the
  initial status path.
- **Error codes:** Corrected the 30004 explanation so STOP handling and landline handling
  aren't folded into "Message blocked."
- **21610:** Kept as a separate opt-out failure mode with the documented START/opt-in path.
- **Queued messages:** Reframed long queueing as a status/log investigation, not automatically
  a carrier-only delay.

## kb-005 — `<Gather>` / DTMF

- **Gather behavior:** Added `actionOnEmptyResult`, redirect behavior, and the fact that
  `finishOnKey` is not included in `Digits`.
- **DTMF reliability:** Reframed "carrier-level tone degradation" as device/network/VoIP-path
  troubleshooting — easier to support from public docs.
- **Studio:** Kept the active-revision check as useful triage context.
- **11200 distinction:** Preserved the separation between TwiML retrieval and digit capture.

## kb-006 — Webhook/TwiML errors (11200 / 21200)

- **11200:** Removed the implication that the customer's server definitely answered
  incorrectly — docs also cover network failures and unparsable responses.
- **21200:** Expanded the call-creation checklist to match the public Calls Resource error
  page.
- **Content-Type:** Avoided naming the wrong content type as a primary 11200 cause, since
  Twilio may raise narrower parsing/TwiML errors instead.
- **`<Dial>`:** Kept the distinction that `<Dial>` only works inside an already-active call.

## kb-007 — Flex UI crashes / plugin errors

- **45600/45601:** Kept the error split but removed the unsupported claim that custom plugin
  errors are "far more common."
- **Status Report:** Matched the public Flex troubleshooting docs.
- **Plugin releases:** Clarified deploy vs. release and rollback using the documented
  Configuration/Release model.
- **Crash signature:** Replaced the single `channel` example with a broader plugin
  stack-trace workflow so the article doesn't overfit one anecdotal failure.

## kb-008 — TaskRouter activities / wrap-up

- **Activities:** Added the availability model so support can reason about *why* a Worker is
  or isn't eligible for Tasks.
- **Reservations:** Clarified timeout behavior and terminal Task conditions instead of saying
  a timeout makes the task disappear.
- **Dequeue post-work:** Kept `DequeuePostWorkActivitySid` but framed it as one thing to check,
  not the only possible cause.
- **Rejection limit — real correction:** original draft said tasks auto-cancel after **10**
  rejections; current TaskRouter docs say **1,000**, and explicitly flag the "10" figure as
  outdated. Worth remembering this was wrong in the first draft, not a stylistic edit.

## kb-009 — Flex SSO setup

- **Enhanced vs. legacy SSO:** Added the current public-doc distinction and the **March 31,
  2026** legacy-migration deadline — time-sensitive, matters for triage right now.
- **Flex vs. Console SSO:** Kept the original warning but made it more precise.
- **Roles:** Added the required IdP attributes and role mapping so auth vs. authorization
  problems are separated cleanly.
- **Cert/setup triage:** Expanded beyond "SAML mismatch" to include ACS URL, issuer, trusted
  domains, redirects, and IdP assignment.

## kb-010 — Verify OTP issues

- **Channels/statuses:** Added current Verify channel coverage and Verification status
  language.
- **602xx errors:** Corrected 60212 to "concurrent requests for a phone number" and separated
  send attempts from check attempts.
- **SNA — real correction:** 60534 is a downstream carrier error (not proof the number is
  invalid); 60540 specifically *is* the invalid-number case, where SMS fallback is **not**
  recommended. The first draft treated both the same way.
- **Auto channel:** Expanded 60550 beyond "bad validation upstream" to include channel access,
  service configuration, and fallback availability.

## kb-011 — Lookup errors

- **Data packages:** Expanded the package list to reflect Lookup v2 rather than only the older
  carrier/CNAM mental model.
- **Package access — real correction:** 60606/60699 reframed as an account-support/
  reactivation path, not a silent empty result.
- **Coverage:** Kept the coverage/Canada cases but clarified what each code actually means.
- **Batch triage:** Added package-level errors and request fields so support can separate
  coverage, access, rate, quota, and data-source issues.

## kb-012 — 10DLC registration rejected

- **Registration chain:** Kept the Customer Profile → Brand → Campaign model, added the Trust
  Hub/TCR distinction from the docs.
- **Error codes:** Preserved the listed codes but tightened each cause/fix to match the public
  error pages.
- **Resubmission:** Replaced "definitely not deleting" with "fix and resubmit by default" —
  Twilio documents cases where delete/recreate is still appropriate.
- **Completeness:** Added common public-doc rejection categories (description, opt-in,
  opt-out/help, sample messages, brand/website consistency).

## kb-013 — Studio Flow execution failures

- **84002:** Kept the widget-centered troubleshooting flow, aligned it with Studio logs,
  Debugging Information, and Flow Data.
- **Run Function / HTTP Request:** Added the documented status/timeout/response-size/
  custom-header constraints.
- **Revision history:** Preserved the rollback guidance, tied to Studio's documented tools.
- **81026 — real correction:** original draft called this a "publish-time error." Twilio
  documents it as an *execution* failure that persists until the cumulative widget count is at
  or below 2,000 — not just a warning at publish time.

## kb-014 — SendGrid bounces/deferrals/drops

- **Event Webhook:** Essentially unchanged — matched documentation well already.
- **Bounce categories:** Kept the categories; changed "usually point back" to "commonly
  indicate" — an easier claim to defend.
- **Deferred:** Kept the documented 72-hour retry window but avoided stating every deferred
  message automatically enters the Block suppression list.
- **Dropped:** Added "X-SMTPAPI" alongside "SMTPAPI," since both terms appear in SendGrid docs.
- **Authentication:** Softened "the single most common root cause" to "verify first" /
  "can contribute" — strong troubleshooting guidance without an unsupported claim.

## kb-015 — Flex degraded mode, caller ID, plugin OAuth

- **Degraded mode:** Clarified Flex "can" initialize in degraded mode rather than implying it
  always does; removed the implication that a login failure is necessarily "more severe" — it's
  simply a different troubleshooting path.
- **Caller ID:** Replaced "configured on the originating call flow or Workflow" with "voice
  call-origination logic" plus examples (Studio, TwiML, Functions, backend orchestration) — the
  original wording incorrectly implied TaskRouter Workflows control caller ID.
- **OAuth:** Reframed the 401 discussion as guidance for *customer-owned* authentication rather
  than something Twilio itself documents as a common failure mode.
- **Troubleshooting:** Added a closing pointer to browser DevTools (Network/Console) as a
  practical first step for isolating Flex vs. plugin vs. backend failures.

## Takeaway

Three of these were genuine factual corrections, not just tone edits — worth remembering as
the "real bugs" of Day 7, the same way earlier lessons had real CI/CD bugs:

1. **TaskRouter task cancellation threshold** — 10 rejections (wrong, outdated) vs. 1,000
   (current docs).
2. **Verify SNA error handling** — 60534 and 60540 need different fallback behavior, not
   identical treatment.
3. **Studio 81026** — an execution failure that blocks every run until fixed, not a one-time
   publish warning.

All three would have been wrong "expert" answers if shipped as originally drafted — a good
reminder that AI-drafted domain content still needs a real expert's verification pass before
it's trustworthy, which is exactly the review discipline this step was meant to practice.
