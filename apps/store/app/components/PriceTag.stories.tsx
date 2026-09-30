import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import PriceTag from "./PriceTag";

const meta = {
  title: "Store/PriceTag",
  component: PriceTag,
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = {
  args: { priceCents: 0, billingPeriod: "month" },
};

export const Monthly: Story = {
  args: { priceCents: 699, billingPeriod: "month" },
};

export const Yearly: Story = {
  args: { priceCents: 6999, billingPeriod: "year" },
};