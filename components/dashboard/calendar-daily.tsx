"use client";

import { appointments } from "@/lib/mock-data";

const hours = Array.from({ length: 10 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

export function DailyView({ date }: { date: Date }) {
  const dayLabel = date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="border-b border-[var(--line)] px-5 py-3">
        <h3 className="text-sm font-bold capitalize">{dayLabel}</h3>
      </div>
      <div className="grid">
        {hours.map((hour) => {
          const hourAppointments = appointments.filter((a) => a.startsAt.startsWith(hour.split(":")[0]));
          return (
            <div key={hour} className="grid min-h-16 grid-cols-[80px_1fr] border-b border-[var(--line)] last:border-0">
              <div className="flex items-start justify-end border-r border-[var(--line)] p-3 text-xs text-[var(--muted)]">
                {hour}
              </div>
              <div className="flex flex-col gap-1.5 p-2">
                {hourAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border-l-4 bg-[var(--panel-strong)] p-2.5 shadow-sm transition-all duration-200 hover:shadow-md"
                    style={{ borderLeftColor: apt.color }}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm">{apt.customerName}</strong>
                      <span className="text-xs text-[var(--muted)]">{apt.startsAt} - {apt.endsAt}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{apt.serviceName} · {apt.employeeName}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
