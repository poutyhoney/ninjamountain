---
id: kb-014
title: "SendGrid email bounces, blocks, and deferrals"
---

SendGrid's Event Webhook reports email lifecycle events such as `processed`,
`delivered`, `deferred`, `bounce`, `blocked`, `dropped`, `spamreport`, `open`,
`click`, and `unsubscribe`, each associated with an `sg_message_id`. When a
customer reports that email was not received, identifying the recorded event is
the first step in determining where delivery failed.

**Bounces** indicate that the receiving mail server permanently rejected the
message. SendGrid classifies bounces into categories including Invalid Address,
Technical, Content, Reputation, Frequency/Volume, Mailbox Unavailable, and
Unclassified. Reputation- and content-related bounces commonly indicate issues
with the sender's domain reputation, authentication, or sending practices
rather than a SendGrid platform problem.

A **Deferred** event indicates that the receiving mail server temporarily
rejected the message. SendGrid continues retrying delivery for up to **72
hours**. If delivery still cannot be completed after the retry period, the
message is no longer retried and may ultimately be treated as blocked. High
deferral rates can indicate recipient-side throttling or filtering and are also
commonly seen during IP warmup while a new dedicated IP is building reputation.

**Dropped** messages are never handed off for delivery. Common reasons include
an invalid SMTPAPI/X-SMTPAPI header, a recipient already present on a
suppression list, spam-related filtering, or account or recipient limits that
prevent SendGrid from attempting delivery.

When investigating widespread deliverability issues (rather than isolated
recipient failures), verify that the sender's domain authentication (SPF, DKIM,
and DMARC) is correctly configured before focusing on individual events.
Authentication problems can contribute to reputation-related bounces and blocks,
although recipient mail-server policies and sender reputation should also be
considered.
