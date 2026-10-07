"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { KpiDetailView } from "@/components/kpi/kpi-detail";
import { KpiEntrySection } from "@/components/kpi/kpi-entry";
import { KpiForm } from "@/components/kpi/kpi-form";
import { EmptyState } from "@/components/ui/primitives";

export default function KpiDetailPage() {
  const params = useParams<{ id: string }>();
  const me = useCurrentUser();
  const kpi = useStore((s) => s.kpis.find((k) => k.id === params.id));
  const [open, setOpen] = useState(false);

  if (!kpi || kpi.deleted) {
    return (
      <EmptyState
        title="KPI not found"
        message="This KPI does not exist or has been removed."
        action={<Link href="/my-kpi" className="btn-primary">Back to My KPI</Link>}
      />
    );
  }

  const isOwner = me?.id === kpi.ownerId;
  const canEdit = isOwner && (kpi.status === "RETURNED" || kpi.status === "DRAFT");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/my-kpi" className="btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" /> Back to My KPI</Link>
        {canEdit ? (
          <button className="btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> {kpi.status === "DRAFT" ? "Edit draft" : "Correct & resubmit"}
          </button>
        ) : null}
      </div>
      <KpiEntrySection kpi={kpi} />
      <KpiDetailView kpi={kpi} />
      {canEdit ? <KpiForm open={open} onClose={() => setOpen(false)} existing={kpi} mode={kpi.status === "DRAFT" ? "edit" : "resubmit"} /> : null}
    </div>
  );
}
