-- Schema for the portfolio backend (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS experiences (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  period      TEXT NOT NULL,
  title       TEXT NOT NULL,
  org         TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'Server',
  tags_json   TEXT NOT NULL DEFAULT '[]',
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  focus_json  TEXT NOT NULL DEFAULT '[]',
  repo        TEXT NOT NULL DEFAULT '',
  featured    INTEGER NOT NULL DEFAULT 0,
  accent      TEXT NOT NULL DEFAULT '#087EA4',
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS skill_groups (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'Server',
  description TEXT NOT NULL DEFAULT '',
  skills_json TEXT NOT NULL DEFAULT '[]',
  sort        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body_md      TEXT NOT NULL DEFAULT '',
  tags_json    TEXT NOT NULL DEFAULT '[]',
  cover        TEXT NOT NULL DEFAULT 'from-[#087EA4] to-[#58C4DC]',
  reading_time TEXT NOT NULL DEFAULT '',
  published    INTEGER NOT NULL DEFAULT 1,
  published_at TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  country    TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_posts_pub ON posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exp_sort ON experiences(sort);
CREATE INDEX IF NOT EXISTS idx_proj_sort ON projects(sort);
CREATE INDEX IF NOT EXISTS idx_skill_sort ON skill_groups(sort);
