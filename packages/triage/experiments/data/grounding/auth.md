# Grounding pack — Auth / API config

Real Twilio auth/credential specifics for synthetic ticket generation. Use naturally; do not list.

## Terms
- HTTP Basic auth. Production: **API Key SID `SK…` + Secret**. Local/test: **Account SID `AC…`
  + Auth Token**. Client SDKs: Access Tokens (JWT) signed with an API Key SID + Secret. OAuth:
  Bearer access token in `Authorization`.
- API key tiers: **Standard**, **Main** (required for `/Accounts`, `/v1/Keys`), **Restricted**
  (scoped permissions). Twilio **Regions** — credentials are region-specific. Test Credentials.

## Error codes
- **20003 Permission Denied** — wrong/expired/deleted credentials; Test Credentials on live
  resources; subaccount creds on main account (or vice versa); Standard key on a Main-only
  endpoint; key created in a different Region; account suspended; a proxy stripped the
  `Authorization` header; Auth Token used where an API Key SID/Secret is required.
- **20403 403 Forbidden** — account suspended/closed; Restricted key missing the needed
  permission; recently rotated Auth Token still propagating (wait ~1 min).
- **45002 Authentication Error** / **45003 Authorization Error** — Flex/IAM-protected resource.

## Common real failure modes
- **20003 after rotating an API key** (old value still in some env/secret store).
- Restricted API key missing a permission for the endpoint being called.
- Auth Token rotation breaking dependent Functions/Services until propagation completes.
