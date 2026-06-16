import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteChrome, SiteFooter } from "@/components/site-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { profile, socials } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = "https://mihad.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.tagline,
  keywords: [
    "Mihadul Islam",
    "Software Engineer",
    ".NET",
    "ASP.NET Core",
    "Cloud",
    "System Design",
    "AI",
    "Portfolio",
  ],
  authors: [{ name: profile.fullName, url: siteUrl }],
  creator: profile.fullName,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
    siteName: profile.name,
    images: [{ url: "/portrait.jpg", width: 800, height: 800, alt: profile.fullName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
    images: ["/portrait.jpg"],
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#080b12" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: profile.name,
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.fullName,
      alternateName: profile.name,
      jobTitle: profile.role,
      description: profile.tagline,
      url: siteUrl,
      image: `${siteUrl}/portrait.jpg`,
      address: { "@type": "PostalAddress", addressCountry: "BD" },
      sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const beacon = process.env.NEXT_PUBLIC_CF_BEACON;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${display.variable} ${mono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#home"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-brand-foreground"
          >
            Skip to content
          </a>
          <SiteChrome />
          <main>{children}</main>
          <SiteFooter />
        </ThemeProvider>

        <JsonLd data={jsonLd} />
        {beacon && (
          // Cloudflare Web Analytics — privacy-friendly, cookie-less
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${beacon}"}`}
          />
        )}
      </body>
    </html>
  );
}
