import { getEnv } from "@/server/db/client";

/** Signed-upload params for a direct browser → Cloudinary upload. The secret is
 *  used only to compute the signature server-side and is never returned. */
export type CloudinarySign = {
  ok: true;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};
export type CloudinarySignResult = CloudinarySign | { ok: false; error: string };

async function creds() {
  const env = await getEnv();
  return {
    cloudName: env?.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: env?.CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: env?.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET ?? "",
  };
}

export async function cloudinaryConfigured(): Promise<boolean> {
  const { cloudName, apiKey, apiSecret } = await creds();
  return Boolean(cloudName && apiKey && apiSecret);
}

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Produces a Cloudinary signature for an upload constrained to `folder`.
 *  Cloudinary signs the alphabetically-sorted params (here: folder, timestamp)
 *  joined as `k=v&k=v` with the api_secret appended, hashed SHA-1 (hex). */
export async function signUpload(folder = "portfolio/blog"): Promise<CloudinarySignResult> {
  const { cloudName, apiKey, apiSecret } = await creds();
  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: "Image uploads aren't configured (set CLOUDINARY_* in the environment)." };
  }
  const safeFolder = (folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 80) || "portfolio/blog").replace(
    /^\/+|\/+$/g,
    ""
  );
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sha1Hex(`folder=${safeFolder}&timestamp=${timestamp}${apiSecret}`);
  return { ok: true, cloudName, apiKey, timestamp, signature, folder: safeFolder };
}
