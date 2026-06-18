import { query, requireDB } from "./client";
import { testimonials as fallback } from "@/lib/data";

export type Testimonial = {
  id: number;
  quote: string;
  name: string;
  title: string;
  initials: string;
  sort: number;
};

export type TestimonialInput = Omit<Testimonial, "id">;

function toTestimonial(r: Record<string, unknown>): Testimonial {
  return {
    id: Number(r.id),
    quote: String(r.quote),
    name: String(r.name),
    title: String(r.title ?? ""),
    initials: String(r.initials ?? ""),
    sort: Number(r.sort ?? 0),
  };
}

/** Live testimonials from D1; falls back to the seed copy in data.ts when D1
 *  is unavailable OR empty, so the section never renders blank. */
export async function listTestimonials(): Promise<Testimonial[]> {
  const fb: Testimonial[] = fallback.map((t, i) => ({
    id: i + 1,
    quote: t.quote,
    name: t.name,
    title: t.title,
    initials: t.initials,
    sort: i + 1,
  }));
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM testimonials ORDER BY sort ASC, id ASC")
      .all();
    return results.length ? results.map(toTestimonial) : fb;
  }, fb);
}

export async function getTestimonial(id: number): Promise<Testimonial | null> {
  return query(async (db) => {
    const row = await db.prepare("SELECT * FROM testimonials WHERE id = ?").bind(id).first();
    return row ? toTestimonial(row) : null;
  }, null);
}

export async function listAllTestimonials(): Promise<Testimonial[]> {
  return query(async (db) => {
    const { results } = await db
      .prepare("SELECT * FROM testimonials ORDER BY sort ASC, id ASC")
      .all();
    return results.map(toTestimonial);
  }, []);
}

export async function createTestimonial(input: TestimonialInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "INSERT INTO testimonials (quote, name, title, initials, sort) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(input.quote, input.name, input.title, input.initials, input.sort)
    .run();
}

export async function updateTestimonial(id: number, input: TestimonialInput): Promise<void> {
  const db = await requireDB();
  await db
    .prepare(
      "UPDATE testimonials SET quote=?, name=?, title=?, initials=?, sort=? WHERE id=?"
    )
    .bind(input.quote, input.name, input.title, input.initials, input.sort, id)
    .run();
}

export async function deleteTestimonial(id: number): Promise<void> {
  const db = await requireDB();
  await db.prepare("DELETE FROM testimonials WHERE id = ?").bind(id).run();
}
