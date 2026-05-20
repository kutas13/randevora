"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";

type Service = { id: string; name: string; duration_minutes: number; price_cents: number; price_variable: boolean; color: string };
type Employee = { id: string; full_name: string; title: string | null };
type WorkingHour = { employee_id: string; weekday: number; starts_at: string; ends_at: string };
type BlockedDate = { employee_id: string; starts_at: string; ends_at: string; reason?: string | null; recurring?: boolean };

type Props = {
  businessId: string;
  services: Service[];
  employees: Employee[];
  fixedEmployeeId: string | null;
  workingHours?: WorkingHour[];
  blockedDates?: BlockedDate[];
  bookingWindow?: string;
  slotCapacity?: number;
  slotMerge?: boolean;
};

type Step = "service" | "employee" | "datetime" | "info" | "done";

export function BookingForm({ businessId, services, employees, fixedEmployeeId, workingHours = [], blockedDates = [], bookingWindow = "weekly", slotCapacity = 1, slotMerge = true }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const selectedService = selectedServices.length > 0 ? selectedServices[0] : null;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_cents, 0);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(fixedEmployeeId || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [busySlots, setBusySlots] = useState<string[]>([]);

  const supabase = createClient();

  // Randevu kabul süresi hesapla
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxBookingDate = new Date(today);

  if (bookingWindow === "monthly") {
    maxBookingDate.setMonth(maxBookingDate.getMonth() + 1);
    maxBookingDate.setDate(0); // Ay sonu
  } else if (bookingWindow === "biweekly") {
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    maxBookingDate.setDate(today.getDate() + daysUntilSunday + 7);
  } else {
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    maxBookingDate.setDate(today.getDate() + daysUntilSunday);
  }

  // Seçili personelin izinli olduğu günleri kontrol et (tekrar edilen dahil)
  function isBlockedDay(dateStr: string) {
    const empId = fixedEmployeeId || selectedEmployee;
    if (!empId) return false;
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    return blockedDates.some((bd) => {
      if (bd.employee_id !== empId) return false;
      // Tekrar edilen izin: her hafta aynı gün
      const isRecurring = bd.recurring || (bd.reason && bd.reason.startsWith("recurring:"));
      if (isRecurring) {
        const blockedDay = new Date(bd.starts_at).getDay();
        return dayOfWeek === blockedDay;
      }
      const start = new Date(bd.starts_at);
      const end = new Date(bd.ends_at);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    });
  }

  // Çalışma saatlerine göre uygun saatleri al
  function getAvailableHours(dateStr: string): string[] {
    const empId = fixedEmployeeId || selectedEmployee;
    if (!empId || !dateStr) return defaultHours();

    const d = new Date(dateStr);
    const weekday = d.getDay();

    const empHours = workingHours.filter((wh) => wh.employee_id === empId && wh.weekday === weekday);
    if (empHours.length === 0) return defaultHours();

    const slots: string[] = [];
    for (const wh of empHours) {
      const startH = parseInt(wh.starts_at.split(":")[0]);
      const endH = parseInt(wh.ends_at.split(":")[0]);
      for (let h = startH; h < endH; h++) {
        slots.push(`${String(h).padStart(2, "0")}:00`);
      }
    }
    return slots.length > 0 ? slots : defaultHours();
  }

  function defaultHours() {
    return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  }

  useEffect(() => {
    async function loadBusy() {
      const empId = fixedEmployeeId || selectedEmployee;
      if (!date || !empId) { setBusySlots([]); return; }

      const start = `${date}T00:00:00`;
      const end = `${date}T23:59:59`;
      const { data } = await supabase
        .from("appointments")
        .select("starts_at, ends_at")
        .eq("employee_id", empId)
        .gte("starts_at", start)
        .lte("starts_at", end)
        .in("status", ["pending", "confirmed"]);

      const countByHour: Record<string, number> = {};
      (data || []).forEach((a) => {
        const s = new Date(a.starts_at);
        const e = new Date(a.ends_at);
        let current = new Date(s);
        while (current < e) {
          const hour = `${String(current.getHours()).padStart(2, "0")}:00`;
          countByHour[hour] = (countByHour[hour] || 0) + 1;
          current = new Date(current.getTime() + 60 * 60 * 1000);
        }
      });

      const busy = Object.entries(countByHour)
        .filter(([, count]) => count >= slotCapacity)
        .map(([hour]) => hour);
      setBusySlots(busy);
    }
    loadBusy();
  }, [date, selectedEmployee, fixedEmployeeId, slotCapacity]);

  function nextStep() {
    if (step === "service" && selectedServices.length > 0) {
      if (fixedEmployeeId) setStep("datetime");
      else setStep("employee");
    } else if (step === "employee" && selectedEmployee) {
      setStep("datetime");
    } else if (step === "datetime" && date && time) {
      setStep("info");
    }
  }

  function toggleService(s: Service) {
    setSelectedServices((prev) =>
      prev.find((ps) => ps.id === s.id)
        ? prev.filter((ps) => ps.id !== s.id)
        : [...prev, s]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) { setError("Ad ve telefon gerekli."); return; }
    setSubmitting(true);
    setError("");

    const totalHours = Math.ceil(totalDuration / 60);
    const slotsToBlock = slotMerge ? Math.ceil(totalHours / 2) : totalHours;

    const startsAt = new Date(`${date}T${time}`);
    const endsAt = new Date(startsAt.getTime() + slotsToBlock * 60 * 60 * 1000);

    const res = await fetch("/api/public-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        name: name.trim(),
        phone: phone.trim(),
        serviceId: selectedServices[0].id,
        employeeId: selectedEmployee || fixedEmployeeId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        priceCents: totalPrice,
        notes: selectedServices.map((s) => s.name).join(", "),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Randevu oluşturulamadı.");
      setSubmitting(false);
      return;
    }

    setStep("done");
    setSubmitting(false);
  }

  if (step === "done") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-400/15">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Randevunuz alındı!</h2>
        <p className="mt-2 text-[var(--muted)]">
          {selectedServices.map((s) => s.name).join(", ")} · {date} {time}
        </p>
        <p className="mt-4 text-sm text-[var(--muted)]">İşletme onayladıktan sonra randevunuz kesinleşecektir.</p>
      </div>
    );
  }

  const availableHours = getAvailableHours(date);

  return (
    <div className="glass rounded-2xl p-6">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <StepIndicator label="Hizmet" active={step === "service"} done={step !== "service"} />
        <ChevronRight size={12} />
        {!fixedEmployeeId && <><StepIndicator label="Personel" active={step === "employee"} done={step === "datetime" || step === "info"} /><ChevronRight size={12} /></>}
        <StepIndicator label="Tarih & Saat" active={step === "datetime"} done={step === "info"} />
        <ChevronRight size={12} />
        <StepIndicator label="Bilgiler" active={step === "info"} done={false} />
      </div>

      {/* Hizmet seçimi */}
      {step === "service" && (
        <div className="grid gap-3">
          <h2 className="text-lg font-bold">Hizmet seçin <span className="text-sm font-normal text-[var(--muted)]">(birden fazla seçebilirsiniz)</span></h2>
          {services.map((s) => {
            const isSelected = selectedServices.some((ps) => ps.id === s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleService(s)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${isSelected ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" : "border-[var(--line)] hover:border-[var(--accent)]/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-5 items-center justify-center rounded-md border-2 transition ${isSelected ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--line)]"}`}>
                    {isSelected && <svg viewBox="0 0 12 12" className="size-3 text-white"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>}
                  </div>
                  <span className="size-3 rounded-full" style={{ background: s.color }} />
                  <div>
                    <strong className="block text-sm">{s.name}</strong>
                    <span className="text-xs text-[var(--muted)]">{s.duration_minutes >= 60 && s.duration_minutes % 60 === 0 ? `${s.duration_minutes / 60} saat` : `${s.duration_minutes} dakika`}</span>
                  </div>
                </div>
                <div className="text-right">
                  <strong className="text-sm">{formatMoney(s.price_cents)}</strong>
                  {s.price_variable && <p className="text-[10px] text-orange-600">Değişkenlik gösterebilir</p>}
                </div>
              </button>
            );
          })}
          {selectedServices.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-[var(--accent)]/5 p-3 text-sm">
              <span>{selectedServices.length} hizmet seçildi</span>
              <span className="font-bold">{formatMoney(totalPrice)} · {totalDuration >= 60 && totalDuration % 60 === 0 ? `${totalDuration / 60} saat` : `${totalDuration} dk`}</span>
            </div>
          )}
          <Button onClick={nextStep} disabled={selectedServices.length === 0} className="mt-3">
            Devam
          </Button>
        </div>
      )}

      {/* Personel seçimi */}
      {step === "employee" && (
        <div className="grid gap-3">
          <h2 className="text-lg font-bold">Personel seçin</h2>
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${selectedEmployee === emp.id ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" : "border-[var(--line)] hover:border-[var(--accent)]/50"}`}
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#b07c4f] to-[#d4956a] text-xs font-bold text-white">
                {emp.full_name.charAt(0)}
              </span>
              <div>
                <strong className="block text-sm">{emp.full_name}</strong>
                <span className="text-xs text-[var(--muted)]">{emp.title || "Personel"}</span>
              </div>
            </button>
          ))}
          <Button onClick={nextStep} disabled={!selectedEmployee} className="mt-3">
            Devam
          </Button>
        </div>
      )}

      {/* Tarih ve saat */}
      {step === "datetime" && (
        <div className="grid gap-4">
          <h2 className="text-lg font-bold">Tarih ve saat seçin</h2>
          <WeekCalendar
            value={date}
            onChange={(d) => { setDate(d); setTime(""); }}
            maxDate={maxBookingDate}
            isBlocked={isBlockedDay}
          />

          {date && (
            <div>
              <p className="mb-2 text-sm font-semibold">Uygun saatler</p>
              <div className="grid grid-cols-4 gap-2">
                {availableHours.map((slot) => {
                  const isBusy = busySlots.includes(slot);
                  const isSelected = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBusy}
                      onClick={() => setTime(slot)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        isBusy
                          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-300 line-through dark:border-red-400/20 dark:bg-red-400/5 dark:text-red-500"
                          : isSelected
                          ? "border-[var(--accent)] bg-gradient-to-r from-[#b07c4f] to-[#d4956a] text-white shadow-sm"
                          : "border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedServices.length > 0 && date && (
            <div className="rounded-lg bg-[var(--panel-strong)] p-3 text-sm">
              <CalendarClock size={14} className="mb-1 inline text-[var(--accent)]" /> Toplam Süre: <strong>{totalDuration >= 60 && totalDuration % 60 === 0 ? `${totalDuration / 60} saat` : `${totalDuration} dakika`}</strong>
            </div>
          )}

          <Button onClick={nextStep} disabled={!date || !time} className="mt-2">
            Devam
          </Button>
        </div>
      )}

      {/* Kişi bilgileri */}
      {step === "info" && (
        <div className="grid gap-4">
          <h2 className="text-lg font-bold">Bilgileriniz</h2>
          <div>
            <label className="text-sm font-semibold">Ad Soyad</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Adınız Soyadınız" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Telefon</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="+90 5xx xxx xx xx" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <h3 className="text-sm font-bold">Randevu özeti</h3>
            <div className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
              <p>Hizmet: <strong className="text-[var(--foreground)]">{selectedServices.map((s) => s.name).join(", ")}</strong></p>
              <p>Tarih: <strong className="text-[var(--foreground)]">{date} {time}</strong></p>
              <p>Toplam Süre: <strong className="text-[var(--foreground)]">{totalDuration >= 60 && totalDuration % 60 === 0 ? `${totalDuration / 60} saat` : `${totalDuration} dk`}</strong></p>
              <p>Ücret: <strong className="text-[var(--foreground)]">{formatMoney(totalPrice)}</strong></p>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
            {submitting ? "Gönderiliyor..." : "Randevu al"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={`${active ? "text-[var(--accent)] font-bold" : done ? "text-[var(--foreground)]" : ""}`}>
      {label}
    </span>
  );
}

function WeekCalendar({ value, onChange, maxDate, isBlocked }: { value: string; onChange: (d: string) => void; maxDate: Date; isBlocked: (d: string) => boolean }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bu haftanın günlerini oluştur (bugünden pazar gününe kadar)
  const days: Date[] = [];
  const current = new Date(today);
  while (current <= maxDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const dayLabels = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
      <p className="mb-3 text-center text-xs font-semibold text-[var(--muted)]">Bu hafta</p>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
          const blocked = isBlocked(dateStr);
          const isSelected = dateStr === value;
          const isToday = day.getTime() === today.getTime();

          return (
            <button
              key={dateStr}
              type="button"
              disabled={blocked}
              onClick={() => onChange(dateStr)}
              className={`flex flex-col items-center rounded-xl p-2 transition-all ${
                blocked
                  ? "cursor-not-allowed opacity-30"
                  : isSelected
                  ? "bg-gradient-to-b from-[#b07c4f] to-[#d4956a] text-white shadow-sm"
                  : isToday
                  ? "border border-[var(--accent)]"
                  : "hover:bg-[var(--accent)]/10"
              }`}
            >
              <span className="text-[10px] font-semibold">{dayLabels[day.getDay()]}</span>
              <span className="text-lg font-bold">{day.getDate()}</span>
              <span className="text-[9px]">{monthNames[day.getMonth()]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
