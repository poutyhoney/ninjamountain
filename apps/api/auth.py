import secrets

from fastapi import Header, HTTPException, status


def check_token(expected: str | None, authorization: str | None) -> None:
	if expected is None:
		return
	if authorization is None or not authorization.startswith("Bearer "):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
	provided = authorization.removeprefix("Bearer ")
	if not secrets.compare_digest(provided, expected):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def bearer_header(authorization: str | None = Header(default=None)) -> str | None:
	return authorization