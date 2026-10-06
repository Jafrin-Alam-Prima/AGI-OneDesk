"use client";

import { useMemo, useState } from "react";
import { Download, ScrollText } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Card, CardHeader, Badge } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data-table";
import { download, formatDateTime, toCSV } from "@/lib/utils";
import type { AuditLog } from "@/lib/types";

export default function AuditPage() {
  const logs = useStore((s) => s.auditLogs);
  const users = useStore((s) => s.users);
  const [action, setAction] = useState("ALL");

  const actions = useMemo(() => [...new Set(logs.map((l) => l.action))].sort(), [logs]);
  const rows = useMemo(() => logs.filter((l) => action === "ALL" || l.action === action), [logs, action]);

  const cols: Column<AuditLog>[] = [
    { key: "at", header: "When", render: (l) => <span className="text-xs text-ink-500">{formatDateTime(l.at)}</span>, value: (l) => l.at },
    { key: "actorId", header: "Actor", render: (l) => nameOf(users, l.actorId), value: (l) => nameOf(users, l.actorId) },
    { key: "action", header: "Action", render: (l) => <Badge tone="blue">{l.action}</Badge> },
    { key: "entity", header: "Entity", render: (l) => <span className="text-xs text-ink-500">{l.entity}</span> },
    { key: "detail", header: "Detail" },
  ];

  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Append-only record of every action in AGI OneDesk."
        action={<button className="btn-secondary" onClick={() => download("audit-trail.csv", toCSV(rows.map((r) => ({ When: r.at, Actor: nameOf(users, r.actorId), Action: r.action, Entity: r.entity, Detail: r.detail }))))}><Download className="h-4 w-4" /> Export</button>} />

      <DataTable
        columns={cols}
        rows={rows}
        searchKeys={["action", "detail", "entity"]}
        searchPlaceholder="Search the audit trail…"
        pageSize={15}
        emptyTitle="No audit entries"
        toolbar={<select className="input max-w-[220px]" value={action} onChange={(e) => setAction(e.target.value)}><option value="ALL">All actions</option>{actions.map((a) => <option key={a} value={a}>{a}</option>)}</select>}
      />

      <Card className="mt-4">
        <CardHeader title="Immutable" subtitle="No user can edit or delete audit records" action={<ScrollText className="h-4 w-4 text-ink-400" />} />
        <p className="p-5 text-sm text-ink-500">Every creation, update, deletion and decision is recorded with the actor, time and detail. Records are never overwritten.</p>
      </Card>
    </div>
  );
}
