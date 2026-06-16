import { query, requireDB, parseJson } from "./client";
import { skillGroups as fallback, type Skill } from "@/lib/data";

export type { Skill };

export type SkillGroup = {
  id: number;
  category: string;
  icon: string;
  description: string;
  skills: Skill[];
  sort: number;
};

export type SkillGroupInput = Omit<SkillGroup, "id">;

function toGroup(r: Record<string, unknown>): SkillGroup {
  return {
    id: Number(r.id),
    category: String(r.category),
    icon: String(r.icon),
    description: String(r.description),
    skills: parseJson<Skill[]>(r.skills_json, []),
    sort: Number(r.sort),
  };
}

export async function listSkillGroups(): Promise<SkillGroup[]> {
  const fb: SkillGroup[] = fallback.map((g, i) => ({
    id: i + 1,
    category: g.category,
    icon: g.icon,
    description: g.description,
    skills: g.skills.map((s) => ({ ...s })),
    sort: i + 1,
  }));
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM skill_groups ORDER BY sort ASC, id ASC")
      .all();
    return results.map(toGroup);
  }, fb);
}

export async function getSkillGroup(id: number): Promise<SkillGroup | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM skill_groups WHERE id = ?").bind(id).first();
    return row ? toGroup(row) : null;
  }, null);
}

export async function createSkillGroup(input: SkillGroupInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "INSERT INTO skill_groups (category, icon, description, skills_json, sort) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(input.category, input.icon, input.description, JSON.stringify(input.skills), input.sort)
    .run();
}

export async function updateSkillGroup(id: number, input: SkillGroupInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "UPDATE skill_groups SET category=?, icon=?, description=?, skills_json=?, sort=? WHERE id=?"
    )
    .bind(input.category, input.icon, input.description, JSON.stringify(input.skills), input.sort, id)
    .run();
}

export async function deleteSkillGroup(id: number): Promise<void> {
  const db = await requireDB();
  await db.prepare("DELETE FROM skill_groups WHERE id = ?").bind(id).run();
}
