"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  CalendarOff,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  group: "main" | "manage" | "system";
};

const items: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "employee"], group: "main" },
  { label: "Randevular", href: "/dashboard/appointments", icon: BadgeDollarSign, roles: ["owner", "admin", "employee"], group: "main" },
  { label: "Takvim", href: "/dashboard/calendar", icon: CalendarDays, roles: ["owner", "admin", "employee"], group: "main" },
  { label: "Müşteriler", href: "/dashboard/customers", icon: Building2, roles: ["owner", "admin", "employee"], group: "main" },
  { label: "Çalışanlar", href: "/dashboard/employees", icon: Users, roles: ["owner", "admin"], group: "manage" },
  { label: "Hizmetler", href: "/dashboard/services", icon: Scissors, roles: ["owner", "admin"], group: "manage" },
  { label: "İzin Yönetimi", href: "/dashboard/leaves", icon: CalendarOff, roles: ["owner", "admin"], group: "manage" },
  { label: "Randevu Linki", href: "/dashboard/booking-link", icon: Link2, roles: ["owner", "admin", "employee"], group: "system" },
  { label: "Ayarlar", href: "/dashboard/settings", icon: Settings, roles: ["owner"], group: "system" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Ana",
  manage: "Yönetim",
  system: "Sistem",
};

function NavItems({ active, role, onNavigate }: { active: string; role: UserRole; onNavigate?: () => void }) {
  const visibleItems = items.filter((item) => item.roles.includes(role));
  const groups: NavItem["group"][] = ["main", "manage", "system"];

  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group) => {
        const groupItems = visibleItems.filter((i) => i.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]/70">
              {GROUP_LABELS[group]}
            </span>
            {groupItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.href || (item.href !== "/dashboard" && active.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-all duration-200",
                    "hover:bg-black/[0.04] hover:text-[var(--foreground)] dark:hover:bg-white/[0.06]",
                    isActive &&
                      "bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] hover:from-neutral-900 hover:to-neutral-800 hover:text-white dark:from-white dark:to-neutral-100 dark:text-neutral-950 dark:hover:from-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-white/10 text-white dark:bg-neutral-900/10 dark:text-neutral-900"
                        : "bg-black/[0.03] text-[var(--muted)] group-hover:bg-black/[0.06] group-hover:text-[var(--foreground)] dark:bg-white/[0.04] dark:group-hover:bg-white/[0.08]",
                    )}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-white/80 dark:bg-neutral-900/70" />
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarHeader({ businessName }: { businessName: string }) {
  return (
    <Link href="/" className="group flex items-center gap-3 rounded-2xl border border-transparent px-2 py-2 transition hover:border-[var(--line)] hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
      <span className="relative inline-flex">
        <span className="absolute inset-0 rounded-xl bg-neutral-900/15 blur-md transition group-hover:bg-neutral-900/25 dark:bg-white/10" />
        <img src="/logo.png" alt="Randevora" className="relative size-10 rounded-xl object-cover shadow-md ring-1 ring-black/5 dark:ring-white/10" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-[15px] leading-tight">Randevora</strong>
        <small className="block truncate text-xs text-[var(--muted)]">{businessName}</small>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("owner");
  const [businessName, setBusinessName] = useState("İşletme");
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("role, business_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRole(profile.role as UserRole);
        if (profile.business_id) {
          const { data: business } = await supabase
            .from("businesses")
            .select("name")
            .eq("id", profile.business_id)
            .single();
          if (business) setBusinessName(business.name);
        }
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[var(--line)] bg-[var(--panel)] md:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
        <SidebarHeader businessName={businessName} />
        <div className="mt-6 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:var(--line)_transparent]">
          <NavItems active={pathname} role={role} />
        </div>
        <div className="mt-4 border-t border-[var(--line)] pt-3">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-red-600 transition group-hover:bg-red-100 dark:bg-red-400/10 dark:text-red-400 dark:group-hover:bg-red-400/15">
              <LogOut size={15} strokeWidth={2.2} />
            </span>
            Çıkış yap
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("owner");
  const [businessName, setBusinessName] = useState("İşletme");
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("role, business_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRole(profile.role as UserRole);
        if (profile.business_id) {
          const { data: business } = await supabase
            .from("businesses")
            .select("name")
            .eq("id", profile.business_id)
            .single();
          if (business) setBusinessName(business.name);
        }
      }
    }
    loadUser();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] md:hidden"
        aria-label="Menü"
      >
        <Menu size={20} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="left">
        <div className="flex h-full flex-col px-4 py-5">
          <SidebarHeader businessName={businessName} />
          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            <NavItems active={pathname} role={role} onNavigate={() => setOpen(false)} />
          </div>
          <div className="mt-4 border-t border-[var(--line)] pt-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400">
                <LogOut size={15} strokeWidth={2.2} />
              </span>
              Çıkış yap
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
