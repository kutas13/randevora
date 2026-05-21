import Link from "next/link";
import { ArrowLeft, FileText, Lock, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";

const legalLinks: Array<{ href: string; label: string }> = [
  { href: "/legal/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/legal/uyelik-sozlesmesi", label: "Üyelik Sözleşmesi" },
  { href: "/legal/gizlilik", label: "Gizlilik Politikası" },
  { href: "/legal/iade-iptal", label: "Teslimat ve İade" },
  { href: "/legal/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/legal/cerez-politikasi", label: "Çerez Politikası" },
];

const aboutLinks: Array<{ href: string; label: string }> = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Randevora" className="size-9 rounded-xl object-cover shadow-md" />
            <div className="leading-tight">
              <strong className="text-base tracking-tight">Randevora</strong>
              <span className="ml-2 inline-block rounded-md border border-[var(--line)] bg-[var(--panel)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Yasal
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/iletisim"
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
            >
              İletişim
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            >
              <ArrowLeft size={14} />
              Ana sayfa
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* Yan menü - masaüstü */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Yasal Belgeler
              </p>
              <nav className="grid gap-1">
                {legalLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--foreground)]"
                  >
                    <FileText size={14} className="opacity-60 group-hover:opacity-100" />
                    {l.label}
                  </Link>
                ))}
              </nav>
              <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Şirket
              </p>
              <nav className="grid gap-1">
                {aboutLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--foreground)]"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
                <p className="mt-3 text-xs font-bold text-[var(--foreground)]">KVKK & GDPR uyumlu</p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
                  Tüm verileriniz SSL/TLS şifreleme ile korunur. Ödeme PCI-DSS uyumlu iyzico üzerinden alınır.
                </p>
              </div>
            </div>
          </aside>

          {/* İçerik */}
          <article className="legal-content min-w-0">{children}</article>
        </div>
      </main>

      <footer className="mt-10 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Randevora" className="size-8 rounded-lg object-cover" />
                <strong className="text-base tracking-tight">Randevora</strong>
              </Link>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                İşletmeniz için online randevu, müşteri ve ödeme yönetimi tek panelde.
              </p>
              <div className="mt-4 grid gap-2 text-xs">
                <a
                  href="tel:+905456036547"
                  className="inline-flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  <Phone size={12} className="text-[var(--accent)]" /> 0545 603 65 47
                </a>
                <a
                  href="mailto:iletisim@randevora.com.tr"
                  className="inline-flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  <Mail size={12} className="text-[var(--accent)]" /> iletisim@randevora.com.tr
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Yasal</h4>
              <ul className="mt-3 grid gap-2 text-xs">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Şirket</h4>
              <ul className="mt-3 grid gap-2 text-xs">
                {aboutLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/register" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                    Ücretsiz başla
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Güven</h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">
                  <Lock size={10} /> SSL
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">
                  <ShieldCheck size={10} /> KVKK
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">
                  <Sparkles size={10} /> 3D Secure
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--line)] bg-white px-2.5 shadow-sm">
                  <span className="text-[11px] font-bold tracking-tight text-[#1E64FF]">iyzico</span>
                </span>
                <span className="inline-flex h-8 items-center rounded-md border border-[var(--line)] bg-white px-2.5 shadow-sm">
                  <span className="font-black italic tracking-tight text-[#1A1F71]" style={{ fontSize: 12 }}>
                    VISA
                  </span>
                </span>
                <span className="inline-flex h-8 items-center rounded-md border border-[var(--line)] bg-white px-2 shadow-sm">
                  <span className="block size-4 rounded-full bg-[#EB001B]" />
                  <span className="-ml-1.5 block size-4 rounded-full bg-[#F79E1B] mix-blend-multiply" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--line)] pt-6 text-center text-[11px] text-[var(--muted)]">
            © 2026 Meridyen Yazılım Teknoloji Ticaret Ltd. Şti. · Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
