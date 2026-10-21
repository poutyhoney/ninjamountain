import json
from collections.abc import Iterator
from dataclasses import replace

from fastapi.testclient import TestClient

import main
from main import app, get_hint_streamer, get_usage_tracker
from sensei import SenseiError
from usage import DAILY_LIMITS, UsageTracker

client = TestClient(app)


class FakeStreamer:
	def stream_hint(self, challenge, question) -> Iterator[str]:
		yield "What was it "
		yield "the day before?"

class FailingStreamer:
	def stream_hint(self, challenge, question) -> Iterator[str]:
		raise SenseiError("The Sensei is busy. Try again in a moment.")
		yield

def post_hint(challenge_id: str, question: str = "Where do I start?"):
	return client.post("/sensei/hint", json={"challenge_id": challenge_id, "question": question})


def with_streamer(streamer, tracker: UsageTracker | None = None) -> UsageTracker:
	tracker = tracker or UsageTracker()
	app.dependency_overrides[get_hint_streamer] = lambda: streamer
	app.dependency_overrides[get_usage_tracker] = lambda: tracker
	return tracker


def teardown_function():
	app.dependency_overrides.clear()


def test_challenges_for_demo_belt():
	response = client.get("/sensei/challenges")
	assert response.status_code == 200
	grounds = {challenge["ground"] for challenge in response.json()}
	assert grounds == {"bamboo-grove", "river-crossing", "cliff-steps"}
	assert all("solution" not in challenge for challenge in response.json())


def test_hint_streams_ndjson():
	with_streamer(FakeStreamer())
	response = post_hint("bamboo-grove-growth")
	assert response.status_code == 200
	assert response.headers["content-type"].startswith("application/x-ndjson")
	lines = [json.loads(line) for line in response.text.splitlines()]
	assert lines[-1] == {"type": "done", "remaining": DAILY_LIMITS["brown-belt"] - 1}
	assert "".join(line["text"] for line in lines if line["type"] == "text") == "What was it the day before?"


def test_unknown_challenge_is_404():
	with_streamer(FakeStreamer())
	assert post_hint("no-such-challenge").status_code == 404


def test_locked_ground_is_403():
	with_streamer(FakeStreamer())
	assert post_hint("summit-shrine-bell").status_code == 403


def test_no_api_key_is_503():
	with_streamer(None)
	assert post_hint("bamboo-grove-growth").status_code == 503


def test_empty_question_is_422():
	with_streamer(FakeStreamer())
	assert post_hint("bamboo-grove-growth", question="").status_code == 422


def test_missing_token_is_401(monkeypatch):
	monkeypatch.setattr(main, "settings", replace(main.settings, api_token="secret-for-test"))
	with_streamer(FakeStreamer())
	assert post_hint("bamboo-grove-growth").status_code == 401


def test_limit_reached_is_429_with_retry_after():
	tracker = with_streamer(FakeStreamer())
	for _ in range(DAILY_LIMITS["brown-belt"]):
		assert post_hint("bamboo-grove-growth").status_code == 200
	response = post_hint("bamboo-grove-growth")
	assert response.status_code == 429
	assert int(response.headers["retry-after"]) == tracker.seconds_until_reset()


def test_failed_stream_refunds_the_hint():
	tracker = with_streamer(FailingStreamer())
	response = post_hint("bamboo-grove-growth")
	assert json.loads(response.text.splitlines()[-1])["type"] == "error"
	assert tracker.try_use(main.DEMO_USER_ID, "brown-belt") == DAILY_LIMITS["brown-belt"] - 1


def test_rejected_requests_do_not_count():
	tracker = with_streamer(FakeStreamer())
	post_hint("summit-shrine-bell")
	post_hint("no-such-challenge")
	assert tracker.try_use(main.DEMO_USER_ID, "brown-belt") == DAILY_LIMITS["brown-belt"] - 1