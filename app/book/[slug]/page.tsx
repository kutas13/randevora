import Link from "next/link";
import { ArrowLeft, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Badge } from "@/components/ui/badge";
import { demoBusiness } from "@/lib/mock-data";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link href={`/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]">
            <ArrowLeft size={17} />
            Geri
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-emerald-600 text-xs font-black text-white">R</span>
            <span className="text-sm font-bold">randevora</span>
          </Link>
        </nav>

        <section className="animate-fade-in py-8 md:py-12">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <Badge variant="success">
                <Sparkles size={12} />
                randevora.com/book/{slug}
              </Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{demoBusiness.name}</h1>
              <p className="mt-3 flex items-center gap-3 text-[var(--muted)]">
                <span className="flex items-center gap-1"><MapPin size={16} /> {demoBusiness.category} · İstanbul</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-orange-500" fill="currentColor" /> 4.9</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck size={17} />
              Kayıt olmadan güvenli randevu
            </div>
          </div>
        </section>

        <div className="animate-slide-up">
          <BookingFlow />
        </div>
      </div>
    </main>
  );
}
