"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { NAV, ROLE_HOME } from "@/lib/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

import type { Role } from "@/lib/types";

const ADMIN_ONLY = ["SYS_ADMIN", "SUPER_ADMIN"] as Role[];
const STAFF_ONLY: Role[] = ["DEPT_HEAD", "HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"];
const STAFF_PREFIXES = ["/kpi-requests", "/approvals", "/leaderboard", "/recruitment", "/confirmation", "/transfers", "/separation", "/rewards", "/assets", "/grc", "/reports"];

function isDenied(pathname: string, role: Role): boolean {
  if (pathname.startsWith("/admin") && !ADMIN_ONLY.includes(role)) return true;
  if (pathname === "/employees" && !ADMIN_ONLY.includes(role)) return true;
  if (STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")) && !STAFF_ONLY.includes(role)) return true;
  return false;
}

function moduleTitleFor(pathname: string): string {
  for (const g of NAV) {
    for (const it of g.items) {
      if (it.href && (pathname === it.href || pathname.startsWith(it.href + "/"))) return it.label;
      if (it.children?.some((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + "/")))) return it.label;
    }
  }
  return "AGI OneDesk";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useStore((s) => s.hydrated);
  const sessionUserId = useStore((s) => s.session.userId);
  const me = useCurrentUser();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (hydrated && !sessionUserId) router.replace("/login");
  }, [hydrated, sessionUserId, router]);

  useEffect(() => { setDrawer(false); }, [pathname]);

  if (!hydrated || !me) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink-400">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          <p className="text-sm">Loading AGI OneDesk…</p>
        </div>
      </div>
    );
  }

  // guard: employee should not land on role-restricted routes (handled per-page too)
  void ROLE_HOME;

  const denied = isDenied(pathname, me.role);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {/* desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-200 lg:block">
        <Sidebar role={me.role} />
      </aside>

      {/* mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-ink-200">
            <Sidebar role={me.role} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setDrawer(true)} />
        <div className="flex-1 overflow-y-auto">
          <div className="bg-brand-600 px-4 py-2.5 sm:px-6">
            <h2 className="text-sm font-semibold text-white">{moduleTitleFor(pathname)}</h2>
          </div>
          <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
            {denied ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-ink-200 bg-white px-6 py-16 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600"><ShieldAlert className="h-6 w-6" /></span>
                <h2 className="text-lg font-bold text-ink-900">Access restricted</h2>
                <p className="mt-1 max-w-md text-sm text-ink-500">
                  Your role ({me.role.replace("_", " ")}) does not have permission to open this screen. Access is enforced by role and department.
                </p>
                <button className="btn-primary mt-4" onClick={() => router.push(ROLE_HOME[me.role])}>Go to my home</button>
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </div>
  );
}
