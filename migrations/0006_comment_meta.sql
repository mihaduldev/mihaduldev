-- Capture request metadata per comment so the admin can review who posted.
ALTER TABLE comments ADD COLUMN country    TEXT;
ALTER TABLE comments ADD COLUMN ip         TEXT;
ALTER TABLE comments ADD COLUMN user_agent TEXT;
