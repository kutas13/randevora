"use client";

import { cn } from "@/lib/utils";

const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const appointmentDots = [3, 5, 7, 10, 12, 14, 15, 17, 19, 20, 21, 23, 26, 28];

export function MonthlyView({ date }: { date: Date }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= totalDays; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="grid grid-cols-7 border-b border-[var(--line)]">
        {dayNames.map((d) => (
          <div key={d} className="border-r border-[var(--line)] p-3 text-center text-xs font-semibold text-[var(--muted)] last:border-0">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const hasAppointments = day !== null && appointmentDots.includes(day);
          return (
            <div
              key={i}
              className={cn(
                "min-h-20 border-b border-r border-[var(--line)] p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5",
                i % 7 === 6 && "border-r-0",
              )}
            >
              {day !== null && (
                <>
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                      isToday && "bg-teal-600 text-white",
                    )}
                  >
                    {day}
                  </span>
                  {hasAppointments && (
                    <div className="mt-1 flex gap-0.5">
                      <span className="size-1.5 rounded-full bg-teal-600" />
                      <span className="size-1.5 rounded-full bg-orange-500" />
                      {day % 3 === 0 && <span className="size-1.5 rounded-full bg-violet-500" />}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
