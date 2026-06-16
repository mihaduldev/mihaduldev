import { query, requireDB, parseJson } from "./client";
import { projects as fallback } from "@/lib/data";

export type Project = {
  id: number;
  title: string;
  description: string;
  focus: string[];
  repo: string;
  featured: boolean;
  accent: string;
  sort: number;
};

export type ProjectInput = Omit<Project, "id">;

function toProject(r: Record<string, unknown>): Project {
  return {
    id: Number(r.id),
    title: String(r.title),
    description: String(r.description),
    focus: parseJson<string[]>(r.focus_json, []),
    repo: String(r.repo),
    featured: Number(r.featured) === 1,
    accent: String(r.accent),
    sort: Number(r.sort),
  };
}

export async function listProjects(): Promise<Project[]> {
  const fb: Project[] = fallback.map((p, i) => ({
    id: i + 1,
    title: p.title,
    description: p.description,
    focus: [...p.focus],
    repo: p.repo,
    featured: Boolean(p.featured),
    accent: p.accent,
    sort: i + 1,
  }));
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM projects ORDER BY sort ASC, id ASC")
      .all();
    return results.map(toProject);
  }, fb);
}

export async function getProject(id: number): Promise<Project | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
    return row ? toProject(row) : null;
  }, null);
}

export async function createProject(input: ProjectInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "INSERT INTO projects (title, description, focus_json, repo, featured, accent, sort) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      input.title,
      input.description,
      JSON.stringify(input.focus),
      input.repo,
      input.featured ? 1 : 0,
      input.accent,
      input.sort
    )
    .run();
}

export async function updateProject(id: number, input: ProjectInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "UPDATE projects SET title=?, description=?, focus_json=?, repo=?, featured=?, accent=?, sort=? WHERE id=?"
    )
    .bind(
      input.title,
      input.description,
      JSON.stringify(input.focus),
      input.repo,
      input.featured ? 1 : 0,
      input.accent,
      input.sort,
      id
    )
    .run();
}

export async function deleteProject(id: number): Promise<void> {
  const db = await requireDB();
  await db.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
}
