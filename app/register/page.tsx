import Link from "next/link";
import { ArrowRight, Gift, Rocket, ShieldCheck, Zap } from "lucide-react";
import { registerAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Gift, text: "10 gün ücretsiz deneme" },
  { icon: Zap, text: "Sınırsız randevu" },
  { icon: Rocket, text: "Her personele özel link" },
  { icon: ShieldCheck, text: "Tek tıkla iptal" },
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
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Sol marka paneli */}
      <aside className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-[var(--accent-3)] to-[#2a1c12]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-[28rem] rounded-full bg-black/25 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="Randevora" className="size-11 rounded-xl object-cover shadow-xl" />
            <span className="text-xl font-black tracking-tight">Randevora</span>
          </Link>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
              <Gift size={12} />
              10 gün ücretsiz
            </span>
            <h2 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight xl:text-5xl">
              İşletmenizi 30 saniyede{" "}
              <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                dijitalleştirin
              </span>
            </h2>
            <p className="mt-4 max-w-md text-base text-white/85">
              Müşterilerinize profesyonel bir online randevu deneyimi sunun. Tek tıkla kayıt
              olun, dakikalar içinde randevu almaya başlayın.
            </p>

            <div className="mt-8 grid gap-3">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/90">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon size={16} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/60">© 2026 Randevora · Meridyen Yazılım Teknoloji Ltd. Şti.</p>
        </div>
      </aside>

      {/* Sağ form */}
      <div className="flex w-full items-start justify-center overflow-y-auto p-6 md:p-10">
        <div className="w-full max-w-md py-6">
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="Randevora" className="size-10 rounded-xl object-cover shadow-lg" />
            <strong className="text-lg tracking-tight">Randevora</strong>
          </Link>

          <div className="mt-8 lg:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Ücretsiz başla
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">İşletme oluştur</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Kayıt sonrası super admin onayı ile aktif olacaksınız.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Mobil benefits şeridi */}
          <div className="mt-5 grid grid-cols-2 gap-2 lg:hidden">
            {benefits.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-2 text-[12px]"
              >
                <Icon size={14} className="shrink-0 text-[var(--accent)]" />
                <span className="text-[var(--muted)]">{text}</span>
              </div>
            ))}
          </div>

          <form action={registerAction} className="mt-6 grid gap-4">
            <Field label="İsim Soyisim">
              <input name="fullName" className="auth-input" placeholder="Adınız ve soyadınız" required />
            </Field>
            <Field label="İşletme adı">
              <input name="businessName" className="auth-input" placeholder="Örn: Nova Studio" required />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori">
                <select name="category" className="auth-input">
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Slug (URL)">
                <div className="flex h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--panel-strong)]">
                  <span className="pl-3 text-[12px] font-medium text-[var(--muted)]">randevora.com/</span>
                  <input
                    name="slug"
                    className="h-full flex-1 bg-transparent px-1 text-[15px] outline-none"
                    placeholder="nova-studio"
                    required
                  />
                </div>
              </Field>
            </div>

            <Field label="E-posta">
              <input name="email" className="auth-input" type="email" placeholder="ornek@email.com" required />
            </Field>

            <Field label="Şifre">
              <input
                name="password"
                className="auth-input"
                type="password"
                placeholder="En az 6 karakter"
                required
                minLength={6}
              />
            </Field>

            <Button type="submit" className="mt-2 h-12 w-full text-base shadow-lg shadow-[var(--accent)]/15">
              Başvuru gönder <ArrowRight size={18} />
            </Button>

            <p className="text-center text-[11px] leading-5 text-[var(--muted)]">
              Kayıt olarak{" "}
              <Link href="/legal/uyelik-sozlesmesi" className="underline hover:text-[var(--foreground)]">
                Üyelik Sözleşmesi
              </Link>
              {", "}
              <Link href="/legal/gizlilik" className="underline hover:text-[var(--foreground)]">
                Gizlilik Politikası
              </Link>{" "}
              ve{" "}
              <Link href="/legal/kvkk" className="underline hover:text-[var(--foreground)]">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okuyup kabul etmiş sayılırsınız.
            </p>
          </form>

          <div className="mt-6 border-t border-[var(--line)] pt-5 text-center text-sm text-[var(--muted)]">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-[var(--foreground)]">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
