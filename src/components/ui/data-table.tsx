"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Search, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./primitives";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  className?: string;
  sortable?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns, rows, searchKeys, searchPlaceholder = "Search…", toolbar, pageSize = 10,
  onRowClick, emptyTitle = "No records found", emptyMessage, footer,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (keyof T)[] | ((row: T) => string);
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((r) => {
        if (typeof searchKeys === "function") return searchKeys(r).toLowerCase().includes(needle);
        const keys = searchKeys ?? (columns.map((c) => c.key) as (keyof T)[]);
        return keys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle));
      });
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      out = [...out].sort((a, b) => {
        const av = col?.value ? col.value(a) : (a as Record<string, unknown>)[sort.key];
        const bv = col?.value ? col.value(b) : (b as Record<string, unknown>)[sort.key];
        let cmp = 0;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, sort, columns, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="card">
      {(searchKeys || toolbar) ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-4 py-3">
          {searchKeys ? (
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="input pl-9"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn("th", c.align === "right" && "text-right", c.align === "center" && "text-center", c.sortable && "cursor-pointer select-none hover:text-ink-700")}
                  onClick={() => c.sortable && setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" }))}
                >
                  {c.header}{sort?.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn("border-b border-ink-50 last:border-0", onRowClick && "cursor-pointer hover:bg-ink-50/60")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("td", c.align === "right" && "text-right", c.align === "center" && "text-center", c.className)}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length ? (
        <div className="p-4"><EmptyState title={emptyTitle} message={emptyMessage} /></div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
          <p className="text-xs text-ink-500">
            Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            {footer}
            <button className="btn-secondary btn-sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>Prev</button>
            <span className="text-xs text-ink-500">Page {current} / {totalPages}</span>
            <button className="btn-secondary btn-sm" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActionMenu({ items, label }: { items: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean }[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="relative inline-block" ref={ref}>
      <button className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} aria-label={label ?? "Actions"}>
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-lg">
          {items.map((it, i) => (
            <button
              key={i}
              disabled={it.disabled}
              onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick(); }}
              className={cn("block w-full px-3 py-2 text-left text-sm hover:bg-ink-50 disabled:opacity-40", it.danger ? "text-red-600" : "text-ink-700")}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
