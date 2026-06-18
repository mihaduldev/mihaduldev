import { signImageUpload } from "@/app/admin/actions";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Uploads an image to Cloudinary via a server-signed, admin-only request and
 *  returns its secure HTTPS URL. Throws a user-friendly message on failure. */
export async function uploadImage(file: File, folder?: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 10 MB.");

  const sig = await signImageUpload(folder);
  if (!sig.ok) throw new Error(sig.error);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    let msg = txt;
    try {
      msg = (JSON.parse(txt)?.error?.message as string) || txt;
    } catch {
      /* keep raw text */
    }
    throw new Error(`Upload failed: ${(msg || res.statusText).slice(0, 160)}`);
  }
  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("Cloudinary didn't return an image URL.");
  return data.secure_url;
}
