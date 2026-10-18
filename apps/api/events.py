from typing import Any, Literal, Protocol

import psycopg
from psycopg.types.json import Jsonb
from pydantic import BaseModel, Field

EventName = Literal["experiment_viewed", "checkout_started"]


class Event(BaseModel):
	event_name: EventName
	visitor_id: str = Field(min_length=1, max_length=64)
	properties: dict[str, Any] = Field(default_factory=dict)


class EventWriter(Protocol):
	def write(self, event: Event) -> None: ...


class PostgresEventWriter:
	def __init__(self, database_url: str) -> None:
		self.database_url = database_url

	def write(self, event: Event) -> None:
		with psycopg.connect(self.database_url) as conn:
			conn.execute(
				"INSERT INTO events (event_name, visitor_id, properties) VALUES (%s, %s, %s)",
				(event.event_name, event.visitor_id, Jsonb(event.properties)),
			)