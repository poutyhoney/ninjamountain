import type { BillingPeriod, Offer } from "@/lib/offers";

type ContentfulEntries<TFields> = {
  total: number;
  items: { sys: { id: string }; fields: TFields }[];
};

type OfferFields = {
  name: string;
  slug: string;
  kind: "tier" | "addon";
  priceCents: number;
  billingPeriod: BillingPeriod;
  perks?: string[];
  badge?: string;
  premium?: boolean;
};

export async function getTierOffers(): Promise<Offer[]> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !token) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set.");
  }

  const url =
    `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries` +
    `?content_type=offer&fields.kind=tier&order=fields.priceCents`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Contentful returned ${res.status}.`);
  }

  const body = (await res.json()) as ContentfulEntries<OfferFields>;
  return body.items.map(({ fields }) => ({
    id: fields.slug,
    name: fields.name,
    priceCents: fields.priceCents,
    billingPeriod: fields.billingPeriod,
    perks: fields.perks ?? [],
    badge: fields.badge,
    premium: fields.premium,
  }));
}