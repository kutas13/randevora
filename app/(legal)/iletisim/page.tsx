import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LegalCallout, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "İletişim · Randevora",
  description: "Randevora ile iletişime geçin. E-posta, telefon ve destek bilgileri.",
};

const channels = [
  {
    icon: Mail,
    title: "E-posta",
    subtitle: "Genel sorular ve destek",
    value: "iletisim@randevora.com.tr",
    href: "mailto:iletisim@randevora.com.tr",
    accent: "from-sky-500/15 to-sky-500/0",
    color: "text-sky-600",
  },
  {
    icon: Phone,
    title: "Telefon",
    subtitle: "Hafta içi 09:00 – 18:00",
    value: "0545 603 65 47",
    href: "tel:+905456036547",
    accent: "from-emerald-500/15 to-emerald-500/0",
    color: "text-emerald-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    subtitle: "Hızlı mesajlaşma",
    value: "0545 603 65 47",
    href: "https://wa.me/905456036547",
    accent: "from-green-500/15 to-green-500/0",
    color: "text-green-600",
  },
  {
    icon: Clock,
    title: "Yanıt süresi",
    subtitle: "İş günleri içinde",
    value: "Ortalama 2 saat",
    href: undefined,
    accent: "from-amber-500/15 to-amber-500/0",
    color: "text-amber-600",
  },
];

export default function Page() {
  return (
    <LegalPage
      title="İletişim"
      updatedAt="01.05.2026"
      description="Hesabınız, ödemeniz, abonelik iptali veya destek talebi için bizimle iletişime geçin."
      eyebrow="Destek"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {channels.map(({ icon: Icon, title, subtitle, value, href, accent, color }) => {
          const inner = (
            <article className={`group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--accent)]/40 hover:shadow-lg ${href ? "cursor-pointer" : ""}`}>
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accent}`} />
              <div className="relative">
                <div className={`flex size-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[var(--line)] ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-1 text-[12px] text-[var(--muted)]">{subtitle}</p>
                <p className="mt-2 text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
                  {value}
                </p>
              </div>
            </article>
          );
          return href ? (
            <a key={title} href={href} className="block">
              {inner}
            </a>
          ) : (
            <div key={title}>{inner}</div>
          );
        })}
      </div>

      <LegalCallout title="İptal & iade talepleri" tone="info">
        Abonelik iptali, iade veya fatura ile ilgili her türlü talebinizi{" "}
        <strong>iletisim@randevora.com.tr</strong> adresine veya{" "}
        <strong>0545 603 65 47</strong> numarasına iletebilirsiniz. Talepleriniz en
        geç 2 iş günü içerisinde yanıtlanır.
      </LegalCallout>

      <LegalSection title="Adres">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-base font-semibold">Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">İstanbul / Türkiye</p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Yasal bilgiler">
        <div className="grid gap-1 text-sm text-[var(--muted)]">
          <p>Ticaret Sicil No: 000000-00</p>
          <p>Mersis No: 0000000000000000</p>
          <p>KEP: meridyen@hs01.kep.tr</p>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
