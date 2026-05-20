"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils";

type Service = { id: string; name: string; duration_minutes: number; price_cents: number; price_variable: boolean; color: string };
type Employee = { id: string; full_name: string; title: string | null };

type Props = {
  businessId: string;
  services: Service[];
  employees: Employee[];
  fixedEmployeeId: string | null;
};

type Step = "service" | "employee" | "datetime" | "info" | "done";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export function BookingForm({ businessId, services, employees, fixedEmployeeId }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(fixedEmployeeId || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [busySlots, setBusySlots] = useState<string[]>([]);

  const supabase = createClient();

  // Dolu saatleri yükle
  useEffect(() => {
    async function loadBusy() {
      const empId = fixedEmployeeId || selectedEmployee;
      if (!date || !empId) { setBusySlots([]); return; }

      const start = `${date}T00:00:00`;
      const end = `${date}T23:59:59`;
      const { data } = await supabase
        .from("appointments")
        .select("starts_at")
        .eq("employee_id", empId)
        .gte("starts_at", start)
        .lte("starts_at", end)
        .in("status", ["pending", "confirmed"]);

      const busy = (data || []).map((a) => {
        const d = new Date(a.starts_at);
        return `${String(d.getHours()).padStart(2, "0")}:00`;
      });
      setBusySlots(busy);
    }
    loadBusy();
  }, [date, selectedEmployee, fixedEmployeeId]);

  function nextStep() {
    if (step === "service" && selectedService) {
      if (fixedEmployeeId) setStep("datetime");
      else setStep("employee");
    } else if (step === "employee" && selectedEmployee) {
      setStep("datetime");
    } else if (step === "datetime" && date && time) {
      setStep("info");
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) { setError("Ad ve telefon gerekli."); return; }
    setSubmitting(true);
    setError("");

    const startsAt = new Date(`${date}T${time}`);
    const endsAt = new Date(startsAt.getTime() + (selectedService?.duration_minutes || 30) * 60 * 1000);

    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .upsert({ full_name: name, phone, business_id: businessId }, { onConflict: "business_id,phone" })
      .select("id")
      .single();

    if (custErr || !customer) {
      setError("Müşteri kaydı oluşturulamadı.");
      setSubmitting(false);
      return;
    }

    const { error: aptErr } = await supabase.from("appointments").insert({
      business_id: businessId,
      customer_id: customer.id,
      service_id: selectedService!.id,
      employee_id: selectedEmployee || fixedEmployeeId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      price_cents: selectedService!.price_cents,
      status: "pending",
    });

    if (aptErr) {
      setError("Randevu oluşturulamadı: " + aptErr.message);
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
          {selectedService?.name} · {date} {time}
        </p>
        <p className="mt-4 text-sm text-[var(--muted)]">İşletme onayladıktan sonra randevunuz kesinleşecektir.</p>
      </div>
    );
  }

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
          <h2 className="text-lg font-bold">Hizmet seçin</h2>
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedService(s)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${selectedService?.id === s.id ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" : "border-[var(--line)] hover:border-[var(--accent)]/50"}`}
            >
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: s.color }} />
                <div>
                  <strong className="block text-sm">{s.name}</strong>
                  <span className="text-xs text-[var(--muted)]">{s.duration_minutes} dakika</span>
                </div>
              </div>
              <div className="text-right">
                <strong className="text-sm">{formatMoney(s.price_cents)}</strong>
                {s.price_variable && <p className="text-[10px] text-orange-600">Değişkenlik gösterebilir</p>}
              </div>
            </button>
          ))}
          <Button onClick={nextStep} disabled={!selectedService} className="mt-3">
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
          <MiniCalendar value={date} onChange={(d) => { setDate(d); setTime(""); }} />

          {date && (
            <div>
              <p className="mb-2 text-sm font-semibold">Uygun saatler</p>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
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

          {selectedService && date && (
            <div className="rounded-lg bg-[var(--panel-strong)] p-3 text-sm">
              <CalendarClock size={14} className="mb-1 inline text-[var(--accent)]" /> Süre: <strong>{selectedService.duration_minutes} dakika</strong>
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

          {/* Özet */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <h3 className="text-sm font-bold">Randevu özeti</h3>
            <div className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
              <p>Hizmet: <strong className="text-[var(--foreground)]">{selectedService?.name}</strong></p>
              <p>Tarih: <strong className="text-[var(--foreground)]">{date} {time}</strong></p>
              <p>Ücret: <strong className="text-[var(--foreground)]">{formatMoney(selectedService?.price_cents || 0)}</strong></p>
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

function MiniCalendar({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= totalDays; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  function isDisabled(day: number) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  }

  function isSelected(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` === value;
  }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  function selectDay(day: number) {
    onChange(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold">{monthNames[month]} {year}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-[var(--muted)]">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day ? (
              <button
                type="button"
                disabled={isDisabled(day)}
                onClick={() => selectDay(day)}
                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  isDisabled(day)
                    ? "cursor-not-allowed opacity-30"
                    : isSelected(day)
                    ? "bg-gradient-to-r from-[#b07c4f] to-[#d4956a] text-white shadow-sm"
                    : isToday(day)
                    ? "border border-[var(--accent)] text-[var(--accent)]"
                    : "hover:bg-[var(--accent)]/10"
                }`}
              >
                {day}
              </button>
            ) : <span />}
          </div>
        ))}
      </div>
    </div>
  );
}
