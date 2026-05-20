"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  price_cents: number;
  notes: string | null;
  customer: { full_name: string; phone: string } | null;
  employee: { full_name: string } | null;
  service: { name: string; color: string } | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadAppointments(); }, []);

  async function loadAppointments() {
    const { data } = await supabase
      .from("appointments")
      .select("*, customer:customers(full_name, phone), employee:employees(full_name), service:services(name, color)")
      .order("starts_at", { ascending: false })
      .limit(50);

    setAppointments(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments(appointments.map((a) => a.id === id ? { ...a, status } : a));
  }

  if (loading) return <><Topbar title="Randevular" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  const statusLabel: Record<string, string> = {
    pending: "Bekliyor",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal",
    no_show: "Gelmedi",
  };

  const statusVariant: Record<string, "warning" | "success" | "info" | "danger" | "default"> = {
    pending: "warning",
    confirmed: "success",
    completed: "info",
    cancelled: "danger",
    no_show: "default",
  };

  return (
    <>
      <Topbar title="Randevular" subtitle="Tüm randevuları görüntüle ve yönet." />
      <main className="grid gap-5 p-4 md:p-8">
        {appointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Henüz randevu yok"
            description="Müşterileriniz online booking sayfanızdan randevu oluşturabilir."
          />
        ) : (
          <section className="grid gap-3">
            {appointments.map((apt) => (
              <article key={apt.id} className="glass flex flex-col gap-3 rounded-xl p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center rounded-lg bg-[var(--panel-strong)] px-3 py-2 text-center">
                    <span className="text-xs text-[var(--muted)]">{new Date(apt.starts_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                    <strong className="text-sm">{new Date(apt.starts_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</strong>
                  </div>
                  <div>
                    <strong className="block">{apt.customer?.full_name || "Bilinmiyor"}</strong>
                    <small className="text-[var(--muted)]">
                      {apt.service?.name || "Hizmet"} · {apt.employee?.full_name || "Atanmamış"}
                    </small>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apt.price_cents > 0 && <span className="text-sm font-bold">{formatMoney(apt.price_cents)}</span>}
                  <Badge variant={statusVariant[apt.status] || "default"}>{statusLabel[apt.status] || apt.status}</Badge>
                  {apt.status === "pending" && (
                    <>
                      <Button variant="primary" className="h-7 text-xs" onClick={() => updateStatus(apt.id, "confirmed")}>Onayla</Button>
                      <Button variant="danger" className="h-7 text-xs" onClick={() => updateStatus(apt.id, "cancelled")}>İptal</Button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
