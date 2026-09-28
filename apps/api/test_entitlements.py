import pytest
from fastapi.testclient import TestClient

from entitlements import BELT_GROUNDS, entitlements_for
from main import app

client = TestClient(app)


@pytest.mark.parametrize(
	("belt", "expected_count"),
	[("white-belt", 1), ("brown-belt", 3), ("black-belt", 4)],
)
def test_grounds_per_belt(belt, expected_count):
	result = entitlements_for("test-user", belt, [])
	assert len(result.unlocked_grounds) == expected_count


def test_higher_belts_keep_lower_grounds():
	white = set(BELT_GROUNDS["white-belt"])
	brown = set(BELT_GROUNDS["brown-belt"])
	black = set(BELT_GROUNDS["black-belt"])
	assert white <= brown <= black
	
def test_my_entitlements_endpoint():
	response = client.get("entitlements/me")
	assert response.status_code == 200
	body = response.json()
	assert set(body) == {"user_id", "belt", "unlocked_grounds", "owned_addons"}
	assert body["user_id"] == "demo"
	assert body["belt"] == "brown-belt"
	assert body["unlocked_grounds"] == BELT_GROUNDS["brown-belt"]