import time
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from auth import bearer_header, check_token
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

settings = load_settings()
logger = configure_logging(settings.log_level)

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