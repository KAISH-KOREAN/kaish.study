CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  received_at INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  path TEXT NOT NULL,
  screen TEXT NOT NULL DEFAULT '',
  lesson TEXT NOT NULL DEFAULT '',
  attempt_id TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  seconds INTEGER NOT NULL DEFAULT 0,
  ip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS events_time ON events(received_at);
CREATE INDEX IF NOT EXISTS events_session ON events(session_id, id);
CREATE INDEX IF NOT EXISTS events_attempt ON events(attempt_id);
