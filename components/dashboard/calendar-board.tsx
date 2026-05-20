"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type CalendarAppointment = {
  id: string;
  starts_at: string;
  customer: { full_name: string; phone?: string } | null;
  service: { name: string; color: string } | null;
};

export function CalendarBoard() {
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const { data } = await supabase
        .from("appointments")
        .select("id, starts_at, customer:customers(full_name, phone), service:services(name, color)")
        .gte("starts_at", startOfWeek.toISOString())
        .lt("starts_at", endOfWeek.toISOString())
        .in("status", ["pending", "confirmed"]);

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        starts_at: row.starts_at,
        customer: Array.isArray(row.customer) ? row.customer[0] || null : row.customer,
        service: Array.isArray(row.service) ? row.service[0] || null : row.service,
      }));
      setAppointments(mapped);
    }
    load();
  }, []);

  function getSlotAppointments(day: string, hour: string) {
    return appointments.filter((apt) => {
      const d = new Date(apt.starts_at);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const aptDay = days[dayIndex];
      const aptHour = `${String(d.getHours()).padStart(2, "0")}:00`;
      return aptDay === day && aptHour === hour;
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)]">
      <div className="grid min-w-[820px] grid-cols-[72px_repeat(7,1fr)]">
        <div className="border-b border-r border-[var(--line)] p-3 text-xs text-[var(--muted)]">Saat</div>
        {days.map((day) => (
          <div key={day} className="border-b border-r border-[var(--line)] p-3 text-sm font-semibold">{day}</div>
        ))}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="border-b border-r border-[var(--line)] p-3 text-xs text-[var(--muted)]">{hour}</div>
            {days.map((day) => {
              const slotApts = getSlotAppointments(day, hour);
              return (
                <div key={`${day}-${hour}`} className="min-h-20 border-b border-r border-[var(--line)] p-2">
                  {slotApts.map((apt) => (
                    <div
                      key={apt.id}
                      className="mb-1 rounded-lg border border-[var(--line)] border-l-4 bg-[var(--panel-strong)] p-2 text-xs shadow-sm"
                      style={{ borderLeftColor: apt.service?.color || "#0f766e" }}
                    >
                      <strong className="block text-[var(--foreground)]">{apt.customer?.full_name || "Müşteri"}</strong>
                      <span className="text-[var(--muted)]">{apt.service?.name || "Hizmet"}</span>
                      {apt.customer?.phone && <span className="block text-[var(--muted)]">{apt.customer.phone}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {appointments.length === 0 && (
        <div className="p-8 text-center text-sm text-[var(--muted)]">Bu hafta randevu bulunmuyor.</div>
      )}
    </div>
  );
}
