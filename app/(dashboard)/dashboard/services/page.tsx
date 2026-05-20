"use client";

import { useEffect, useState } from "react";
import { Palette, Plus, Power, Timer, Trash2 } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useBusinessId } from "@/lib/hooks/use-business";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  price_variable: boolean;
  color: string;
  active: boolean;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", duration: "45", price: "700", color: "#0f766e", priceVariable: false });
  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    setServices(data || []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!businessId) {
      toast("İşletme bilgisi bulunamadı.", "error");
      return;
    }

    const { error } = await supabase.from("services").insert({
      name: form.name,
      duration_minutes: Number(form.duration),
      price_cents: Number(form.price) * 100,
      price_variable: form.priceVariable,
      color: form.color,
      business_id: businessId,
    });

    if (error) {
      toast("Hizmet eklenemedi: " + error.message, "error");
      return;
    }

    toast("Hizmet eklendi!", "success");
    setForm({ name: "", duration: "45", price: "700", color: "#0f766e", priceVariable: false });
    setShowModal(false);
    loadServices();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("services").update({ active: !current }).eq("id", id);
    setServices(services.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }

  async function removeService(id: string) {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast("Silinemedi: " + error.message, "error");
      return;
    }
    setServices(services.filter((s) => s.id !== id));
  }

  if (loading) return <><Topbar title="Hizmetler" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  return (
    <>
      <Topbar title="Hizmetler" subtitle="Süre, fiyat ve aktiflik durumunu işletme bazında yönetin." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">{services.length} hizmet tanımlı</p>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> Hizmet ekle</Button>
        </div>

        {services.length === 0 ? (
          <EmptyState
            icon={Palette}
            title="Henüz hizmet eklenmemiş"
            description="İşletmenizin sunduğu hizmetleri ekleyin. Müşterileriniz online booking sayfasında bu hizmetleri görecek."
          >
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk hizmeti ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.id}
                className={`glass animate-fade-in rounded-xl p-5 transition-all duration-200 hover:shadow-lg stagger-${Math.min(index + 1, 4)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="size-4 rounded-full shadow-sm" style={{ background: service.color }} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(service.id, service.active)} className="transition-transform hover:scale-110">
                      <Badge variant={service.active ? "success" : "default"}>
                        <Power size={12} />
                        {service.active ? "Aktif" : "Pasif"}
                      </Badge>
                    </button>
                    <button onClick={() => removeService(service.id)} className="flex size-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-bold">{service.name}</h2>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2"><Timer size={16} /> {service.duration_minutes} dk</span>
                  <div className="text-right">
                    <strong className="text-lg text-[var(--foreground)]">{formatMoney(service.price_cents)}</strong>
                    {service.price_variable && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">Değişkenlik gösterebilir</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni hizmet ekle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Hizmet adı</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Örn: Saç Kesimi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Süre (dk)</label>
              <input type="number" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Fiyat (TL)</label>
              <input type="number" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 transition hover:border-[var(--accent)]">
            <input
              type="checkbox"
              checked={form.priceVariable}
              onChange={(e) => setForm({ ...form, priceVariable: e.target.checked })}
              className="size-4 rounded accent-teal-600"
            />
            <span className="text-sm font-medium">Fiyat değişkenlik gösterebilir</span>
          </label>
          <div>
            <label className="text-sm font-semibold">Renk</label>
            <div className="mt-2 flex gap-2">
              {["#0f766e", "#f97316", "#7c3aed", "#2563eb", "#dc2626", "#0891b2"].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} className={`size-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? "ring-2 ring-offset-2 ring-[var(--accent)]" : ""}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!form.name.trim()} className="mt-2">
            <Plus size={18} /> Hizmet ekle
          </Button>
        </div>
      </Modal>
    </>
  );
}
