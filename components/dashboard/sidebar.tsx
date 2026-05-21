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
};

const items: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "employee"] },
  { label: "Randevular", href: "/dashboard/appointments", icon: BadgeDollarSign, roles: ["owner", "admin", "employee"] },
  { label: "Takvim", href: "/dashboard/calendar", icon: CalendarDays, roles: ["owner", "admin", "employee"] },
  { label: "Çalışanlar", href: "/dashboard/employees", icon: Users, roles: ["owner", "admin"] },
  { label: "Hizmetler", href: "/dashboard/services", icon: Scissors, roles: ["owner", "admin"] },
  { label: "Müşteriler", href: "/dashboard/customers", icon: Building2, roles: ["owner", "admin", "employee"] },
  { label: "İzin Yönetimi", href: "/dashboard/leaves", icon: CalendarOff, roles: ["owner", "admin"] },
  { label: "Randevu Linki", href: "/dashboard/booking-link", icon: Link2, roles: ["owner", "admin", "employee"] },
  { label: "Ayarlar", href: "/dashboard/settings", icon: Settings, roles: ["owner"] },
];

function NavItems({ active, role, onNavigate }: { active: string; role: UserRole; onNavigate?: () => void }) {
  const visibleItems = items.filter((item) => item.roles.includes(role));

  return (
    <nav className="grid gap-1">
      {visibleItems.map((item) => {
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

function SidebarHeader({ businessName }: { businessName: string }) {
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <img src="/logo.png" alt="Randevora" className="size-10 rounded-lg object-cover shadow-lg" />
      <span>
        <strong className="block text-base">Randevora</strong>
        <small className="text-[var(--muted)]">{businessName}</small>
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
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[var(--line)] bg-[var(--panel)] px-4 py-5 backdrop-blur md:block">
      <SidebarHeader businessName={businessName} />
      <div className="mt-8">
        <NavItems active={pathname} role={role} />
      </div>
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-400/10"
        >
          <LogOut size={18} />
          Çıkış yap
        </button>
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
        <div className="px-4 py-5">
          <SidebarHeader businessName={businessName} />
          <div className="mt-8">
            <NavItems active={pathname} role={role} onNavigate={() => setOpen(false)} />
          </div>
          <div className="mt-8 border-t border-[var(--line)] pt-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-400/10"
            >
              <LogOut size={18} />
              Çıkış yap
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
