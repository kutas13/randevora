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

const PLAN_OPTIONS = [
  { value: "starter", label: "Başlangıç", price: 999 },
  { value: "pro", label: "Profesyonel", price: 1999 },
];

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function getPlanPrice(plan: string) {
  return PLAN_OPTIONS.find((p) => p.value === plan)?.price || 999;
}

function getPlanLabel(plan: string) {
  return PLAN_OPTIONS.find((p) => p.value === plan)?.label || plan;
}

export default function PaymentsPage() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [paymentDay, setPaymentDay] = useState(1);
  const [showAssign, setShowAssign] = useState(false);

  // Ay filtresi
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());

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
        .limit(200),
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

    const amount = getPlanPrice(biz.plan);
    const period = `${filterYear}-${String(filterMonth + 1).padStart(2, "0")}`;

    // Aynı dönem için zaten ödeme var mı kontrol et
    const existing = payments.find((p) => p.business_id === businessId && p.period === period);
    if (existing) {
      toast("Bu dönem için zaten ödeme kaydı var.", "error");
      return;
    }

    const { error } = await supabase.from("payments").insert({
      business_id: businessId,
      amount,
      paid_at: new Date().toISOString(),
      period,
    });

    if (error) {
      toast("Ödeme kaydı eklenemedi: " + error.message, "error");
      return;
    }

    toast(`${biz.name} - ${amount} TL (${MONTHS[filterMonth]} ${filterYear}) ödeme kaydedildi!`, "success");
    load();
  }

  // Seçili ay için ödeme yapan/yapmayan işletmeler
  const selectedPeriod = `${filterYear}-${String(filterMonth + 1).padStart(2, "0")}`;
  const paidThisPeriod = payments.filter((p) => p.period === selectedPeriod);
  const paidBizIds = new Set(paidThisPeriod.map((p) => p.business_id));
  const unpaidBusinesses = businesses.filter((b) => !paidBizIds.has(b.id));
  const paidBusinesses = businesses.filter((b) => paidBizIds.has(b.id));

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const monthRevenue = paidThisPeriod.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-[var(--muted)]">Yükleniyor...</div>;
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
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard title="Toplam Gelir" value={`${totalRevenue.toLocaleString("tr-TR")} TL`} delta="Tüm zamanlar" icon={<TrendingUp size={19} />} />
          <MetricCard title={`${MONTHS[filterMonth]} ${filterYear} Geliri`} value={`${monthRevenue.toLocaleString("tr-TR")} TL`} delta={`${paidThisPeriod.length} ödeme`} icon={<CreditCard size={19} />} tone="indigo" />
          <MetricCard title="Ödeme bekleyen" value={String(unpaidBusinesses.length)} delta={`${MONTHS[filterMonth]} ayı`} icon={<AlertCircle size={19} />} tone="orange" />
        </section>

        {/* Ay Seçici */}
        <section className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm font-semibold outline-none"
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            className="h-10 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm font-semibold outline-none"
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
          >
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-sm text-[var(--muted)]">
            {paidBusinesses.length}/{businesses.length} işletme ödedi
          </span>
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
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label} - {p.price} TL/ay</option>
                  ))}
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

        {/* Ödeme bekleyenler */}
        <section className="glass rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <AlertCircle size={20} className="text-orange-500" />
            Ödeme Bekleyenler — {MONTHS[filterMonth]} {filterYear}
          </h2>
          {unpaidBusinesses.length === 0 ? (
            <p className="mt-3 text-sm text-green-600">Tüm işletmeler bu ay ödeme yaptı!</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {unpaidBusinesses.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-400/20 dark:bg-orange-400/10">
                  <div>
                    <strong>{biz.name}</strong>
                    <span className="ml-2 text-sm text-[var(--muted)]">
                      {getPlanLabel(biz.plan)} · {getPlanPrice(biz.plan)} TL
                      {biz.payment_day && <> · Her ayın {biz.payment_day}. günü</>}
                    </span>
                  </div>
                  <Button className="h-8 text-xs" onClick={() => handleMarkPaid(biz.id)}>
                    <Check size={14} /> Ödeme alındı
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ödeme yapanlar */}
        <section className="glass rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Check size={20} className="text-green-600" />
            Ödeme Yapanlar — {MONTHS[filterMonth]} {filterYear}
          </h2>
          {paidBusinesses.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">Bu ay henüz ödeme kaydı yok.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {paidBusinesses.map((biz) => {
                const payment = paidThisPeriod.find((p) => p.business_id === biz.id);
                return (
                  <div key={biz.id} className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-400/20 dark:bg-green-400/10">
                    <div>
                      <strong>{biz.name}</strong>
                      <span className="ml-2 text-sm text-[var(--muted)]">{getPlanLabel(biz.plan)}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-green-700 dark:text-green-300">{payment?.amount.toLocaleString("tr-TR")} TL</strong>
                      {payment && <p className="text-xs text-[var(--muted)]">{new Date(payment.paid_at).toLocaleDateString("tr-TR")}</p>}
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
