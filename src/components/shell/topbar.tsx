"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut, User as UserIcon, RotateCcw, Check, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, useCurrentUser } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/navigation";
import { Avatar } from "@/components/ui/primitives";
import { Logo } from "./logo";

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch?: (q: string) => void }) {
  const router = useRouter();
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const kpis = useStore((s) => s.kpis);
  const announcements = useStore((s) => s.announcements);
  const notifications = useStore((s) => s.notifications);
  const markNotification = useStore((s) => s.markNotification);
  const markAll = useStore((s) => s.markAllNotifications);
  const logout = useStore((s) => s.logout);
  const resetDemo = useStore((s) => s.resetDemo);

  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);

  const departments = useStore((s) => s.departments);
  const myDepartment = departments.find((d) => d.id === me?.departmentId);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowBell(false);
      if (profRef.current && !profRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const myNotifs = useMemo(
    () => notifications.filter((n) => n.userId === me?.id).sort((a, b) => (a.at < b.at ? 1 : -1)),
    [notifications, me]
  );
  const unread = myNotifs.filter((n) => !n.read).length;

  const results = useMemo(() => {
    if (q.trim().length < 2) return { kpis: [], people: [], pages: [] };
    const needle = q.toLowerCase();
    return {
      kpis: kpis.filter((k) => !k.deleted && (k.name.toLowerCase().includes(needle) || k.code.toLowerCase().includes(needle))).slice(0, 4),
      people: users.filter((u) => u.fullName.toLowerCase().includes(needle) || u.employeeId.toLowerCase().includes(needle)).slice(0, 4),
      pages: [
        { label: "My KPI", href: "/my-kpi" }, { label: "Performance Summary", href: "/performance" },
        { label: "Variable Income", href: "/variable-income" }, { label: "Approval Center", href: "/approvals" },
        { label: "Reports", href: "/reports" }, { label: "Employees", href: "/employees" },
      ].filter((p) => p.label.toLowerCase().includes(needle)).slice(0, 4),
    };
  }, [q, kpis, users]);

  const hasResults = results.kpis.length + results.people.length + results.pages.length > 0;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-ink-200 bg-white px-3 sm:px-4">
      <button className="rounded-md p-2 text-ink-500 hover:bg-ink-100 lg:hidden" onClick={onMenu} aria-label="Toggle navigation">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 lg:hidden">
        <Logo className="h-7" />
      </div>

      <div className="relative hidden max-w-md flex-1 sm:block" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          placeholder="Search KPIs, people, pages…"
          className="input h-9 pl-9"
        />
        {showSearch && q.trim().length >= 2 ? (
          <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-xl">
            {!hasResults ? <p className="px-4 py-3 text-sm text-ink-500">No results for “{q}”.</p> : null}
            {results.kpis.length ? (
              <div className="px-2 py-1">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">KPIs</p>
                {results.kpis.map((k) => (
                  <Link key={k.id} href={`/my-kpi/${k.id}`} onClick={() => setShowSearch(false)} className="block rounded-md px-2 py-1.5 text-sm hover:bg-ink-50">
                    <span className="font-medium text-ink-800">{k.name}</span> <span className="num text-xs text-ink-400">{k.code}</span>
                  </Link>
                ))}
              </div>
            ) : null}
            {results.people.length ? (
              <div className="px-2 py-1">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">People</p>
                {results.people.map((u) => (
                  <Link key={u.id} href={`/employees/${u.id}`} onClick={() => setShowSearch(false)} className="block rounded-md px-2 py-1.5 text-sm hover:bg-ink-50">
                    <span className="font-medium text-ink-800">{u.fullName}</span> <span className="text-xs text-ink-400">{u.employeeId}</span>
                  </Link>
                ))}
              </div>
            ) : null}
            {results.pages.length ? (
              <div className="px-2 py-1">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">Pages</p>
                {results.pages.map((p) => (
                  <Link key={p.href} href={p.href} onClick={() => setShowSearch(false)} className="block rounded-md px-2 py-1.5 text-sm hover:bg-ink-50">{p.label}</Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <span className="hidden items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 md:inline-flex" title="Your department">
          <Briefcase className="h-3.5 w-3.5 text-ink-400" />
          {myDepartment?.name ?? "—"}
        </span>

        <Link href="/announcements" className="hidden rounded-md p-2 text-ink-500 hover:bg-ink-100 sm:block" aria-label="Announcements">
          <HelpCircle className="h-5 w-5" />
        </Link>

        <div className="relative" ref={bellRef}>
          <button className="relative rounded-md p-2 text-ink-500 hover:bg-ink-100" onClick={() => setShowBell((s) => !s)} aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{unread}</span> : null}
          </button>
          {showBell ? (
            <div className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] overflow-hidden rounded-lg border border-ink-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-semibold text-ink-800">Notifications</p>
                {unread > 0 ? <button className="link text-xs" onClick={() => markAll()}>Mark all read</button> : null}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {myNotifs.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-ink-500">You’re all caught up.</p>
                ) : myNotifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { markNotification(n.id, true); setShowBell(false); if (n.link) router.push(n.link); }}
                    className={cn("flex w-full gap-3 border-b border-ink-50 px-4 py-3 text-left hover:bg-ink-50", !n.read && "bg-brand-50/40")}
                  >
                    <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-ink-200" : "bg-brand-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink-800">{n.title}</span>
                      <span className="block text-xs text-ink-500">{n.body}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative" ref={profRef}>
          <button className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-ink-100" onClick={() => setShowProfile((s) => !s)}>
            {me ? <Avatar name={me.fullName} size={30} /> : null}
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold leading-tight text-ink-800">{me?.fullName}</span>
              <span className="block text-[11px] leading-tight text-ink-500">{me ? ROLE_LABEL[me.role] : ""}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
          </button>
          {showProfile ? (
            <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-xl">
              <div className="border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-semibold text-ink-800">{me?.fullName}</p>
                <p className="text-xs text-ink-500">{me?.email}</p>
              </div>
              <Link href="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"><UserIcon className="h-4 w-4" /> My Profile</Link>
              <Link href="/notifications" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"><Bell className="h-4 w-4" /> Notifications</Link>
              <button onClick={() => { resetDemo(); setShowProfile(false); router.push("/dashboard"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"><RotateCcw className="h-4 w-4" /> Reset demo data</button>
              <button onClick={() => { logout(); router.push("/login"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Log out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
