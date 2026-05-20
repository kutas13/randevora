"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Link2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type Employee = { id: string; full_name: string; title: string | null };

export default function BookingLinkPage() {
  const [businessSlug, setBusinessSlug] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentEmployeeId, setCurrentEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profile } = await supabase.from("users").select("business_id, role").eq("id", user.id).single();
      if (!profile?.business_id) return;
      setRole(profile.role);

      const { data: biz } = await supabase.from("businesses").select("slug, name").eq("id", profile.business_id).single();
      if (biz) { setBusinessSlug(biz.slug); setBusinessName(biz.name); }

      const { data: emps } = await supabase.from("employees").select("id, full_name, title, user_id").eq("business_id", profile.business_id).eq("active", true);
      if (emps) {
        setEmployees(emps);
        const myEmp = emps.find((e: any) => e.user_id === user.id);
        if (myEmp) setCurrentEmployeeId(myEmp.id);
      }
    }
    load();
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function businessLink() {
    return `${baseUrl}/book/${businessSlug}`;
  }
  function employeeLink(empId: string) {
    return `${baseUrl}/book/${businessSlug}/${empId}`;
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!businessSlug) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--muted)]">
        Yükleniyor...
      </div>
    );
  }

  const isOwnerOrAdmin = role === "owner" || role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Randevu Linkleri</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Müşterilerinizle paylaşın, doğrudan randevu alsınlar.
        </p>
      </div>

      {/* İşletme Linki (sadece owner/admin) */}
      {isOwnerOrAdmin && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">
              <Users size={20} />
            </span>
            <div>
              <h2 className="font-bold">{businessName} - İşletme Linki</h2>
              <p className="text-xs text-[var(--muted)]">Müşteriler personel + hizmet seçerek randevu alır</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
            <Link2 size={16} className="shrink-0 text-teal-600" />
            <code className="flex-1 truncate text-sm">{businessLink()}</code>
            <Button variant="ghost" className="h-8 px-2" onClick={() => copyToClipboard(businessLink(), "biz")}>
              {copied === "biz" ? <Check size={14} /> : <Copy size={14} />}
            </Button>
            <a href={businessLink()} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="h-8 px-2"><ExternalLink size={14} /></Button>
            </a>
          </div>
        </div>
      )}

      {/* Kendi Linki (personel veya admin'in kendisi) */}
      {currentEmployeeId && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
              <Link2 size={20} />
            </span>
            <div>
              <h2 className="font-bold">Kişisel Linkim</h2>
              <p className="text-xs text-[var(--muted)]">Müşteriler sadece hizmet seçer, direkt size randevu alır</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
            <Link2 size={16} className="shrink-0 text-violet-600" />
            <code className="flex-1 truncate text-sm">{employeeLink(currentEmployeeId)}</code>
            <Button variant="ghost" className="h-8 px-2" onClick={() => copyToClipboard(employeeLink(currentEmployeeId), "me")}>
              {copied === "me" ? <Check size={14} /> : <Copy size={14} />}
            </Button>
            <a href={employeeLink(currentEmployeeId)} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="h-8 px-2"><ExternalLink size={14} /></Button>
            </a>
          </div>
        </div>
      )}

      {/* Tüm personel linkleri (owner/admin) */}
      {isOwnerOrAdmin && employees.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-bold">Personel Linkleri</h2>
          <p className="mb-4 text-xs text-[var(--muted)]">Her personelin kendi randevu linki</p>
          <div className="grid gap-3">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-neutral-200 text-xs font-bold dark:bg-neutral-700">
                  {emp.full_name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{emp.full_name}</p>
                  <code className="block truncate text-xs text-[var(--muted)]">{employeeLink(emp.id)}</code>
                </div>
                <Button variant="ghost" className="h-8 px-2" onClick={() => copyToClipboard(employeeLink(emp.id), emp.id)}>
                  {copied === emp.id ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}
