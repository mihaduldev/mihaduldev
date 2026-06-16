import { getCloudflareContext } from "@opennextjs/cloudflare";

export type DB = CloudflareEnv["DB"];

/** Cloudflare env (bindings + vars), or null when not running on the CF
 *  runtime (e.g. a plain `next build`/sandbox) — callers fall back gracefully. */
export async function getEnv(): Promise<CloudflareEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv) ?? null;
  } catch {
    return null;
  }
}

export async function getDB(): Promise<DB | null> {
  const env = await getEnv();
  return env?.DB ?? null;
}

/** D1 is required for this operation (admin writes). Throws a clear error. */
export async function requireDB(): Promise<DB> {
  const db = await getDB();
  if (!db) {
    throw new Error(
      "Database unavailable. This action needs the Cloudflare D1 binding (run via wrangler / deploy to Cloudflare)."
    );
  }
  return db;
}

/** Run a read against D1, falling back to `fallback` if D1 is missing OR the
 *  query errors (e.g. table not migrated yet / sandbox). Keeps pages resilient. */
export async function query<T>(
  run: (db: DB) => Promise<T>,
  fallback: T
): Promise<T> {
  const db = await getDB();
  if (!db) return fallback;
  try {
    return await run(db);
  } catch {
    return fallback;
  }
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
