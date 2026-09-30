import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import EntitlementsSummary, { EntitlementsSkeleton } from "./EntitlementsSummary";

const meta = {
  title: "Store/EntitlementsSummary",
  component: EntitlementsSummary,
  args: {
    result: {
      ok: true,
      data: {
        user_id: "demo",
        belt: "brown-belt",
        unlocked_grounds: ["bamboo-grove", "river-crossing", "cliff-steps"],
        owned_addons: ["lantern-gear-pack"],
      },
    },
  },
} satisfies Meta<typeof EntitlementsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrownBelt: Story = {};

export const WhiteBeltNoAddons: Story = {
  args: {
    result: {
      ok: true,
      data: {
        user_id: "demo",
        belt: "white-belt",
        unlocked_grounds: ["bamboo-grove"],
        owned_addons: [],
      },
    },
  },
};

export const ApiUnreachable: Story = {
  args: {
    result: { ok: false, error: "Could not reach the API." },
  },
};

export const ApiError: Story = {
  args: {
    result: { ok: false, error: "The API returned 500." },
  },
};

export const Loading: Story = {
  render: () => <EntitlementsSkeleton />,
};