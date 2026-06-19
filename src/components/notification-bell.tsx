"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { markNotificationsRead } from "@/lib/actions/notifications";

interface NotificationItem {
  id: string;
  type: "interview" | "followup";
  title: string;
  body: string; // dedupeKey: "interview-<id>-1d" or "followup-<id>-2d"
  applicationId: string | null;
  createdAt: string;
}

interface NotificationData {
  count: number;
  items: NotificationItem[];
}

function daysUntilFromBody(body: string): number {
  const match = body.match(/-(\d+)d$/);
  return match ? parseInt(match[1]) : 0;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    es.onmessage = (e) => setData(JSON.parse(e.data));
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleOpen() {
    setOpen((o) => !o);
  }

  async function handleMarkAllRead() {
    if (!data || data.count === 0) return;
    setMarking(true);
    await markNotificationsRead();
    setData((d) => d ? { count: 0, items: [] } : d);
    setMarking(false);
    setOpen(false);
  }

  const count = data?.count ?? 0;
  const items = data?.items ?? [];
  const loading = data === null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <Bell className={clsx("w-5 h-5", count > 0 && "text-foreground")} />
        )}
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-background shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {count > 0 ? `${count} unread` : "All caught up"}
              </p>
            </div>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={marking}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {marking ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <BellOff className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No new notifications</p>
              <p className="text-xs text-muted-foreground">
                You'll be notified before interviews & follow-ups
              </p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y">
              {items.map((item) => {
                const days = daysUntilFromBody(item.body);
                const urgency = days <= 1 ? "high" : "medium";

                const content = (
                  <>
                    {/* Icon */}
                    <span className={clsx(
                      "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      item.type === "interview"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-amber-100 dark:bg-amber-900/30"
                    )}>
                      {item.type === "interview" ? "🎤" : "📅"}
                    </span>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate leading-snug">{item.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={clsx(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          urgency === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>
                          {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </>
                );

                return (
                  <li key={item.id}>
                    {item.applicationId ? (
                      <Link
                        href={`/dashboard/applications/${item.applicationId}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
