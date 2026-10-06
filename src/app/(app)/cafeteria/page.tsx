"use client";

import { useState } from "react";
import { UtensilsCrossed, Plus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Badge, StatCard, Card, CardHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate, todayISO } from "@/lib/utils";

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export default function CafeteriaPage() {
  const me = useCurrentUser();
  const meals = useStore((s) => s.meals);
  const users = useStore((s) => s.users);
  const book = useStore((s) => s.bookMeal);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ date: todayISO(), meal: "Lunch", quantity: "1" });

  if (!me) return null;
  const isAdmin = ["SYS_ADMIN", "HR_ADMIN", "SUPER_ADMIN"].includes(me.role);
  const mine = meals.filter((m) => m.userId === me.id);
  const todayCount = meals.filter((m) => m.date === todayISO()).reduce((s, m) => s + m.quantity, 0);

  return (
    <div>
      <PageHeader title="Cafeteria / Food Corner" subtitle="Book meals and view cafeteria usage."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Book Meal</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="My bookings" value={mine.length} icon={<UtensilsCrossed className="h-5 w-5" />} />
        <StatCard label="Meals today (all)" value={todayCount} tone="blue" />
        <StatCard label="Menu items" value={MEALS.length} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent bookings" />
          <div className="divide-y divide-ink-100">
            {(isAdmin ? meals : mine).slice(0, 12).map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div><p className="text-sm text-ink-800">{m.meal} × {m.quantity}</p><p className="text-xs text-ink-400">{isAdmin ? `${nameOf(users, m.userId)} · ` : ""}{formatDate(m.date)}</p></div>
                <Badge tone="green">Confirmed</Badge>
              </div>
            ))}
            {!(isAdmin ? meals : mine).length ? <p className="px-5 py-4 text-sm text-ink-500">No meal bookings.</p> : null}
          </div>
        </Card>
        <Card>
          <CardHeader title="Today's menu" />
          <ul className="divide-y divide-ink-100 p-5 pt-0">
            {MEALS.map((m) => <li key={m} className="flex items-center justify-between py-2.5"><span className="text-sm text-ink-700">{m}</span><Badge tone="green">Available</Badge></li>)}
          </ul>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Book a meal" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={() => { book({ userId: me.id, date: f.date, meal: f.meal, quantity: Number(f.quantity) }); push("success", "Meal booked."); setOpen(false); }}>Book</button></>}>
        <Field label="Date" required><TextInput type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Meal" required><Select value={f.meal} onChange={(e) => setF({ ...f, meal: e.target.value })}>{MEALS.map((m) => <option key={m}>{m}</option>)}</Select></Field>
          <Field label="Quantity" required><TextInput type="number" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
