import json
from collections import Counter
from pathlib import Path

from challenges import CHALLENGES

CASES_PATH = Path(__file__).parent / "evals" / "sensei_hints.jsonl"
KINDS = {"stuck", "wrong-attempt", "wants-answer", "off-topic"}


def load_cases() -> list[dict]:
	return [json.loads(line) for line in CASES_PATH.read_text().splitlines() if line.strip()]


def test_twenty_cases():
	assert len(load_cases()) == 20


def test_ids_are_unique():
	ids = [case["id"] for case in load_cases()]
	assert len(ids) == len(set(ids))


def test_every_case_points_at_a_real_challenge():
	for case in load_cases():
		assert case["challenge_id"] in CHALLENGES, case["id"]


def test_kinds_are_known():
	for case in load_cases():
		assert case["kind"] in KINDS, case["id"]


def test_questions_fit_the_api_limit():
	for case in load_cases():
		assert 1 <= len(case["question"]) <= 500, case["id"]


def test_every_ground_is_covered():
	grounds = Counter(CHALLENGES[case["challenge_id"]].ground for case in load_cases())
	assert set(grounds) == {"bamboo-grove", "river-crossing", "cliff-steps", "summit-shrine"}
    