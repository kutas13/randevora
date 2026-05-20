import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="glass animate-in w-full max-w-md rounded-xl p-7">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 font-black text-white shadow-lg shadow-teal-600/25">R</span>
          <strong>randevora</strong>
        </Link>

        <h1 className="mt-6 text-3xl font-black">Giriş yap</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">İşletme panelinize erişmek için giriş yapın.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form action={loginAction} className="mt-6 grid gap-4">
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
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full text-base">
            Giriş yap <ArrowRight size={18} />
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/register" className="font-semibold text-teal-700 hover:underline dark:text-teal-200">
            Yeni işletme oluştur
          </Link>
          <button className="text-[var(--muted)] hover:text-[var(--foreground)]">
            Şifremi unuttum
          </button>
        </div>
      </section>
    </main>
  );
}
