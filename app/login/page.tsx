"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const [loading, setLoading] = useState(false);

  // Şifremi unuttum state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail || !newPassword) {
      setError("E-posta ve yeni şifre girin.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }

    setForgotLoading(true);
    setError("");

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Şifre değiştirilemedi.");
      setForgotLoading(false);
      return;
    }

    setForgotSuccess(true);
    setForgotLoading(false);
  }

  if (forgotMode) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <section className="glass animate-in w-full max-w-md rounded-xl p-7">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Randevora" className="size-10 rounded-lg object-cover shadow-lg" />
            <strong>Randevora</strong>
          </Link>

          <h1 className="mt-6 text-3xl font-black">Şifre sıfırla</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">E-posta adresinizi ve yeni şifrenizi girin.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
              {error}
            </div>
          )}

          {forgotSuccess ? (
            <div className="mt-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
                Şifreniz başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz.
              </div>
              <Button className="mt-4 w-full" onClick={() => { setForgotMode(false); setForgotSuccess(false); setError(""); }}>
                Giriş sayfasına dön
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-semibold">E-posta</label>
                <input
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
                  type="email"
                  placeholder="ornek@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Yeni şifre</label>
                <div className="relative mt-1">
                  <input
                    className="h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 pr-11 outline-none"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Yeni şifreniz"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-11 w-full text-base" disabled={forgotLoading}>
                {forgotLoading ? "İşleniyor..." : "Şifreyi değiştir"}
              </Button>
              <button type="button" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" onClick={() => { setForgotMode(false); setError(""); }}>
                ← Giriş sayfasına dön
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="glass animate-in w-full max-w-md rounded-xl p-7">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Randevora" className="size-10 rounded-lg object-cover shadow-lg" />
          <strong>Randevora</strong>
        </Link>

        <h1 className="mt-6 text-3xl font-black">Giriş yap</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">İşletme panelinize erişmek için giriş yapın.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold">E-posta</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Şifre</label>
            <div className="relative mt-1">
              <input
                className="h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 pr-11 outline-none"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="size-4 accent-[var(--accent)]"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" className="text-sm text-[var(--muted)] cursor-pointer">Beni hatırla</label>
          </div>

          <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : <>Giriş yap <ArrowRight size={18} /></>}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">
            Yeni işletme oluştur
          </Link>
          <button className="text-[var(--muted)] hover:text-[var(--foreground)]" onClick={() => { setForgotMode(true); setError(""); }}>
            Şifremi unuttum
          </button>
        </div>
      </section>
    </main>
  );
}
