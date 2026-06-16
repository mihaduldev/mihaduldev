"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createContact } from "@/server/db/contacts";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  message: z.string().min(10).max(5000),
});

export type ContactResult = { ok: boolean; error?: string };

export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check your details." };

  let country: string | null = null;
  try {
    const h = await headers();
    country = h.get("cf-ipcountry");
  } catch {
    /* headers unavailable outside request scope */
  }

  try {
    await createContact({ ...parsed.data, country });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send right now — please email directly." };
  }
}
