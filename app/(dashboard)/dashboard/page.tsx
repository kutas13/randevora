import { CalendarClock, Coins, TrendingUp, Users, Wallet } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { appointments, customers, employees } from "@/lib/mock-data";
import { formatMoney, initials } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Bugünkü operasyon, gelir ve ekip kapasitesi tek ekranda." />
      <main className="grid gap-5 p-4 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-fade-in stagger-1">
            <MetricCard title="Bugünkü randevu" value="16" delta="+12% geçen haftaya göre" icon={<CalendarClock size={19} />} />
          </div>
          <div className="animate-fade-in stagger-2">
            <MetricCard title="Haftalık randevu" value="154" delta="+24 yeni online talep" icon={<Users size={19} />} tone="indigo" />
          </div>
          <div className="animate-fade-in stagger-3">
            <MetricCard title="Aylık kazanç" value={formatMoney(184600)} delta="Pro plan hedefinin %81'i" icon={<Coins size={19} />} tone="orange" />
          </div>
          <div className="animate-fade-in stagger-4">
            <MetricCard title="Aktif çalışan" value={String(employees.length)} delta="1 izin günü planlandı" icon={<Wallet size={19} />} tone="neutral" />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
          <article className="glass animate-slide-up rounded-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Gelir ve randevu grafiği</h2>
                <p className="text-sm text-[var(--muted)]">Haftalık performans görünümü</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">
                  <TrendingUp size={12} />
                  +18%
                </Badge>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-400/15 dark:text-teal-200">Canlı</span>
              </div>
            </div>
            <RevenueChart />
          </article>

          <article className="glass animate-slide-up rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Yaklaşan randevular</h2>
              <Badge variant="info">{appointments.length} adet</Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="group rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 transition-all duration-200 hover:border-[var(--accent)] hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{appointment.startsAt} - {appointment.endsAt}</strong>
                    <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${appointment.color}15`, color: appointment.color }}>
                      {appointment.status === "pending" ? "Onay bekliyor" : "Onaylandı"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{appointment.customerName}</p>
                  <p className="text-xs text-[var(--muted)]">{appointment.serviceName} · {appointment.employeeName}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className="glass rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Son müşteriler</h2>
              <Badge>{customers.length} kişi</Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 transition-all duration-200 hover:border-[var(--accent)] hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">{initials(customer.name)}</span>
                    <span>
                      <strong className="block text-sm">{customer.name}</strong>
                      <small className="text-[var(--muted)]">{customer.appointmentCount} randevu · {customer.lastVisit}</small>
                    </span>
                  </div>
                  <span className="text-sm font-bold">{formatMoney(customer.totalSpend)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="glass rounded-xl p-5">
            <h2 className="text-lg font-bold">Ekip kapasitesi</h2>
            <div className="mt-4 grid gap-3">
              {employees.map((employee) => (
                <div key={employee.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">{initials(employee.name)}</span>
                      <span>
                        <strong className="block text-sm">{employee.name}</strong>
                        <small className="text-[var(--muted)]">{employee.role}</small>
                      </span>
                    </div>
                    <Badge variant={employee.appointmentsToday > 5 ? "warning" : "success"}>
                      {employee.appointmentsToday} randevu
                    </Badge>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min((employee.appointmentsToday / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
