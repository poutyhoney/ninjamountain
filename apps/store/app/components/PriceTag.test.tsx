import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PriceTag from "./PriceTag";

describe("PriceTag", () => {
	it("shows Free and no billing period for a zero price", () => {
		render(<PriceTag priceCents={0} billingPeriod="month" />);
		
		expect(screen.getByText("Free")).toBeInTheDocument();
		expect(screen.queryByText(/month/)).not.toBeInTheDocument();
	});
	
	it("formats cents as dollars with the billing period", () => {
		render(<PriceTag priceCents={699} billingPeriod="month" />);
		
		expect(screen.getByText("$6.99")).toBeInTheDocument();
		expect(screen.getByText("/ month")).toBeInTheDocument();
	});
	
	it("shows a yearly price", () => {
		render(<PriceTag priceCents={6999} billingPeriod="year" />);
		
		expect(screen.getByText("$69.99")).toBeInTheDocument();
		expect(screen.getByText("/ year")).toBeInTheDocument();
	});
});