import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteChrome, SiteFooter } from "@/components/site-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { profile, socials, skillGroups, experience } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

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

const siteUrl = SITE_URL;
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} (${profile.fullName}) — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: `${profile.name} (also ${profile.fullName}) — ${profile.tagline}`,
  applicationName: `${profile.name} · Portfolio`,
  category: "technology",
  keywords: [
    profile.name,
    ...profile.altNames,
    profile.githubUsername,
    "Full-Stack .NET Engineer",
    ".NET",
    "ASP.NET Core",
    "C#",
    "Cloud",
    "Azure",
    "AWS",
    "System Design",
    "AI integration",
    "Software Engineer",
    "Bangladesh",
    "Portfolio",
  ],
  authors: [{ name: profile.fullName, url: siteUrl }],
  creator: profile.fullName,
  publisher: profile.fullName,
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
    siteName: profile.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#080b12" },
  ],
};

const knowsAbout = Array.from(
  new Set(skillGroups.flatMap((g) => g.skills.map((s) => s.name)))
).slice(0, 24);

const worksFor = experience
  .filter((e) => /present/i.test(e.period))
  .map((e) => ({ "@type": "Organization", name: e.org.split("·")[0].trim() }));

// Person.alternateName carries every spelling people search for, so Google can
// resolve "Mihadul Islam", "Md Mehadul Islam", "Md. Mehadul Islam" to this entity.
const personAltNames = [profile.fullName, ...profile.altNames].filter(
  (n, i, a) => a.indexOf(n) === i
);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: `${profile.name} — Portfolio`,
      alternateName: profile.altNames,
      description: profile.tagline,
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      alternateName: personAltNames,
      jobTitle: profile.role,
      description: profile.tagline,
      url: siteUrl,
      image: `${siteUrl}/portrait.jpg`,
      email: profile.email,
      knowsAbout,
      worksFor,
      nationality: { "@type": "Country", name: "Bangladesh" },
      address: {
        "@type": "PostalAddress",
        addressCountry: "BD",
        addressLocality: profile.location,
      },
      // external profiles only (own site is already bound via @id + url)
      sameAs: socials
        .filter((s) => s.href.startsWith("http") && !s.href.startsWith(siteUrl))
        .map((s) => s.href),
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
