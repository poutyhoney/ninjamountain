from collections import Counter

from challenges import CHALLENGES, challenges_for_belt, get_challenge, is_unlocked
from entitlements import BELT_GROUNDS


def test_two_challenges_per_ground():
	counts = Counter(challenge.ground for challenge in CHALLENGES.values())
	assert counts == {ground: 2 for ground in BELT_GROUNDS["black-belt"]}


def test_white_belt_sees_only_bamboo_grove():
	grounds = {challenge.ground for challenge in challenges_for_belt("white-belt")}
	assert grounds == {"bamboo-grove"}


def test_black_belt_sees_everything():
	assert len(challenges_for_belt("black-belt")) == len(CHALLENGES)


def test_public_challenges_have_no_solution():
	for challenge in challenges_for_belt("black-belt"):
		dumped = challenge.model_dump()
		assert "solution" not in dumped
		assert "key_terms" not in dumped


def test_unknown_challenge_is_none():
	assert get_challenge("no-such-challenge") is None


def test_locked_ground_for_brown_belt():
	shrine = get_challenge("summit-shrine-bell")
	assert shrine is not None
	assert not is_unlocked(shrine, "brown-belt")