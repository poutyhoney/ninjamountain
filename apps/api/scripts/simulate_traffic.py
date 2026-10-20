import argparse
import random
import re
import time
import uuid

import httpx

STORE_URL = "http://localhost:3001/"
EVENTS_URL = "http://localhost:8000/events"
LAYOUT_PATTERN = re.compile(r'data-layout="([a-z-]+)"')
PAID_OFFERS = [("brown-belt", "699"), ("black-belt", "1299")]
OFFER_WEIGHTS = [0.7, 0.3]


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Simulate visitors for the offer-card-layout experiment.")
	parser.add_argument("--visitors", type=int, default=5000)
	parser.add_argument("--control-rate", type=float, default=0.08)
	parser.add_argument("--treatment-rate", type=float, default=0.10)
	parser.add_argument("--think-seconds", type=float, default=0.5)
	parser.add_argument("--seed", type=int, default=42)
	return parser.parse_args()


def main() -> None:
	args = parse_args()
	rng = random.Random(args.seed)
	run_id = uuid.uuid4().hex[:8]
	totals = {"control": [0, 0], "cta-first": [0, 0]}

	with httpx.Client(timeout=10) as client:
		for n in range(args.visitors):
			visitor_id = f"sim-{run_id}-{n}"
			page = client.get(STORE_URL, headers={"Cookie": f"nm_vid={visitor_id}"})
			page.raise_for_status()

			match = LAYOUT_PATTERN.search(page.text)
			if match is None:
				raise SystemExit("No data-layout found. Is the store running with GrowthBook enabled?")
			layout = match.group(1)
			totals[layout][0] += 1

			rate = args.treatment_rate if layout == "cta-first" else args.control_rate
			if rng.random() < rate:
				time.sleep(args.think_seconds)
				offer_id, price_cents = rng.choices(PAID_OFFERS, weights=OFFER_WEIGHTS)[0]
				response = client.post(
					EVENTS_URL,
					json={
						"event_name": "checkout_started",
						"visitor_id": visitor_id,
						"properties": {"offer_id": offer_id, "price_cents": price_cents},
					},
				)
				response.raise_for_status()
				totals[layout][1] += 1

			if (n + 1) % 500 == 0:
				print(f"{n + 1} visitors")

	print(f"\nRun {run_id}")
	for layout, (visitors, conversions) in totals.items():
		rate = conversions / visitors if visitors else 0
		print(f"{layout:>10}: {visitors} visitors, {conversions} checkouts ({rate:.1%})")


if __name__ == "__main__":
	main()