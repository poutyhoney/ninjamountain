export type BillingPeriod = "month" | "year";

export type Offer = {
  id: string;
  name: string;
  priceCents: number;
  billingPeriod: BillingPeriod;
  perks: string[];
  badge?: string;
  premium?: boolean;
};

export const offers: Offer[] = [
  {
    id: "white-belt",
    name: "White Belt",
    priceCents: 0,
    billingPeriod: "month",
    perks: ["1 training ground", "Daily challenge", "Global leaderboard"],
  },
  {
    id: "brown-belt",
    name: "Brown Belt",
    priceCents: 699,
    billingPeriod: "month",
    perks: [
      "All core training grounds",
      "Unlimited challenges",
      "Progress tracking",
    ],
    badge: "Most popular",
  },
  {
    id: "black-belt",
    name: "Black Belt",
    priceCents: 1299,
    billingPeriod: "month",
    perks: [
      "Everything in Brown Belt",
      "New training grounds first",
      "Exclusive gear drops",
      "Custom dojo profile",
    ],
    premium: true,
  },
];