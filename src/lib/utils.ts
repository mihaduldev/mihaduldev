import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** A post `cover` is either a Tailwind gradient class set (e.g. "from-… to-…")
 *  or, when an image was uploaded, an absolute image URL. */
export function isImageCover(cover: string | null | undefined): cover is string {
  return typeof cover === "string" && /^https?:\/\//.test(cover);
}

/** Inserts on-the-fly format/quality optimization into a Cloudinary URL so we
 *  serve modern, right-sized images. No-op for non-Cloudinary URLs. */
export function cldOptimize(url: string, transform = "f_auto,q_auto"): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes(`/upload/${transform}/`)) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}
