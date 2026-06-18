"use client";

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/* Compact markdown for chat bubbles. No raw HTML (react-markdown escapes by
   default) so model output is safe to render. Headings are downsized to bold
   text to keep bubbles tight. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const components: Components = {
  p: ({ node, ...p }: any) => <p className="mb-2 last:mb-0" {...p} />,
  a: ({ node, ...p }: any) => (
    <a className="font-medium text-accent underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />
  ),
  ul: ({ node, ...p }: any) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0" {...p} />,
  ol: ({ node, ...p }: any) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0" {...p} />,
  li: ({ node, ...p }: any) => <li className="leading-snug" {...p} />,
  strong: ({ node, ...p }: any) => <strong className="font-semibold text-primary" {...p} />,
  code: ({ node, ...p }: any) => (
    <code className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[0.85em]" {...p} />
  ),
  pre: ({ node, ...p }: any) => (
    <pre className="mb-2 overflow-x-auto rounded-lg border border-border bg-primary/[0.06] p-2.5 font-mono text-xs last:mb-0" {...p} />
  ),
  h1: ({ node, ...p }: any) => <p className="mb-1 font-semibold text-primary" {...p} />,
  h2: ({ node, ...p }: any) => <p className="mb-1 font-semibold text-primary" {...p} />,
  h3: ({ node, ...p }: any) => <p className="mb-1 font-semibold text-primary" {...p} />,
  hr: () => <hr className="my-2 border-border" />,
  blockquote: ({ node, ...p }: any) => (
    <blockquote className="my-2 border-l-2 border-accent/50 pl-2 italic" {...p} />
  ),
  // GFM tables — wrapped so wide tables scroll instead of overflowing the bubble
  table: ({ node, ...p }: any) => (
    <div className="my-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-[0.85em]" {...p} />
    </div>
  ),
  th: ({ node, ...p }: any) => (
    <th className="border border-border px-2 py-1 text-left font-semibold text-primary" {...p} />
  ),
  td: ({ node, ...p }: any) => (
    <td className="border border-border px-2 py-1 align-top" {...p} />
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ChatMarkdown({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </Markdown>
  );
}
