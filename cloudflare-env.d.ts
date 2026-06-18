// Ambient types for the Cloudflare bindings/vars available via
// getCloudflareContext().env. DB is typed loosely (queries are string-based).
declare global {
  interface CloudflareEnv {
    DB: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
          first: <T = Record<string, unknown>>() => Promise<T | null>;
          run: () => Promise<unknown>;
        };
        all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
        first: <T = Record<string, unknown>>() => Promise<T | null>;
        run: () => Promise<unknown>;
      };
    };
    ADMIN_PASSWORD: string;
    AUTH_SECRET: string;
    NEXT_PUBLIC_CF_BEACON?: string;
    OPENROUTER_API_KEY?: string;
    OPENROUTER_MODEL?: string;
    // Cloudinary (blog images + covers). Cloud name + key are sent to the
    // authenticated admin client for signed direct uploads; the secret never is.
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
  }
}

export {};
