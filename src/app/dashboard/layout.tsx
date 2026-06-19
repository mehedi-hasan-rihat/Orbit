import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SessionProvider } from "@/components/session-provider";
import { NotificationBell } from "@/components/notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider user={{ userId: session.userId, name: session.name, email: session.email }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={{ name: session.name, email: session.email }} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <MobileNav />
          {/* Desktop notification bar */}
          <div className="hidden md:flex items-center justify-end px-6 py-2 border-b shrink-0">
            <NotificationBell />
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
