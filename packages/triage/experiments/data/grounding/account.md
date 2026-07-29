# Grounding pack — Account / billing

Real Twilio account & billing specifics for synthetic ticket generation. Use naturally; do not list.

This surface is less error-code-driven than others — ground it in real billing terminology and
account states rather than codes.

## Terms / SIDs
- Account SID `AC…`; subaccounts (each its own `AC…`). Invoices, usage records, balance,
  auto-recharge, billing alerts/triggers.
- Common invoice line items: "Programmable Messaging - Carrier Surcharge", "Short Code MMS",
  Voice minutes (inbound/outbound), "Insights", phone number monthly rentals, A2P fees,
  carrier pass-through fees.
- Account states: active, **suspended**, closed. Suspension blocks API access (see 20403/20003).

## Common real failure modes
- Charges the customer doesn't recognize (carrier surcharges, pass-through fees, Insights).
- Unexpected outbound voice/SMS volume on the invoice (possible compromise or runaway loop).
- Refund/credit request for erroneous charges.
- **Account suspended** — urgent, customer fully blocked (often billing- or compliance-driven).
- Auto-recharge not triggering, or balance hitting zero mid-campaign.
