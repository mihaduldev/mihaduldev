"use client";

import { useState } from "react";
import { field } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/** Comma-separated text input that previews the parsed values as chips.
 *  Submits via the real input's `name` (server parses with split-by-comma). */
export function TagInput({
  name,
  defaultValue = [],
  placeholder,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue.join(", "));
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div>
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(field)}
      />
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-md border border-border bg-white/[0.03] px-2 py-0.5 text-xs text-secondary"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
