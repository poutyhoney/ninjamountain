import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import OfferCard from "./OfferCard";

const meta = {
  title: "Store/OfferCard",
  component: OfferCard,
  decorators: [
    (Story) => (
      <div className="max-w-sm p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OfferCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = {
  args: {
    offer: {
      id: "white-belt",
      name: "White Belt",
      priceCents: 0,
      billingPeriod: "month",
      perks: ["1 training ground", "Daily challenge"],
    },
  },
};

export const Popular: Story = {
  args: {
    offer: {
      id: "brown-belt",
      name: "Brown Belt",
      priceCents: 699,
      billingPeriod: "month",
      perks: ["All core training grounds", "Unlimited challenges"],
      badge: "Most popular",
    },
  },
};

export const Premium: Story = {
  args: {
    offer: {
      id: "black-belt",
      name: "Black Belt",
      priceCents: 1299,
      billingPeriod: "month",
      perks: ["Everything in Brown Belt", "Exclusive gear drops"],
      premium: true,
    },
  },
};