import { getDB, query, parseJson } from "./client";

export type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  country: string | null;
  createdAt: number;
};

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  country?: string | null;
};

function toContact(r: Record<string, unknown>): Contact {
  return {
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    message: String(r.message),
    country: (r.country as string | null) ?? null,
    createdAt: Number(r.created_at),
  };
}

export async function listContacts(): Promise<Contact[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM contacts ORDER BY created_at DESC, id DESC LIMIT 200")
      .all();
    return results.map(toContact);
  }, []);
}

export async function countContacts(): Promise<number> {
  return query(async (db) => {
    const row = await db.prepare("SELECT COUNT(*) AS n FROM contacts").first<{ n: number }>();
    return Number(row?.n ?? 0);
  }, 0);
}

/** Saves a submission. No-op (returns false) when D1 is unavailable (dev),
 *  so the public form still succeeds visually; saves for real in production. */
export async function createContact(input: ContactInput): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;
  await db
    .prepare("INSERT INTO contacts (name, email, message, country) VALUES (?, ?, ?, ?)")
    .bind(input.name, input.email, input.message, input.country ?? null)
    .run();
  return true;
}

// re-export so admin pages can import counts helper alongside
export { parseJson };
