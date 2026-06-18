-- Editable testimonials (managed from the admin panel).
CREATE TABLE IF NOT EXISTS testimonials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  quote      TEXT NOT NULL,
  name       TEXT NOT NULL,
  title      TEXT NOT NULL DEFAULT '',
  initials   TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials(sort);

INSERT INTO testimonials (quote, name, title, initials, sort) VALUES
('Mihadul turns vague requirements into clean, dependable backend systems. His APIs are a pleasure to integrate with, and the architecture always holds up as the product grows.', 'Engineering Lead', 'Enterprise SaaS Team', 'EL', 1),
('Pragmatic, security-minded, and fast. He shipped a Dockerized .NET service with CI/CD that just worked — readable code, clear docs, and zero drama in production.', 'Product Manager', 'Tourism Platform', 'PM', 2),
('His system design notes and mentoring leveled up our whole team. He explains the why behind every decision, which is rare and incredibly valuable.', 'Junior Developer', 'Mentee', 'JD', 3),
('We needed an AI workflow that was actually reliable, not a demo. Mihadul delivered a retrieval-based pipeline that''s been solid since day one.', 'Startup Founder', 'AI Product', 'SF', 4);
