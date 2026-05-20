"use client";

import { useState } from "react";
import { Bell, Building2, Clock, Globe, Link2, MessageCircle, QrCode, Smartphone } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoBusiness } from "@/lib/mock-data";

const weekdays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default function SettingsPage() {
  const [name, setName] = useState(demoBusiness.name);
  const [category, setCategory] = useState(demoBusiness.category);
  const [slug, setSlug] = useState(demoBusiness.slug);
  const [timezone, setTimezone] = useState(demoBusiness.timezone);
  const [workDays, setWorkDays] = useState([true, true, true, true, true, true, false]);

  function toggleDay(index: number) {
    setWorkDays(workDays.map((v, i) => (i === index ? !v : v)));
  }

  return (
    <>
      <Topbar title="Ayarlar" subtitle="İşletme profili, slug, çalışma saatleri ve entegrasyon ayarları." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="glass animate-fade-in rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Building2 size={20} /> İşletme bilgileri</h2>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-semibold">İşletme adı</label>
                <input
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Kategori</label>
                <select
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Güzellik ve bakım</option>
                  <option>Berber</option>
                  <option>Nail studio</option>
                  <option>Danışman</option>
                  <option>Freelancer</option>
                  <option>Özel ders</option>
                  <option>Dövmeci</option>
                  <option>Küçük işletme</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Slug (URL)</label>
                <label className="mt-1 flex h-11 items-center gap-0 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)]">
                  <span className="px-3 text-sm text-[var(--muted)]">randevora.com/</span>
                  <input
                    className="h-full flex-1 bg-transparent outline-none"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  />
                </label>
              </div>
              <div>
                <label className="text-sm font-semibold">Zaman dilimi</label>
                <select
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                </select>
              </div>
              <Button className="mt-2">Kaydet</Button>
            </div>
          </section>

          <div className="grid gap-5">
            <section className="glass animate-fade-in stagger-2 rounded-xl p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Clock size={20} /> Çalışma günleri</h2>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {weekdays.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(index)}
                    className={`rounded-lg border p-2 text-center text-xs font-semibold transition ${workDays[index] ? "border-teal-600 bg-teal-500/10 text-teal-700 dark:text-teal-200" : "border-[var(--line)] bg-[var(--panel-strong)] text-[var(--muted)]"}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Açılış</label>
                  <input type="time" className="mt-1 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none" defaultValue="09:00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Kapanış</label>
                  <input type="time" className="mt-1 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none" defaultValue="18:00" />
                </div>
              </div>
            </section>

            <section className="glass animate-fade-in stagger-3 rounded-xl p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold"><QrCode size={20} /> QR check-in</h2>
              <div className="mt-4 grid place-items-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel-strong)] p-6">
                <div className="grid size-28 place-items-center rounded-xl bg-neutral-950 dark:bg-white">
                  <QrCode size={80} className="text-white dark:text-neutral-950" />
                </div>
                <p className="mt-3 text-center text-sm text-[var(--muted)]">
                  randevora.com/book/{slug}
                </p>
                <Button variant="secondary" className="mt-3 text-xs">QR kodu indir</Button>
              </div>
            </section>
          </div>
        </div>

        <section className="glass animate-fade-in stagger-4 rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Bell size={20} /> Bildirim ve entegrasyonlar</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Gelecekte eklenecek entegrasyonlar için hazır altyapı.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { icon: MessageCircle, title: "WhatsApp", desc: "Otomatik hatırlatma ve onay mesajları", status: "Yakında" },
              { icon: Smartphone, title: "SMS", desc: "Randevu bildirimleri SMS ile gönderilsin", status: "Yakında" },
              { icon: Globe, title: "Webhook", desc: "Özel entegrasyonlar için webhook desteği", status: "Enterprise" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-4">
                <div className="flex items-center justify-between">
                  <item.icon size={20} className="text-[var(--muted)]" />
                  <Badge variant="info">{item.status}</Badge>
                </div>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
