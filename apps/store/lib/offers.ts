// The Offer type for the Ninja Mountain Arcade storefront.
//
// This file is plain TypeScript: no React, no Next.js. It defines the shape
// the UI works with. The data itself lives in Contentful; lib/contentful.ts
// fetches it and maps Contentful's fields into this type.

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

