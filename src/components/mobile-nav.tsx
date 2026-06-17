"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navigation = [
  { name: "Home", href: "/dashboard", icon: "📊" },
  { name: "Apps", href: "/dashboard/applications", icon: "📋" },
  { name: "Calendar", href: "/dashboard/calendar", icon: "📅" },
  { name: "Companies", href: "/dashboard/companies", icon: "🏢" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-40">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors",
              pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
