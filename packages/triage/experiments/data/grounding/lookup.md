# Grounding pack — Lookup

Real Twilio Lookup specifics for synthetic ticket generation. Use naturally; do not list.

## Terms
- Lookup v2. Data packages: **line type intelligence**, **carrier**, **caller name (CNAM)**,
  **SIM swap**, **call forwarding**, **identity match**, Silent Network Auth. Numbers in E.164.

## Error codes
- **60600 Unprovisioned or out of coverage**; **60610 Phone number outside of coverage**.
- **60606 Lookup Package Not Enabled**; **60699 Lookup Usage Disabled**.
- **60607 Unsupported Country**; **60601 Authorization required for Canada lookups**.
- **60608 Lookup Error**; **60613 Lookup Provider Degradation**.
- **60611 Package Quota Reached**; **60616 rate limit exceeded**; **60626 phone number rate limit exceeded**.
- **60617 Not Enough Request Parameters**; **60618 Malformed Request Parameter**.
- **60612 Requested phone number not mobile**; **60621 Carrier Information Not Available**.

## Common real failure modes
- Lookup returns no carrier / line-type data (60621), or partial SIM-swap data.
- Package not enabled (60606) or quota reached (60611) mid-batch.
- Country unsupported (60607) for the requested data package.
