export type BillingPeriod = "month" | "year";

export type Offer = {
	id: string;
	name: string;
	priceCents: number;
	billingPeriod: BillingPeriod;
	perks: string[];
	badge?: string;
};

export const offers: Offer[] = [
  {
    id: "starter",
    name: "Starter",
    priceCents: 900,
    billingPeriod: "month",
    perks: ["1 project", "Community support", "Basic analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 2900,
    billingPeriod: "month",
    perks: ["Unlimited projects", "Email support", "Advanced analytics", "Custom domain"],
    badge: "Most popular",
  },
  {
    id: "team",
    name: "Team",
    priceCents: 29000,
    billingPeriod: "year",
    perks: ["Everything in Pro", "5 seats", "SSO", "Priority support"],
  },
];