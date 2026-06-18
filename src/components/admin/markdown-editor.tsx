"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, ImagePlus, Loader2 } from "lucide-react";
import { PostBody } from "@/components/markdown";
import { field } from "@/components/admin/ui";
import { uploadImage } from "@/components/admin/cloudinary-upload";
import { cn } from "@/lib/utils";

/** Markdown textarea with Write/Preview, a fullscreen mode, and image upload
 *  (button, paste, or drag-and-drop → Cloudinary). The textarea keeps name="bodyMd"
 *  so the form always submits; in fullscreen it portals to <body> (escaping the
 *  glass card's backdrop-filter containing block) and stays form-bound via `form`. */
export function MarkdownEditor({
  defaultValue = "",
  formId,
}: {
  defaultValue?: string;
  formId?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [fullscreen, setFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Lock page scroll, wire Escape-to-exit, and focus the editor while fullscreen.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => taRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  function insertAtCursor(text: string) {
    const ta = taRef.current;
    if (!ta) {
      setValue((v) => v + text);
      return;
    }
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  async function uploadAndInsert(file: File) {
    setErr("");
    setUploading(true);
    setTab("write");
    try {
      const url = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      insertAtCursor(`\n\n![${alt}](${url})\n\n`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    const file = item?.getAsFile();
    if (file) {
      e.preventDefault();
      void uploadAndInsert(file);
    }
  }

  function onDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      void uploadAndInsert(file);
    }
  }

  // Only intercept file drags (so native text drag-and-drop still works).
  function onDragOver(e: React.DragEvent<HTMLTextAreaElement>) {
    if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault();
  }

  const toolBtn =
    "inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary disabled:opacity-60";

  const body = (
    <div className={cn("flex flex-col", fullscreen && "min-h-0 flex-1")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                tab === t ? "bg-accent/15 text-accent" : "text-tertiary hover:text-primary"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={toolBtn}>
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
            {uploading ? "Uploading…" : "Image"}
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            className={toolBtn}
            title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          >
            {fullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {fullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      {err && (
        <p role="alert" className="mb-2 text-xs text-red-400">
          {err}
        </p>
      )}

      <textarea
        ref={taRef}
        name="bodyMd"
        form={formId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={onDragOver}
        rows={fullscreen ? 1 : 16}
        className={cn(
          field,
          "font-mono text-xs",
          fullscreen && "min-h-0 flex-1 resize-none",
          tab !== "write" && "hidden"
        )}
        placeholder="Write in Markdown…  Paste, drop, or click Image to upload."
      />

      {tab === "preview" && (
        <div
          className={cn(
            "overflow-auto rounded-lg border border-border bg-white/[0.02] px-4 pb-4 pt-1",
            fullscreen ? "min-h-0 flex-1" : "max-h-[460px]"
          )}
        >
          {value.trim() ? (
            <PostBody markdown={value} />
          ) : (
            <p className="py-6 text-sm text-tertiary">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadAndInsert(f);
        }}
      />
    </div>
  );

  if (!fullscreen || typeof document === "undefined") return body;

  // Portal to <body> so the overlay isn't trapped by the glass card's
  // backdrop-filter containing block — only then does `fixed inset-0` mean the
  // real viewport, and only then can the editor scroll on its own.
  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col bg-card p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">Body — Markdown</p>
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
        >
          <Minimize2 className="size-3.5" /> Exit fullscreen (Esc)
        </button>
      </div>
      {body}
    </div>,
    document.body
  );
}
