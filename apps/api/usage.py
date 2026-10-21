import threading
from collections.abc import Callable
from datetime import date, datetime, timedelta, timezone

from entitlements import Belt

DAILY_LIMITS: dict[Belt, int] = {
	"white-belt": 3,
	"brown-belt": 10,
	"black-belt": 30,
}

Clock = Callable[[], datetime]


def utc_now() -> datetime:
	return datetime.now(timezone.utc)


class UsageTracker:
	def __init__(self, clock: Clock = utc_now) -> None:
		self.clock = clock
		self.lock = threading.Lock()
		self.day: date = clock().date()
		self.counts: dict[str, int] = {}

	def _roll_over(self) -> None:
		today = self.clock().date()
		if today != self.day:
			self.day = today
			self.counts = {}

	def try_use(self, user_id: str, belt: Belt) -> int | None:
		with self.lock:
			self._roll_over()
			used = self.counts.get(user_id, 0)
			if used >= DAILY_LIMITS[belt]:
				return None
			self.counts[user_id] = used + 1
			return DAILY_LIMITS[belt] - used - 1

	def refund(self, user_id: str) -> None:
		with self.lock:
			self._roll_over()
			if self.counts.get(user_id, 0) > 0:
				self.counts[user_id] -= 1

	def seconds_until_reset(self) -> int:
		now = self.clock()
		tomorrow = datetime.combine(now.date() + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
		return max(1, int((tomorrow - now).total_seconds()))