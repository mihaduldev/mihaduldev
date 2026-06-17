import { getDB, query, parseJson } from "./client";
import { profile } from "@/lib/data";

/* ---------- editable hero content ---------- */
export type HeroContent = {
  name: string;
  roleLead: string; // bold part, e.g. "Full-Stack .NET Engineer"
  roleAccent: string; // cyan continuation, e.g. " · Cloud · System Design · AI Integrations"
  description: string;
  availability: string; // availability badge text
  proof: string[]; // proof chips
};

export const heroDefaults: HeroContent = {
  name: profile.name,
  roleLead: "Full-Stack .NET Engineer",
  roleAccent: " · Cloud · System Design · AI Integrations",
  description:
    "I build full-stack applications across the .NET ecosystem — scalable backends, clean APIs, and modern web frontends — with cloud-ready delivery and practical AI integrations that help real businesses operate faster and more reliably.",
  availability: "Available for full-stack, cloud & AI integration projects",
  proof: ["Clean Architecture", "Cloud-ready Delivery", "Practical AI"],
};

/* ---------- scroll / motion behavior ---------- */
export type ScrollMode = "glide" | "snap" | "native";
export type ScrollEasing = "smootherstep" | "easeInOut" | "easeOut" | "linear";
export type ScrollSettings = {
  mode: ScrollMode; // glide (paged), snap (instant), native (browser default)
  durationMs: number; // glide length
  easing: ScrollEasing;
};

export const scrollDefaults: ScrollSettings = {
  mode: "glide",
  durationMs: 1650,
  easing: "smootherstep",
};

/* ---------- generic key→JSON accessors (O(1) PK lookup) ---------- */
async function getSetting<T>(key: string, fallback: T): Promise<T> {
  return query(async (db) => {
    const row = await db
      .prepare("SELECT v FROM settings WHERE k = ?")
      .bind(key)
      .first<{ v: string }>();
    if (!row) return fallback;
    const parsed = parseJson<Partial<T> | null>(row.v, null);
    // merge over defaults so new fields are forward-compatible
    return parsed ? { ...fallback, ...parsed } : fallback;
  }, fallback);
}

async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db
    .prepare(
      "INSERT INTO settings (k, v, updated_at) VALUES (?, ?, unixepoch()) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = unixepoch()"
    )
    .bind(key, JSON.stringify(value))
    .run();
}

export const getHeroContent = () => getSetting<HeroContent>("hero", heroDefaults);
export const getScrollSettings = () => getSetting<ScrollSettings>("scroll", scrollDefaults);
export const saveHeroContent = (v: HeroContent) => setSetting("hero", v);
export const saveScrollSettings = (v: ScrollSettings) => setSetting("scroll", v);
