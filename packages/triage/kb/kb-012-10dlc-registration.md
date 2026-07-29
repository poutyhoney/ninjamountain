---
id: kb-012
title: "10DLC campaign registration rejected"
---

A2P 10DLC registration has distinct stages: collect business information in Trust Hub/Customer
Profile, register the Brand with The Campaign Registry (TCR), then register the Campaign/use
case. Brand approval and Campaign approval fail for different reasons, and throughput is tied
to Brand vetting and Trust Score, so do not assume a rejected Campaign means the Brand is wrong
or that a Brand issue can be fixed by editing sample messages.

Specific rejection codes point to specific fixes. **30880 Unknown Error** means manual vetting
rejected the Campaign without a specific actionable reason; check the Campaign details for any
additional, more specific codes before guessing. **30881 Invalid Brand Support Email** means the
support email is malformed, disposable, public-domain, not associated with the Brand, or belongs
to an ISV/platform instead of the actual sender. **30894 Invalid Brand Information** means the
Campaign submission does not match the business behind the messaging program, such as an ISV
using its own details for a customer's Campaign. **30714 Vetting Token Rejected by TCR** points
to an invalid, expired, revoked, unrecognized, or brand-mismatched vetting token.

For most correctable Campaign failures, fix the failed Campaign and resubmit rather than
deleting and recreating by default. Common correctable problems include a vague Campaign
description, use-case mismatch, sample messages that do not match the registered use case, a
missing or incomplete opt-in workflow, opt-out/help language that does not match the real user
experience, or a website/brand identity that reviewers cannot validate. Delete/recreate only
when the selected use case or associated Brand is the thing that must change, or when Twilio's
current workflow requires it for that failure path.
