-- Editable site settings (hero content, scroll/motion behavior, …).
-- Key → JSON value. Primary-key lookups stay O(1) as settings grow.
CREATE TABLE IF NOT EXISTS settings (
  k          TEXT PRIMARY KEY,
  v          TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
