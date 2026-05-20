"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Building2, Database, Search, Shield, TrendingUp, Users } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tenants = [
  { slug: "nova-studio", name: "Nova Studio", plan: "pro", users: 4, appointments: 342, status: "active" },
  { slug: "barbershop", name: "Elite Barber", plan: "free", users: 1, appointments: 28, status: "active" },
  { slug: "nailart", name: "Nail Art Studio", plan: "pro", users: 3, appointments: 156, status: "active" },
  { slug: "beautycenter", name: "Beauty Center", plan: "enterprise", users: 8, appointments: 892, status: "active" },
  { slug: "danismanlik", name: "Proje Danışmanlık", plan: "free", users: 1, appointments: 12, status: "trial" },
  { slug: "yoga-studio", name: "Zen Yoga", plan: "pro", users: 2, appointments: 67, status: "active" },
];

const planColors: Record<string, "success" | "info" | "warning"> = {
  free: "info",
  pro: "success",
  enterprise: "warning",
};

export default function SuperAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Topbar title="Super Admin" subtitle="Tüm tenantlar, abonelikler ve sistem sağlığı için üst yönetim paneli." />
      <main className="grid gap-5 p-4 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-fade-in stagger-1">
            <MetricCard title="Toplam işletme" value="248" delta="+18 bu ay" icon={<Building2 size={19} />} />
          </div>
          <div className="animate-fade-in stagger-2">
            <MetricCard title="Aktif kullanıcı" value="1.842" delta="%99.9 erişilebilirlik" icon={<Users size={19} />} tone="indigo" />
          </div>
          <div className="animate-fade-in stagger-3">
            <MetricCard title="Pro + Enterprise" value="73" delta="MRR ₺58.327" icon={<TrendingUp size={19} />} tone="orange" />
          </div>
          <div className="animate-fade-in stagger-4">
            <MetricCard title="Sistem sağlığı" value="99.9%" delta="Son 30 gün" icon={<Activity size={19} />} tone="neutral" />
          </div>
        </section>

        <section className="glass rounded-xl p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold">Tenant yönetimi</h2>
            <label className="flex h-10 max-w-sm items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm">
              <Search size={16} className="text-[var(--muted)]" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="İşletme ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 font-semibold text-[var(--muted)]">İşletme</th>
                  <th className="pb-3 font-semibold text-[var(--muted)]">Plan</th>
                  <th className="pb-3 font-semibold text-[var(--muted)]">Kullanıcı</th>
                  <th className="pb-3 font-semibold text-[var(--muted)]">Randevu</th>
                  <th className="pb-3 font-semibold text-[var(--muted)]">Durum</th>
                  <th className="pb-3 font-semibold text-[var(--muted)]">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.slug} className="border-b border-[var(--line)] transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="py-3">
                      <strong className="block">{tenant.name}</strong>
                      <small className="text-[var(--muted)]">/{tenant.slug}</small>
                    </td>
                    <td className="py-3">
                      <Badge variant={planColors[tenant.plan]}>{tenant.plan.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3">{tenant.users}</td>
                    <td className="py-3">{tenant.appointments}</td>
                    <td className="py-3">
                      <Badge variant={tenant.status === "active" ? "success" : "warning"}>
                        {tenant.status === "active" ? "Aktif" : "Deneme"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" className="h-8 text-xs">Detay</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="glass rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Database size={20} /> Sistem metrikleri</h2>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Database boyutu", value: "2.4 GB / 10 GB", percent: 24 },
                { label: "API istekleri (günlük)", value: "12.480 / 100.000", percent: 12 },
                { label: "Storage kullanımı", value: "890 MB / 5 GB", percent: 18 },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500" style={{ width: `${metric.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><AlertTriangle size={20} /> Son olaylar</h2>
            <div className="mt-4 grid gap-3">
              {[
                { time: "2 dk önce", event: "nova-studio yeni Pro abonelik", type: "success" },
                { time: "15 dk önce", event: "beautycenter 50 randevu günlük rekor", type: "info" },
                { time: "1 saat önce", event: "danismanlik free limit yaklaşıyor (28/30)", type: "warning" },
                { time: "3 saat önce", event: "yoga-studio yeni çalışan ekledi", type: "info" },
              ].map((event) => (
                <div key={event.event} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                  <Badge variant={event.type as "success" | "info" | "warning"}>
                    {event.time}
                  </Badge>
                  <span className="text-sm">{event.event}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
