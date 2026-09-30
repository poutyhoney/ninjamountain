import type { Offer } from "@/lib/offers";

import Badge from "./Badge";
import PerkList from "./PerkList";
import PriceTag from "./PriceTag";

type OfferCardProps = {
  offer: Offer;
};

export default function OfferCard({ offer }: OfferCardProps) {
  const { name, priceCents, billingPeriod, perks, badge, premium } = offer;

  return (
    <article
      className={`relative flex flex-col gap-6 rounded-2xl border bg-nm-charcoal p-8 ${
        premium ? "border-nm-honey" : "border-nm-slate"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-8">
          <Badge>{badge}</Badge>
        </div>
      )}

      <h2 className={`text-xl font-semibold ${premium ? "text-nm-honey" : ""}`}>
        {name}
      </h2>

      <PriceTag priceCents={priceCents} billingPeriod={billingPeriod} />

      <PerkList perks={perks} premium={premium} />
    </article>
  );
}