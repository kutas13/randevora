import { CalendarClock, Coins, Users, Wallet } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney, initials } from "@/lib/utils";
import { getCurrentUser, canViewRevenue } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const showRevenue = user ? canViewRevenue(user.role) : true;
  const businessId = user?.business_id;

  const admin = createAdminClient();

  // Gerçek verileri çek
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [appointmentsRes, employeesRes, customersRes] = await Promise.all([
    admin.from("appointments").select("*").eq("business_id", businessId || "").gte("starts_at", todayISO).order("starts_at"),
    admin.from("employees").select("*").eq("business_id", businessId || "").eq("active", true),
    admin.from("customers").select("*").eq("business_id", businessId || "").order("created_at", { ascending: false }).limit(5),
  ]);

  const todayAppointments = appointmentsRes.data || [];
  const employees = employeesRes.data || [];
  const customers = customersRes.data || [];

  // Haftalık randevular
  const { data: weekAppointments } = await admin
    .from("appointments")
    .select("id")
    .eq("business_id", businessId || "")
    .gte("starts_at", weekAgo);

  const weekCount = weekAppointments?.length || 0;

  // Aylık ciro
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const { data: monthAppointments } = await admin
    .from("appointments")
    .select("price_cents")
    .eq("business_id", businessId || "")
    .gte("starts_at", monthStart)
    .in("status", ["confirmed", "completed"]);

  const monthRevenue = (monthAppointments || []).reduce((sum, a) => sum + (a.price_cents || 0), 0);

  const isEmpty = todayAppointments.length === 0 && employees.length === 0 && customers.length === 0;

  return (
    <>
      <Topbar title="Dashboard" subtitle="Bugünkü operasyon, gelir ve ekip kapasitesi tek ekranda." />
      <main className="grid gap-5 p-4 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-fade-in stagger-1">
            <MetricCard title="Bugünkü randevu" value={String(todayAppointments.length)} delta={weekCount > 0 ? `Bu hafta ${weekCount} randevu` : "Henüz randevu yok"} icon={<CalendarClock size={19} />} />
          </div>
          <div className="animate-fade-in stagger-2">
            <MetricCard title="Haftalık randevu" value={String(weekCount)} delta={customers.length > 0 ? `${customers.length} müşteri` : "Müşteri bekleniyor"} icon={<Users size={19} />} tone="indigo" />
          </div>
          {showRevenue && (
            <div className="animate-fade-in stagger-3">
              <MetricCard title="Aylık kazanç" value={formatMoney(monthRevenue)} delta={monthRevenue > 0 ? "Bu ay" : "Henüz gelir yok"} icon={<Coins size={19} />} tone="orange" />
            </div>
          )}
          <div className={`animate-fade-in ${showRevenue ? "stagger-4" : "stagger-3"}`}>
            <MetricCard title="Aktif çalışan" value={String(employees.length)} delta={employees.length > 0 ? "Kayıtlı personel" : "Çalışan ekleyin"} icon={<Wallet size={19} />} tone="neutral" />
          </div>
        </section>

        {isEmpty ? (
          <EmptyState
            title="Hoş geldiniz!"
            description="İşletmeniz henüz yeni. Hizmet, çalışan ve müşteri ekleyerek başlayın."
            icon="calendar"
          />
        ) : (
          <>
            <section className="grid gap-5 xl:grid-cols-2">
              <article className="glass rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Bugünkü randevular</h2>
                  <Badge variant="info">{todayAppointments.length} adet</Badge>
                </div>
                {todayAppointments.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">Bugün randevu bulunmuyor.</p>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {todayAppointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 transition-all duration-200 hover:border-[var(--accent)]">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-sm">
                            {new Date(apt.starts_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - {new Date(apt.ends_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </strong>
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${apt.status === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300"}`}>
                            {apt.status === "confirmed" ? "Onaylandı" : apt.status === "pending" ? "Bekliyor" : apt.status}
                          </span>
                        </div>
                        {showRevenue && apt.price_cents > 0 && (
                          <p className="mt-1 text-xs font-semibold text-teal-700 dark:text-teal-300">{formatMoney(apt.price_cents)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="glass rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Ekip</h2>
                  <Badge>{employees.length} kişi</Badge>
                </div>
                {employees.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">Henüz çalışan eklenmemiş.</p>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {employees.map((emp) => (
                      <div key={emp.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">{initials(emp.full_name)}</span>
                        <span>
                          <strong className="block text-sm">{emp.full_name}</strong>
                          <small className="text-[var(--muted)]">{emp.title || emp.role}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>

            {customers.length > 0 && (
              <article className="glass rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Son müşteriler</h2>
                  <Badge>{customers.length} kişi</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {customers.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">{initials(c.full_name)}</span>
                      <span>
                        <strong className="block text-sm">{c.full_name}</strong>
                        <small className="text-[var(--muted)]">{c.phone}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </>
        )}
      </main>
    </>
  );
}
