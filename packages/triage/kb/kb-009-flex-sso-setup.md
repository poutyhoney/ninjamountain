---
id: kb-009
title: "Setting up SSO for Flex (SAML with an identity provider)"
---

Flex supports single sign-on with identity providers that support SAML 2.0, such as Okta,
Google, Microsoft Azure, Salesforce, Auth0, and others. First identify whether the customer is
using **enhanced SSO** or **legacy SSO**. Twilio's Flex docs distinguish the two: enhanced SSO
uses a simplified OAuth 2.0-based setup for Flex UI 2.5.x or later when configuring SSO for the
first time, while legacy SSO applies to older Flex setups, including accounts that configured
SSO before January 29, 2024 or use Flex 2.4.x or earlier. Twilio's public docs state that
legacy SSO customers needed to migrate to enhanced SSO before **March 31, 2026**, so legacy SSO
questions should be treated as migration-sensitive rather than routine new setup.

Do not confuse Flex SSO with general Twilio Console SSO. Flex SSO is configured under Flex's
Users and access / Single sign-on settings and has Flex-specific service provider URLs,
certificates, trusted domains, redirect URLs, and required identity attributes. Console SSO docs
are for logging in to Twilio Console and are not a substitute for the Flex IdP configuration
guide.

For Flex user creation and permissions, the IdP must send the required identity attributes,
including a unique user ID, roles, full name, and email. Flex roles such as `agent`,
`supervisor`, and `admin` determine what the user can do after authentication succeeds. Treat
"users can log in but cannot access a view or action" as a role/attribute/worker issue, and
treat "users cannot log in at all" as a SSO configuration, ACS URL, issuer, certificate,
trusted-domain, redirect, or IdP assignment issue until proven otherwise.
