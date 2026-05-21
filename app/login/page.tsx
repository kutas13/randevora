"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarCheck, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const REMEMBER_KEY = "randevora.remember";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Yükleniyor...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-[var(--accent-3)] to-[#3a2a1c]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.10),transparent_45%)]" />
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-black/20 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between p-10 text-white">
        <Link href="/" className="inline-flex items-center gap-3">
          <img src="/logo.png" alt="Randevora" className="size-11 rounded-xl object-cover shadow-xl" />
          <span className="text-xl font-black tracking-tight">Randevora</span>
        </Link>

        <div>
          <h2 className="text-4xl font-black leading-[1.1] tracking-tight xl:text-5xl">
            Randevu yönetiminin{" "}
            <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
              en zarif yolu
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base text-white/85">
            Ultra hızlı sayfalar, akıllı takvim, otomatik hatırlatmalar. Tek panelden tüm
            ekibinizi yönetin.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              { icon: CalendarCheck, text: "Sınırsız randevu" },
              { icon: ShieldCheck, text: "KVKK uyumlu güvenli altyapı" },
              { icon: Sparkles, text: "10 gün ücretsiz deneme" },
            ].map(({ icon: Icon, text }) => (
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
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.email) setEmail(data.email);
        if (data?.password) setPassword(data.password);
        setRememberMe(true);
      }
    } catch {}
  }, []);

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

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });

      if (err) {
        setError(err.message || "Giriş başarısız.");
        setLoading(false);
        return;
      }

      if (!data?.session) {
        setError("Oturum oluşturulamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {}

      window.location.assign("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Beklenmedik bir hata oluştu.");
      setLoading(false);
    }
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

  const FormCard = ({ children }: { children: React.ReactNode }) => (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 lg:hidden">
          <img src="/logo.png" alt="Randevora" className="size-10 rounded-xl object-cover shadow-lg" />
          <strong className="text-lg tracking-tight">Randevora</strong>
        </Link>
        {children}
      </div>
    </div>
  );

  if (forgotMode) {
    return (
      <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <BrandPanel />
        <FormCard>
          <h1 className="mt-8 text-3xl font-black tracking-tight md:text-4xl lg:mt-0">Şifre sıfırla</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">E-posta adresinizi ve yeni şifrenizi girin.</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
              {error}
            </div>
          )}

          {forgotSuccess ? (
            <div className="mt-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                Şifreniz başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz.
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  setForgotMode(false);
                  setForgotSuccess(false);
                  setError("");
                }}
              >
                Giriş sayfasına dön
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="mt-6 grid gap-4">
              <Field label="E-posta">
                <input
                  className="auth-input"
                  type="email"
                  placeholder="ornek@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Yeni şifre">
                <div className="relative">
                  <input
                    className="auth-input pr-11"
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
              </Field>
              <Button type="submit" className="h-12 w-full text-base" disabled={forgotLoading}>
                {forgotLoading ? "İşleniyor..." : "Şifreyi değiştir"}
              </Button>
              <button
                type="button"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => {
                  setForgotMode(false);
                  setError("");
                }}
              >
                ← Giriş sayfasına dön
              </button>
            </form>
          )}
        </FormCard>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <BrandPanel />
      <FormCard>
        <div className="mt-8 lg:mt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Hoş geldin
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Giriş yap</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            İşletme panelinize erişmek için bilgilerinizi girin.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 grid gap-4">
          <Field label="E-posta">
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Şifre">
            <div className="relative">
              <input
                className="auth-input pr-11"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
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
          </Field>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2" htmlFor="remember">
              <input
                type="checkbox"
                id="remember"
                className="size-4 accent-[var(--accent)]"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-[var(--muted)]">Beni hatırla</span>
            </label>
            <button
              type="button"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              onClick={() => {
                setForgotMode(true);
                setError("");
              }}
            >
              Şifremi unuttum
            </button>
          </div>

          <Button type="submit" className="h-12 w-full text-base shadow-lg shadow-[var(--accent)]/15" disabled={loading}>
            {loading ? (
              "Giriş yapılıyor..."
            ) : (
              <>
                Giriş yap <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 border-t border-[var(--line)] pt-6 text-center text-sm text-[var(--muted)]">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">
            Ücretsiz işletme oluştur
          </Link>
        </div>
      </FormCard>
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
