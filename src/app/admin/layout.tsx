import type { Metadata } from "next";

// Applies to ALL /admin routes — including /admin/login, which sits outside the
// (panel) group. Keeps the whole admin area out of search indexes (belt-and-
// braces with the robots.txt Disallow).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
