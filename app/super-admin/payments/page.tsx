"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  payment_day: number | null;
};

type PaymentRecord = {
  id: string;
  business_id: string;
  amount: number;
  paid_at: string;
  period: string;
  business?: { name: string } | null;
};

const PLAN_PRICES: Record<string, number> = {
  starter: 999,
  pro: 1999,
};

export default function PaymentsPage() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [paymentDay, setPaymentDay] = useState(1);
  const [showAssign, setShowAssign] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [bizRes, payRes] = await Promise.all([
      supabase
        .from("businesses")
        .select("id, name, slug, plan, payment_day")
        .eq("status", "approved")
        .order("name"),
      supabase
        .from("payments")
        .select("*, business:businesses(name)")
        .order("paid_at", { ascending: false })
        .limit(50),
    ]);

    setBusinesses(bizRes.data || []);
    setPayments(payRes.data || []);
    setLoading(false);
  }

  async function handleAssignPlan() {
    if (!selectedBiz) {
      toast("İşletme seçin.", "error");
      return;
    }

    const { error } = await supabase
      .from("businesses")
      .update({ plan: selectedPlan, payment_day: paymentDay })
      .eq("id", selectedBiz);

    if (error) {
      toast("Paket atanamadı: " + error.message, "error");
      return;
    }

    toast("Paket ve ödeme tarihi atandı!", "success");
    setShowAssign(false);
    load();
  }

  async function handleMarkPaid(businessId: string) {
    const biz = businesses.find((b) => b.id === businessId);
    if (!biz) return;

    const amount = PLAN_PRICES[biz.plan] || 999;
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { error } = await supabase.from("payments").insert({
      business_id: businessId,
      amount,
      paid_at: now.toISOString(),
      period,
    });

    if (error) {
      toast("Ödeme kaydı eklenemedi: " + error.message, "error");
      return;
    }

    toast(`${biz.name} - ${amount} TL ödeme kaydedildi!`, "success");
    load();
  }

  function getDueBusinesses() {
    const today = new Date().getDate();
    return businesses.filter((b) => {
      if (!b.payment_day) return false;
      return b.payment_day === today || b.payment_day === today + 1 || b.payment_day === today + 2;
    });
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthPayments = payments.filter((p) => {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return p.period === period;
  });
  const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const dueBusinesses = getDueBusinesses();

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-center text-[var(--muted)]">Yükleniyor...</div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/82 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/super-admin">
              <Button variant="ghost" className="size-9 px-0"><ArrowLeft size={18} /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Ödeme Takibi</h1>
              <p className="text-xs text-[var(--muted)]">İşletme ödemeleri ve ciro</p>
            </div>
          </div>
          <Button onClick={() => setShowAssign(!showAssign)}>
            <CreditCard size={18} /> Paket Ata
          </Button>
        </div>
      </header>

      <main className="grid gap-5 p-4 md:p-8">
        {/* Metrikler */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Toplam Gelir" value={`${totalRevenue.toLocaleString("tr-TR")} TL`} delta="Tüm zamanlar" icon={<TrendingUp size={19} />} />
          <MetricCard title="Bu Ay Gelir" value={`${thisMonthRevenue.toLocaleString("tr-TR")} TL`} delta={`${thisMonthPayments.length} ödeme`} icon={<CreditCard size={19} />} tone="indigo" />
          <MetricCard title="Aktif İşletme" value={String(businesses.length)} delta="Onaylı işletmeler" icon={<Check size={19} />} tone="neutral" />
          <MetricCard title="Ödeme Yaklaşan" value={String(dueBusinesses.length)} delta="Bugün/yarın" icon={<AlertCircle size={19} />} tone="orange" />
        </section>

        {/* Paket Atama */}
        {showAssign && (
          <section className="glass rounded-xl p-5">
            <h2 className="text-lg font-bold">Paket & Ödeme Tarihi Ata</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-semibold">İşletme</label>
                <select
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  value={selectedBiz}
                  onChange={(e) => setSelectedBiz(e.target.value)}
                >
                  <option value="">Seçin</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Paket</label>
                <select
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <option value="starter">Başlangıç - 999 TL/ay</option>
                  <option value="pro">Profesyonel - 1999 TL/ay</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Ödeme günü (ayın)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAssignPlan} className="h-11 w-full">Kaydet</Button>
              </div>
            </div>
          </section>
        )}

        {/* Ödeme Yaklaşanlar */}
        {dueBusinesses.length > 0 && (
          <section className="glass rounded-xl border-l-4 border-l-orange-500 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-orange-600">
              <AlertCircle size={20} /> Ödeme Hatırlatması
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Bu işletmelerin ödeme günü yaklaştı veya bugün:</p>
            <div className="mt-3 grid gap-2">
              {dueBusinesses.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-400/10">
                  <div>
                    <strong>{biz.name}</strong>
                    <span className="ml-2 text-sm text-[var(--muted)]">
                      Paket: {biz.plan === "pro" ? "Profesyonel" : "Başlangıç"} · Ödeme günü: {biz.payment_day}
                    </span>
                  </div>
                  <Button className="h-8 text-xs" onClick={() => handleMarkPaid(biz.id)}>
                    <Check size={14} /> Ödeme alındı
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* İşletme Listesi */}
        <section className="glass rounded-xl p-5">
          <h2 className="text-lg font-bold">İşletmeler & Paketler</h2>
          <div className="mt-4 grid gap-2">
            {businesses.map((biz) => {
              const price = PLAN_PRICES[biz.plan] || 0;
              const lastPayment = payments.find((p) => p.business_id === biz.id);
              return (
                <div key={biz.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                      {biz.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong className="block text-sm">{biz.name}</strong>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <Badge>{biz.plan === "pro" ? "Profesyonel" : "Başlangıç"}</Badge>
                        <span>{price} TL/ay</span>
                        {biz.payment_day && (
                          <span className="flex items-center gap-1"><Calendar size={11} /> Her ayın {biz.payment_day}. günü</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lastPayment ? (
                      <span className="text-xs text-green-600">Son ödeme: {new Date(lastPayment.paid_at).toLocaleDateString("tr-TR")}</span>
                    ) : (
                      <span className="text-xs text-red-500">Henüz ödeme yok</span>
                    )}
                    <Button variant="secondary" className="h-8 text-xs" onClick={() => handleMarkPaid(biz.id)}>
                      <Check size={14} /> Ödeme al
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Son Ödemeler / Ciro */}
        <section className="glass rounded-xl p-5">
          <h2 className="text-lg font-bold">Son Ödemeler (Gelir/Ciro)</h2>
          {payments.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Henüz ödeme kaydı yok.</p>
          ) : (
            <div className="mt-4 grid gap-2">
              {payments.map((p) => {
                const bizName = Array.isArray(p.business) ? (p.business as any)[0]?.name : (p.business as any)?.name;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300">
                        <CreditCard size={15} />
                      </div>
                      <div>
                        <strong className="text-sm">{bizName || "İşletme"}</strong>
                        <p className="text-xs text-[var(--muted)]">{p.period} dönemi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-green-700 dark:text-green-300">{p.amount.toLocaleString("tr-TR")} TL</strong>
                      <p className="text-xs text-[var(--muted)]">{new Date(p.paid_at).toLocaleDateString("tr-TR")}</p>
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
