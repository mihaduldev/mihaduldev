-- AI assistant: client conversations + messages + a cached project brief.

CREATE TABLE IF NOT EXISTS chat_conversations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id    TEXT NOT NULL,              -- anonymous client id (localStorage)
  visitor_name  TEXT,
  visitor_email TEXT,
  overview_json TEXT,                        -- cached LLM-extracted project brief (JSON)
  overview_at   INTEGER NOT NULL DEFAULT 0,  -- message_count when the brief was generated
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_chat_conv_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_updated ON chat_conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role            TEXT NOT NULL,             -- 'user' | 'assistant'
  content         TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id, id);
