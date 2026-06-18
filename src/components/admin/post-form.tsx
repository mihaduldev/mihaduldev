"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import type { Post } from "@/server/db/posts";
import { savePost, suggestPost } from "@/app/admin/actions";
import { Field, field } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { TagInput } from "@/components/admin/tag-input";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { CoverPicker, COVER_GRADIENTS } from "@/components/admin/cover-picker";

const today = () => new Date().toISOString().slice(0, 10);

export function PostForm({ editing }: { editing: Post | null }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [excerpt, setExcerpt] = useState(editing?.excerpt ?? "");
  const [readingTime, setReadingTime] = useState(editing?.readingTime ?? "5 min read");
  const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
  const [body, setBody] = useState(editing?.bodyMd ?? "");
  const [cover, setCover] = useState(editing?.cover ?? COVER_GRADIENTS[0]);
  const [published, setPublished] = useState(editing ? editing.published : true);

  // Re-mount keys for the uncontrolled TagInput + MarkdownEditor when AI fills them.
  // The body editor must only re-mount on "draft" — in "meta" mode the visitor has
  // typed live content the `body` state doesn't hold, so re-mounting would wipe it.
  const [tagsKey, setTagsKey] = useState(0);
  const [bodyKey, setBodyKey] = useState(0);

  const [topic, setTopic] = useState("");
  const [aiLoading, setAiLoading] = useState<"" | "draft" | "meta">("");
  const [aiErr, setAiErr] = useState("");

  async function runAi(mode: "draft" | "meta") {
    if (aiLoading) return;
    setAiErr("");
    setAiLoading(mode);
    // read the live body straight from the form (the editor is uncontrolled)
    const currentBody =
      mode === "meta" && formRef.current
        ? String(new FormData(formRef.current).get("bodyMd") ?? "")
        : "";
    const res = await suggestPost({ mode, topic, body: currentBody });
    setAiLoading("");
    if (!res.ok || !res.suggestion) {
      setAiErr(res.error ?? "The AI couldn't help right now.");
      return;
    }
    const s = res.suggestion;
    setTitle(s.title);
    setSlug(s.slug);
    setExcerpt(s.excerpt);
    setReadingTime(s.readingTime);
    setTags(s.tags);
    setTagsKey((k) => k + 1); // re-mount TagInput with the suggested tags
    if (mode === "draft" && typeof s.body === "string") {
      setBody(s.body);
      setBodyKey((k) => k + 1); // re-mount the editor with the generated body
    }
  }

  return (
    <form ref={formRef} action={savePost} className="mt-4 space-y-4">
      {editing && <input type="hidden" name="id" defaultValue={editing.id} />}

      {/* AI assist */}
      <div className="rounded-xl border border-accent/25 bg-accent/[0.05] p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="size-3.5" /> AI assist
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runAi("draft");
              }
            }}
            placeholder="Topic or rough idea — e.g. “Clean Architecture in ASP.NET Core”"
            className={`${field} flex-1`}
          />
          <button
            type="button"
            onClick={() => runAi("draft")}
            disabled={!!aiLoading}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-sm)] disabled:opacity-60"
          >
            {aiLoading === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            Generate draft
          </button>
        </div>
        <button
          type="button"
          onClick={() => runAi("meta")}
          disabled={!!aiLoading}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-secondary transition-colors hover:text-accent disabled:opacity-60"
        >
          {aiLoading === "meta" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          Suggest title, excerpt &amp; tags from the body
        </button>
        {aiErr && <p role="alert" className="mt-1.5 text-xs text-red-400">{aiErr}</p>}
        <p className="mt-1.5 text-[11px] text-tertiary">
          AI fills the fields below — review and edit before publishing.
        </p>
      </div>

      <Field label="Title">
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Slug" hint="url path; auto-cleaned">
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-post"
            className={field}
          />
        </Field>
        <Field label="Reading time">
          <input
            name="readingTime"
            value={readingTime}
            onChange={(e) => setReadingTime(e.target.value)}
            className={field}
          />
        </Field>
      </div>
      <Field label="Excerpt">
        <textarea
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={field}
        />
      </Field>
      <Field label="Tags" hint="comma separated">
        <TagInput key={`tags-${tagsKey}`} name="tags" defaultValue={tags} placeholder=".NET, Architecture" />
      </Field>
      <Field label="Cover" hint="pick a gradient or upload an image">
        <CoverPicker value={cover} onChange={setCover} />
      </Field>
      <Field label="Publish date">
        <input
          name="publishedAt"
          type="date"
          defaultValue={editing?.publishedAt ?? today()}
          className={`${field} w-auto`}
        />
      </Field>
      <Field label="Body (Markdown)">
        <MarkdownEditor key={`body-${bodyKey}`} defaultValue={body} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-secondary">
        <input
          type="checkbox"
          name="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="size-4 accent-[var(--accent)]"
        />
        Published (visible on the public blog)
      </label>
      <div className="flex items-center gap-3 pt-1">
        <SubmitButton>{editing ? "Save changes" : "Create post"}</SubmitButton>
        {editing && (
          <Link href="/admin/blog" className="text-sm text-tertiary hover:text-primary">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
