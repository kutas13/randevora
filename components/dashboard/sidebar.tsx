"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Scissors,
  Settings,
  Shield,
  Users,
  WalletCards,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { demoBusiness } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Randevular", href: "/dashboard/appointments", icon: BadgeDollarSign },
  { label: "Takvim", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Çalışanlar", href: "/dashboard/employees", icon: Users },
  { label: "Hizmetler", href: "/dashboard/services", icon: Scissors },
  { label: "Müşteriler", href: "/dashboard/customers", icon: Building2 },
  { label: "Ayarlar", href: "/dashboard/settings", icon: Settings },
  { label: "Ödeme Planı", href: "/dashboard/billing", icon: WalletCards },
  { label: "Super Admin", href: "/super-admin", icon: Shield },
];

function NavItems({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.href || (item.href !== "/dashboard" && active.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-all duration-200 hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/10",
              isActive && "bg-neutral-950 text-white shadow-sm hover:bg-neutral-950 hover:text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-white",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 text-sm font-black text-white shadow-lg shadow-teal-600/25">R</span>
      <span>
        <strong className="block text-base">randevora</strong>
        <small className="text-[var(--muted)]">{demoBusiness.name}</small>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-[var(--line)] bg-[var(--panel)] px-4 py-5 backdrop-blur xl:block">
      <SidebarHeader />
      <div className="mt-8">
        <NavItems active={pathname} />
      </div>
      <div className="mt-auto pt-8">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
          <p className="text-xs font-semibold text-[var(--muted)]">Mevcut plan</p>
          <p className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-200">Pro Plan</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500" />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">154 / ∞ randevu</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] xl:hidden"
        aria-label="Menü"
      >
        <Menu size={20} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="left">
        <div className="px-4 py-5">
          <SidebarHeader />
          <div className="mt-8">
            <NavItems active={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </Sheet>
    </>
  );
}
