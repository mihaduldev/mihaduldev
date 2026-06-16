import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1 className="mt-10 font-display text-3xl font-bold tracking-tight text-primary" {...props} />
    ),
    h2: (props) => (
      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-primary" {...props} />
    ),
    h3: (props) => (
      <h3 className="mt-8 font-display text-xl font-semibold text-primary" {...props} />
    ),
    p: (props) => <p className="mt-5 leading-relaxed text-secondary" {...props} />,
    a: ({ href = "#", ...props }) => (
      <Link
        href={href}
        className="font-medium text-link underline-offset-4 hover:underline"
        {...props}
      />
    ),
    ul: (props) => <ul className="mt-5 list-disc space-y-2 pl-6 text-secondary" {...props} />,
    ol: (props) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-secondary" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="mt-6 border-l-2 border-brand bg-card py-2 pl-5 pr-4 italic text-secondary"
        {...props}
      />
    ),
    code: (props) => (
      <code
        className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[0.85em] text-brand"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="mt-6 overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-sm"
        {...props}
      />
    ),
    hr: () => <hr className="my-10 border-border" />,
    ...components,
  };
}
