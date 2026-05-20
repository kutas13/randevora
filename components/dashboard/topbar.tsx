"use client";

import Link from "next/link";
import { Moon, Plus, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenuButton } from "@/components/dashboard/sidebar";
import { useTheme } from "@/components/providers/theme-provider";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/82 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <div>
            <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
            <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <label className="hidden h-10 min-w-72 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm text-[var(--muted)] transition-all focus-within:border-[var(--accent)] focus-within:shadow-sm md:flex">
            <Search size={17} />
            <input className="w-full bg-transparent outline-none" placeholder="Müşteri, randevu veya hizmet ara..." />
          </label>
          <Button
            variant="secondary"
            className="size-10 px-0"
            aria-label="Tema değiştir"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Link href="/dashboard/appointments">
            <Button className="shrink-0">
              <Plus size={18} />
              <span className="hidden sm:inline">Randevu</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
