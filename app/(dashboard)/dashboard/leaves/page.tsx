"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
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
  employee?: { full_name: string } | null;
};

export default function LeavesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: "", start_date: "", end_date: "", reason: "" });

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
        .select("*, employee:employees(full_name)")
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

  async function handleAdd() {
    if (!form.employee_id || !form.start_date || !form.end_date) {
      toast("Personel ve tarih aralığı seçin.", "error");
      return;
    }

    const { error } = await supabase.from("blocked_dates").insert({
      business_id: businessId,
      employee_id: form.employee_id,
      starts_at: new Date(form.start_date).toISOString(),
      ends_at: new Date(form.end_date + "T23:59:59").toISOString(),
      reason: form.reason || null,
    });

    if (error) {
      toast("İzin eklenemedi: " + error.message, "error");
      return;
    }

    toast("İzin eklendi!", "success");
    setForm({ employee_id: "", start_date: "", end_date: "", reason: "" });
    setShowModal(false);
    load();
  }

  async function removeLeave(id: string) {
    if (!confirm("Bu izni silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) { toast("Silinemedi: " + error.message, "error"); return; }
    toast("İzin silindi.", "success");
    setBlockedDates(blockedDates.filter((b) => b.id !== id));
  }

  if (loading) return <><Topbar title="İzin Yönetimi" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  return (
    <>
      <Topbar title="İzin Yönetimi" subtitle="Personel ve admin izin günlerini belirleyin." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">{blockedDates.length} izin kaydı</p>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> İzin ekle</Button>
        </div>

        {blockedDates.length === 0 ? (
          <EmptyState icon={CalendarOff} title="Henüz izin tanımlanmamış" description="Personel ve adminlere izin günleri tanımlayın. İzinli günlerde randevu alınamaz.">
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk izni ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-3">
            {blockedDates.map((bd) => {
              const empName = Array.isArray(bd.employee) ? (bd.employee as any)[0]?.full_name : (bd.employee as any)?.full_name;
              return (
                <article key={bd.id} className="glass flex items-center justify-between rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-400/15">
                      <CalendarOff size={18} />
                    </div>
                    <div>
                      <strong className="block">{empName || "Personel"}</strong>
                      <small className="text-[var(--muted)]">
                        {new Date(bd.starts_at).toLocaleDateString("tr-TR")} - {new Date(bd.ends_at).toLocaleDateString("tr-TR")}
                      </small>
                      {bd.reason && <p className="text-xs text-[var(--muted)]">{bd.reason}</p>}
                    </div>
                  </div>
                  <button onClick={() => removeLeave(bd.id)} className="flex size-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10">
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="İzin ekle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Personel</label>
            <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
              <option value="">Personel seçin</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Başlangıç</label>
              <input type="date" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Bitiş</label>
              <input type="date" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Sebep (opsiyonel)</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Yıllık izin, hastalık vb." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <Button onClick={handleAdd} className="mt-2">
            <Plus size={18} /> İzin ekle
          </Button>
        </div>
      </Modal>
    </>
  );
}
