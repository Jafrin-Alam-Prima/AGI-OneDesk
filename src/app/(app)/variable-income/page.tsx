"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Variable Income is now part of My KPI (segmented: KPI Scorecard | Variable Income).
export default function VariableIncomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/my-kpi");
  }, [router]);
  return (
    <div className="flex items-center justify-center py-16 text-sm text-ink-500">
      Variable Income has moved into <span className="mx-1 font-medium text-ink-700">My KPI</span> …
    </div>
  );
}
