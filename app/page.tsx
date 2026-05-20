import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarCheck, CheckCircle2, Globe, Laptop, Rocket, ShieldCheck, Smartphone, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const segments = ["Berber", "Kuaför", "Nail studio", "Güzellik merkezi", "Danışman", "Freelancer", "Özel ders", "Dövmeci", "Küçük işletme"];

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Zap, title: "Ultra hızlı", text: "Mobile-first App Router, streaming hazır sayfalar ve temiz component sistemi ile anında yükleme." },
  { icon: ShieldCheck, title: "SaaS güvenliği", text: "Business tenant, rol bazlı erişim ve PostgreSQL RLS politikaları ile veri izolasyonu." },
  { icon: CheckCircle2, title: "Future-ready", text: "WhatsApp, ödeme, kapora, kupon, QR check-in ve sadakat modülleri için genişletilebilir yapı." },
  { icon: Globe, title: "Public booking", text: "Her işletme için unique URL ile müşterileriniz kayıt olmadan randevu oluşturabilir." },
  { icon: Laptop, title: "Modern dashboard", text: "Stripe ve Linear'dan ilham alan temiz, minimal ve güçlü yönetim paneli." },
  { icon: Smartphone, title: "Mobile-first", text: "Responsive tasarım ile her cihazdan mükemmel deneyim." },
];

const stats = [
  { value: "248+", label: "Aktif işletme" },
  { value: "12K+", label: "Randevu / ay" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "Kullanıcı puanı" },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="min-h-screen px-4 py-5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 font-black text-white shadow-lg shadow-teal-600/25">R</span>
            <strong className="text-lg">randevora</strong>
          </Link>
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block" href="/login">
              Giriş
            </Link>
            <Link href="/register">
              <Button variant="secondary" className="hidden sm:inline-flex">
                İşletme oluştur
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>
                Paneli aç
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-10 pb-10 pt-20 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--muted)]">
              <Sparkles size={16} className="text-teal-600" />
              WhatsApp ve Excel yerine modern randevu altyapısı
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">randevora</span>
            </h1>
            <p className="mt-2 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Her işletme için modern online randevu sistemi
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Berberden danışmana, nail studiodan özel ders öğretmenine kadar herkes için ultra hızlı, güvenli ve ölçeklenebilir SaaS randevu platformu.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book/nova-studio">
                <Button className="h-12 w-full px-6 text-base shadow-lg shadow-neutral-950/20 sm:w-auto">
                  Public booking dene
                  <CalendarCheck size={20} />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" className="h-12 w-full px-6 text-base sm:w-auto">
                  Ücretsiz başla
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {segments.map((segment) => (
                <span key={segment} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]">
                  {segment}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-slide-up">
            <div className="glass rounded-xl p-4 shadow-2xl shadow-black/10">
              <div className="rounded-lg bg-[var(--panel-strong)] p-5">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div>
                    <p className="text-sm text-[var(--muted)]">Bugün</p>
                    <strong className="text-3xl">16 randevu</strong>
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700 dark:bg-teal-400/15 dark:text-teal-200">Canlı</span>
                </div>
                <div className="mt-4 grid gap-2.5">
                  {[
                    { time: "09:30", name: "Ayşe", service: "Saç Kesimi", color: "#0f766e" },
                    { time: "10:30", name: "Can", service: "Sakal", color: "#f97316" },
                    { time: "13:00", name: "Selin", service: "Nail Art", color: "#7c3aed" },
                  ].map((item) => (
                    <div key={item.time} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-3 transition-all duration-200 hover:border-[var(--accent)]">
                      <span className="flex items-center gap-3">
                        <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm font-semibold">{item.time} {item.name} · {item.service}</span>
                      </span>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {[
                    ["30", "Free limit"],
                    ["∞", "Pro plan"],
                    ["RLS", "Tenant"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-lg bg-neutral-100 p-3 dark:bg-white/10">
                      <strong className="block text-xl">{value}</strong>
                      <span className="text-xs text-[var(--muted)]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <strong className="block text-3xl font-black md:text-4xl">{stat.value}</strong>
                <span className="mt-1 text-sm text-[var(--muted)]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-black md:text-4xl">Neden randevora?</h2>
            <p className="mt-3 text-[var(--muted)]">İşletmenizi büyütecek her özellik tek platformda.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <article key={title} className="glass rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-600/5">
                <div className="flex size-11 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-200">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-400/15 dark:text-orange-200">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <h2 className="mt-5 text-3xl font-black md:text-4xl">Hemen başlayın</h2>
          <p className="mt-3 text-lg text-[var(--muted)]">
            30 saniyede ücretsiz işletmenizi oluşturun. Kredi kartı gerekmez.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button className="h-12 px-8 text-base shadow-lg shadow-neutral-950/20">
                <Rocket size={20} />
                Ücretsiz başla
              </Button>
            </Link>
            <Link href="/book/nova-studio">
              <Button variant="secondary" className="h-12 px-8 text-base">
                Demo booking sayfası
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-emerald-600 text-xs font-black text-white">R</span>
            <span>randevora &copy; 2026</span>
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
