import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/* eslint-disable @typescript-eslint/no-explicit-any */
const md = {
  h1: ({ node, ...p }: any) => (
    <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-primary" {...p} />
  ),
  h2: ({ node, ...p }: any) => (
    <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-primary" {...p} />
  ),
  h3: ({ node, ...p }: any) => (
    <h3 className="mt-8 font-display text-xl font-semibold text-primary" {...p} />
  ),
  p: ({ node, ...p }: any) => <p className="mt-5 leading-relaxed text-secondary" {...p} />,
  a: ({ node, ...p }: any) => (
    <a className="font-medium text-accent underline-offset-4 hover:underline" {...p} />
  ),
  ul: ({ node, ...p }: any) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 text-secondary" {...p} />
  ),
  ol: ({ node, ...p }: any) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 text-secondary" {...p} />
  ),
  li: ({ node, ...p }: any) => <li className="leading-relaxed" {...p} />,
  blockquote: ({ node, ...p }: any) => (
    <blockquote className="mt-6 border-l-2 border-accent bg-primary/[0.03] py-2 pl-5 pr-4 italic text-secondary" {...p} />
  ),
  code: ({ node, ...p }: any) => (
    <code className="rounded-md border border-border bg-primary/[0.05] px-1.5 py-0.5 font-mono text-[0.85em] text-accent" {...p} />
  ),
  pre: ({ node, ...p }: any) => (
    <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-wash-2 p-4 font-mono text-sm dark:bg-black/40" {...p} />
  ),
  hr: () => <hr className="my-10 border-border" />,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Renders post Markdown with the site's styling. Works in server (public post)
 *  and client (admin live preview) components. */
export function PostBody({ markdown }: { markdown: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={md as Components}>
      {markdown}
    </Markdown>
  );
}
