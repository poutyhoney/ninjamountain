---
id: kb-003
title: "Account suspended: what it blocks and why it happens"
---

A suspended Twilio account is blocked from Twilio usage, including calls, messages, and API
activity, until it is reactivated. The customer may report this as "nothing works" because the
symptom can surface through product-specific errors such as **10001 Account is not active**,
**20003 Permission Denied**, **20403 Forbidden**, or Messaging **30002 Account suspended**,
depending on which API or product path failed.

Publicly documented suspension causes include a balance reaching zero or going negative,
overdue payments, failed or unavailable auto-recharge, a suspended parent account affecting a
subaccount, a subaccount deliberately set to `suspended`, suspected fraud or account
compromise, and Terms of Service or Acceptable Use Policy review. If the issue is billing-only
and the customer has just paid or refilled the balance, allow a short reactivation window before
escalating, but do not promise timing until the suspension reason is confirmed.

Treat this as high severity when it affects production traffic: unlike Flex degraded mode or a
single carrier delivery issue, account suspension can stop multiple products at once. First
response should identify whether the path is billing, parent/subaccount status, fraud/abuse, or
compliance review, then route to the team that can actually reinstate the account. Closed
accounts are different from suspended accounts; Twilio documents closure as permanent, so do not
describe a closed account as something that can simply be unsuspended.
