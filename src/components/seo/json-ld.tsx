/** Renders a JSON-LD structured-data script tag (server component). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // structured data is generated from trusted server data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
