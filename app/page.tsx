import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Clock, CreditCard, Gift, Globe, Laptop, Lock, RefreshCw, Rocket, ShieldCheck, Smartphone, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const segments = ["Berber", "Kuaför", "Nail studio", "Güzellik merkezi", "Danışman", "Freelancer", "Özel ders", "Dövmeci", "Spa & Masaj"];

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Zap, title: "Ultra hızlı", text: "Anında yüklenen sayfalar ile müşterilerinize hızlı ve akıcı deneyim." },
  { icon: ShieldCheck, title: "Güvenli altyapı", text: "Rol bazlı erişim ve güçlü veritabanı güvenliği ile verileriniz güvende." },
  { icon: Globe, title: "Online booking", text: "Her personel için özel link. Müşterileriniz kayıt olmadan kolayca randevu alsın." },
  { icon: Clock, title: "Akıllı takvim", text: "Dolu saatleri otomatik göster, çakışmayı engelle, tek tıkla onayla." },
  { icon: Laptop, title: "Zarif panel", text: "Temiz, minimal ve güçlü yönetim paneli ile işletmenizi kolayca yönetin." },
  { icon: Smartphone, title: "Her cihazda", text: "Responsive tasarım ile telefondan, tabletten, bilgisayardan mükemmel deneyim." },
];

const stats = [
  { value: "248+", label: "Aktif işletme" },
  { value: "12K+", label: "Aylık randevu" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "Kullanıcı puanı" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Randevora",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://randevora.com.tr",
  description: "İşletmeler için online randevu yönetim sistemi",
  offers: {
    "@type": "Offer",
    price: "999",
    priceCurrency: "TRY",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "248",
  },
};

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="relative min-h-screen px-4 py-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#c9956b]/20 to-transparent blur-3xl" />
        </div>

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Randevora" className="size-11 rounded-xl object-cover shadow-lg" />
            <strong className="text-xl tracking-tight">Randevora</strong>
          </Link>
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block" href="/login">
              Giriş yap
            </Link>
            <Link href="/register">
              <Button className="hidden sm:inline-flex">
                Ücretsiz başla
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link href="/dashboard" className="sm:hidden">
              <Button>Panel</Button>
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto max-w-7xl pt-24 text-center lg:pt-32">
          <div className="animate-fade-in">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)] shadow-sm">
              <Gift size={16} className="text-[var(--accent)]" />
              10 gün ücretsiz deneme · İstediğin an iptal et
            </div>

            <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
              Randevunuz{" "}
              <span className="bg-gradient-to-r from-[#b07c4f] via-[#d4956a] to-[#e8c4a0] bg-clip-text text-transparent">
                bizde
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              İşletmeniz için ultra hızlı, güvenli ve şık online randevu sistemi. 
              Müşterileriniz kolayca randevu alsın, siz işinize odaklanın.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button className="h-13 px-8 text-base shadow-lg shadow-[#b07c4f]/20">
                  <Rocket size={20} />
                  Ücretsiz işletme oluştur
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" className="h-13 px-8 text-base">
                  Giriş yap
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Preview Card */}
          <div className="animate-slide-up mx-auto mt-16 max-w-2xl">
            <div className="glass rounded-2xl p-5 shadow-2xl shadow-black/10">
              <div className="rounded-xl bg-[var(--panel-strong)] p-5">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div className="text-left">
                    <p className="text-sm text-[var(--muted)]">Bugünkü randevular</p>
                    <strong className="text-2xl">16 randevu</strong>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-400/15 dark:text-green-200">Canlı</span>
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    { time: "09:30", name: "Ayşe K.", service: "Saç Kesimi", color: "#b07c4f" },
                    { time: "10:30", name: "Can D.", service: "Sakal Tıraşı", color: "#d4956a" },
                    { time: "13:00", name: "Selin M.", service: "Nail Art", color: "#8b6d47" },
                  ].map((item) => (
                    <div key={item.time} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-3">
                      <span className="flex items-center gap-3">
                        <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm font-medium">{item.time} · {item.name} · {item.service}</span>
                      </span>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[var(--line)] px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <strong className="block text-3xl font-black md:text-4xl">{stat.value}</strong>
              <span className="mt-1 text-sm text-[var(--muted)]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Segments */}
      <section className="border-t border-[var(--line)] px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold text-[var(--muted)]">Her sektör için uygun</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {segments.map((segment) => (
              <span key={segment} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]">
                {segment}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--line)] px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-black md:text-5xl">Neden Randevora?</h2>
            <p className="mt-4 text-lg text-[var(--muted)]">İşletmenizi büyütecek her özellik tek yerde.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <article key={title} className="glass rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-[#b07c4f]/5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#b07c4f]/10 to-[#d4956a]/10 text-[var(--accent)]">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-[var(--line)] px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-black md:text-5xl">Basit ve şeffaf fiyatlandırma</h2>
            <p className="mt-4 text-lg text-[var(--muted)]">Tüm planlarda sınırsız randevu. Randevu kotası yoktur.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <article className="glass rounded-2xl border border-[var(--accent)] p-7 shadow-lg shadow-[var(--accent)]/10">
              <div className="inline-block rounded-lg bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">Önerilen</div>
              <h3 className="mt-3 text-xl font-bold">Başlangıç</h3>
              <p className="text-sm text-[var(--muted)]">Küçük ve orta ölçekli işletmeler için</p>
              <div className="mt-4"><span className="text-4xl font-black">999</span><span className="text-sm text-[var(--muted)]"> TL/ay</span></div>
              <ul className="mt-5 grid gap-2 text-sm">
                {["Sınırsız randevu", "Admin dahil 5 çalışan", "Online randevu sayfası", "Takvim yönetimi", "Müşteri yönetimi", "İzin yönetimi", "Çalışma saati ayarları"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-[var(--accent)]" />{f}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-6 block">
                <Button className="w-full">Hemen başla</Button>
              </Link>
            </article>
            <article className="glass rounded-2xl p-7">
              <div className="inline-block rounded-lg bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700 dark:bg-white/10 dark:text-neutral-300">Profesyonel</div>
              <h3 className="mt-3 text-xl font-bold">Profesyonel</h3>
              <p className="text-sm text-[var(--muted)]">Büyük işletmeler ve çoklu şubeler için</p>
              <div className="mt-4"><span className="text-4xl font-black">1999</span><span className="text-sm text-[var(--muted)]"> TL/ay</span></div>
              <ul className="mt-5 grid gap-2 text-sm">
                {["Sınırsız randevu", "Admin dahil 10 çalışan", "WhatsApp entegrasyonu", "Özel domain bağlama", "Öncelikli destek", "Gelişmiş raporlar", "Tüm Başlangıç özellikleri"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-[var(--accent)]" />{f}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-6 block">
                <Button variant="secondary" className="w-full">Profesyonel&apos;e geç</Button>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Güven / Şeffaflık */}
      <section className="border-t border-[var(--line)] px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-black md:text-4xl">Güvenli ödeme, şeffaf abonelik</h2>
            <p className="mt-4 text-lg text-[var(--muted)]">
              Hiçbir gizli ücret yok. Aboneliğinizi istediğiniz an tek tıkla iptal edebilirsiniz.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="glass rounded-2xl p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Gift size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold">10 gün ücretsiz deneme</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tüm özellikleri 10 gün boyunca ücretsiz kullan. Beğenmezsen iptal et.
              </p>
            </article>
            <article className="glass rounded-2xl p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <RefreshCw size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold">Tek tıkla iptal</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Otomatik yenileme açıktır, ama panelden veya e-posta ile her an iptal edebilirsiniz.
              </p>
            </article>
            <article className="glass rounded-2xl p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <Lock size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold">SSL & HTTPS</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tüm trafik TLS şifreleme ile korunur. Bağlantı uçtan uca güvenlidir.
              </p>
            </article>
            <article className="glass rounded-2xl p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                <CreditCard size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold">Kart bilgisi sunucumuzda saklanmaz</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Ödemeler PCI-DSS sertifikalı <strong>iyzico</strong> sanal POS üzerinden alınır.
              </p>
            </article>
          </div>
          <p className="mt-8 text-center text-sm text-[var(--muted)]">
            Detaylar için{" "}
            <Link href="/legal/mesafeli-satis" className="text-[var(--accent)] underline">
              Mesafeli Satış Sözleşmesi
            </Link>{" "}
            ve{" "}
            <Link href="/legal/iade-iptal" className="text-[var(--accent)] underline">
              İade & İptal Koşulları
            </Link>
            &apos;na bakınız.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--line)] px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <h2 className="mt-6 text-3xl font-black md:text-5xl">Hemen başlayın</h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            30 saniyede ücretsiz işletmenizi oluşturun. 10 gün boyunca tüm özellikleri ücretsiz deneyin.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button className="h-13 px-8 text-base shadow-lg shadow-[#b07c4f]/20">
                <Rocket size={20} />
                Ücretsiz başla
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-13 px-8 text-base">
                Giriş yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--panel)] px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Randevora" className="size-9 rounded-lg object-cover" />
              <strong className="text-lg tracking-tight">Randevora</strong>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Randevunuz bizde. Berber, kuaför, güzellik ve danışmanlık için online randevu sistemi.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-[11px] font-semibold text-[var(--muted)]">
                <Lock size={11} /> SSL
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-[11px] font-semibold text-[var(--muted)]">
                <ShieldCheck size={11} /> KVKK
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-[11px] font-semibold text-[var(--muted)]">
                <CreditCard size={11} /> iyzico
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold">Ürün</h4>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
              <li><Link href="/register" className="hover:text-[var(--foreground)]">Ücretsiz kayıt</Link></li>
              <li><Link href="/login" className="hover:text-[var(--foreground)]">Giriş</Link></li>
              <li><Link href="/dashboard" className="hover:text-[var(--foreground)]">Panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold">Şirket</h4>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
              <li><Link href="/hakkimizda" className="hover:text-[var(--foreground)]">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-[var(--foreground)]">İletişim</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold">Yasal</h4>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
              <li><Link href="/legal/mesafeli-satis" className="hover:text-[var(--foreground)]">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/legal/uyelik-sozlesmesi" className="hover:text-[var(--foreground)]">Üyelik Sözleşmesi</Link></li>
              <li><Link href="/legal/gizlilik" className="hover:text-[var(--foreground)]">Gizlilik Politikası</Link></li>
              <li><Link href="/legal/iade-iptal" className="hover:text-[var(--foreground)]">İade & İptal</Link></li>
              <li><Link href="/legal/kvkk" className="hover:text-[var(--foreground)]">KVKK</Link></li>
              <li><Link href="/legal/cerez-politikasi" className="hover:text-[var(--foreground)]">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-[var(--line)] pt-6 text-center text-xs text-[var(--muted)]">
          © 2026 Meridyen Yazılım Teknoloji Ticaret Ltd. Şti. · Tüm hakları saklıdır.
        </div>
      </footer>
    </main>
  );
}
