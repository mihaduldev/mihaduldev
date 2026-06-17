-- Abuse hardening for the public AI assistant endpoint.

-- Coarse rate-limit counters (keyed by an arbitrary bucket string + expiry).
CREATE TABLE IF NOT EXISTS chat_rate (
  k   TEXT PRIMARY KEY,
  n   INTEGER NOT NULL DEFAULT 0,
  exp INTEGER NOT NULL DEFAULT 0
);

-- Exactly one conversation per session — closes the first-turn duplicate race
-- (SELECT-then-INSERT could otherwise create two rows for the same session).
DROP INDEX IF EXISTS idx_chat_conv_session;
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_conv_session_unique ON chat_conversations(session_id);
