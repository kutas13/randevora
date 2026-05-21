"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

export default function SaLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Giris basarisiz");
        setLoading(false);
        return;
      }
      window.location.href = "/super-admin";
    } catch (err) {
      setError("Ag hatasi");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[var(--panel)] to-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#b07c4f] to-[#d4956a] shadow-lg">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-black">Super Admin Acil Giris</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Supabase login calismadiginda kullanilan yedek giris.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm backdrop-blur"
        >
          <div>
            <label className="text-sm font-semibold">Acil Giris Anahtari</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="SUPER_ADMIN_KEY env var'inda yazan deger"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="h-11 rounded-lg bg-gradient-to-r from-[#b07c4f] to-[#d4956a] font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Giris yapiliyor..." : "Super Admin olarak gir"}
          </button>

          <p className="text-center text-xs text-[var(--muted)]">
            Bu sayfa sadece Supabase Auth bozuldugunda kullanilir.
            <br />
            SUPER_ADMIN_KEY env var'ini Vercel'de tanimlamalisin.
          </p>
        </form>
      </div>
    </main>
  );
}
