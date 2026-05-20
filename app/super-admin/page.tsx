"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Building2, Check, CreditCard, LogOut, Search, Shield, TrendingUp, Users, X } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { BusinessStatus } from "@/lib/types";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: BusinessStatus;
  plan: string;
  created_at: string;
  owner_id: string;
};

const statusConfig: Record<BusinessStatus, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  pending: { label: "Onay bekliyor", variant: "warning" },
  approved: { label: "Aktif", variant: "success" },
  rejected: { label: "Reddedildi", variant: "danger" },
  suspended: { label: "Askıda", variant: "info" },
};

export default function SuperAdminPage() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<BusinessStatus | "all">("all");
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBusinesses(data);
    }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast("Onay işlemi başarısız: " + error.message, "error");
    } else {
      toast("İşletme onaylandı!", "success");
      setBusinesses(businesses.map((b) => b.id === id ? { ...b, status: "approved" as BusinessStatus } : b));
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      toast("İşlem başarısız: " + error.message, "error");
    } else {
      toast("İşletme reddedildi", "warning");
      setBusinesses(businesses.map((b) => b.id === id ? { ...b, status: "rejected" as BusinessStatus } : b));
    }
  }

  async function handleSuspend(id: string) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "suspended" })
      .eq("id", id);

    if (error) {
      toast("İşlem başarısız: " + error.message, "error");
    } else {
      toast("İşletme askıya alındı", "warning");
      setBusinesses(businesses.map((b) => b.id === id ? { ...b, status: "suspended" as BusinessStatus } : b));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const filtered = businesses.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase()) && !b.slug.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingCount = businesses.filter((b) => b.status === "pending").length;
  const approvedCount = businesses.filter((b) => b.status === "approved").length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/82 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-600 text-sm font-black text-white shadow-lg">SA</span>
            <div>
              <h1 className="text-xl font-bold">Super Admin Panel</h1>
              <p className="text-xs text-[var(--muted)]">Tüm işletmeleri yönet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge variant="warning">{pendingCount} onay bekliyor</Badge>
            )}
            <Link href="/super-admin/payments">
              <Button variant="secondary">
                <CreditCard size={18} /> Ödeme Takibi
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut size={18} /> Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="grid gap-5 p-4 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-fade-in stagger-1">
            <MetricCard title="Toplam işletme" value={String(businesses.length)} delta={`${pendingCount} onay bekliyor`} icon={<Building2 size={19} />} />
          </div>
          <div className="animate-fade-in stagger-2">
            <MetricCard title="Aktif işletme" value={String(approvedCount)} delta="Onaylanmış" icon={<Users size={19} />} tone="indigo" />
          </div>
          <div className="animate-fade-in stagger-3">
            <MetricCard title="Onay bekliyor" value={String(pendingCount)} delta="Acil ilgilenilmeli" icon={<Shield size={19} />} tone="orange" />
          </div>
          <div className="animate-fade-in stagger-4">
            <MetricCard title="Sistem" value="Aktif" delta="Tüm servisler çalışıyor" icon={<Activity size={19} />} tone="neutral" />
          </div>
        </section>

        <section className="glass rounded-xl p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold">İşletme Yönetimi</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-1">
                {(["all", "pending", "approved", "rejected", "suspended"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${filterStatus === s ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950" : "text-[var(--muted)]"}`}
                  >
                    {s === "all" ? "Tümü" : s === "pending" ? "Bekliyor" : s === "approved" ? "Aktif" : s === "rejected" ? "Red" : "Askıda"}
                  </button>
                ))}
              </div>
              <label className="flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm">
                <Search size={15} className="text-[var(--muted)]" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-center text-sm text-[var(--muted)]">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="mt-8 text-center text-sm text-[var(--muted)]">
              {businesses.length === 0 ? "Henüz kayıtlı işletme yok." : "Filtreye uygun işletme bulunamadı."}
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {filtered.map((business) => {
                const config = statusConfig[business.status];
                return (
                  <div
                    key={business.id}
                    className={`rounded-lg border bg-[var(--panel-strong)] p-4 transition-all duration-200 hover:shadow-md ${business.status === "pending" ? "border-orange-300 dark:border-orange-400/30" : "border-[var(--line)]"}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong className="block">{business.name}</strong>
                          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                            <span>/{business.slug}</span>
                            <span>·</span>
                            <span>{business.category}</span>
                            <span>·</span>
                            <span>{new Date(business.created_at).toLocaleDateString("tr-TR")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <Badge>{business.plan.toUpperCase()}</Badge>

                        {business.status === "pending" && (
                          <>
                            <Button
                              variant="primary"
                              className="h-8 text-xs"
                              onClick={() => handleApprove(business.id)}
                            >
                              <Check size={14} /> Onayla
                            </Button>
                            <Button
                              variant="danger"
                              className="h-8 text-xs"
                              onClick={() => handleReject(business.id)}
                            >
                              <X size={14} /> Reddet
                            </Button>
                          </>
                        )}

                        {business.status === "approved" && (
                          <Button
                            variant="ghost"
                            className="h-8 text-xs text-orange-600"
                            onClick={() => handleSuspend(business.id)}
                          >
                            Askıya al
                          </Button>
                        )}

                        {(business.status === "rejected" || business.status === "suspended") && (
                          <Button
                            variant="secondary"
                            className="h-8 text-xs"
                            onClick={() => handleApprove(business.id)}
                          >
                            <Check size={14} /> Onayla
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
