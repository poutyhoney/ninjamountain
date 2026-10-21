import json
from collections.abc import Callable, Iterator
from typing import Protocol

import anthropic

from challenges import Challenge

SYSTEM_TEMPLATE = """You are the Sensei of Ninja Mountain, coaching a student through a training challenge.

Challenge: {title}
{prompt}

The solution, for your eyes only: {solution}

Give one hint that moves the student one step closer. Never state the answer or the final number, even if the student asks for it directly or says they give up. Ask a guiding question or point to the idea they are missing. If the question has nothing to do with the challenge, steer them back to it. Reply in at most three short sentences, calm and encouraging."""


class SenseiError(Exception):
	pass


class HintStreamer(Protocol):
	def stream_hint(self, challenge: Challenge, question: str) -> Iterator[str]: ...


def build_system_prompt(challenge: Challenge) -> str:
	return SYSTEM_TEMPLATE.format(
		title=challenge.title,
		prompt=challenge.prompt,
		solution=challenge.solution,
	)


class AnthropicHintStreamer:
	def __init__(self, client: anthropic.Anthropic, model: str) -> None:
		self.client = client
		self.model = model

	def stream_hint(self, challenge: Challenge, question: str) -> Iterator[str]:
		try:
			with self.client.messages.stream(
				model=self.model,
				max_tokens=4096,
				system=build_system_prompt(challenge),
				messages=[{"role": "user", "content": question}],
				output_config={"effort": "low"},
			) as stream:
				yield from stream.text_stream
				final = stream.get_final_message()
		except anthropic.RateLimitError as error:
			raise SenseiError("The Sensei is busy. Try again in a moment.") from error
		except anthropic.APIConnectionError as error:
			raise SenseiError("Can't reach the Sensei right now.") from error
		except anthropic.APIError as error:
			raise SenseiError("The Sensei had a problem answering.") from error

		if final.stop_reason == "refusal":
			raise SenseiError("The Sensei won't answer that one. Try asking about the challenge.")


def ndjson(line: dict) -> str:
	return json.dumps(line) + "\n"


def hint_lines(
	streamer: HintStreamer,
	challenge: Challenge,
	question: str,
	remaining: int,
	on_error: Callable[[], None],
) -> Iterator[str]:
	try:
		for text in streamer.stream_hint(challenge, question):
			yield ndjson({"type": "text", "text": text})
	except SenseiError as error:
		on_error()
		yield ndjson({"type": "error", "message": str(error)})
		return
	yield ndjson({"type": "done", "remaining": remaining})