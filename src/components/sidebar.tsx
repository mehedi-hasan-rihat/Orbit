"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
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
  { name: "Companies", href: "/dashboard/companies", icon: "🏢" },
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

      <div className="border-t p-4 space-y-3">
        <div className="text-sm truncate">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-muted-foreground truncate">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
