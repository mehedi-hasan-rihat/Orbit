"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { useSession } from "@/components/session-provider";
import { Logo } from "@/components/landing/logo";
import { Menu, X, ArrowRightFromLine } from "lucide-react";
import clsx from "clsx";
import { NotificationBell } from "@/components/notification-bell";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "" },
  { name: "Applications", href: "/dashboard/applications", icon: "" },
  { name: "Calendar", href: "/dashboard/calendar", icon: "" },
  { name: "Companies", href: "/dashboard/companies", icon: "" },
  { name: "Pipeline", href: "/dashboard/pipeline", icon: "" },
  { name: "Tags", href: "/dashboard/tags", icon: "" },
  { name: "Profile", href: "/dashboard/profile", icon: "" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { name, email } = useSession();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Top bar — visible only on mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-[var(--color-glass)] backdrop-blur-[var(--blur-floating)] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* <Logo className="w-5 h-5" /> */}
          <span className="text-lg">Orbit</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setOpen(true)}
            className="p-2 -mr-2 rounded-full hover:bg-[#1e1e1e]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel from right */}
      <div
        className={clsx(
          "md:hidden fixed top-0 right-0 z-50 h-full w-64 bg-background border-l border-border transition-transform duration-200 ease-in-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {/* <Logo className="w-5 h-5" /> */}
            <span className="text-lg">Orbit</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#1e1e1e]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                isActive(item.href)
                  ? "bg-[#2a2a2a] text-foreground"
                  : "text-muted-foreground hover:bg-[#1e1e1e] hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-6 h-6 rounded-full bg-[#2a2a2a] text-muted-foreground flex items-center justify-center text-xs shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          <form action={logoutAction} className="mt-0.5">
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-[#1e1e1e] hover:text-foreground transition-colors"
            >
              <ArrowRightFromLine className="w-3.5 h-3.5 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
