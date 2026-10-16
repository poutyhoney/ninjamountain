import json
import logging

from logging_config import JsonFormatter


def test_json_formatter_includes_extra_fields():
	record = logging.LogRecord(
		name="api",
		level=logging.INFO,
		pathname=__file__,
		lineno=1,
		msg="request",
		args=None,
		exc_info=None,
	)
	record.fields = {"method": "GET", "path": "/health", "status": 200}

	entry = json.loads(JsonFormatter().format(record))

	assert entry["level"] == "INFO"
	assert entry["message"] == "request"
	assert entry["method"] == "GET"
	assert entry["path"] == "/health"
	assert entry["status"] == 200