"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useBusinessId } from "@/lib/hooks/use-business";

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  notes: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", notes: "" });
  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!businessId) { toast("İşletme bilgisi bulunamadı.", "error"); return; }
    const { error } = await supabase.from("customers").insert({
      full_name: form.full_name,
      phone: form.phone,
      notes: form.notes || null,
      business_id: businessId,
    });

    if (error) {
      toast("Müşteri eklenemedi: " + error.message, "error");
      return;
    }

    toast("Müşteri eklendi!", "success");
    setForm({ full_name: "", phone: "", notes: "" });
    setShowModal(false);
    loadCustomers();
  }

  if (loading) return <><Topbar title="Müşteriler" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  return (
    <>
      <Topbar title="Müşteriler" subtitle="Müşteri havuzunuzu yönetin." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">{customers.length} müşteri</p>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> Müşteri ekle</Button>
        </div>

        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Henüz müşteri yok"
            description="Müşterilerinizi ekleyin veya online booking ile otomatik eklensin."
          >
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk müşteriyi ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-3">
            {customers.map((c) => (
              <article key={c.id} className="glass flex items-center justify-between rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">{initials(c.full_name)}</span>
                  <div>
                    <strong className="block text-sm">{c.full_name}</strong>
                    <small className="text-[var(--muted)]">{c.phone}</small>
                  </div>
                </div>
                {c.notes && <span className="text-xs text-[var(--muted)]">{c.notes}</span>}
              </article>
            ))}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni müşteri ekle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Ad Soyad</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Örn: Ayşe Demir" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold">Telefon</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="+90 5xx xxx xx xx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold">Not (opsiyonel)</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Tercihleri, alerjileri vb." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <Button onClick={handleAdd} disabled={!form.full_name.trim() || !form.phone.trim()} className="mt-2">
            <Plus size={18} /> Müşteri ekle
          </Button>
        </div>
      </Modal>
    </>
  );
}
