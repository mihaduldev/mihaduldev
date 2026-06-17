-- Blog engagement: threaded comments + per-post like/dislike reactions.

CREATE TABLE IF NOT EXISTS comments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug    TEXT NOT NULL,
  parent_id    INTEGER,                       -- NULL = top-level; else a reply
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL,                 -- stored for moderation, never shown publicly
  body         TEXT NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(post_slug, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

CREATE TABLE IF NOT EXISTS reactions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug    TEXT NOT NULL,
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'like',  -- 'like' | 'dislike'
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(post_slug, author_email)             -- one reaction per person per post (switchable)
);
CREATE INDEX IF NOT EXISTS idx_reactions_slug ON reactions(post_slug);
