import type { Offer } from "@/lib/offers";

import Badge from "./Badge";
import PerkList from "./PerkList";
import PriceTag from "./PriceTag";

type OfferCardProps = {
  offer: Offer;
  action?: React.ReactNode;
};

export default function OfferCard({ offer, action }: OfferCardProps) {
  const { name, priceCents, billingPeriod, perks, badge, premium } = offer;

  return (
    <article
      className={`relative flex flex-col gap-6 rounded-2xl border bg-nm-charcoal p-8 ${
        premium ? "border-nm-honey" : "border-nm-slate"
      }`}
    >
      <h2 className={`text-xl font-semibold ${premium ? "text-nm-honey" : ""}`}>
        {name}
      </h2>

      {badge && (
        <div className="absolute -top-3 left-8">
          <Badge>{badge}</Badge>
        </div>
      )}

      <PriceTag priceCents={priceCents} billingPeriod={billingPeriod} />

      <PerkList perks={perks} premium={premium} />

      {action && <div className="mt-auto pt-2">{action}</div>}
    </article>
  );
}