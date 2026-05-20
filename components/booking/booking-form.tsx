"use client";

import { useState } from "react";
import { CalendarClock, Check, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const supabase = createClient();

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

    // Müşteri oluştur veya bul
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
      <div className="glass rounded-xl p-8 text-center">
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
    <div className="glass rounded-xl p-6">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <span className={step === "service" ? "text-teal-600" : ""}>Hizmet</span>
        <ChevronRight size={12} />
        {!fixedEmployeeId && <><span className={step === "employee" ? "text-teal-600" : ""}>Personel</span><ChevronRight size={12} /></>}
        <span className={step === "datetime" ? "text-teal-600" : ""}>Tarih</span>
        <ChevronRight size={12} />
        <span className={step === "info" ? "text-teal-600" : ""}>Bilgiler</span>
      </div>

      {/* Hizmet seçimi */}
      {step === "service" && (
        <div className="grid gap-3">
          <h2 className="text-lg font-bold">Hizmet seçin</h2>
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedService(s)}
              className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${selectedService?.id === s.id ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-400/10" : "border-[var(--line)] hover:border-[var(--accent)]"}`}
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
            Devam <ChevronRight size={16} />
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
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${selectedEmployee === emp.id ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-400/10" : "border-[var(--line)] hover:border-[var(--accent)]"}`}
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                {emp.full_name.charAt(0)}
              </span>
              <div>
                <strong className="block text-sm">{emp.full_name}</strong>
                <span className="text-xs text-[var(--muted)]">{emp.title || "Personel"}</span>
              </div>
            </button>
          ))}
          <Button onClick={nextStep} disabled={!selectedEmployee} className="mt-3">
            Devam <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Tarih ve saat */}
      {step === "datetime" && (
        <div className="grid gap-4">
          <h2 className="text-lg font-bold">Tarih ve saat seçin</h2>
          <div>
            <label className="text-sm font-semibold">Tarih</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Saat</label>
            <input
              type="time"
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          {selectedService && (
            <div className="rounded-lg bg-[var(--panel-strong)] p-3 text-sm">
              <CalendarClock size={14} className="mb-1 inline text-teal-600" /> Randevu süresi: <strong>{selectedService.duration_minutes} dakika</strong>
            </div>
          )}
          <Button onClick={nextStep} disabled={!date || !time} className="mt-2">
            Devam <ChevronRight size={16} />
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
          <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-4">
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
