import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import PerkList from "./PerkList";

const meta = {
  title: "Store/PerkList",
  component: PerkList,
  args: {
    perks: ["All core training grounds", "Unlimited challenges", "Progress tracking"],
  },
} satisfies Meta<typeof PerkList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Premium: Story = {
  args: { premium: true },
};

export const Empty: Story = {
  args: { perks: [] },
};