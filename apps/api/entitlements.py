from typing import Literal

from pydantic import BaseModel

Belt = Literal["white-belt", "brown-belt", "black-belt"]

BELT_GROUNDS: dict[Belt, list[str]] = {
	"white-belt": ["bamboo-grove"],
	"brown-belt": ["bamboo-grove", "river-crossing", "cliff-steps"],
	"black-belt": ["bamboo-grove", "river-crossing", "cliff-steps", "summit-shrine"],
}

DEMO_USER_ID = "demo"
DEMO_BELT: Belt = "brown-belt"
DEMO_ADDONS = ["lantern-gear-pack"]

class Entitlements(BaseModel):
	user_id: str
	belt: Belt
	unlocked_grounds: list[str]
	owned_addons: list[str]
	
def entitlements_for(user_id: str, belt: Belt, owned_addons: list[str]) -> Entitlements:
	return Entitlements(
		user_id=user_id,
		belt=belt,
		unlocked_grounds=BELT_GROUNDS[belt],
		owned_addons=owned_addons,
	)