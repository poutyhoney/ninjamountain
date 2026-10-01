import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EntitlementsSummary, { EntitlementsSkeleton } from "./EntitlementsSummary";

describe("EntitlementsSummary", () => {
  it("shows the belt and counts on success", () => {
    render(
      <EntitlementsSummary
        result={{
          ok: true,
          data: {
            user_id: "demo",
            belt: "brown-belt",
            unlocked_grounds: ["bamboo-grove", "river-crossing", "cliff-steps"],
            owned_addons: ["lantern-gear-pack"],
          },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "You are a Brown Belt" })).toBeInTheDocument();
    expect(screen.getByText("3 training grounds unlocked, 1 add-on owned")).toBeInTheDocument();
  });

  it("uses singular and plural labels correctly", () => {
    render(
      <EntitlementsSummary
        result={{
          ok: true,
          data: {
            user_id: "demo",
            belt: "white-belt",
            unlocked_grounds: ["bamboo-grove"],
            owned_addons: [],
          },
        }}
      />,
    );

    expect(screen.getByText("1 training ground unlocked, 0 add-ons owned")).toBeInTheDocument();
  });

  it("shows the error message when the API failed", () => {
    render(<EntitlementsSummary result={{ ok: false, error: "Could not reach the API." }} />);

    expect(screen.getByRole("region", { name: "Your training" })).toHaveTextContent(
      "Your training progress is unavailable right now. Could not reach the API.",
    );
  });
});

describe("EntitlementsSkeleton", () => {
  it("announces loading to screen readers", () => {
    render(<EntitlementsSkeleton />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading your training progress");
  });
});