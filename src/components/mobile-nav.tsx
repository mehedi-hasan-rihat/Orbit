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
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="w-5 h-5" />
          <span className="text-lg font-bold">Orbit</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setOpen(true)}
            className="p-2 -mr-2 rounded-lg hover:bg-accent"
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
          "md:hidden fixed top-0 right-0 z-50 h-full w-64 bg-background border-l shadow-xl transition-transform duration-200 ease-in-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
            <span className="text-lg font-bold">Orbit</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-accent"
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
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          <form action={logoutAction} className="mt-1">
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowRightFromLine className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
