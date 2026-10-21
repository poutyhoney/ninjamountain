from dataclasses import dataclass

from pydantic import BaseModel

from entitlements import BELT_GROUNDS, Belt


@dataclass(frozen=True)
class Challenge:
	id: str
	ground: str
	title: str
	prompt: str
	solution: str
	key_terms: tuple[str, ...]


class PublicChallenge(BaseModel):
	id: str
	ground: str
	title: str
	prompt: str


CHALLENGES: dict[str, Challenge] = {
	challenge.id: challenge
	for challenge in [
		Challenge(
			id="bamboo-grove-growth",
			ground="bamboo-grove",
			title="The Doubling Stalk",
			prompt="A bamboo stalk doubles in height every day. On day 12 it reaches the top of the grove. On which day was it halfway?",
			solution="Day 11. It doubles each day, so it was half as tall the day before it reached the top.",
			key_terms=("11", "eleven"),
		),
		Challenge(
			id="bamboo-grove-bows",
			ground="bamboo-grove",
			title="Courtesy Circle",
			prompt="Eight students meet in the grove. Each student bows to every other student exactly once. How many bows is that?",
			solution="28. Each of 8 students bows to 7 others, which counts each pair twice: 8 x 7 / 2 = 28.",
			key_terms=("28", "twenty-eight"),
		),
		Challenge(
			id="river-crossing-incense",
			ground="river-crossing",
			title="Two Incense Sticks",
			prompt="You have two incense sticks. Each burns for exactly 60 minutes, but unevenly. How do you measure exactly 45 minutes before crossing?",
			solution="Light stick A at both ends and stick B at one end. When A burns out (30 minutes), light the other end of B. B burns out 15 minutes later.",
			key_terms=("both ends",),
		),
		Challenge(
			id="river-crossing-stones",
			ground="river-crossing",
			title="Stepping Stones",
			prompt="Ten stepping stones cross the river. From the bank you can step onto the next stone or skip one. How many different ways can you reach the tenth stone?",
			solution="89. The ways to reach each stone are the sum of the ways to reach the two stones before it: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89.",
			key_terms=("89", "eighty-nine"),
		),
		Challenge(
			id="cliff-steps-climb",
			ground="cliff-steps",
			title="The Slipping Climber",
			prompt="A climber goes up 3 meters each day and slides back 2 meters each night. The cliff is 20 meters high. On which day does she reach the top?",
			solution="Day 18. After 17 days she is at 17 meters, and on day 18 she climbs the last 3 before she can slip.",
			key_terms=("18", "eighteen"),
		),
		Challenge(
			id="cliff-steps-shuriken",
			ground="cliff-steps",
			title="The Heavy Shuriken",
			prompt="Nine shuriken look the same, but one is slightly heavier. Using a balance scale, what is the fewest number of weighings that always finds it?",
			solution="Two. Split them into three groups of three and weigh two groups; the heavier side (or the group left out) has it. Then weigh two of those three.",
			key_terms=("two weighings", "2 weighings", "groups of three"),
		),
		Challenge(
			id="summit-shrine-bell",
			ground="summit-shrine",
			title="The Shrine Bell",
			prompt="The shrine bell rings once at one o'clock, twice at two o'clock, and so on up to twelve times at twelve o'clock. How many times does it ring in a full day?",
			solution="156. One to twelve adds up to 78, and the cycle happens twice a day.",
			key_terms=("156", "78"),
		),
		Challenge(
			id="summit-shrine-guardians",
			ground="summit-shrine",
			title="The Two Guardians",
			prompt="Two gates lead to the shrine, each with a guardian. One guardian always tells the truth and one always lies. You may ask one guardian one question. How do you find the safe gate?",
			solution="Ask either guardian which gate the other guardian would say is safe, then take the opposite gate.",
			key_terms=("other guardian would say", "opposite gate"),
		),
	]
}


def get_challenge(challenge_id: str) -> Challenge | None:
	return CHALLENGES.get(challenge_id)


def is_unlocked(challenge: Challenge, belt: Belt) -> bool:
	return challenge.ground in BELT_GROUNDS[belt]


def challenges_for_belt(belt: Belt) -> list[PublicChallenge]:
	return [
		PublicChallenge(
			id=challenge.id,
			ground=challenge.ground,
			title=challenge.title,
			prompt=challenge.prompt,
		)
		for challenge in CHALLENGES.values()
		if is_unlocked(challenge, belt)
	]