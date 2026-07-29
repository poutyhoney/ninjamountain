---
id: kb-001
title: "Auth errors: 20003 Permission Denied and 20403 Forbidden"
---

Twilio API requests can fail with **20003 Permission Denied** when the credentials are
incorrect, expired, deleted, scoped to the wrong account, or not valid for the requested
resource. Publicly documented causes include using Test Credentials against live resources,
mixing main-account and subaccount credentials, using a Standard API key for endpoints that
require a Main API key (such as `/Accounts` or `/v1/Keys`), using a key from a different
Twilio Region than the request, sending an expired OAuth access token, having a proxy or
middleware strip the `Authorization` header, using an Auth Token where an API Key SID and
Secret are required for JWT/client-token signing, or calling from an account that is suspended
or closed.

A very high-signal operational question is still: **did this start right after a credential
rotation, deletion, or secret-store change?** If the integration previously worked, check every
environment variable, secrets-manager entry, deployed Function or Service, CI setting, and
cached config that might still hold the old value before treating the API itself as degraded.

**20403 Forbidden** is a permission failure rather than a generic bad-password error. Common
documented causes include a suspended or closed account, a Restricted API key missing the
permission required for that endpoint, or a recent Auth Token rotation where dependent
Services or Functions are still using an outdated value while propagation finishes. Twilio
documents allowing at least about a minute for Auth Token rotation propagation.

First-response checklist: identify the credential type used (Account SID + Auth Token, API Key
SID + Secret, or OAuth Bearer token), confirm that it belongs to the account or subaccount that
owns the resource, verify the key type and Region, check whether credentials were recently
rotated or deleted, confirm account status, and inspect any proxy, gateway, or middleware that
could alter the `Authorization` header. For product-specific auth failures, also check the
relevant prerequisite in the error details, such as Flex Webchat allowed origins or an addendum
that must be accepted in Console.
