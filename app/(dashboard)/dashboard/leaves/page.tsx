"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Repeat, Trash2 } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useBusinessId } from "@/lib/hooks/use-business";
import { useToast } from "@/components/ui/toast";

type Employee = { id: string; full_name: string };
type BlockedDate = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  recurring: boolean;
};

const DAY_NAMES_ORDERED = [
  { label: "Pazartesi", value: 1 },
  { label: "Salı", value: 2 },
  { label: "Çarşamba", value: 3 },
  { label: "Perşembe", value: 4 },
  { label: "Cuma", value: 5 },
  { label: "Cumartesi", value: 6 },
  { label: "Pazar", value: 0 },
];
const DAY_NAMES: Record<number, string> = { 0: "Pazar", 1: "Pazartesi", 2: "Salı", 3: "Çarşamba", 4: "Perşembe", 5: "Cuma", 6: "Cumartesi" };

export default function LeavesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<Record<string, string>>({});
  const [recurring, setRecurring] = useState<Record<string, boolean>>({});

  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  async function load() {
    const [bdRes, empRes] = await Promise.all([
      supabase
        .from("blocked_dates")
        .select("*")
        .eq("business_id", businessId)
        .order("starts_at", { ascending: false }),
      supabase
        .from("employees")
        .select("id, full_name")
        .eq("business_id", businessId)
        .eq("active", true),
    ]);

    setBlockedDates(bdRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  }

  async function handleAdd(employeeId: string) {
    const dayStr = selectedDays[employeeId];
    if (!dayStr && dayStr !== "0") {
      toast("Gün seçin.", "error");
      return;
    }
    const dayNum = parseInt(dayStr);
    const isRecurring = recurring[employeeId] || false;

    // Seçilen güne denk gelen en yakın tarihi bul
    const refDate = new Date();
    const currentDay = refDate.getDay();
    let diff = dayNum - currentDay;
    if (diff < 0) diff += 7;
    refDate.setDate(refDate.getDate() + diff);
    refDate.setHours(0, 0, 0, 0);

    const { error } = await supabase.from("blocked_dates").insert({
      business_id: businessId,
      employee_id: employeeId,
      starts_at: refDate.toISOString(),
      ends_at: new Date(refDate.getTime() + 86399000).toISOString(),
      reason: `recurring:${dayNum}`,
      recurring: isRecurring,
    });

    if (error) {
      toast("İzin eklenemedi: " + error.message, "error");
      return;
    }

    toast("İzin eklendi!", "success");
    setSelectedDays((p) => ({ ...p, [employeeId]: "" }));
    setRecurring((p) => ({ ...p, [employeeId]: false }));
    load();
  }

  async function removeLeave(id: string) {
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) {
      toast("Silinemedi: " + error.message, "error");
      return;
    }
    toast("İzin silindi.", "success");
    setBlockedDates(blockedDates.filter((b) => b.id !== id));
  }

  function getEmployeeLeaves(employeeId: string) {
    return blockedDates.filter((bd) => bd.employee_id === employeeId);
  }

  if (loading)
    return (
      <>
        <Topbar title="İzin Yönetimi" subtitle="Yükleniyor..." />
        <main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main>
      </>
    );

  return (
    <>
      <Topbar title="İzin Yönetimi" subtitle="Personel ve admin izin günlerini belirleyin." />
      <main className="grid gap-5 p-4 md:p-8">
        <p className="text-sm text-[var(--muted)]">
          Her personel için izinli gününü seçin. &quot;Tekrar edilebilir&quot; seçilirse her hafta o gün kapalı olur.
        </p>

        <div className="grid gap-4">
          {employees.map((emp) => {
            const leaves = getEmployeeLeaves(emp.id);
            return (
              <article key={emp.id} className="glass rounded-xl p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    <CalendarOff size={18} />
                  </div>
                  <strong className="text-base">{emp.full_name}</strong>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    className="h-10 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none"
                    value={selectedDays[emp.id] ?? ""}
                    onChange={(e) => setSelectedDays((p) => ({ ...p, [emp.id]: e.target.value }))}
                  >
                    <option value="">Gün seçin</option>
                    {DAY_NAMES_ORDERED.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm transition hover:bg-[var(--panel-strong)]">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--accent)]"
                      checked={recurring[emp.id] || false}
                      onChange={(e) => setRecurring((p) => ({ ...p, [emp.id]: e.target.checked }))}
                    />
                    <Repeat size={14} />
                    Tekrar edilebilir
                  </label>

                  <Button onClick={() => handleAdd(emp.id)} className="h-10 px-4 text-sm">
                    Ekle
                  </Button>
                </div>

                {leaves.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {leaves.map((lv) => {
                      const dayNum = lv.reason ? parseInt(lv.reason.split(":")[1]) : new Date(lv.starts_at).getDay();
                      const dayName = DAY_NAMES[dayNum] ?? "—";
                      return (
                        <div key={lv.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 dark:bg-red-400/10">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-red-700 dark:text-red-300">{dayName}</span>
                            {lv.recurring ? (
                              <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
                                <Repeat size={11} /> Her hafta
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">
                                ({new Date(lv.starts_at).toLocaleDateString("tr-TR")})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeLeave(lv.id)}
                            className="flex size-7 items-center justify-center rounded text-[var(--muted)] transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-400/15"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}

          {employees.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--muted)]">
              Henüz aktif personel bulunmuyor.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
