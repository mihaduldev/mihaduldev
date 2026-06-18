"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/components/admin/cloudinary-upload";
import { isImageCover, cldOptimize, cn } from "@/lib/utils";

export const COVER_GRADIENTS = [
  "from-[#087EA4] to-[#58C4DC]",
  "from-[#512BD4] to-[#087EA4]",
  "from-[#58C4DC] to-[#61DAFB]",
  "from-[#0052CC] to-[#3178C6]",
];

/** Picks a post cover: either a gradient preset or an uploaded Cloudinary image.
 *  Submits the chosen value (gradient class set OR image URL) via name="cover". */
export function CoverPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const image = isImageCover(value);

  async function onPick(file: File) {
    setErr("");
    setUploading(true);
    try {
      onChange(await uploadImage(file, "portfolio/blog/covers"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name="cover" value={value} />

      <div className="relative mb-3 h-28 overflow-hidden rounded-lg border border-border">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cldOptimize(value)} alt="Cover preview" className="h-full w-full object-cover" />
        ) : (
          <div className={cn("h-full w-full bg-gradient-to-br", value || COVER_GRADIENTS[0])} />
        )}
        {image && (
          <button
            type="button"
            onClick={() => onChange(COVER_GRADIENTS[0])}
            title="Remove image (back to gradient)"
            className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-md bg-black/55 text-white transition-colors hover:bg-black/75"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {COVER_GRADIENTS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            title="Use this gradient"
            className={cn(
              "h-7 w-10 rounded-md bg-gradient-to-br ring-offset-2 ring-offset-card transition",
              g,
              !image && value === g ? "ring-2 ring-accent" : "ring-1 ring-border hover:ring-accent/50"
            )}
          />
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      </div>

      {err && (
        <p role="alert" className="mt-1.5 text-xs text-red-400">
          {err}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
        }}
      />
    </div>
  );
}
