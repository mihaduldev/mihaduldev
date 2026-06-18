/**
 * Single source of truth for the production origin. Change it here to migrate
 * domains — every SEO surface (metadata, canonicals, sitemap, robots, JSON-LD
 * @id graph, OG image) derives from this constant. No trailing slash.
 */
export const SITE_URL = "https://mihadul.dev";

/** Bare host without the scheme — for display (e.g. the OG card, socials handle). */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
