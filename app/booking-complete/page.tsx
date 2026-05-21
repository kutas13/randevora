import Link from "next/link";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Sparkles, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; aid?: string; reason?: string }>;

export default async function BookingCompletePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status || "unknown";
  const aid = params.aid;
  const reason = params.reason;

  let appointmentInfo: {
    starts_at: string;
    service: string | null;
    business_slug: string | null;
    business_name: string | null;
  } | null = null;

  if (aid && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data } = await admin
        .from("appointments")
        .select("starts_at, service:services(name), business:businesses(slug, name)")
        .eq("id", aid)
        .single();
      if (data) {
        const svc = Array.isArray(data.service) ? data.service[0] : (data.service as any);
        const biz = Array.isArray(data.business) ? data.business[0] : (data.business as any);
        appointmentInfo = {
          starts_at: data.starts_at,
          service: svc?.name || null,
          business_slug: biz?.slug || null,
          business_name: biz?.name || null,
        };
      }
    } catch {}
  }

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  const dateLong = appointmentInfo
    ? new Date(appointmentInfo.starts_at).toLocaleDateString("tr-TR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const timeShort = appointmentInfo
    ? new Date(appointmentInfo.starts_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(176,124,79,0.15),transparent_60%)]" />

      <div className="relative mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={14} />
          Ana sayfaya dön
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl shadow-black/5 backdrop-blur">
          {/* Üst şerit */}
          {isSuccess && (
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
          )}
          {isFailed && <div className="h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500" />}
          {!isSuccess && !isFailed && (
            <div className="h-1.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500" />
          )}

          <div className="p-8 text-center md:p-10">
            {isSuccess ? (
              <>
                <div className="relative mx-auto flex size-20 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/15" />
                  <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                  </div>
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">
                  Randevunuz onaylandı
                </h1>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Ödemeniz alındı, randevunuz kayıt altına alındı.
                </p>

                {appointmentInfo && (
                  <div className="mt-6 grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] p-5 text-left">
                    {appointmentInfo.business_name && (
                      <Row label="İşletme" value={appointmentInfo.business_name} />
                    )}
                    {appointmentInfo.service && (
                      <Row label="Hizmet" value={appointmentInfo.service} />
                    )}
                    <Row label="Tarih" value={dateLong} />
                    <Row label="Saat" value={timeShort} />
                  </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50 p-3 text-[12px] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <Sparkles size={14} />
                  Onay bilgileri WhatsApp / SMS / e-posta üzerinden iletilecektir.
                </div>
              </>
            ) : isFailed ? (
              <>
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-rose-500/30">
                  <X size={40} strokeWidth={2.5} />
                </div>
                <h1 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">Ödeme tamamlanamadı</h1>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Kapora ödemesi başarısız oldu. Tekrar denemek için randevu sayfasına dönebilirsiniz.
                </p>
                {reason && (
                  <p className="mt-3 inline-block rounded-lg border border-red-200/50 bg-red-50 px-3 py-1.5 text-[12px] text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                    Sebep: {reason}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                  <AlertCircle size={40} strokeWidth={2.5} />
                </div>
                <h1 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">Durum belirsiz</h1>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {reason ? `Sebep: ${reason}` : "Ödeme durumu doğrulanamadı."}
                </p>
              </>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {appointmentInfo?.business_slug ? (
                <Link
                  href={`/book/${appointmentInfo.business_slug}`}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#b07c4f] to-[#d4956a] px-6 text-sm font-semibold text-white shadow-lg shadow-[#b07c4f]/25 transition hover:opacity-90"
                >
                  <Calendar size={16} />
                  Yeni randevu al
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#b07c4f] to-[#d4956a] px-6 text-sm font-semibold text-white shadow-lg shadow-[#b07c4f]/25 transition hover:opacity-90"
                >
                  Anasayfa
                </Link>
              )}
              <Link
                href="/iletisim"
                className="inline-flex h-12 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
              >
                Destek
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-[var(--muted)]">
          Sorun yaşıyorsanız <a href="mailto:iletisim@randevora.com.tr" className="underline">iletisim@randevora.com.tr</a>
          {" "}veya <a href="tel:+905456036547" className="underline">0545 603 65 47</a>
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-2 last:border-b-0 last:pb-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}
