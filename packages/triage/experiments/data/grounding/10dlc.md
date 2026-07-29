# Grounding pack — 10DLC & compliance (A2P)

Real A2P 10DLC specifics for synthetic ticket generation. Use naturally; do not list.

## Terms
- A2P 10DLC registration chain: **Customer Profile** (TrustHub) → **Brand** → **Campaign**
  (use case). Registered with **The Campaign Registry (TCR)**.
- A campaign needs: brand details, use case, opt-in / message flow, sample messages, a working
  website, and consistent business identity across all fields.
- ISV (registering on behalf of customers) vs. direct brand. Throughput tied to brand vetting.

## Campaign vetting rejection codes
- **30880 Unknown Error** — rejected in manual vetting, no specific reason; check for other codes.
- **30881 Invalid Brand Support Email** — disposable/public domain, or domain doesn't match the brand.
- **30894 Invalid Brand Information** — campaign tied to the wrong brand, or an ISV used its own
  details instead of the customer's business.
- **30714 Vetting Token Rejected by TCR** — invalid/expired token or mismatched brand details.

## Common real failure modes
- Campaign registration rejected with an unclear reason; needs edit + resubmit (vs. delete/recreate
  when the Brand itself is the problem).
- Sample messages / opt-in language inconsistent with the registered use case.
