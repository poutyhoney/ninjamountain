import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Badge from "./Badge";

const meta = {
  title: "Store/Badge",
  component: Badge,
  args: {
    children: "Most popular",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MostPopular: Story = {};

export const LongText: Story = {
  args: {
    children: "Founding member price",
  },
};