CREATE TABLE IF NOT EXISTS events (
    id  BIGSERIAL   PRIMARY KEY,
    event_name  TEXT    NOT NULL,
    visitor_id  TEXT    NOT NULL,
    occurred_at  TIMESTAMPTZ NOT NULL DEFAULT    now(),
    properties  JSONB   NOT NULL DEFAULT   '{}'::jsonb 
);

CREATE INDEX IF NOT EXISTS events_name_time ON events (event_name, occurred_at);