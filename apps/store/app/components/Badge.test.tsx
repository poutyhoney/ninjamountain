import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import Badge from "./Badge";

it("renders its children", () => {
  render(<Badge>Most popular</Badge>);

  expect(screen.getByText("Most popular")).toBeInTheDocument();
});