"use client";

import { useState } from "react";
import { Calendar, Check, Clock, Filter, Search, X } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { appointments as initialAppointments } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const statusConfig: Record<AppointmentStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  pending: { label: "Onay bekliyor", variant: "warning" },
  confirmed: { label: "Onaylandı", variant: "success" },
  completed: { label: "Tamamlandı", variant: "info" },
  cancelled: { label: "İptal", variant: "danger" },
  no_show: { label: "Gelmedi", variant: "default" },
};

const filterTabs: { label: string; value: AppointmentStatus | "all" }[] = [
  { label: "Tümü", value: "all" },
  { label: "Bekliyor", value: "pending" },
  { label: "Onaylı", value: "confirmed" },
  { label: "Tamamlandı", value: "completed" },
  { label: "İptal", value: "cancelled" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (searchQuery && !a.customerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return (
    <>
      <Topbar title="Randevular" subtitle="Çakışma kontrolü, bildirim akışı ve durum yönetimi." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition ${filter === tab.value ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm">
            <Search size={16} className="text-[var(--muted)]" />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Müşteri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Randevu bulunamadı"
            description="Seçili filtrelerinize uygun randevu yok. Filtreleri değiştirin veya yeni randevu oluşturun."
          />
        ) : (
          <div className="grid gap-3">
            {filtered.map((appointment, index) => {
              const config = statusConfig[appointment.status];
              return (
                <article
                  key={appointment.id}
                  className={`glass animate-fade-in grid items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:shadow-md lg:grid-cols-[0.6fr_1fr_1fr_0.5fr_0.6fr_auto] stagger-${Math.min(index + 1, 4)}`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[var(--muted)]" />
                    <strong className="text-sm">{appointment.startsAt} - {appointment.endsAt}</strong>
                  </div>
                  <div>
                    <strong className="block text-sm">{appointment.customerName}</strong>
                    <small className="text-[var(--muted)]">{appointment.customerPhone}</small>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 rounded-full" style={{ background: appointment.color }} />
                    <span className="text-[var(--muted)]">{appointment.serviceName} · {appointment.employeeName}</span>
                  </div>
                  <strong className="text-sm">{formatMoney(appointment.price)}</strong>
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <div className="flex gap-1.5">
                    {appointment.status === "pending" && (
                      <Button
                        variant="secondary"
                        className="size-8 px-0"
                        aria-label="Onayla"
                        onClick={() => updateStatus(appointment.id, "confirmed")}
                      >
                        <Check size={15} />
                      </Button>
                    )}
                    {(appointment.status === "pending" || appointment.status === "confirmed") && (
                      <Button
                        variant="danger"
                        className="size-8 px-0"
                        aria-label="İptal et"
                        onClick={() => updateStatus(appointment.id, "cancelled")}
                      >
                        <X size={15} />
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
