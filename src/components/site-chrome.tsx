"use client";

import { usePathname } from "next/navigation";
import { AmbientBackground } from "@/components/depth/ambient-background";
import { ScrollProgress } from "@/components/depth/scroll-progress";
import { FloatingNav } from "@/components/depth/floating-nav";
import { Footer } from "@/components/depth/footer";
import { ChatWidget } from "@/components/assistant/chat-widget";

/** Public-site chrome — hidden on /admin (which has its own shell). */
export function SiteChrome() {
  const p = usePathname();
  if (p?.startsWith("/admin")) return null;
  return (
    <>
      <AmbientBackground />
      <ScrollProgress />
      <FloatingNav />
      <ChatWidget />
    </>
  );
}

export function SiteFooter() {
  const p = usePathname();
  if (p?.startsWith("/admin")) return null;
  return <Footer />;
}
