import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);

// Cloudflare bindings (D1, etc.) available during `next dev` via the adapter.
// Wrapped in try/catch so a normal `next build` (no adapter installed yet in
// some environments) never breaks.
import("@opennextjs/cloudflare")
  .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
  .catch(() => {});
