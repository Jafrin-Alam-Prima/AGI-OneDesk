"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { visibleNav } from "@/lib/navigation";
import type { Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { NavIcon } from "./icon";
import { Logo } from "./logo";

export function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = visibleNav(role);

  const pendingCount = useStore((s) => {
    const me = s.users.find((u) => u.id === s.session.userId);
    if (!me) return 0;
    return s.kpis.filter((k) => {
      if (k.deleted || k.status !== "SUBMITTED") return false;
      if (me.role === "SUPER_ADMIN") return true;
      if (me.role === "HR_ADMIN") return k.stage === "HR";
      if (me.role === "FINANCE_ADMIN") return k.stage === "FINANCE";
      if (me.role === "AUDIT_ADMIN") return k.stage === "AUDIT";
      if (me.role === "DEPT_HEAD") return s.users.find((u) => u.id === k.ownerId)?.departmentId === me.departmentId && k.stage === "DEPT";
      return false;
    }).length;
  });

  const isActive = (href?: string): boolean => !!href && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="flex h-full flex-col overflow-y-auto bg-white">
      <div className="flex items-center gap-2.5 border-b border-ink-100 px-4 py-3.5">
        <Logo className="h-8" />
        <span className="h-6 w-px bg-ink-200" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink-900">AGI OneDesk</p>
          <p className="text-[11px] text-ink-500">Anwar Group</p>
        </div>
      </div>
      <div className="flex-1 px-2 py-3">
        {groups.map((group) => (
          <div key={group.title} className="mb-3">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavRow
                  key={item.label}
                  item={item}
                  active={isActive(item.href)}
                  pathname={pathname}
                  pendingCount={item.badgeKey === "kpiPending" ? pendingCount : 0}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

function NavRow({
  item, active, pathname, pendingCount, onNavigate,
}: {
  item: ReturnType<typeof visibleNav>[number]["items"][number];
  active: boolean | undefined;
  pathname: string;
  pendingCount: number;
  onNavigate?: () => void;
}) {
  const hasChildren = !!item.children?.length;
  const childActive = item.children?.some((c) => pathname === c.href || pathname.startsWith((c.href ?? "") + "/"));
  const [open, setOpen] = useState(childActive ?? false);

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            childActive ? "text-brand-700" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
          )}
        >
          <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
        {open ? (
          <ul className="mt-0.5 space-y-0.5 pl-9">
            {item.children!.map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href ?? "#"}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm",
                    pathname === c.href ? "bg-brand-50 font-medium text-brand-700" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                  )}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href ?? "#"}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        )}
      >
        <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {pendingCount > 0 ? (
          <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>
        ) : null}
      </Link>
    </li>
  );
}
