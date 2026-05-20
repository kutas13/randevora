"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { CalendarBoard } from "@/components/dashboard/calendar-board";
import { DailyView } from "@/components/dashboard/calendar-daily";
import { MonthlyView } from "@/components/dashboard/calendar-monthly";
import { Button } from "@/components/ui/button";

type ViewMode = "daily" | "weekly" | "monthly";

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());

  const dateLabel = currentDate.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function navigate(direction: -1 | 1) {
    const newDate = new Date(currentDate);
    if (view === "daily") newDate.setDate(newDate.getDate() + direction);
    else if (view === "weekly") newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  }

  return (
    <>
      <Topbar title="Takvim" subtitle="Günlük, haftalık ve aylık görünüm için sürükle bırak destekli planlama." />
      <main className="grid gap-5 p-4 md:p-8">
        <section className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-1">
              {(["daily", "weekly", "monthly"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${view === v ? "bg-neutral-950 text-white shadow-sm dark:bg-white dark:text-neutral-950" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  {v === "daily" ? "Günlük" : v === "weekly" ? "Haftalık" : "Aylık"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="flex size-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-32 text-center text-sm font-semibold">{dateLabel}</span>
              <button
                onClick={() => navigate(1)}
                className="flex size-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2 text-xs font-semibold transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              Bugün
            </button>
            <Button variant="secondary">
              <Filter size={16} /> Filtre
            </Button>
          </div>
        </section>

        {view === "weekly" && <CalendarBoard />}
        {view === "daily" && <DailyView date={currentDate} />}
        {view === "monthly" && <MonthlyView date={currentDate} />}
      </main>
    </>
  );
}
