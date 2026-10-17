import pytest
from fastapi import HTTPException

from auth import check_token


def test_open_when_no_token_configured():
	check_token(None, None)


def test_rejects_missing_header():
	with pytest.raises(HTTPException) as error:
		check_token("s3cret", None)
	assert error.value.status_code == 401


def test_rejects_wrong_token():
	with pytest.raises(HTTPException) as error:
		check_token("s3cret", "Bearer nope")
	assert error.value.status_code == 401


def test_rejects_non_bearer_scheme():
	with pytest.raises(HTTPException) as error:
		check_token("s3cret", "Basic s3cret")
	assert error.value.status_code == 401


def test_accepts_correct_token():
	check_token("s3cret", "Bearer s3cret")