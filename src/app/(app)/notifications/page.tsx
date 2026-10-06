"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { PageHeader, Card, Badge } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const me = useCurrentUser();
  const notifications = useStore((s) => s.notifications);
  const mark = useStore((s) => s.markNotification);
  const markAll = useStore((s) => s.markAllNotifications);

  if (!me) return null;
  const mine = notifications.filter((n) => n.userId === me.id).sort((a, b) => (a.at < b.at ? 1 : -1));
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader title="Notifications" subtitle={`${unread} unread`}
        action={unread ? <button className="btn-secondary" onClick={() => markAll()}><CheckCheck className="h-4 w-4" /> Mark all read</button> : undefined} />

      <Card>
        {mine.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-500">You have no notifications.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {mine.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.read ? "bg-brand-50/40" : ""}`}>
                <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg ${n.read ? "bg-ink-100 text-ink-400" : "bg-brand-100 text-brand-600"}`}><Bell className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink-800">{n.title}</p>
                    {!n.read ? <Badge tone="brand">New</Badge> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-400">{formatDateTime(n.at)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {n.link ? <Link href={n.link} className="link text-sm" onClick={() => mark(n.id, true)}>Open</Link> : null}
                  <button className="text-xs text-ink-400 hover:text-ink-600" onClick={() => mark(n.id, !n.read)}>{n.read ? "Mark unread" : "Mark read"}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
