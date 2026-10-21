import time
from typing import Annotated

import anthropic
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from auth import bearer_header, check_token
from challenges import PublicChallenge, challenges_for_belt, get_challenge, is_unlocked
from config import load_settings
from entitlements import (
	DEMO_ADDONS,
	DEMO_BELT,
	DEMO_USER_ID,
	Entitlements,
	entitlements_for,
)
from events import Event, EventWriter, PostgresEventWriter
from logging_config import configure_logging
from sensei import AnthropicHintStreamer, HintStreamer, hint_lines

settings = load_settings()
logger = configure_logging(settings.log_level)

anthropic_client = (
	anthropic.Anthropic(api_key=settings.anthropic_api_key, timeout=30.0)
	if settings.anthropic_api_key
	else None
)

app = FastAPI(title="Ninja Mountain API", version=settings.app_version)

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
	start = time.perf_counter()
	response = await call_next(request)
	duration_ms = round((time.perf_counter() - start) * 1000, 1)
	logger.info(
		"request",
		extra={
			"fields": {
				"method": request.method,
				"path": request.url.path,
				"status": response.status_code,
				"duration_ms": duration_ms,
			}
		},
	)
	return response


def get_event_writer() -> EventWriter:
	if settings.database_url is None:
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Event storage is not configured",
		)
	return PostgresEventWriter(settings.database_url)



def get_hint_streamer() -> HintStreamer | None:
	if anthropic_client is None:
		return None
	return AnthropicHintStreamer(anthropic_client, settings.sensei_model)

class HintRequest(BaseModel):
	challenge_id: str = Field(min_length=1, max_length=64)
	question: str = Field(min_length=1, max_length=500)

@app.get("/")
def read_root():
	return {"message": "Ninja Mountain API is awake and deployed!"}


@app.get("/health")
def health_check():
	return {"status": "ok", "version": settings.app_version}


@app.get("/projects")
def list_projects():
	return [
		{
			"title": "APIs for TSEs",
			"href": "onboard",
			"slug": "api-onboard",
			"status": "Started",
			"description": "A playground for TSEs to master API skills.",
		},
		{
			"title": "Support Triage Assistant",
			"href": "triage",
			"slug": "support-triage",
			"status": "Started",
			"description": "Classify and route support tickets with Claude.",
		},
		{
			"title": "Training Notes",
			"href": "notes",
			"slug": "dev-notes",
			"status": "Started",
			"description": "Notes from rebuilding local web development muscle memory.",
		},
		{
			"title": "Photo Dojo",
			"href": "gallery",
			"slug": "photo-dojo",
			"status": "Coming Soon",
			"description": "A place to upload, organize, and connect photos from the phone archive.",
		},
		{
			"title": "Connection Magic",
			"href": "connect",
			"slug": "connection-map",
			"status": "Idea",
			"description": "A visual experiment for connecting projects, photos, places, and memories.",
		},
	]


@app.get("/entitlements/me")
def my_entitlements(authorization: str | None = Depends(bearer_header)) -> Entitlements:
	check_token(settings.api_token, authorization)
	return entitlements_for(DEMO_USER_ID, DEMO_BELT, DEMO_ADDONS)


@app.post("/events", status_code=status.HTTP_202_ACCEPTED)
def record_event(
	event: Event,
	writer: Annotated[EventWriter, Depends(get_event_writer)],
) -> dict[str, str]:
	writer.write(event)
	return {"status": "accepted"}



@app.get("/sensei/challenges")
def sensei_challenges(
	authorization: Annotated[str | None, Depends(bearer_header)],
) -> list[PublicChallenge]:
	check_token(settings.api_token, authorization)
	return challenges_for_belt(DEMO_BELT)


@app.post("/sensei/hint")
def sensei_hint(
	body: HintRequest,
	authorization: Annotated[str | None, Depends(bearer_header)],
	streamer: Annotated[HintStreamer | None, Depends(get_hint_streamer)],
) -> StreamingResponse:
	check_token(settings.api_token, authorization)
	if streamer is None:
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="The Sensei is not configured",
		)
	challenge = get_challenge(body.challenge_id)
	if challenge is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown challenge")
	if not is_unlocked(challenge, DEMO_BELT):
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Upgrade your belt to unlock this training ground",
		)
	return StreamingResponse(
		hint_lines(streamer, challenge, body.question),
		media_type="application/x-ndjson",
		headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
	)