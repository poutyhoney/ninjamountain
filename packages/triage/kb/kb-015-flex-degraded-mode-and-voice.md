---
id: kb-015
title: "Flex degraded mode, caller ID, and OAuth token refresh in plugins"
---

Since Flex UI 1.31, Flex can initialize in **degraded mode** when one or more underlying SDKs
(such as TaskRouter, Conversations, Voice, or Sync) is unavailable. Rather than preventing
agents from signing in entirely, Flex continues loading with the features that remain
available—for example, a Voice service incident may leave messaging tasks working while
voice-specific capabilities are unavailable.

A complete login failure (for example, "Log in failed. Please contact your administrator…")
should be triaged separately from degraded mode because it may indicate authentication,
configuration, network, or broader platform issues. Before investigating customer-specific
configuration, check the current Twilio Status page for any active incidents affecting Flex or
its dependent services.

**Wrong caller ID on outbound calls from Flex** is typically **not** a Flex UI issue. The Flex
desktop initiates outbound calls, but the caller ID is determined by the voice
call-origination logic (for example, Studio, TwiML, Functions, or other backend call
orchestration). If the displayed caller ID is incorrect, verify the originating call flow and
voice configuration before investigating the Flex UI itself. This is generally unrelated to
warm/cold transfer failures, which should instead be investigated as transfer or conference
behavior.

Custom Flex plugins may also communicate with customer-owned APIs that use their own
authentication independent of Twilio credentials. In these cases, a plugin that begins
returning HTTP 401 responses after previously working often indicates an issue with the
customer's authentication layer—for example, an expired access or refresh token, failed token
refresh logic, clock skew, revoked credentials, or signing-key rotation—rather than a problem
with Twilio or Flex itself.

When troubleshooting plugin issues, use the browser's Developer Tools (Network and Console
tabs) to determine whether failures originate from Twilio services, the custom plugin, or the
customer's backend.
