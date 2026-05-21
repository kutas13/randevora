"use client";

import { useEffect, useState } from "react";
import { Edit3, Palette, Plus, Power, Timer, Trash2 } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useBusinessId } from "@/lib/hooks/use-business";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  duration_max_minutes: number | null;
  price_cents: number;
  price_max_cents: number | null;
  price_variable: boolean;
  deposit_cents: number;
  color: string;
  active: boolean;
};

type FormState = {
  name: string;
  duration: string;
  durationMax: string;
  durationUnit: "dk" | "saat";
  price: string;
  priceMax: string;
  deposit: string;
  color: string;
  priceVariable: boolean;
};

type EditFormState = FormState & { active: boolean };

const emptyForm: FormState = {
  name: "",
  duration: "45",
  durationMax: "",
  durationUnit: "dk",
  price: "700",
  priceMax: "",
  deposit: "0",
  color: "#0f766e",
  priceVariable: false,
};

function formatDuration(min: number) {
  return min >= 60 && min % 60 === 0 ? `${min / 60} saat` : `${min} dk`;
}

function formatDurationRange(minVal: number, maxVal: number | null) {
  if (maxVal && maxVal > minVal) {
    return `${formatDuration(minVal)} – ${formatDuration(maxVal)}`;
  }
  return formatDuration(minVal);
}

function formatPriceRange(minPrice: number, maxPrice: number | null) {
  if (maxPrice && maxPrice > minPrice) {
    return `${formatMoney(minPrice)} – ${formatMoney(maxPrice)}`;
  }
  return formatMoney(minPrice);
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<EditFormState>({ ...emptyForm, active: true });
  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (!businessId) return;
    loadServices();
  }, [businessId]);

  async function loadServices() {
    if (!businessId) return;
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    setServices(data || []);
    setLoading(false);
  }

  function toMinutes(value: string, unit: "dk" | "saat") {
    const v = Number(value);
    if (!v || v <= 0) return null;
    return unit === "saat" ? v * 60 : v;
  }

  async function handleAdd() {
    if (!businessId) { toast("İşletme bilgisi bulunamadı.", "error"); return; }

    const durationMin = toMinutes(form.duration, form.durationUnit);
    if (!durationMin) { toast("Geçerli bir süre girin.", "error"); return; }

    const durationMax = form.durationMax ? toMinutes(form.durationMax, form.durationUnit) : null;
    if (durationMax !== null && durationMax < durationMin) {
      toast("Maksimum süre, minimumdan küçük olamaz.", "error"); return;
    }

    const priceMin = Number(form.price);
    if (priceMin < 0 || Number.isNaN(priceMin)) { toast("Geçerli bir fiyat girin.", "error"); return; }

    const priceMax = form.priceMax ? Number(form.priceMax) : null;
    if (priceMax !== null && priceMax < priceMin) {
      toast("Maksimum fiyat, minimumdan küçük olamaz.", "error"); return;
    }

    const deposit = Math.max(0, Math.floor(Number(form.deposit) || 0));
    if (deposit > priceMin) {
      toast("Kapora tutarı, hizmet fiyatından yüksek olamaz.", "error"); return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("services").insert({
      name: form.name,
      duration_minutes: durationMin,
      duration_max_minutes: durationMax,
      price_cents: priceMin,
      price_max_cents: priceMax,
      price_variable: form.priceVariable || priceMax !== null,
      deposit_cents: deposit,
      color: form.color,
      business_id: businessId,
    });

    if (error) { toast("Hizmet eklenemedi: " + error.message, "error"); }
    else {
      toast("Hizmet eklendi!", "success");
      setForm(emptyForm);
      setShowModal(false);
      loadServices();
    }
    setSubmitting(false);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    const isHours = service.duration_minutes >= 60 && service.duration_minutes % 60 === 0
      && (!service.duration_max_minutes || service.duration_max_minutes % 60 === 0);
    const unit: "dk" | "saat" = isHours ? "saat" : "dk";
    const divisor = unit === "saat" ? 60 : 1;
    setEditForm({
      name: service.name,
      duration: String(service.duration_minutes / divisor),
      durationMax: service.duration_max_minutes ? String(service.duration_max_minutes / divisor) : "",
      durationUnit: unit,
      price: String(service.price_cents),
      priceMax: service.price_max_cents ? String(service.price_max_cents) : "",
      deposit: String(service.deposit_cents || 0),
      color: service.color,
      priceVariable: service.price_variable,
      active: service.active,
    });
    setEditModal(true);
  }

  async function handleEdit() {
    if (!editingService) return;

    const durationMin = toMinutes(editForm.duration, editForm.durationUnit);
    if (!durationMin) { toast("Geçerli bir süre girin.", "error"); return; }

    const durationMax = editForm.durationMax ? toMinutes(editForm.durationMax, editForm.durationUnit) : null;
    if (durationMax !== null && durationMax < durationMin) {
      toast("Maksimum süre, minimumdan küçük olamaz.", "error"); return;
    }

    const priceMin = Number(editForm.price);
    if (priceMin < 0 || Number.isNaN(priceMin)) { toast("Geçerli bir fiyat girin.", "error"); return; }

    const priceMax = editForm.priceMax ? Number(editForm.priceMax) : null;
    if (priceMax !== null && priceMax < priceMin) {
      toast("Maksimum fiyat, minimumdan küçük olamaz.", "error"); return;
    }

    const deposit = Math.max(0, Math.floor(Number(editForm.deposit) || 0));
    if (deposit > priceMin) {
      toast("Kapora tutarı, hizmet fiyatından yüksek olamaz.", "error"); return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("services").update({
      name: editForm.name,
      duration_minutes: durationMin,
      duration_max_minutes: durationMax,
      price_cents: priceMin,
      price_max_cents: priceMax,
      price_variable: editForm.priceVariable || priceMax !== null,
      deposit_cents: deposit,
      color: editForm.color,
      active: editForm.active,
    }).eq("id", editingService.id);

    if (error) { toast("Güncellenemedi: " + error.message, "error"); }
    else { toast("Hizmet güncellendi!", "success"); setEditModal(false); loadServices(); }
    setSubmitting(false);
  }

  async function removeService(id: string) {
    const ok = await confirm({ title: "Hizmeti sil", message: "Bu hizmeti ve ilişkili randevularını silmek istediğinize emin misiniz?", confirmText: "Sil", variant: "danger" });
    if (!ok) return;

    const res = await fetch("/api/delete-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: id }),
    });
    const result = await res.json();
    if (!res.ok) { toast("Silinemedi: " + (result.error || "Hata"), "error"); return; }
    toast("Hizmet silindi.", "success");
    setServices(services.filter((s) => s.id !== id));
  }

  const colors = ["#0f766e", "#f97316", "#7c3aed", "#2563eb", "#dc2626", "#0891b2"];

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
          <EmptyState icon={Palette} title="Henüz hizmet eklenmemiş" description="İşletmenizin sunduğu hizmetleri ekleyin.">
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk hizmeti ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <article key={service.id} className={`glass animate-fade-in rounded-xl p-5 transition-all duration-200 hover:shadow-lg stagger-${Math.min(index + 1, 4)}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="size-4 rounded-full shadow-sm" style={{ background: service.color }} />
                  <div className="flex items-center gap-2">
                    <Badge variant={service.active ? "success" : "default"}>
                      <Power size={12} />
                      {service.active ? "Aktif" : "Pasif"}
                    </Badge>
                    <button onClick={() => openEdit(service)} className="flex size-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => removeService(service.id)} className="flex size-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-bold">{service.name}</h2>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2"><Timer size={16} /> {formatDurationRange(service.duration_minutes, service.duration_max_minutes)}</span>
                  <div className="text-right">
                    <strong className="text-lg text-[var(--foreground)]">{formatPriceRange(service.price_cents, service.price_max_cents)}</strong>
                    {service.price_variable && !service.price_max_cents && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">Değişkenlik gösterebilir</p>
                    )}
                  </div>
                </div>
                {service.deposit_cents > 0 && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                    Kapora: {formatMoney(service.deposit_cents)}
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Ekleme Modalı */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni hizmet ekle"
        description="Müşterilerin randevu alırken göreceği hizmeti tanımlayın."
        size="lg"
      >
        <div className="grid gap-5">
          <div>
            <label className="text-sm font-semibold">Hizmet adı</label>
            <input
              className="mt-1.5 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="Örn: Saç Kesimi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Süre</h3>
              <select
                className="h-9 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 text-xs outline-none"
                value={form.durationUnit}
                onChange={(e) => setForm({ ...form, durationUnit: e.target.value as "dk" | "saat" })}
              >
                <option value="dk">Dakika</option>
                <option value="saat">Saat</option>
              </select>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--muted)]">Min</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">Max (opsiyonel)</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder="—"
                  value={form.durationMax}
                  onChange={(e) => setForm({ ...form, durationMax: e.target.value })}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">Max alanı boş bırakılırsa sabit süre olur.</p>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <h3 className="text-sm font-semibold">Fiyat (TL)</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--muted)]">Min</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">Max (opsiyonel)</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder="—"
                  value={form.priceMax}
                  onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                />
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] p-2.5 transition hover:border-[var(--accent)]">
              <input
                type="checkbox"
                checked={form.priceVariable}
                onChange={(e) => setForm({ ...form, priceVariable: e.target.checked })}
                className="size-4 rounded accent-teal-600"
              />
              <span className="text-xs font-medium">Fiyat değişkenlik gösterebilir</span>
            </label>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-gradient-to-br from-teal-50/60 to-[var(--panel-strong)] p-4 dark:from-teal-400/5 dark:to-[var(--panel-strong)]">
            <h3 className="text-sm font-semibold">Kapora (TL)</h3>
            <input
              type="number"
              min={0}
              className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="0 = kapora alma"
              value={form.deposit}
              onChange={(e) => setForm({ ...form, deposit: e.target.value })}
            />
            <p className="mt-2 text-xs text-[var(--muted)]">
              Müşteri randevu alırken iyzico üzerinden bu tutarı ödeyecek. 0 yazarsan kapora alınmaz.
            </p>
          </section>

          <div>
            <label className="text-sm font-semibold">Renk</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`size-9 rounded-full ring-offset-[var(--background)] transition-transform hover:scale-110 ${form.color === c ? "ring-2 ring-offset-2 ring-[var(--accent)]" : ""}`}
                  style={{ background: c }}
                  aria-label={`Renk ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 -mb-5 mt-3 flex gap-2 border-t border-[var(--line)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:-mb-5 sm:px-6">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              İptal
            </Button>
            <Button onClick={handleAdd} disabled={!form.name.trim() || submitting} className="flex-1">
              <Plus size={18} /> {submitting ? "Ekleniyor..." : "Hizmet ekle"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Düzenleme Modalı */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Hizmet düzenle"
        description="Bu hizmetin süre, fiyat ve kapora ayarlarını güncelleyin."
        size="lg"
      >
        <div className="grid gap-5">
          <div>
            <label className="text-sm font-semibold">Hizmet adı</label>
            <input
              className="mt-1.5 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Süre</h3>
              <select
                className="h-9 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 text-xs outline-none"
                value={editForm.durationUnit}
                onChange={(e) => setEditForm({ ...editForm, durationUnit: e.target.value as "dk" | "saat" })}
              >
                <option value="dk">Dakika</option>
                <option value="saat">Saat</option>
              </select>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--muted)]">Min</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">Max (opsiyonel)</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder="—"
                  value={editForm.durationMax}
                  onChange={(e) => setEditForm({ ...editForm, durationMax: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
            <h3 className="text-sm font-semibold">Fiyat (TL)</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--muted)]">Min</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">Max (opsiyonel)</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder="—"
                  value={editForm.priceMax}
                  onChange={(e) => setEditForm({ ...editForm, priceMax: e.target.value })}
                />
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--background)] p-2.5">
              <input
                type="checkbox"
                checked={editForm.priceVariable}
                onChange={(e) => setEditForm({ ...editForm, priceVariable: e.target.checked })}
                className="size-4 rounded accent-teal-600"
              />
              <span className="text-xs font-medium">Fiyat değişkenlik gösterebilir</span>
            </label>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-gradient-to-br from-teal-50/60 to-[var(--panel-strong)] p-4 dark:from-teal-400/5 dark:to-[var(--panel-strong)]">
            <h3 className="text-sm font-semibold">Kapora (TL)</h3>
            <input
              type="number"
              min={0}
              className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="0 = kapora alma"
              value={editForm.deposit}
              onChange={(e) => setEditForm({ ...editForm, deposit: e.target.value })}
            />
            <p className="mt-2 text-xs text-[var(--muted)]">
              Müşteri randevu alırken iyzico üzerinden bu tutarı ödeyecek.
            </p>
          </section>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
            <input
              type="checkbox"
              checked={editForm.active}
              onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
              className="size-4 rounded accent-teal-600"
            />
            <span className="text-sm font-medium">Hizmet aktif (müşteriler görsün)</span>
          </label>

          <div>
            <label className="text-sm font-semibold">Renk</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, color: c })}
                  className={`size-9 rounded-full ring-offset-[var(--background)] transition-transform hover:scale-110 ${editForm.color === c ? "ring-2 ring-offset-2 ring-[var(--accent)]" : ""}`}
                  style={{ background: c }}
                  aria-label={`Renk ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 -mb-5 mt-3 flex gap-2 border-t border-[var(--line)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:-mb-5 sm:px-6">
            <Button variant="ghost" onClick={() => setEditModal(false)} className="flex-1">
              İptal
            </Button>
            <Button onClick={handleEdit} disabled={!editForm.name.trim() || submitting} className="flex-1">
              {submitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
