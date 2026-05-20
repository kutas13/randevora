"use client";

import { useState } from "react";
import { CalendarDays, CalendarOff, Clock, Plus, UserMinus, Users } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { employees as initialEmployees } from "@/lib/mock-data";
import { initials } from "@/lib/utils";
import type { Employee } from "@/lib/types";

const workingHoursPresets = [
  { label: "Tam gün", value: "09:00 - 18:00" },
  { label: "Yarım gün", value: "09:00 - 13:00" },
  { label: "Akşam", value: "14:00 - 22:00" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", workHours: "09:00 - 18:00" });

  function handleAdd() {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: form.name,
      role: form.role,
      active: true,
      appointmentsToday: 0,
    };
    setEmployees([...employees, newEmployee]);
    setForm({ name: "", role: "", workHours: "09:00 - 18:00" });
    setShowModal(false);
  }

  function toggleActive(id: string) {
    setEmployees(employees.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));
  }

  return (
    <>
      <Topbar title="Çalışanlar" subtitle="Rol, çalışma saatleri, izin günleri ve randevu görünürlüğü." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">{employees.filter((e) => e.active).length} aktif çalışan</p>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> Çalışan ekle</Button>
        </div>

        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Henüz çalışan eklenmemiş"
            description="Ekibinizdeki kişileri ekleyin. Her çalışan kendi randevularını ve takvimini görebilir."
          >
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk çalışanı ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {employees.map((employee, index) => (
              <article
                key={employee.id}
                className={`glass animate-fade-in rounded-xl p-5 transition-all duration-200 hover:shadow-lg stagger-${Math.min(index + 1, 4)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 text-sm font-bold text-white shadow-lg dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                      {initials(employee.name)}
                    </span>
                    <span>
                      <strong className="block">{employee.name}</strong>
                      <small className="text-[var(--muted)]">{employee.role}</small>
                    </span>
                  </div>
                  <button onClick={() => toggleActive(employee.id)}>
                    <Badge variant={employee.active ? "success" : "default"}>
                      {employee.active ? "Aktif" : "Pasif"}
                    </Badge>
                  </button>
                </div>

                <div className="mt-5 grid gap-2">
                  <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-2.5 text-sm">
                    <span className="flex items-center gap-2 text-[var(--muted)]"><Clock size={15} /> Çalışma saati</span>
                    <strong>09:00 - 18:00</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-2.5 text-sm">
                    <span className="flex items-center gap-2 text-[var(--muted)]"><CalendarDays size={15} /> Bugün</span>
                    <strong>{employee.appointmentsToday} randevu</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-2.5 text-sm">
                    <span className="flex items-center gap-2 text-[var(--muted)]"><CalendarOff size={15} /> İzin</span>
                    <span className="text-[var(--muted)]">Yok</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="flex-1 text-xs">
                    <CalendarDays size={14} /> Takvim
                  </Button>
                  <Button variant="ghost" className="text-xs text-red-600">
                    <UserMinus size={14} />
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni çalışan ekle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Ad soyad</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="Örn: Ece Arslan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Rol / Uzmanlık</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="Örn: Uzman stilist"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Çalışma saatleri</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {workingHoursPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setForm({ ...form, workHours: preset.value })}
                  className={`rounded-lg border p-2.5 text-xs font-semibold transition ${form.workHours === preset.value ? "border-teal-600 bg-teal-500/10 text-teal-700 dark:text-teal-200" : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--muted)]"}`}
                >
                  {preset.label}
                  <br />
                  <span className="font-normal">{preset.value}</span>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!form.name.trim()} className="mt-2">
            <Plus size={18} /> Çalışan ekle
          </Button>
        </div>
      </Modal>
    </>
  );
}
