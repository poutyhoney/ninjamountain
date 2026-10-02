import { startCheckout } from "@/app/checkout/actions";
import type { Offer } from "@/lib/offers";

type CheckoutButtonProps = {
	offer: Offer;
};

export default function CheckoutButton({ offer }: CheckoutButtonProps) {
	if (offer.priceCents === 0) {
		return <p className="text-sm text-nm-silver">Free forever. No card needed.</p>;
	}
	
	return (
		<form action={startCheckout}>
			<input type="hidden" name="slug" value={offer.id} />
			<button
				type="submit"
				className={`w-full rounded-full px-4 py-2 font-semibold text-nm-obsidian ${
					offer.premium ? "bg-nm-honey" : "bg-nm-violet"
				}`}
			>
				Choose {offer.name}
			</button>
		</form>
	);
}