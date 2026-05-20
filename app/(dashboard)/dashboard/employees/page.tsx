"use client";

import { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, Users } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
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
  const [editModal, setEditModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", title: "", phone: "", email: "", password: "", role: "employee" });
  const [editForm, setEditForm] = useState({ full_name: "", title: "", phone: "", role: "employee", active: true });
  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    setEmployees(data || []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!businessId) { toast("İşletme bilgisi bulunamadı.", "error"); return; }
    if (!form.email || !form.password) { toast("E-posta ve şifre zorunlu.", "error"); return; }
    if (form.password.length < 6) { toast("Şifre en az 6 karakter olmalı.", "error"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          title: form.title || null,
          phone: form.phone || null,
          email: form.email,
          password: form.password,
          role: form.role,
          business_id: businessId,
        }),
      });
      const result = await res.json();
      if (!res.ok) { toast(result.error || "Çalışan eklenemedi.", "error"); return; }

      toast("Çalışan eklendi!", "success");
      setForm({ full_name: "", title: "", phone: "", email: "", password: "", role: "employee" });
      setShowModal(false);
      loadEmployees();
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(emp: Employee) {
    setEditingEmp(emp);
    setEditForm({ full_name: emp.full_name, title: emp.title || "", phone: emp.phone || "", role: emp.role, active: emp.active });
    setEditModal(true);
  }

  async function handleEdit() {
    if (!editingEmp) return;
    setSubmitting(true);
    const { error } = await supabase.from("employees").update({
      full_name: editForm.full_name,
      title: editForm.title || null,
      phone: editForm.phone || null,
      role: editForm.role,
      active: editForm.active,
    }).eq("id", editingEmp.id);

    if (error) { toast("Güncellenemedi: " + error.message, "error"); }
    else { toast("Çalışan güncellendi!", "success"); setEditModal(false); loadEmployees(); }
    setSubmitting(false);
  }

  async function removeEmployee(id: string) {
    const ok = await confirm({ title: "Çalışanı sil", message: "Bu çalışanı ve ilişkili randevularını silmek istediğinize emin misiniz?", confirmText: "Sil", variant: "danger" });
    if (!ok) return;
    const res = await fetch("/api/delete-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: id }),
    });
    const result = await res.json();
    if (!res.ok) { toast("Silinemedi: " + (result.error || "Hata"), "error"); return; }
    toast("Çalışan silindi.", "success");
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
          <EmptyState icon={Users} title="Henüz çalışan eklenmemiş" description="Ekibinizi ekleyin, randevu atamaları yapabilin.">
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
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(emp)} className="flex size-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => removeEmployee(emp.id)} className="flex size-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant={emp.active ? "success" : "default"}>{emp.active ? "Aktif" : "Pasif"}</Badge>
                  <Badge>{emp.role === "admin" ? "Admin" : "Personel"}</Badge>
                </div>
                {emp.email && <p className="mt-2 text-xs text-[var(--muted)]">{emp.email}</p>}
                {emp.phone && <p className="text-xs text-[var(--muted)]">{emp.phone}</p>}
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Ekleme Modalı */}
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
              <label className="text-sm font-semibold">E-posta *</label>
              <input type="email" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="personel@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Şifre *</label>
              <input type="password" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="En az 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Telefon</label>
              <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="+90 5xx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Rol</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Personel</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">Personel bu e-posta ve şifreyle giriş yaparak panele erişebilir.</p>
          <Button onClick={handleAdd} disabled={!form.full_name.trim() || !form.email.trim() || !form.password.trim() || submitting} className="mt-2">
            <Plus size={18} /> {submitting ? "Oluşturuluyor..." : "Çalışan ekle"}
          </Button>
        </div>
      </Modal>

      {/* Düzenleme Modalı */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Çalışan düzenle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Ad Soyad</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold">Ünvan</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Telefon</label>
              <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Rol</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                <option value="employee">Personel</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
            <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} className="size-4 rounded accent-teal-600" />
            <span className="text-sm font-medium">Aktif</span>
          </label>
          <Button onClick={handleEdit} disabled={!editForm.full_name.trim() || submitting} className="mt-2">
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
