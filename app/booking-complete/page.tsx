import Link from "next/link";
import { Check, X, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; aid?: string; reason?: string }>;

export default async function BookingCompletePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status || "unknown";
  const aid = params.aid;
  const reason = params.reason;

  let appointmentInfo: { starts_at: string; service: string | null; business_slug: string | null } | null = null;

  if (aid && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      const { data } = await admin
        .from("appointments")
        .select("starts_at, service:services(name), business:businesses(slug)")
        .eq("id", aid)
        .single();
      if (data) {
        appointmentInfo = {
          starts_at: data.starts_at,
          service: Array.isArray(data.service) ? data.service[0]?.name : (data.service as any)?.name || null,
          business_slug: Array.isArray(data.business) ? data.business[0]?.slug : (data.business as any)?.slug || null,
        };
      }
    } catch {}
  }

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[var(--panel)] to-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="glass rounded-2xl p-8">
          {isSuccess ? (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-400/15">
                <Check size={32} className="text-green-600" />
              </div>
              <h1 className="mt-5 text-2xl font-black">Ödeme alındı, randevunuz onaylandı!</h1>
              {appointmentInfo && (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {appointmentInfo.service && <span>{appointmentInfo.service} · </span>}
                  {new Date(appointmentInfo.starts_at).toLocaleString("tr-TR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              )}
              <p className="mt-4 text-sm text-[var(--muted)]">
                Randevu bilgileri telefonunuza SMS olarak gönderilecek (eğer SMS servisi aktifse).
              </p>
            </>
          ) : isFailed ? (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-400/15">
                <X size={32} className="text-red-600" />
              </div>
              <h1 className="mt-5 text-2xl font-black">Ödeme başarısız</h1>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Kapora ödemesi tamamlanamadı. Tekrar denemek için randevu sayfasına dönebilirsiniz.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-400/15">
                <AlertCircle size={32} className="text-orange-600" />
              </div>
              <h1 className="mt-5 text-2xl font-black">Durum belirsiz</h1>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {reason ? `Sebep: ${reason}` : "Ödeme durumu doğrulanamadı."}
              </p>
            </>
          )}

          <div className="mt-6">
            {appointmentInfo?.business_slug ? (
              <Link
                href={`/book/${appointmentInfo.business_slug}`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-[#b07c4f] to-[#d4956a] px-6 font-semibold text-white shadow-sm"
              >
                Ana sayfaya dön
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-[#b07c4f] to-[#d4956a] px-6 font-semibold text-white shadow-sm"
              >
                Anasayfa
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
