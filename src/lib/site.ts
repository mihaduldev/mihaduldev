/**
 * Single source of truth for the production origin. Change it here to migrate
 * domains — every SEO surface (metadata, canonicals, sitemap, robots, JSON-LD
 * @id graph, OG image) derives from this constant. No trailing slash.
 */
export const SITE_URL = "https://www.mihadul.dev";

/** Bare host without the scheme — for display (e.g. the OG card, socials handle). */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

/** Stable "site last meaningfully updated" date (YYYY-MM-DD) for sitemap lastmod
 *  of non-content routes and ProfilePage dateModified. Bump on significant
 *  changes — kept stable (not build-time) so crawlers don't learn to ignore it. */
export const SITE_UPDATED = "2026-06-18";
