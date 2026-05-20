"use client";

import { Check, CheckCircle2, Crown, Rocket } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Başlangıç",
    price: "999",
    period: "/ay",
    description: "Küçük ve orta ölçekli işletmeler için",
    icon: Rocket,
    features: [
      "Sınırsız randevu",
      "Admin dahil 5 çalışan",
      "Online randevu sayfası",
      "Takvim yönetimi",
      "Müşteri yönetimi",
      "İzin yönetimi",
      "Çalışma saati ayarları",
    ],
    cta: "Bu planı seç",
    popular: true,
  },
  {
    name: "Profesyonel",
    price: "1999",
    period: "/ay",
    description: "Büyük işletmeler ve çoklu şubeler için",
    icon: Crown,
    features: [
      "Sınırsız randevu",
      "Admin dahil 10 çalışan",
      "WhatsApp entegrasyonu",
      "Özel domain bağlama",
      "Öncelikli destek",
      "Gelişmiş raporlar",
      "Tüm Başlangıç özellikleri",
    ],
    cta: "Profesyonel'e geç",
    popular: false,
  },
];

export default function BillingPage() {
  return (
    <>
      <Topbar title="Ödeme Planı" subtitle="İşletmenize uygun planı seçin." />
      <main className="grid gap-6 p-4 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">İşletmeniz için doğru planı seçin</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Tüm planlarda sınırsız randevu. Randevu kotası yoktur.</p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.name}
                className={`animate-fade-in relative rounded-2xl border p-7 transition-all duration-300 hover:shadow-xl stagger-${index + 1} ${plan.popular ? "border-[var(--accent)] bg-gradient-to-b from-[var(--accent)]/5 to-transparent shadow-lg shadow-[var(--accent)]/10" : "border-[var(--line)] bg-[var(--panel-strong)]"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="success">Önerilen</Badge>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`flex size-11 items-center justify-center rounded-xl ${plan.popular ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300"}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-[var(--muted)]">{plan.description}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm text-[var(--muted)]"> TL{plan.period}</span>
                </div>

                <div className="mt-6 grid gap-2.5">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="shrink-0 text-[var(--accent)]" />
                      {feature}
                    </p>
                  ))}
                </div>

                <Button
                  className="mt-7 w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </article>
            );
          })}
        </div>

        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-[var(--muted)]">
            Tüm planlarda sınırsız randevu hakkı. Çalışan limiti admin dahildir. 
            Ödeme bilgileri için iletişime geçin.
          </p>
        </section>
      </main>
    </>
  );
}
