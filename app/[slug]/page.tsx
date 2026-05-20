import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, MapPin, Phone, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoBusiness, employees, services } from "@/lib/mock-data";
import { formatMoney, initials } from "@/lib/utils";

export default async function BusinessSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Randevora" className="size-10 rounded-lg object-cover shadow-lg" />
            <strong>Randevora</strong>
          </Link>
          <Link href={`/book/${slug}`}>
            <Button>
              Randevu al
              <ArrowRight size={17} />
            </Button>
          </Link>
        </nav>

        <section className="animate-fade-in grid gap-8 py-14 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <Badge variant="success">
              <MapPin size={12} />
              {slug} · Aktif
            </Badge>
            <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">{demoBusiness.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Hizmet seçin, uygun saati görün ve kayıt olmadan randevunuzu oluşturun. Hızlı, güvenli ve modern.
            </p>

            <div className="mt-6 flex items-center gap-4 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-orange-500" fill="currentColor" /> 4.9
              </span>
              <span className="flex items-center gap-1"><Users size={14} /> {employees.length} uzman</span>
              <span className="flex items-center gap-1"><Phone size={14} /> İletişime geç</span>
            </div>

            <Link href={`/book/${slug}`} className="mt-8 inline-flex">
              <Button className="h-12 px-6 text-base shadow-lg shadow-neutral-950/20">
                Online randevu al
                <CalendarCheck size={20} />
              </Button>
            </Link>
          </div>

          <section className="glass rounded-xl p-5">
            <h2 className="text-xl font-bold">Hizmetlerimiz</h2>
            <div className="mt-5 grid gap-2.5">
              {services.filter((s) => s.active).map((service) => (
                <div key={service.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3.5 transition-all duration-200 hover:border-[var(--accent)] hover:shadow-sm">
                  <span className="flex items-center gap-3">
                    <span className="size-3 rounded-full" style={{ background: service.color }} />
                    <span>
                      <strong className="block">{service.name}</strong>
                      <small className="flex items-center gap-1 text-[var(--muted)]"><Clock size={13} /> {service.duration} dk</small>
                    </span>
                  </span>
                  <strong className="text-lg">{formatMoney(service.price)}</strong>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[var(--muted)]">Ekibimiz</h3>
              <div className="mt-3 flex gap-2">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2">
                    <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                      {initials(emp.name)}
                    </span>
                    <span className="text-xs font-semibold">{emp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
