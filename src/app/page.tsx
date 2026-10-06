"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, useCurrentUser } from "@/lib/store";
import { ROLE_HOME } from "@/lib/navigation";

export default function Home() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const me = useCurrentUser();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(me ? ROLE_HOME[me.role] : "/login");
  }, [hydrated, me, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
    </div>
  );
}
