// Offer data for the Ninja Mountain Arcade storefront.
//
// This file is plain TypeScript: no React, no Next.js. It defines the shape of
// an offer (the `Offer` type) and a hardcoded list of the belt tiers.
// `app/page.tsx` imports `offers` and renders one `OfferCard` per item.
// In week 2 the list moves behind the FastAPI offers endpoints; the `Offer`
// type stays and describes what the API returns.

// A union of string literals: a BillingPeriod can only be "month" or "year".
// A typo like "monthly" is a compile error instead of a runtime bug.
export type BillingPeriod = "month" | "year";

export type Offer = {
  // Stable, unique identifier. Also used as the React `key` in page.tsx.
  id: string;
  name: string;
  // Money is stored in whole cents, never as a decimal like 6.99. JavaScript
  // numbers are floating point (0.1 + 0.2 !== 0.3), so integer cents avoid
  // rounding bugs. Stripe and most payment APIs use the same convention.
  // Formatting to "$6.99" happens only at display time, in OfferCard.
  priceCents: number;
  billingPeriod: BillingPeriod;
  perks: string[];
  // Optional properties (the `?`): the type is really `string | undefined`,
  // so TypeScript makes every consumer handle the missing case.
  badge?: string;
  // Marks premium content, which gets the honey accent. A data flag instead
  // of checking `id === "black-belt"` in the card, so renaming an id can't
  // silently break the styling, and add-ons can reuse it later.
  premium?: boolean;
};

// The `: Offer[]` annotation makes TypeScript check every object in the array
// against the Offer type (missing fields, wrong types, unknown keys).
export const offers: Offer[] = [
  {
    id: "white-belt",
    name: "White Belt",
    // Free is still a price: zero. OfferCard decides to display it as "Free".
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
