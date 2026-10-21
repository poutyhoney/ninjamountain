from datetime import datetime, timedelta, timezone

from usage import DAILY_LIMITS, UsageTracker


class FakeClock:
	def __init__(self, start: datetime) -> None:
		self.now = start

	def __call__(self) -> datetime:
		return self.now

	def advance(self, **kwargs) -> None:
		self.now += timedelta(**kwargs)


def make_tracker(hour: int = 12) -> tuple[UsageTracker, FakeClock]:
	clock = FakeClock(datetime(2026, 10, 21, hour, 0, tzinfo=timezone.utc))
	return UsageTracker(clock), clock


def test_counts_down_remaining():
	tracker, _ = make_tracker()
	assert tracker.try_use("demo", "white-belt") == 2
	assert tracker.try_use("demo", "white-belt") == 1
	assert tracker.try_use("demo", "white-belt") == 0


def test_blocks_after_the_limit():
	tracker, _ = make_tracker()
	for _ in range(DAILY_LIMITS["brown-belt"]):
		assert tracker.try_use("demo", "brown-belt") is not None
	assert tracker.try_use("demo", "brown-belt") is None


def test_users_are_counted_separately():
	tracker, _ = make_tracker()
	for _ in range(3):
		tracker.try_use("alice", "white-belt")
	assert tracker.try_use("alice", "white-belt") is None
	assert tracker.try_use("bob", "white-belt") == 2


def test_resets_at_midnight_utc():
	tracker, clock = make_tracker(hour=23)
	for _ in range(3):
		tracker.try_use("demo", "white-belt")
	assert tracker.try_use("demo", "white-belt") is None
	clock.advance(hours=1)
	assert tracker.try_use("demo", "white-belt") == 2


def test_refund_gives_a_hint_back():
	tracker, _ = make_tracker()
	for _ in range(3):
		tracker.try_use("demo", "white-belt")
	tracker.refund("demo")
	assert tracker.try_use("demo", "white-belt") == 0


def test_seconds_until_reset():
	tracker, _ = make_tracker(hour=23)
	assert tracker.seconds_until_reset() == 3600