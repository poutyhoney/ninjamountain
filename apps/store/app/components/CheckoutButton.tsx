import { startCheckout } from "@/app/checkout/actions";
import type { Offer } from "@/lib/offers";

import ChooseButton from "./ChooseButton";

type CheckoutButtonProps = {
  offer: Offer;
};

export default function CheckoutButton({ offer }: CheckoutButtonProps) {
  if (offer.priceCents === 0) {
    return (
      <p className="text-sm text-nm-silver">Free forever. No card needed.</p>
    );
  }

  return (
    <form action={startCheckout}>
      <input type="hidden" name="slug" value={offer.id} />
      <ChooseButton
        offerId={offer.id}
        offerName={offer.name}
        priceCents={offer.priceCents}
        premium={offer.premium}
      />
    </form>
  );
}
