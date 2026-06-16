import { query, requireDB, parseJson } from "./client";
import { experience as fallback } from "@/lib/data";

export type Experience = {
  id: number;
  period: string;
  title: string;
  org: string;
  description: string;
  icon: string;
  tags: string[];
  sort: number;
};

export type ExperienceInput = Omit<Experience, "id">;

function toExp(r: Record<string, unknown>): Experience {
  return {
    id: Number(r.id),
    period: String(r.period),
    title: String(r.title),
    org: String(r.org),
    description: String(r.description),
    icon: String(r.icon),
    tags: parseJson<string[]>(r.tags_json, []),
    sort: Number(r.sort),
  };
}

export async function listExperiences(): Promise<Experience[]> {
  const fb: Experience[] = fallback.map((e, i) => ({
    id: i + 1,
    period: e.period,
    title: e.title,
    org: e.org,
    description: e.description,
    icon: e.icon,
    tags: [...e.tags],
    sort: i + 1,
  }));
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM experiences ORDER BY sort ASC, id ASC")
      .all();
    return results.map(toExp);
  }, fb);
}

export async function getExperience(id: number): Promise<Experience | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM experiences WHERE id = ?").bind(id).first();
    return row ? toExp(row) : null;
  }, null);
}

export async function createExperience(input: ExperienceInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "INSERT INTO experiences (period, title, org, description, icon, tags_json, sort) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      input.period,
      input.title,
      input.org,
      input.description,
      input.icon,
      JSON.stringify(input.tags),
      input.sort
    )
    .run();
}

export async function updateExperience(id: number, input: ExperienceInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "UPDATE experiences SET period=?, title=?, org=?, description=?, icon=?, tags_json=?, sort=? WHERE id=?"
    )
    .bind(
      input.period,
      input.title,
      input.org,
      input.description,
      input.icon,
      JSON.stringify(input.tags),
      input.sort,
      id
    )
    .run();
}

export async function deleteExperience(id: number): Promise<void> {
  const db = await requireDB();
  await db.prepare("DELETE FROM experiences WHERE id = ?").bind(id).run();
}
