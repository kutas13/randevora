"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const hours = Array.from({ length: 10 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

type DayAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  customer: { full_name: string } | null;
  employee: { full_name: string } | null;
  service: { name: string; color: string } | null;
};

export function DailyView({ date }: { date: Date }) {
  const [appointments, setAppointments] = useState<DayAppointment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const { data } = await supabase
        .from("appointments")
        .select("id, starts_at, ends_at, customer:customers(full_name), employee:employees(full_name), service:services(name, color)")
        .gte("starts_at", start.toISOString())
        .lte("starts_at", end.toISOString())
        .in("status", ["pending", "confirmed"])
        .order("starts_at");

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        customer: Array.isArray(row.customer) ? row.customer[0] || null : row.customer,
        employee: Array.isArray(row.employee) ? row.employee[0] || null : row.employee,
        service: Array.isArray(row.service) ? row.service[0] || null : row.service,
      }));
      setAppointments(mapped);
    }
    load();
  }, [date]);

  const dayLabel = date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="border-b border-[var(--line)] px-5 py-3">
        <h3 className="text-sm font-bold capitalize">{dayLabel}</h3>
      </div>
      <div className="grid">
        {hours.map((hour) => {
          const hourNum = parseInt(hour.split(":")[0]);
          const hourApts = appointments.filter((a) => new Date(a.starts_at).getHours() === hourNum);
          return (
            <div key={hour} className="grid min-h-16 grid-cols-[80px_1fr] border-b border-[var(--line)] last:border-0">
              <div className="flex items-start justify-end border-r border-[var(--line)] p-3 text-xs text-[var(--muted)]">{hour}</div>
              <div className="flex flex-col gap-1.5 p-2">
                {hourApts.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border-l-4 bg-[var(--panel-strong)] p-2.5 shadow-sm transition-all duration-200 hover:shadow-md"
                    style={{ borderLeftColor: apt.service?.color || "#0f766e" }}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm">{apt.customer?.full_name || "Müşteri"}</strong>
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(apt.starts_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - {new Date(apt.ends_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{apt.service?.name || "Hizmet"} · {apt.employee?.full_name || "Atanmamış"}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {appointments.length === 0 && (
        <div className="p-6 text-center text-sm text-[var(--muted)]">Bu gün randevu bulunmuyor.</div>
      )}
    </div>
  );
}
