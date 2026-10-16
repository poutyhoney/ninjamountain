import json
import logging


class JsonFormatter(logging.Formatter):
	def format(self, record: logging.LogRecord) -> str:
		entry = {
			"time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
			"level": record.levelname,
			"message": record.getMessage(),
		}
		entry.update(getattr(record, "fields", {}))
		return json.dumps(entry)


def configure_logging(level: str) -> logging.Logger:
	handler = logging.StreamHandler()
	handler.setFormatter(JsonFormatter())
	logger = logging.getLogger("api")
	logger.handlers = [handler]
	logger.setLevel(level)
	logger.propagate = False
	return logger