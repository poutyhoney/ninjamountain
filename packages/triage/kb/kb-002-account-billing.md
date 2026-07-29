---
id: kb-002
title: "Unrecognized charges and invoice line items"
---

Customers frequently open tickets over invoice or Usage line items they don't recognize. Common
items to separate during triage include Twilio message or voice usage, carrier fees or
surcharges, monthly phone number charges, short code or sender-related charges where
applicable, Insights or add-on usage, and A2P 10DLC Brand, Campaign, carrier, or throughput
fees. For Messaging, the Message resource `price` represents the total message cost and can
include carrier fees; the value is not always populated immediately and may lag carrier
reporting.

When a customer says they were "charged for calls/messages we never made," start with Usage
Records, Messaging logs, Voice logs, and recent traffic volume. The usual branches are:
expected pass-through or recurring fees they did not know would appear, legitimate application
traffic that spiked unexpectedly, a runaway loop in their own webhook or job logic, or account
compromise/fraud using leaked credentials. Always check for a volume spike and recent credential
or deployment changes before assuming the invoice is wrong.

Refunds, credits, and disputes for genuinely erroneous charges go through account support and
billing processes, not the product API. Auto-recharge failures and balance exhaustion are a
separate billing path: if the balance reaches zero, Twilio can suspend usage, so check the
auto-recharge threshold, payment method status, recent payment failures, and whether the
customer has recurring charges that continued while suspended.
