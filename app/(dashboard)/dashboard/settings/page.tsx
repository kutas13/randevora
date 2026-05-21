"use client";

import { useEffect, useState } from "react";
import { Building2, Clock, Save } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useBusinessId } from "@/lib/hooks/use-business";
import { useToast } from "@/components/ui/toast";
import { WhatsAppSettings } from "@/components/dashboard/whatsapp-settings";

const weekdays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const weekdayNumbers = [1, 2, 3, 4, 5, 6, 0]; // JS: 0=Pazar, 1=Pzt...

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [workDays, setWorkDays] = useState([true, true, true, true, true, true, false]);
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [bookingWindow, setBookingWindow] = useState("weekly");
  const [slotCapacity, setSlotCapacity] = useState(1);
  const [slotMerge, setSlotMerge] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!businessId) return;
    loadSettings();
  }, [businessId]);

  async function loadSettings() {
    const { data: biz } = await supabase
      .from("businesses")
      .select("name, category, slug, booking_window, slot_capacity, slot_merge")
      .eq("id", businessId)
      .single();

    if (biz) {
      setName(biz.name);
      setCategory(biz.category || "");
      setSlug(biz.slug);
      setBookingWindow(biz.booking_window || "weekly");
      setSlotCapacity(biz.slot_capacity || 1);
      setSlotMerge(biz.slot_merge !== false);
    }

    // Çalışma saatlerini yükle (ilk personel üzerinden veya genel)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: emp } = await supabase
      .from("employees")
      .select("id")
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .single();

    if (emp) {
      const { data: wh } = await supabase
        .from("working_hours")
        .select("weekday, starts_at, ends_at")
        .eq("employee_id", emp.id);

      if (wh && wh.length > 0) {
        const activeDays = wh.map((w) => w.weekday);
        setWorkDays(weekdayNumbers.map((d) => activeDays.includes(d)));
        setOpenTime(wh[0].starts_at.slice(0, 5));
        setCloseTime(wh[0].ends_at.slice(0, 5));
      }
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!businessId) return;
    setSaving(true);

    // İşletme bilgilerini güncelle
    const { error: bizErr } = await supabase
      .from("businesses")
      .update({ name, category, slug, booking_window: bookingWindow, slot_capacity: slotCapacity, slot_merge: slotMerge })
      .eq("id", businessId);

    if (bizErr) {
      toast("İşletme bilgileri kaydedilemedi: " + bizErr.message, "error");
      setSaving(false);
      return;
    }

    // Çalışma saatlerini kaydet (tüm personeller için)
    const { data: emps } = await supabase
      .from("employees")
      .select("id")
      .eq("business_id", businessId)
      .eq("active", true);

    if (emps) {
      for (const emp of emps) {
        // Mevcut çalışma saatlerini sil
        await supabase.from("working_hours").delete().eq("employee_id", emp.id);

        // Yeni çalışma saatlerini ekle
        const rows = weekdayNumbers
          .map((dayNum, i) => {
            if (!workDays[i]) return null;
            return {
              employee_id: emp.id,
              weekday: dayNum,
              starts_at: openTime + ":00",
              ends_at: closeTime + ":00",
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        if (rows.length > 0) {
          await supabase.from("working_hours").insert(rows);
        }
      }
    }

    toast("Ayarlar kaydedildi!", "success");
    setSaving(false);
  }

  function toggleDay(index: number) {
    setWorkDays(workDays.map((v, i) => (i === index ? !v : v)));
  }

  if (loading) return <><Topbar title="Ayarlar" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  return (
    <>
      <Topbar title="Ayarlar" subtitle="İşletme profili ve çalışma saatlerini yönetin." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="grid gap-5 xl:grid-cols-2">
          {/* İşletme Bilgileri */}
          <section className="glass animate-fade-in rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Building2 size={20} /> İşletme bilgileri</h2>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-semibold">İşletme adı</label>
                <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold">Kategori</label>
                <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="berber">Berber</option>
                  <option value="kuafor">Kuaför</option>
                  <option value="nail_studio">Nail Studio</option>
                  <option value="guzellik_merkezi">Güzellik Merkezi</option>
                  <option value="danismanlik">Danışmanlık</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="ozel_ders">Özel Ders</option>
                  <option value="small_business">Küçük İşletme</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Slug (URL)</label>
                <label className="mt-1 flex h-11 items-center gap-0 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)]">
                  <span className="px-3 text-sm text-[var(--muted)]">Randevora.com/book/</span>
                  <input className="h-full flex-1 bg-transparent outline-none" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                </label>
              </div>
            </div>
          </section>

          {/* Çalışma Günleri ve Saatleri */}
          <section className="glass animate-fade-in stagger-2 rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Clock size={20} /> Çalışma günleri ve saatleri</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Seçtiğiniz günler ve saatler tüm personeller için geçerli olur.</p>

            <div className="mt-4">
              <label className="text-sm font-semibold">Randevu kabul süresi</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={bookingWindow} onChange={(e) => setBookingWindow(e.target.value)}>
                <option value="weekly">Haftalık (bu hafta sonuna kadar)</option>
                <option value="biweekly">2 Haftalık (2 hafta sonuna kadar)</option>
                <option value="monthly">Aylık (ay sonuna kadar)</option>
              </select>
              <p className="mt-1 text-xs text-[var(--muted)]">Müşteriler bu süre aralığında randevu alabilir.</p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold">Saat başı müşteri kapasitesi</label>
              <input
                type="number"
                min={1}
                max={10}
                className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                value={slotCapacity}
                onChange={(e) => setSlotCapacity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <p className="mt-1 text-xs text-[var(--muted)]">Aynı saatte kaç müşteri kabul edebileceğinizi belirleyin. (Örn: 2 = aynı saatte 2 randevu alınabilir)</p>
            </div>

            <div className="mt-4">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-4">
                <div>
                  <span className="text-sm font-semibold">Slot birleştirme (optimizasyon)</span>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">Açıkken: Çoklu hizmet seçildiğinde slotlar yarıya düşürülür. (3 saat = 2 slot kapatır, 5 saat = 3 slot kapatır)</p>
                </div>
                <div className={`relative h-6 w-11 shrink-0 rounded-full transition ${slotMerge ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`} onClick={() => setSlotMerge(!slotMerge)}>
                  <div className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${slotMerge ? "left-[22px]" : "left-0.5"}`} />
                </div>
              </label>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {weekdays.map((day, index) => (
                <button
                  key={day}
                  onClick={() => toggleDay(index)}
                  className={`rounded-lg border p-2.5 text-center text-xs font-semibold transition ${workDays[index] ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--muted)]"}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Açılış saati</label>
                <input type="time" className="mt-1 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Kapanış saati</label>
                <input type="time" className="mt-1 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
              </div>
            </div>
          </section>
        </div>

        <WhatsAppSettings />

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto md:justify-self-end">
          <Save size={18} /> {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </main>
    </>
  );
}
