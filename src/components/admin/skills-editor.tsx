"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { Skill } from "@/server/db/skills";
import { field } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/** Structured editor for a skill group's skills. Serializes to a hidden
 *  `skills` input (always-valid JSON), so the server action reads it unchanged. */
export function SkillsEditor({ defaultValue = [] }: { defaultValue?: Skill[] }) {
  const [rows, setRows] = useState<Skill[]>(defaultValue);

  const update = (i: number, patch: Partial<Skill>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const add = () =>
    setRows((r) => [...r, { name: "", color: "#58c4dc", desc: "" }]);
  const remove = (i: number) => setRows((r) => r.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div>
      <input type="hidden" name="skills" value={JSON.stringify(rows)} />

      <div className="space-y-3">
        {rows.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="text-tertiary hover:text-primary">
                  <GripVertical className="size-3.5 rotate-90" />
                </button>
              </div>
              <input
                type="color"
                value={s.color || "#58c4dc"}
                onChange={(e) => update(i, { color: e.target.value })}
                aria-label="Colour"
                className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
              />
              <input
                value={s.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Skill name (e.g. C#)"
                className={cn(field, "flex-1")}
              />
              <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-secondary">
                <input
                  type="checkbox"
                  checked={!!s.core}
                  onChange={(e) => update(i, { core: e.target.checked })}
                  className="size-4 accent-[var(--accent)]"
                />
                Core
              </label>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove skill"
                className="shrink-0 rounded-lg p-1.5 text-tertiary transition-colors hover:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={s.desc}
                onChange={(e) => update(i, { desc: e.target.value })}
                placeholder="Short purpose (e.g. APIs, services, business logic)"
                className={field}
              />
              <input
                value={s.logo ?? ""}
                onChange={(e) => update(i, { logo: e.target.value })}
                placeholder="Logo: devicon slug, optional (e.g. csharp/csharp-original)"
                className={field}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-tertiary">
            No skills yet — add the first one.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-accent/40 hover:text-primary"
      >
        <Plus className="size-3.5" /> Add skill
      </button>
    </div>
  );
}
