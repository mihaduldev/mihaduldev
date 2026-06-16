import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/server/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const authed = await verifySession(c.get(SESSION_COOKIE)?.value);
  if (!authed) redirect("/admin/login");

  return (
    <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
