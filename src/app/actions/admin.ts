"use server";

import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/server/auth";

/** Whether the current request carries a valid admin session. Used by the nav
 *  to show the lock (login) vs unlock (logout) state. */
export async function getAdminStatus(): Promise<boolean> {
  try {
    const c = await cookies();
    return Boolean(await verifySession(c.get(SESSION_COOKIE)?.value));
  } catch {
    return false;
  }
}

/** Clears the admin session in place (the caller reloads to refresh the UI). */
export async function adminLogout(): Promise<void> {
  const c = await cookies();
  c.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
