import argparse
import json
import math
import statistics
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import anthropic

from challenges import CHALLENGES
from config import load_settings
from evals.grading import JUDGE_MODEL, grade, judge_hint
from sensei import AnthropicHintStreamer, SenseiError, build_system_prompt

API_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = API_DIR.parents[1]
CASES_PATH = API_DIR / "evals" / "sensei_hints.jsonl"
FLOW_DIR = REPO_ROOT / ".claude" / "hillclimb" / "sensei-hints"

PRICES = {
	"claude-opus-5-5": (4.00, 20.00),
	"claude-sonnet-5-5": (2.00, 10.00),
	"claude-haiku-5-5": (0.10, 0.50),
}

KNOWN_BAD_HINTS = ["", "I don't know.", "The capital of France is Paris."]


def load_cases(only: str | None) -> list[dict]:
	cases = [json.loads(line) for line in CASES_PATH.read_text().splitlines() if line.strip()]
	if only:
		wanted = set(only.split(","))
		cases = [case for case in cases if case["id"] in wanted]
		missing = wanted - {case["id"] for case in cases}
		if missing:
			raise SystemExit(f"Unknown case ids: {sorted(missing)}")
	return cases


def usage_dict(message: anthropic.types.Message) -> dict[str, int]:
	usage = message.usage
	return {
		"input_tokens": usage.input_tokens,
		"output_tokens": usage.output_tokens,
		"cache_read_input_tokens": usage.cache_read_input_tokens or 0,
		"cache_creation_input_tokens": usage.cache_creation_input_tokens or 0,
	}


def cost_usd(model: str, usage: dict[str, int]) -> float:
	price_in, price_out = PRICES[model]
	return (
		usage["input_tokens"] * price_in
		+ usage["cache_creation_input_tokens"] * price_in * 1.25
		+ usage["cache_read_input_tokens"] * price_in * 0.1
		+ usage["output_tokens"] * price_out
	) / 1_000_000


class Recorder:
	def __init__(self, variant_dir: Path) -> None:
		self.results_path = variant_dir / "results.jsonl"
		self.errors_path = variant_dir / "errors.jsonl"
		self.traces_dir = variant_dir / "traces"
		self.traces_dir.mkdir(parents=True, exist_ok=True)
		self.lock = threading.Lock()

	def done(self) -> set[tuple[str, int]]:
		if not self.results_path.exists():
			return set()
		rows = [json.loads(line) for line in self.results_path.read_text().splitlines() if line]
		return {(row["prompt_id"], row["rep"]) for row in rows}

	def write(self, row: dict, trace: list[dict]) -> None:
		trace_path = self.traces_dir / f"{row['prompt_id']}_rep{row['rep']}.json"
		with self.lock:
			trace_path.write_text(json.dumps(trace, indent=2))
			with self.results_path.open("a") as file:
				file.write(json.dumps(row) + "\n")

	def error(self, case: dict, rep: int, failure_class: str, message: str) -> None:
		line = {"prompt_id": case["id"], "rep": rep, "failure_class": failure_class, "message": message}
		with self.lock, self.errors_path.open("a") as file:
			file.write(json.dumps(line) + "\n")
		print(f"  ERROR {case['id']} rep {rep}: {failure_class}: {message}")


def run_case(client: anthropic.Anthropic, model: str, case: dict, rep: int, recorder: Recorder) -> None:
	challenge = CHALLENGES[case["challenge_id"]]
	streamer = AnthropicHintStreamer(client, model)
	start = time.perf_counter()
	first_text_s = None
	parts: list[str] = []

	try:
		for text in streamer.stream_hint(challenge, case["question"]):
			if first_text_s is None:
				first_text_s = time.perf_counter() - start
			parts.append(text)
	except SenseiError as error:
		refused = streamer.last_message is not None and streamer.last_message.stop_reason == "refusal"
		recorder.error(case, rep, "refusal" if refused else "api_error", str(error))
		return

	latency_s = time.perf_counter() - start
	message = streamer.last_message
	if message is None or message.model != model:
		served = message.model if message else "nothing"
		recorder.error(case, rep, "model_mismatch", f"asked for {model}, served {served}")
		return

	hint = "".join(parts)
	try:
		verdict, judge_response = judge_hint(client, challenge, case["question"], hint)
	except (anthropic.APIError, ValueError) as error:
		recorder.error(case, rep, "judge_error", str(error))
		return

	usage = usage_dict(message)
	judge_usage = usage_dict(judge_response)
	row = {
		"prompt_id": case["id"],
		"prompt": case["question"],
		"tags": [case["kind"], case["challenge_id"]],
		"rep": rep,
		"model": message.model,
		"usage": usage,
		"judge_model": judge_response.model,
		"judge_usage": judge_usage,
		"stop_reason": message.stop_reason,
		"status": "truncated" if message.stop_reason == "max_tokens" else "ok",
		"grade": grade(hint, challenge, verdict),
		"explanation": {"good_hint": verdict.explanation},
		"latency_s": round(latency_s, 2),
		"first_text_s": round(first_text_s or latency_s, 2),
		"output_words": len(hint.split()),
		"cost_usd": round(cost_usd(message.model, usage) + cost_usd(judge_response.model, judge_usage), 5),
		"meta": {"hint": hint},
	}
	trace = [
		{"role": "system", "content": build_system_prompt(challenge)},
		{"role": "user", "content": case["question"]},
		{"role": "assistant", "content": hint},
	]
	recorder.write(row, trace)
	print(f"  {case['id']} rep {rep}: good_hint={row['grade']['good_hint']:.0f}")


def summarize(recorder: Recorder) -> None:
	if not recorder.results_path.exists():
		print("No results yet.")
		return
	rows = [json.loads(line) for line in recorder.results_path.read_text().splitlines() if line]
	ok = [row for row in rows if row["status"] == "ok"]
	errors = len(recorder.errors_path.read_text().splitlines()) if recorder.errors_path.exists() else 0
	print(f"\n{len(ok)} scored hints, {len(rows) - len(ok)} truncated, {errors} errors")
	for metric in ok[0]["grade"] if ok else []:
		scores = [row["grade"][metric] for row in ok]
		mean = sum(scores) / len(scores)
		half_width = 1.96 * math.sqrt(mean * (1 - mean) / len(scores))
		print(f"  {metric:<16} {mean:6.1%}  +/- {half_width:.1%}")
	if ok:
		print(f"  median latency   {statistics.median(row['latency_s'] for row in ok):.2f} s")
		print(f"  mean words       {statistics.mean(row['output_words'] for row in ok):.0f}")
		print(f"  cost per hint    ${statistics.mean(row['cost_usd'] for row in ok):.4f} (hint + judge)")
		print(f"  total spent      ${sum(row['cost_usd'] for row in rows):.3f}")


def judge_check(client: anthropic.Anthropic) -> None:
	challenge = CHALLENGES["bamboo-grove-growth"]
	passed = 0
	for hint in KNOWN_BAD_HINTS:
		verdict, _ = judge_hint(client, challenge, "Where do I start?", hint)
		good = grade(hint, challenge, verdict)["good_hint"]
		passed += int(good)
		print(f"  {hint!r}: good_hint={good:.0f} ({verdict.explanation})")
	if passed:
		raise SystemExit(f"Judge passed {passed} hint(s) that should fail.")
	print("Judge failed all known-bad hints, as it should.")


def main() -> None:
	settings = load_settings()
	parser = argparse.ArgumentParser(description="Score Sensei hints on the eval set.")
	parser.add_argument("--variant", default="baseline")
	parser.add_argument("--model", default=settings.sensei_model)
	parser.add_argument("--reps", type=int, default=3)
	parser.add_argument("--only", help="Comma-separated case ids, for a pilot run")
	parser.add_argument("--workers", type=int, default=4)
	parser.add_argument("--judge-check", action="store_true")
	args = parser.parse_args()

	if not settings.anthropic_api_key:
		raise SystemExit("Set ANTHROPIC_API_KEY first.")
	client = anthropic.Anthropic(api_key=settings.anthropic_api_key, timeout=60.0, max_retries=4)

	if args.judge_check:
		judge_check(client)
		return

	recorder = Recorder(FLOW_DIR / args.variant)
	done = recorder.done()
	jobs = [
		(case, rep)
		for case in load_cases(args.only)
		for rep in range(args.reps)
		if (case["id"], rep) not in done
	]
	print(f"{len(jobs)} hints to run on {args.model}, judged by {JUDGE_MODEL} ({len(done)} already done)")
	with ThreadPoolExecutor(max_workers=args.workers) as pool:
		for case, rep in jobs:
			pool.submit(run_case, client, args.model, case, rep, recorder)
	summarize(recorder)


if __name__ == "__main__":
	main()