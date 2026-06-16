import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
