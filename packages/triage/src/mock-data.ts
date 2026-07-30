// Mock account/ticket-history data for the v3 tool-use agent (src/agent.ts).
// Real Zendesk/CRM lookups are out of scope here — the agent pattern is the
// interview story, not the data source (see LEARNINGS.md). One entry below
// matches ticket T01's phone number in experiments/data/tickets.json so a
// demo run has at least one real "found" path; anything else realistically
// falls through to "not found".

export interface MockAccount {
  identifier:    string;
  companyName:   string;
  planTier:      "trial" | "pay_as_you_go" | "enterprise";
  accountStatus: "active" | "suspended" | "past_due";
  signupDate:    string;
}

export interface MockTicketHistoryEntry {
  id:         string;
  subject:    string;
  resolvedAt: string;
  category:   string;
}

const ACCOUNTS: MockAccount[] = [
  {
    identifier:    "+15551234567",
    companyName:   "Acme Logistics",
    planTier:      "enterprise",
    accountStatus: "active",
    signupDate:    "2023-02-11",
  },
  {
    identifier:    "sales@northwind-example.com",
    companyName:   "Northwind Retail",
    planTier:      "pay_as_you_go",
    accountStatus: "past_due",
    signupDate:    "2025-01-04",
  },
];

const TICKET_HISTORY: Record<string, MockTicketHistoryEntry[]> = {
  "+15551234567": [
    { id: "T-8821", subject: "Webhook signature validation failing intermittently", resolvedAt: "2026-05-02", category: "bug" },
    { id: "T-8790", subject: "Rate limit increase request",                          resolvedAt: "2026-03-14", category: "config" },
  ],
};

export function findAccountByIdentifier(identifier: string): MockAccount | undefined {
  return ACCOUNTS.find(
    (a) => identifier.includes(a.identifier) || a.identifier.includes(identifier)
  );
}

export function findRecentTickets(identifier: string): MockTicketHistoryEntry[] {
  const account = findAccountByIdentifier(identifier);
  if (!account) return [];
  return TICKET_HISTORY[account.identifier] ?? [];
}
