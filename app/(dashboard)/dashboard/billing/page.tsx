"use client";

import { useState } from "react";
import { Check, CheckCircle2, Crown, Rocket, Sparkles, Zap } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "/ay",
    description: "Küçük işletmeler için başlangıç",
    icon: Zap,
    features: ["30 randevu / ay", "1 çalışan", "Temel takvim", "Public booking sayfası", "E-posta bildirimleri"],
    limitations: ["Gelişmiş raporlar yok", "WhatsApp entegrasyonu yok", "Özel domain yok"],
    cta: "Mevcut plan",
    popular: false,
  },
  {
    name: "Pro",
    price: "799",
    period: "/ay",
    description: "Büyüyen işletmeler için her şey dahil",
    icon: Rocket,
    features: ["Sınırsız randevu", "Sınırsız çalışan", "Gelişmiş raporlar", "WhatsApp entegrasyonu", "Kupon ve sadakat sistemi", "Kapora sistemi", "Öncelikli destek"],
    limitations: [],
    cta: "Pro'ya geç",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Özel",
    period: "",
    description: "Kurumsal ihtiyaçlar için özel çözüm",
    icon: Crown,
    features: ["Pro'daki her şey", "Özel domain", "SLA garantisi", "Ekip eğitimi", "API erişimi", "Dedicated destek", "Özel entegrasyonlar"],
    limitations: [],
    cta: "İletişime geç",
    popular: false,
  },
];

export default function BillingPage() {
  const [currentPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      <Topbar title="Ödeme Planı" subtitle="SaaS limitleri, paket yükseltme ve ödeme altyapısı." />
      <main className="grid gap-6 p-4 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">İşletmeniz için doğru planı seçin</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Tüm planlar 14 gün ücretsiz deneme ile başlar. İstediğiniz zaman iptal edin.</p>

          <div className="mx-auto mt-5 inline-flex rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${billingCycle === "monthly" ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950" : "text-[var(--muted)]"}`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${billingCycle === "yearly" ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950" : "text-[var(--muted)]"}`}
            >
              Yıllık <Badge variant="success" className="ml-1">-20%</Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isActive = currentPlan === plan.name.toLowerCase();
            const yearlyPrice = plan.price !== "Özel" ? Math.round(Number(plan.price) * 0.8) : "Özel";

            return (
              <article
                key={plan.name}
                className={`animate-fade-in relative rounded-xl border p-6 transition-all duration-300 hover:shadow-xl stagger-${index + 1} ${plan.popular ? "border-teal-600 bg-gradient-to-b from-teal-500/5 to-transparent shadow-lg shadow-teal-600/10" : "border-[var(--line)] bg-[var(--panel-strong)]"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="success">
                      <Sparkles size={12} /> En popüler
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-lg ${plan.popular ? "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-200" : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300"}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-[var(--muted)]">{plan.description}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-4xl font-black">
                    {plan.price !== "Özel" ? (billingCycle === "yearly" ? `${yearlyPrice}` : plan.price) : "Özel"}
                  </span>
                  {plan.price !== "Özel" && (
                    <span className="text-sm text-[var(--muted)]"> TL{plan.period}</span>
                  )}
                </div>

                <div className="mt-6 grid gap-2.5">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="shrink-0 text-teal-600" />
                      {feature}
                    </p>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <p key={limitation} className="flex items-center gap-2 text-sm text-[var(--muted)] line-through">
                      <CheckCircle2 size={16} className="shrink-0 opacity-30" />
                      {limitation}
                    </p>
                  ))}
                </div>

                <Button
                  className="mt-6 w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                  disabled={isActive}
                >
                  {isActive ? <><Check size={16} /> Aktif plan</> : plan.cta}
                </Button>
              </article>
            );
          })}
        </div>

        <section className="glass rounded-xl p-5">
          <h3 className="text-lg font-bold">Kullanım durumu</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Randevular</span>
                <strong>16 / 30</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                <div className="h-full w-[53%] rounded-full bg-gradient-to-r from-teal-600 to-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Çalışanlar</span>
                <strong>3 / 1</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
              </div>
              <p className="mt-1 text-xs text-red-600">Limit aşıldı — Pro'ya geçin</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Depolama</span>
                <strong>12 MB / 100 MB</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                <div className="h-full w-[12%] rounded-full bg-gradient-to-r from-teal-600 to-emerald-500" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
