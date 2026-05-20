"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useBusinessId } from "@/lib/hooks/use-business";

type Employee = {
  id: string;
  full_name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  active: boolean;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", title: "", phone: "", email: "", role: "employee" });
  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    setEmployees(data || []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!businessId) { toast("İşletme bilgisi bulunamadı.", "error"); return; }
    const { error } = await supabase.from("employees").insert({
      full_name: form.full_name,
      title: form.title || null,
      phone: form.phone || null,
      email: form.email || null,
      role: form.role,
      business_id: businessId,
    });

    if (error) {
      toast("Çalışan eklenemedi: " + error.message, "error");
      return;
    }

    toast("Çalışan eklendi!", "success");
    setForm({ full_name: "", title: "", phone: "", email: "", role: "employee" });
    setShowModal(false);
    loadEmployees();
  }

  async function removeEmployee(id: string) {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      toast("Silinemedi: " + error.message, "error");
      return;
    }
    setEmployees(employees.filter((e) => e.id !== id));
  }

  if (loading) return <><Topbar title="Çalışanlar" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  return (
    <>
      <Topbar title="Çalışanlar" subtitle="Ekibinizi yönetin, roller atayın." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">{employees.length} çalışan</p>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> Çalışan ekle</Button>
        </div>

        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Henüz çalışan eklenmemiş"
            description="Ekibinizi ekleyin, randevu atamaları yapabilin."
          >
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk çalışanı ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {employees.map((emp, i) => (
              <article key={emp.id} className={`glass animate-fade-in rounded-xl p-5 stagger-${Math.min(i + 1, 4)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-sm font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">{initials(emp.full_name)}</span>
                    <div>
                      <strong className="block">{emp.full_name}</strong>
                      <small className="text-[var(--muted)]">{emp.title || "Personel"}</small>
                    </div>
                  </div>
                  <button onClick={() => removeEmployee(emp.id)} className="flex size-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant={emp.active ? "success" : "default"}>{emp.active ? "Aktif" : "Pasif"}</Badge>
                  <Badge>{emp.role === "admin" ? "Admin" : "Personel"}</Badge>
                </div>
                {emp.phone && <p className="mt-2 text-xs text-[var(--muted)]">{emp.phone}</p>}
              </article>
            ))}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni çalışan ekle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Ad Soyad</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Örn: Ece Arslan" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold">Ünvan</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Örn: Uzman Stilist" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Telefon</label>
              <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="+90 5xx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">E-posta</label>
              <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Rol</label>
            <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Personel</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button onClick={handleAdd} disabled={!form.full_name.trim()} className="mt-2">
            <Plus size={18} /> Çalışan ekle
          </Button>
        </div>
      </Modal>
    </>
  );
}
