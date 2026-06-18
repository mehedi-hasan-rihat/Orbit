"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ArrowRightFromLine } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard" , icon: "📊" },
  { name: "Applications", href: "/dashboard/applications", icon: "📋" },
  { name: "Calendar", href: "/dashboard/calendar", icon: "📅" },
  { name: "Companies", href: "/dashboard/companies", icon: "🏢" },
  { name: "Tags", href: "/dashboard/tags", icon: "🏷️" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/applications") {
      return pathname.startsWith("/dashboard/applications") && searchParams.get("archived") !== "true";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-muted/30">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="text-lg font-bold">
          Orbit
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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

      <div className="border-t p-3">
        {/* Profile row */}
        <Link
          href="/dashboard/profile"
          className={clsx(
            "flex items-center gap-3 w-full rounded-md px-3 py-2 transition-colors hover:bg-accent",
            pathname === "/dashboard/profile" ? "bg-accent" : ""
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
        </Link>

        {/* Sign out */}
        <form action={logoutAction} className="mt-1">
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowRightFromLine className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
