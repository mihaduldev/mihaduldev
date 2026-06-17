"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/server/auth";
import { parseJson } from "@/server/db/client";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  type ExperienceInput,
} from "@/server/db/experiences";
import {
  createProject,
  updateProject,
  deleteProject,
  type ProjectInput,
} from "@/server/db/projects";
import {
  createSkillGroup,
  updateSkillGroup,
  deleteSkillGroup,
  type SkillGroupInput,
  type Skill,
} from "@/server/db/skills";
import { createPost, updatePost, deletePost, type PostInput } from "@/server/db/posts";
import { deleteComment, listAllComments } from "@/server/db/comments";
import { deleteConversation, listConversations } from "@/server/db/conversations";
import { listContacts } from "@/server/db/contacts";
import {
  saveHeroContent,
  saveScrollSettings as persistScrollSettings,
  heroDefaults,
  scrollDefaults,
  type ScrollMode,
  type ScrollEasing,
} from "@/server/db/settings";

async function assertAdmin() {
  const c = await cookies();
  const ok = await verifySession(c.get(SESSION_COOKIE)?.value);
  if (!ok) throw new Error("Unauthorized");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(fd.get(k) ?? 0) || 0;
const bool = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v === "on" || v === "true" || v === "1";
};
const list = (fd: FormData, k: string) =>
  str(fd, k)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function refresh(...paths: string[]) {
  revalidatePath("/");
  for (const p of paths) revalidatePath(p);
}

/* ---------------- Experience ---------------- */
function expInput(fd: FormData): ExperienceInput {
  return {
    period: str(fd, "period"),
    title: str(fd, "title"),
    org: str(fd, "org"),
    description: str(fd, "description"),
    icon: str(fd, "icon") || "Server",
    tags: list(fd, "tags"),
    sort: num(fd, "sort"),
  };
}
export async function saveExperience(fd: FormData) {
  await assertAdmin();
  const id = num(fd, "id");
  if (id) await updateExperience(id, expInput(fd));
  else await createExperience(expInput(fd));
  refresh("/admin/experience");
  redirect("/admin/experience");
}
export async function removeExperience(fd: FormData) {
  await assertAdmin();
  await deleteExperience(num(fd, "id"));
  refresh("/admin/experience");
  redirect("/admin/experience");
}

/* ---------------- Projects ---------------- */
function projInput(fd: FormData): ProjectInput {
  return {
    title: str(fd, "title"),
    description: str(fd, "description"),
    focus: list(fd, "focus"),
    repo: str(fd, "repo"),
    featured: bool(fd, "featured"),
    accent: str(fd, "accent") || "#087EA4",
    sort: num(fd, "sort"),
  };
}
export async function saveProject(fd: FormData) {
  await assertAdmin();
  const id = num(fd, "id");
  if (id) await updateProject(id, projInput(fd));
  else await createProject(projInput(fd));
  refresh("/admin/projects");
  redirect("/admin/projects");
}
export async function removeProject(fd: FormData) {
  await assertAdmin();
  await deleteProject(num(fd, "id"));
  refresh("/admin/projects");
  redirect("/admin/projects");
}

/* ---------------- Skill groups ---------------- */
function skillInput(fd: FormData): SkillGroupInput {
  return {
    category: str(fd, "category"),
    icon: str(fd, "icon") || "Server",
    description: str(fd, "description"),
    skills: parseJson<Skill[]>(str(fd, "skills"), []),
    sort: num(fd, "sort"),
  };
}
export async function saveSkillGroup(fd: FormData) {
  await assertAdmin();
  const id = num(fd, "id");
  if (id) await updateSkillGroup(id, skillInput(fd));
  else await createSkillGroup(skillInput(fd));
  refresh("/admin/skills");
  redirect("/admin/skills");
}
export async function removeSkillGroup(fd: FormData) {
  await assertAdmin();
  await deleteSkillGroup(num(fd, "id"));
  refresh("/admin/skills");
  redirect("/admin/skills");
}

/* ---------------- Blog posts ---------------- */
function postInput(fd: FormData): PostInput {
  const publishedAt = str(fd, "publishedAt");
  return {
    slug: str(fd, "slug").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""),
    title: str(fd, "title"),
    excerpt: str(fd, "excerpt"),
    bodyMd: String(fd.get("bodyMd") ?? ""),
    tags: list(fd, "tags"),
    cover: str(fd, "cover") || "from-[#087EA4] to-[#58C4DC]",
    readingTime: str(fd, "readingTime") || "5 min read",
    published: bool(fd, "published"),
    publishedAt: publishedAt || new Date().toISOString().slice(0, 10),
  };
}
export async function savePost(fd: FormData) {
  await assertAdmin();
  const id = num(fd, "id");
  if (id) await updatePost(id, postInput(fd));
  else await createPost(postInput(fd));
  refresh("/admin/blog", "/blog");
  redirect("/admin/blog");
}
export async function removePost(fd: FormData) {
  await assertAdmin();
  await deletePost(num(fd, "id"));
  refresh("/admin/blog", "/blog");
  redirect("/admin/blog");
}

/* ---------------- Comments (moderation) ---------------- */
export async function removeComment(fd: FormData) {
  await assertAdmin();
  await deleteComment(num(fd, "id"));
  const slug = str(fd, "slug");
  refresh("/admin/comments", slug ? `/blog/${slug}` : "/blog");
  redirect("/admin/comments");
}

/* ---------------- Assistant conversations (leads) ---------------- */
export async function removeConversation(fd: FormData) {
  await assertAdmin();
  await deleteConversation(num(fd, "id"));
  refresh("/admin/conversations");
  redirect("/admin/conversations");
}

/* ---------------- Admin list pagination (infinite scroll) ----------------
   Each returns the next page; keep the page size in sync with ADMIN_PAGE_SIZE
   in components/admin/infinite-list.tsx (20). */
const off = (offset: number) => Math.max(0, Math.floor(offset) || 0);
export async function moreComments(offset: number) {
  await assertAdmin();
  return listAllComments(20, off(offset));
}
export async function moreContacts(offset: number) {
  await assertAdmin();
  return listContacts(20, off(offset));
}
export async function moreLeads(offset: number) {
  await assertAdmin();
  return listConversations(20, off(offset));
}

/* ---------------- Site settings (hero content + scroll/motion) ---------------- */
export async function saveHeroSettings(fd: FormData) {
  await assertAdmin();
  await saveHeroContent({
    name: str(fd, "name") || heroDefaults.name,
    roleLead: str(fd, "roleLead") || heroDefaults.roleLead,
    roleAccent: str(fd, "roleAccent"),
    description: str(fd, "description") || heroDefaults.description,
    availability: str(fd, "availability") || heroDefaults.availability,
    proof: list(fd, "proof"),
  });
  refresh("/admin/settings");
  redirect("/admin/settings");
}

const MODES: ScrollMode[] = ["glide", "snap", "native"];
const EASINGS: ScrollEasing[] = ["smootherstep", "easeInOut", "easeOut", "linear"];
export async function saveScrollSettings(fd: FormData) {
  await assertAdmin();
  const mode = str(fd, "mode") as ScrollMode;
  const easing = str(fd, "easing") as ScrollEasing;
  await persistScrollSettings({
    mode: MODES.includes(mode) ? mode : scrollDefaults.mode,
    durationMs: Math.min(4000, Math.max(300, num(fd, "durationMs") || scrollDefaults.durationMs)),
    easing: EASINGS.includes(easing) ? easing : scrollDefaults.easing,
  });
  refresh("/admin/settings");
  redirect("/admin/settings");
}
