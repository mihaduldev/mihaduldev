import { NextResponse } from "next/server";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    // small delay to blunt brute-force timing
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await signSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
