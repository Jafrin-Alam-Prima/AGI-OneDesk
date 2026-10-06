"use client";

import { Check, Circle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiStatus } from "@/lib/types";

export const TRACKER_STEPS = ["Target", "Actual", "Evidence", "Score", "Review", "Approval"] as const;
type Step = (typeof TRACKER_STEPS)[number];
type StepState = "done" | "current" | "pending" | "stop";

export function trackerStates(status: KpiStatus): StepState[] {
  if (status === "DRAFT") return ["pending", "pending", "pending", "pending", "pending", "pending"];
  const base: StepState[] = ["done", "done", "done", "done", "current", "pending"];
  switch (status) {
    case "SUBMITTED": return base;
    case "RETURNED": return ["done", "done", "done", "done", "stop", "pending"];
    case "REJECTED": return ["done", "done", "done", "done", "stop", "pending"];
    case "APPROVED":
    case "ADJUSTED":
    case "COMPLETED": return ["done", "done", "done", "done", "done", "done"];
    default: return base;
  }
}

export function Tracker({ status, size = "sm" }: { status: KpiStatus; size?: "sm" | "md" }) {
  const states = trackerStates(status);
  return (
    <div className={cn("grid grid-cols-3 gap-x-3 gap-y-2", size === "md" && "grid-cols-6")}>
      {TRACKER_STEPS.map((step, i) => {
        const st = states[i];
        return (
          <div key={step} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                st === "done" && "bg-emerald-500 text-white",
                st === "current" && "bg-amber-400 text-white",
                st === "stop" && "bg-red-500 text-white",
                st === "pending" && "border border-ink-300 text-transparent"
              )}
            >
              {st === "done" ? <Check className="h-2.5 w-2.5" /> : st === "stop" ? <Minus className="h-2.5 w-2.5" /> : st === "current" ? <Circle className="h-2 w-2 fill-current" /> : null}
            </span>
            <span className={cn("text-[11px] leading-none", st === "done" ? "text-ink-600" : st === "current" ? "font-medium text-amber-700" : st === "stop" ? "font-medium text-red-600" : "text-ink-400")}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
