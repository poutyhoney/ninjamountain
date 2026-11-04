import argparse
import os

from agentmail import AgentMail
from agentmail.inboxes import CreateInboxRequest
from dotenv import load_dotenv

USERNAME = "ninja-sensei"
DISPLAY_NAME = "Ninja Mountain Sensei"
CLIENT_ID = "ninja-sensei-v1"


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Create the Sensei inbox and send a test email.")
	parser.add_argument("--to", help="Send a test email to this address.")
	return parser.parse_args()


def main() -> None:
	load_dotenv()
	args = parse_args()
	client = AgentMail(api_key=os.environ["AGENTMAIL_API_KEY"])

	inbox = client.inboxes.create(
		request=CreateInboxRequest(
			username=USERNAME,
			display_name=DISPLAY_NAME,
			client_id=CLIENT_ID,
		)
	)
	print(f"Inbox ready: {inbox.inbox_id}")

	if args.to:
		client.inboxes.messages.send(
			inbox.inbox_id,
			to=args.to,
			subject="The Sensei has an inbox",
			text="Reply to this email with a coding question and the Sensei will answer.",
		)
		print(f"Test email sent to {args.to}")


if __name__ == "__main__":
	main()