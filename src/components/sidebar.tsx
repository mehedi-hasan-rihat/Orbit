"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ArrowRightFromLine } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import clsx from "clsx";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard" , icon: "" },
  { name: "Applications", href: "/dashboard/applications", icon: "" },
  { name: "Calendar", href: "/dashboard/calendar", icon: "" },
  { name: "Companies", href: "/dashboard/companies", icon: "" },
  { name: "Pipeline", href: "/dashboard/pipeline", icon: "" },
  { name: "Tags", href: "/dashboard/tags", icon: "" },
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
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-canvas">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* <Logo className="w-6 h-6" /> */}
          <span className="text-[15px] text-foreground">Orbit</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
              isActive(item.href)
                ? "bg-[#2a2a2a] text-foreground"
                : "text-muted-foreground hover:bg-[#1e1e1e] hover:text-foreground"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {/* Profile row */}
        <Link
          href="/dashboard/profile"
          className={clsx(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-colors",
            pathname === "/dashboard/profile"
              ? "bg-[#2a2a2a] text-foreground"
              : "hover:bg-[#1e1e1e]"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-[#2a2a2a] text-muted-foreground flex items-center justify-center text-xs shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-foreground truncate leading-none">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
        </Link>

        {/* Sign out */}
        <form action={logoutAction} className="mt-0.5">
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:bg-[#1e1e1e] hover:text-foreground transition-colors"
          >
            <ArrowRightFromLine className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
