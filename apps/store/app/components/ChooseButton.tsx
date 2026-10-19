"use client";

import { sendGAEvent } from "@next/third-parties/google";

type ChooseButtonProps = {
  offerId: string;
  offerName: string;
  priceCents: number;
  premium?: boolean;
};

export default function ChooseButton({
  offerId,
  offerName,
  priceCents,
  premium,
}: ChooseButtonProps) {
  function trackSelection() {
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      return;
    }
    sendGAEvent("event", "select_belt", {
      belt: offerId,
      value: priceCents / 100,
      currency: "USD",
    });
  }

  return (
    <button
      type="submit"
      onClick={trackSelection}
      className={`w-full rounded-full px-4 py-2 font-semibold text-nm-obsidian ${
        premium ? "bg-nm-honey" : "bg-nm-violet"
      }`}
    >
      Choose {offerName}
    </button>
  );
}
