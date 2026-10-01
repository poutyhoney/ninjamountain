import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PerkList from "./PerkList";

describe("PerkList", () => {
  it("renders one list item per perk", () => {
    render(<PerkList perks={["Daily challenge", "Global leaderboard"]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Daily challenge")).toBeInTheDocument();
    expect(screen.getByText("Global leaderboard")).toBeInTheDocument();
  });

  it("renders an empty list when there are no perks", () => {
    render(<PerkList perks={[]} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});