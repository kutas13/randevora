import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { registerAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

const benefits = [
  "30 saniyede kurulum",
  "Sınırsız randevu",
  "Her personele özel link",
  "Onay sonrası hemen aktif",
];

const categories = [
  { value: "berber", label: "Berber" },
  { value: "kuafor", label: "Kuaför" },
  { value: "nail_studio", label: "Nail Studio" },
  { value: "guzellik_merkezi", label: "Güzellik Merkezi" },
  { value: "danismanlik", label: "Danışmanlık" },
  { value: "freelancer", label: "Freelancer" },
  { value: "ozel_ders", label: "Özel Ders" },
  { value: "dovmeci", label: "Dövmeci" },
  { value: "small_business", label: "Küçük İşletme" },
];

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="hidden lg:block">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Randevora" className="size-10 rounded-lg object-cover shadow-lg" />
            <strong>Randevora</strong>
          </Link>
          <h2 className="mt-8 text-3xl font-black">İşletmenizi dijitalleştirin</h2>
          <p className="mt-3 text-[var(--muted)]">Modern randevu sistemiyle müşterilerinize profesyonel bir deneyim sunun.</p>
          <div className="mt-8 grid gap-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className="text-teal-600" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="glass animate-in rounded-xl p-7">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25 lg:hidden">
            <Building2 size={22} />
          </div>
          <h1 className="mt-5 text-3xl font-black lg:mt-0">İşletme oluştur</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Kayıt sonrası super admin onayı ile aktif olacaksınız.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
              {error}
            </div>
          )}

          <form action={registerAction} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-semibold">İşletme adı</label>
              <input
                name="businessName"
                className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                placeholder="Örn: Nova Studio"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Kategori</label>
              <select
                name="category"
                className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Slug (URL)</label>
              <div className="mt-1 flex h-11 items-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)]">
                <span className="pl-3 text-sm text-[var(--muted)]">Randevora.com/</span>
                <input
                  name="slug"
                  className="h-full flex-1 bg-transparent px-1 outline-none"
                  placeholder="nova-studio"
                  required
                  pattern="^[a-z0-9-]+$"
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">Sadece küçük harf, rakam ve tire kullanın.</p>
            </div>
            <div>
              <label className="text-sm font-semibold">E-posta</label>
              <input
                name="email"
                className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                type="email"
                placeholder="ornek@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Şifre</label>
              <input
                name="password"
                className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                type="password"
                placeholder="En az 6 karakter"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="h-11 w-full text-base">
              Başvuru gönder <ArrowRight size={18} />
            </Button>
            <p className="text-center text-xs text-[var(--muted)]">
              Başvurunuz super admin onayı sonrası aktif olacaktır.
            </p>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:underline dark:text-teal-200">
              Giriş yap
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
