"use client";

import { usePathname } from "next/navigation";
import { AmbientBackground } from "@/components/depth/ambient-background";
import { ScrollProgress } from "@/components/depth/scroll-progress";
import { FloatingNav } from "@/components/depth/floating-nav";
import { Footer } from "@/components/depth/footer";

/** Public-site chrome — hidden on /admin (which has its own shell). */
export function SiteChrome() {
  const p = usePathname();
  if (p?.startsWith("/admin")) return null;
  return (
    <>
      <AmbientBackground />
      <ScrollProgress />
      <FloatingNav />
    </>
  );
}

export function SiteFooter() {
  const p = usePathname();
  if (p?.startsWith("/admin")) return null;
  return <Footer />;
}
