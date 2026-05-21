import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Randevora" className="size-8 rounded-lg object-cover" />
            <strong className="text-base tracking-tight">Randevora</strong>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={14} />
            Ana sayfa
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        <article className="prose-legal">{children}</article>
      </main>
      <footer className="border-t border-[var(--line)] px-4 py-8 text-center text-xs text-[var(--muted)]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/legal/mesafeli-satis" className="hover:text-[var(--foreground)]">Mesafeli Satış Sözleşmesi</Link>
          <span>·</span>
          <Link href="/legal/uyelik-sozlesmesi" className="hover:text-[var(--foreground)]">Üyelik Sözleşmesi</Link>
          <span>·</span>
          <Link href="/legal/gizlilik" className="hover:text-[var(--foreground)]">Gizlilik Politikası</Link>
          <span>·</span>
          <Link href="/legal/iade-iptal" className="hover:text-[var(--foreground)]">Teslimat ve İade</Link>
          <span>·</span>
          <Link href="/legal/kvkk" className="hover:text-[var(--foreground)]">KVKK</Link>
          <span>·</span>
          <Link href="/legal/cerez-politikasi" className="hover:text-[var(--foreground)]">Çerez Politikası</Link>
          <span>·</span>
          <Link href="/iletisim" className="hover:text-[var(--foreground)]">İletişim</Link>
        </div>
        <p className="mt-3">© 2026 Randevora · Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</p>
      </footer>
    </div>
  );
}
