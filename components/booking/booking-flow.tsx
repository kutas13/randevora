"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, CheckCircle2, Clock, PartyPopper, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAvailableSlots } from "@/lib/booking";
import { employees, services } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";

const busyByEmployee: Record<string, Array<{ startsAt: string; endsAt: string }>> = {
  emp_1: [
    { startsAt: "09:00", endsAt: "09:45" },
    { startsAt: "13:00", endsAt: "14:00" },
  ],
  emp_2: [{ startsAt: "10:30", endsAt: "11:00" }],
  emp_3: [{ startsAt: "15:30", endsAt: "16:45" }],
};

type Step = "service" | "employee" | "time" | "info" | "success";

export function BookingFlow() {
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState(services[0].id);
  const [employeeId, setEmployeeId] = useState(employees[0].id);
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) ?? services[0], [serviceId]);
  const selectedEmployee = useMemo(() => employees.find((e) => e.id === employeeId) ?? employees[0], [employeeId]);

  const availableTimes = getAvailableSlots({
    workStart: "09:00",
    workEnd: "18:00",
    durationMinutes: selectedService.duration,
    busy: busyByEmployee[employeeId] ?? [],
    stepMinutes: 15,
  });

  function handleSubmit() {
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="glass animate-in mx-auto max-w-lg rounded-xl p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-400/15">
          <PartyPopper size={32} className="text-emerald-600" />
        </div>
        <h2 className="mt-5 text-2xl font-black">Randevunuz oluşturuldu!</h2>
        <p className="mt-3 text-[var(--muted)]">
          {selectedService.name} · {selectedEmployee.name} · {time}
        </p>
        <div className="mx-auto mt-5 max-w-sm rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-4 text-left">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Hizmet</span>
              <strong>{selectedService.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Çalışan</span>
              <strong>{selectedEmployee.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Saat</span>
              <strong>{time}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Süre</span>
              <strong>{selectedService.duration} dk</strong>
            </div>
            <div className="flex justify-between border-t border-[var(--line)] pt-2">
              <span className="text-[var(--muted)]">Tutar</span>
              <strong className="text-lg">{formatMoney(selectedService.price)}</strong>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Hatırlatma bildirimi gönderilecek
        </div>
        <Button variant="secondary" className="mt-5" onClick={() => { setStep("service"); setTime(""); setForm({ name: "", phone: "", notes: "" }); }}>
          Yeni randevu oluştur
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <section className="glass rounded-xl p-5">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold"><CalendarCheck size={21} /> Randevu oluştur</h2>
        </div>

        <div className="mt-2 flex gap-1.5">
          {(["service", "employee", "time", "info"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                (["service", "employee", "time", "info"] as Step[]).indexOf(step) >= i
                  ? "bg-teal-600"
                  : "bg-neutral-200 dark:bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">1. Hizmet seçin</label>
              <Badge>{services.filter((s) => s.active).length} hizmet</Badge>
            </div>
            <div className="mt-2 grid gap-2">
              {services.filter((s) => s.active).map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setServiceId(service.id);
                    setTime("");
                    if (step === "service") setStep("employee");
                  }}
                  className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all duration-200 ${serviceId === service.id ? "border-teal-600 bg-teal-500/10 shadow-sm" : "border-[var(--line)] bg-[var(--panel-strong)] hover:border-[var(--accent)]"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="size-3 rounded-full" style={{ background: service.color }} />
                    <span>
                      <strong className="block">{service.name}</strong>
                      <small className="text-[var(--muted)]">{service.duration} dk</small>
                    </span>
                  </span>
                  <span className="font-bold">{formatMoney(service.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">2. Çalışan seçin</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    setEmployeeId(employee.id);
                    setTime("");
                    if (step === "employee") setStep("time");
                  }}
                  className={`rounded-lg border p-3 text-left transition-all duration-200 ${employeeId === employee.id ? "border-orange-500 bg-orange-500/10 shadow-sm" : "border-[var(--line)] bg-[var(--panel-strong)] hover:border-[var(--accent-2)]"}`}
                >
                  <UserRound size={18} className="text-[var(--muted)]" />
                  <strong className="mt-2 block text-sm">{employee.name}</strong>
                  <small className="text-[var(--muted)]">{employee.role}</small>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">3. Uygun saat</label>
              <span className="text-xs text-[var(--muted)]">{availableTimes.length} müsait slot</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {availableTimes.slice(0, 15).map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setTime(slot);
                    if (step === "time") setStep("info");
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ${time === slot ? "border-neutral-950 bg-neutral-950 text-white shadow-md dark:border-white dark:bg-white dark:text-neutral-950" : "border-[var(--line)] bg-[var(--panel-strong)] hover:border-[var(--foreground)]"}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {availableTimes.length > 15 && (
              <p className="mt-2 text-xs text-[var(--muted)]">+{availableTimes.length - 15} saat daha mevcut</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Clock size={21} /> Bilgileriniz</h2>
        <form className="mt-5 grid gap-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div>
            <label className="text-sm font-semibold">Ad soyad</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="Adınız ve soyadınız"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Telefon</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="+90 5XX XXX XX XX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Not (opsiyonel)</label>
            <textarea
              className="mt-1 min-h-24 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 outline-none"
              placeholder="Randevunuzla ilgili özel istekleriniz..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">Randevu özeti</p>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Hizmet</span>
                <strong>{selectedService.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Çalışan</span>
                <strong>{selectedEmployee.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Saat</span>
                <strong>{time || "Seçilmedi"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Süre</span>
                <strong>{selectedService.duration} dk</strong>
              </div>
              <div className="flex justify-between border-t border-[var(--line)] pt-2">
                <span className="text-[var(--muted)]">Tutar</span>
                <strong className="text-lg text-teal-700 dark:text-teal-200">{formatMoney(selectedService.price)}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel-strong)] p-3 text-center text-xs text-[var(--muted)]">
            Çakışma kontrolü otomatik yapılır. Randevunuz onay sonrası kesinleşir.
          </div>

          <Button
            type="submit"
            disabled={!form.name.trim() || !form.phone.trim() || !time}
            className="h-12 text-base"
          >
            <Check size={20} /> Randevuyu oluştur
          </Button>
        </form>
      </section>
    </div>
  );
}
