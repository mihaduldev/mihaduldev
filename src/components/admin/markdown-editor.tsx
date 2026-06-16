"use client";

import { useState } from "react";
import { PostBody } from "@/components/markdown";
import { field } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/** Markdown textarea with a Write/Preview toggle. The textarea stays mounted
 *  (name="bodyMd") so the form always submits, even while previewing. */
export function MarkdownEditor({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="mb-2 flex gap-1">
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

      <textarea
        name="bodyMd"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={16}
        className={cn(field, "font-mono text-xs", tab !== "write" && "hidden")}
        placeholder="Write your post in Markdown…"
      />

      {tab === "preview" && (
        <div className="max-h-[460px] overflow-auto rounded-lg border border-border bg-white/[0.02] px-4 pb-4 pt-1">
          {value.trim() ? (
            <PostBody markdown={value} />
          ) : (
            <p className="py-6 text-sm text-tertiary">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
