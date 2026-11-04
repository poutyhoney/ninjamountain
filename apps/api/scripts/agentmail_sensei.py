import argparse
import os
import time

import anthropic
from agentmail import AgentMail
from dotenv import load_dotenv

INBOX_ID = "ninja-sensei@agentmail.to"
DEFAULT_MODEL = "claude-opus-5-5"
POLL_SECONDS = 15

SYSTEM_PROMPT = """You are the Sensei of Ninja Mountain, a calm coding coach answering a student by email.

Give one hint that moves the student one step closer. Do not hand over the full solution. Ask a guiding question or point to the idea they are missing. Reply in three to five short sentences, plain text only, and sign off as "The Sensei"."""


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Answer emails sent to the Sensei inbox.")
	parser.add_argument("--watch", action="store_true", help="Keep checking for new email.")
	return parser.parse_args()


def ask_sensei(claude: anthropic.Anthropic, model: str, question: str) -> str:
	response = claude.messages.create(
		model=model,
		max_tokens=1024,
		system=SYSTEM_PROMPT,
		messages=[{"role": "user", "content": question}],
		output_config={"effort": "low"},
	)
	return "".join(block.text for block in response.content if block.type == "text")


def answer_new_mail(mail: AgentMail, claude: anthropic.Anthropic, model: str) -> int:
	answered = 0
	for item in mail.inboxes.threads.list(INBOX_ID, limit=20).threads:
		thread = mail.inboxes.threads.get(INBOX_ID, item.thread_id)
		last = max(thread.messages, key=lambda message: message.timestamp)
		if INBOX_ID in last.from_:
			continue

		question = last.extracted_text or last.text or ""
		print(f"Question from {last.from_}: {question.strip()[:80]}")
		hint = ask_sensei(claude, model, question)
		mail.inboxes.messages.reply(INBOX_ID, last.message_id, text=hint)
		mail.inboxes.messages.update(INBOX_ID, last.message_id, add_labels=["replied"])
		answered += 1
	return answered


def main() -> None:
	load_dotenv()
	args = parse_args()
	mail = AgentMail(api_key=os.environ["AGENTMAIL_API_KEY"])
	claude = anthropic.Anthropic()
	model = os.environ.get("SENSEI_MODEL") or DEFAULT_MODEL

	while True:
		answered = answer_new_mail(mail, claude, model)
		print(f"Answered {answered} new email(s).")
		if not args.watch:
			break
		time.sleep(POLL_SECONDS)


if __name__ == "__main__":
	main()