from fastapi.testclient import TestClient

from events import Event
from main import app, get_event_writer


class FakeWriter:
    def __init__(self) -> None:
        self.events: list[Event] = []

    def write(self, event: Event) -> None:
        self.events.append(event)


client = TestClient(app)


def test_records_a_valid_event():
    fake = FakeWriter()
    app.dependency_overrides[get_event_writer] = lambda: fake
    try:
        response = client.post(
            "/events",
            json={
                "event_name": "experiment_viewed",
                "visitor_id": "v-123",
                "properties": {"experiment_id": "offer-card-layout", "variation_id": "1"}
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 202
    assert len(fake.events) == 1
    assert fake.events[0].properties["variation_id"] == "1"


def test_rejects_an_unknown_event_name():
    app.dependency_overrides[get_event_writer] = lambda: FakeWriter()
    try:
        response = client.post("/events", json={"event_name": "nope", "visitor_id": "v-1"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


def test_returns_503_without_a_database():
    response = client.post("/events", json={"event_name": "checkout_started", "visitor_id": "v-1"})

    assert response.status_code == 503