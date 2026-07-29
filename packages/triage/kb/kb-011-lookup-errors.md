---
id: kb-011
title: "Lookup returning no data or coverage errors"
---

Twilio Lookup v2 performs basic phone number validation and formatting and can add paid data
packages such as Line Type Intelligence, Caller Name, SIM Swap, Call Forwarding, Identity
Match, Reassigned Number, SMS Pumping Risk, Line Status, Phone Number Quality Score, and
Pre-Fill depending on account access and country coverage. Requests should use E.164 phone
numbers, and a valid Lookup response can still contain `null` package data or a package-level
`error_code` when a specific data source has no result.

When a customer reports "Lookup returns no carrier data" or only partial results, first confirm
that the requested package is enabled and allowed for the account. **60606 Lookup Package is Not
Enabled** means the account is not enabled for that package. **60699 Lookup Usage Disabled**
means Twilio disabled Lookup usage on the account after detecting abnormal behavior, which is a
support/reactivation path rather than a normal data-quality escalation.

Coverage and authorization errors are a separate class. **60600 Unprovisioned or out of
coverage** means Twilio's sources have no information because the number appears unassigned or
outside coverage. **60610 Phone number outside of coverage** and **60607 Unsupported Country**
indicate the requested package/country combination is not supported. **60601 Authorization
required for Canada lookups** means the account needs additional authorization for Canadian
phone-number data.

Quota and rate errors such as **60611 Package Quota Reached**, **60616 Lookup rate limit
exceeded**, and **60626 Phone number rate limit exceeded** can appear during high-volume batches
and look like missing data if the integration ignores `ErrorCode`. Always capture the exact
HTTP status, top-level error code, requested `Fields`, account SID, phone number country, and
any package-level error codes before escalating "Lookup is broken."
