import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Heart, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { LegalCallout, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Hakkımızda · Randevora",
  description:
    "Randevora hakkında: kuruluş amacımız, kimler için ve hangi sorunu çözüyoruz.",
};

const values = [
  {
    icon: CalendarCheck,
    title: "Randevu yönetimi",
    text: "Berber, kuaför, güzellik merkezi, danışman, freelancer — randevu ile çalışan tüm sektörler için online rezervasyonu kolaylaştırıyoruz.",
  },
  {
    icon: Users,
    title: "Ekip & müşteri",
    text: "Çalışan ekleme, izin yönetimi, müşteri kartları ve randevu geçmişi tek panelde.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli altyapı",
    text: "SSL/TLS, rol bazlı erişim, KVKK uyumlu veri saklama ve PCI-DSS uyumlu ödeme.",
  },
  {
    icon: Sparkles,
    title: "Sade arayüz",
    text: "Telefonda ve masaüstünde aynı akıcılıkta, sade ve modern bir yönetim paneli.",
  },
  {
    icon: Zap,
    title: "Hızlı kurulum",
    text: "30 saniyede işletmenizi oluşturun, dakikalar içinde online randevu almaya başlayın.",
  },
  {
    icon: Heart,
    title: "Müşteri odaklı",
    text: "İhtiyaçlarınıza göre sürekli geliştiriliyoruz. Önerileriniz bizim için değerli.",
  },
];

const stats = [
  { value: "248+", label: "Aktif işletme" },
  { value: "12K+", label: "Aylık randevu" },
  { value: "99.9%", label: "Uptime" },
];

export default function Page() {
  return (
    <LegalPage
      title="Randevora hakkında"
      updatedAt="01.05.2026"
      description="Küçük ve orta ölçekli işletmeler için modern bir online randevu sistemi."
      eyebrow="Hakkımızda"
    >
      <LegalCallout title="Kuruluş amacımız" tone="info">
        Randevora, KOBİ&apos;lerin telefonda randevu alma sorununu ortadan kaldırmak için
        kuruldu. Müşterileriniz özel link üzerinden, işletme açık olmasa bile, kayıt
        olmadan, 30 saniyede randevu alabilir. Siz tüm randevuları, ekibinizi,
        müşterilerinizi ve gelirinizi tek panelden yönetirsiniz.
      </LegalCallout>

      {/* Stats şeridi */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl px-3 py-4 text-center">
            <strong className="block text-2xl font-black md:text-3xl">{s.value}</strong>
            <span className="mt-1 block text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <LegalSection title="Ne yapıyoruz?">
        <p>
          Hizmetimiz bir SaaS abonelik modeli ile sunulur. Yeni kullanıcılara{" "}
          <strong>10 gün ücretsiz deneme</strong> süresi tanınır ve bu süre boyunca
          kart bilgisi alınmaz. Deneme sonrası kullanıcı bilinçli olarak bir plan
          seçerek aboneliğini başlatır. Aboneliği panelden tek tıkla iptal
          edebilirsiniz.
        </p>
        <p>
          Tüm müşteri verileri Avrupa içinde KVKK & GDPR uyumlu sağlayıcılarda
          barındırılır. Ödeme verileri sunucularımıza hiç ulaşmadan PCI-DSS
          sertifikalı <strong>iyzico</strong> altyapısı tarafından işlenir.
        </p>
      </LegalSection>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="group rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--accent)]/40 hover:shadow-md"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent)]/5 text-[var(--accent)]">
              <Icon size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold">{title}</h3>
            <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">{text}</p>
          </article>
        ))}
      </div>

      <LegalSection title="Kurucu firma">
        <p>
          <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong> bünyesinde
          geliştirilen Randevora, Türkiye merkezli yerli bir yazılımdır.
        </p>
      </LegalSection>

      {/* CTA */}
      <div className="overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 via-[var(--accent)]/5 to-transparent p-6 md:p-8">
        <h3 className="text-xl font-black md:text-2xl">İşletmenizi 30 saniyede dijitalleştirin</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          10 gün ücretsiz deneme. İstediğiniz an iptal edebilirsiniz.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-[var(--foreground)] px-5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
          >
            Ücretsiz başla
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex h-11 items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
          >
            İletişime geç
          </Link>
        </div>
      </div>
    </LegalPage>
  );
}
