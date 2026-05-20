import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, Globe, Laptop, Rocket, ShieldCheck, Smartphone, Sparkles, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const segments = ["Berber", "Kuaför", "Nail studio", "Güzellik merkezi", "Danışman", "Freelancer", "Özel ders", "Dövmeci", "Spa & Masaj"];

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Zap, title: "Ultra hızlı", text: "Modern App Router altyapısı, streaming hazır sayfalar ile müşterilerinize hızlı deneyim." },
  { icon: ShieldCheck, title: "Güvenli altyapı", text: "Rol bazlı erişim, PostgreSQL RLS ve multi-tenant izolasyon ile verileriniz güvende." },
  { icon: Globe, title: "Online booking", text: "Her personel için özel link. Müşterileriniz kayıt olmadan kolayca randevu alsın." },
  { icon: Clock, title: "Akıllı takvim", text: "Dolu saatleri otomatik göster, çakışmayı engelle, tek tıkla onayla." },
  { icon: Laptop, title: "Zarif panel", text: "Stripe ve Linear'dan ilham alan temiz, minimal ve güçlü yönetim arayüzü." },
  { icon: Smartphone, title: "Her cihazda", text: "Responsive tasarım ile telefondan, tabletten, bilgisayardan mükemmel deneyim." },
];

const stats = [
  { value: "248+", label: "Aktif işletme" },
  { value: "12K+", label: "Aylık randevu" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "Kullanıcı puanı" },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen px-4 py-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#c9956b]/20 to-transparent blur-3xl" />
        </div>

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Randevora" className="size-11 rounded-xl object-cover shadow-lg" />
            <strong className="text-xl tracking-tight">randevora</strong>
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
              <Sparkles size={16} className="text-[var(--accent)]" />
              Modern randevu yönetimi platformu
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
            <h2 className="text-3xl font-black md:text-5xl">Neden randevora?</h2>
            <p className="mt-4 text-lg text-[var(--muted)]">İşletmenizi büyütecek her özellik tek platformda.</p>
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

      {/* CTA */}
      <section className="border-t border-[var(--line)] px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <h2 className="mt-6 text-3xl font-black md:text-5xl">Hemen başlayın</h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            30 saniyede ücretsiz işletmenizi oluşturun. Kredi kartı gerekmez.
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
      <footer className="border-t border-[var(--line)] px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Randevora" className="size-7 rounded-md object-cover" />
            <span>randevora &copy; 2026 · Randevunuz bizde</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-[var(--foreground)]">Giriş</Link>
            <Link href="/register" className="hover:text-[var(--foreground)]">Kayıt</Link>
            <Link href="/dashboard" className="hover:text-[var(--foreground)]">Panel</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
