import json
from collections.abc import Iterator

from challenges import get_challenge
from sensei import SenseiError, build_system_prompt, hint_lines

CHALLENGE = get_challenge("bamboo-grove-growth")
assert CHALLENGE is not None


class FakeStreamer:
	def __init__(self, chunks: list[str], fail_after: int | None = None) -> None:
		self.chunks = chunks
		self.fail_after = fail_after

	def stream_hint(self, challenge, question) -> Iterator[str]:
		for index, chunk in enumerate(self.chunks):
			if index == self.fail_after:
				raise SenseiError("The Sensei is busy. Try again in a moment.")
			yield chunk


def parse(lines) -> list[dict]:
	return [json.loads(line) for line in lines]


def test_system_prompt_includes_challenge_and_solution():
	prompt = build_system_prompt(CHALLENGE)
	assert CHALLENGE.title in prompt
	assert CHALLENGE.solution in prompt


def test_text_lines_then_done():
	lines = parse(hint_lines(FakeStreamer(["Think ", "about ", "yesterday."]), CHALLENGE, "help"))
	assert lines == [
		{"type": "text", "text": "Think "},
		{"type": "text", "text": "about "},
		{"type": "text", "text": "yesterday."},
		{"type": "done"},
	]


def test_error_mid_stream_becomes_error_line():
	lines = parse(hint_lines(FakeStreamer(["Think ", "about "], fail_after=1), CHALLENGE, "help"))
	assert lines == [
		{"type": "text", "text": "Think "},
		{"type": "error", "message": "The Sensei is busy. Try again in a moment."},
	]


def test_every_line_ends_with_newline():
	for line in hint_lines(FakeStreamer(["a", "b"]), CHALLENGE, "help"):
		assert line.endswith("\n")
		assert "\n" not in line[:-1]