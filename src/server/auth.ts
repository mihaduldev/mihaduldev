import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "./db/client";

export const SESSION_COOKIE = "admin_session";
const ALG = "HS256";

async function getSecretAndPassword(): Promise<{ secret: string; password: string }> {
  const env = await getEnv();
  const secret =
    env?.AUTH_SECRET ?? process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
  const password = env?.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";
  return { secret, password };
}

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/** Constant-time string comparison (edge-safe, no Node crypto). */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const { password: expected } = await getSecretAndPassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function signSession(): Promise<string> {
  const { secret } = await getSecretAndPassword();
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key(secret));
}

export async function verifySession(token?: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { secret } = await getSecretAndPassword();
    await jwtVerify(token, key(secret), { algorithms: [ALG] });
    return true;
  } catch {
    return false;
  }
}
