"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useBusinessId } from "@/lib/hooks/use-business";
import { useToast } from "@/components/ui/toast";

type Appointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  price_cents: number;
  notes: string | null;
  customer: { full_name: string; phone: string } | null;
  employee: { full_name: string } | null;
  service: { name: string; color: string; duration_minutes: number; price_cents: number } | null;
};

type ServiceOption = { id: string; name: string; duration_minutes: number; price_cents: number };
type EmployeeOption = { id: string; full_name: string };
type CustomerOption = { id: string; full_name: string; phone: string };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [form, setForm] = useState({ customer_id: "", service_id: "", employee_id: "", date: "", time: "", notes: "", newCustomerName: "", newCustomerPhone: "", useNewCustomer: false });

  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => { loadAppointments(); loadOptions(); }, []);

  async function loadAppointments() {
    const { data } = await supabase
      .from("appointments")
      .select("*, customer:customers(full_name, phone), employee:employees(full_name), service:services(name, color, duration_minutes, price_cents)")
      .order("starts_at", { ascending: false })
      .limit(50);
    setAppointments(data || []);
    setLoading(false);
  }

  async function loadOptions() {
    const [sRes, eRes, cRes] = await Promise.all([
      supabase.from("services").select("id, name, duration_minutes, price_cents").eq("active", true),
      supabase.from("employees").select("id, full_name").eq("active", true),
      supabase.from("customers").select("id, full_name, phone").order("full_name"),
    ]);
    setServices(sRes.data || []);
    setEmployees(eRes.data || []);
    setCustomers(cRes.data || []);
  }

  async function handleCreate() {
    if (!businessId) { toast("İşletme bilgisi bulunamadı.", "error"); return; }

    let customerId = form.customer_id;

    if (form.useNewCustomer) {
      if (!form.newCustomerName || !form.newCustomerPhone) {
        toast("Müşteri adı ve telefonu gerekli.", "error");
        return;
      }
      const { data: newCust, error: custErr } = await supabase
        .from("customers")
        .insert({ full_name: form.newCustomerName, phone: form.newCustomerPhone, business_id: businessId })
        .select("id")
        .single();
      if (custErr) { toast("Müşteri oluşturulamadı: " + custErr.message, "error"); return; }
      customerId = newCust.id;
    }

    if (!customerId || !form.service_id || !form.employee_id || !form.date || !form.time) {
      toast("Tüm alanları doldurun.", "error");
      return;
    }

    const service = services.find((s) => s.id === form.service_id);
    const startsAt = new Date(`${form.date}T${form.time}`);
    const endsAt = new Date(startsAt.getTime() + (service?.duration_minutes || 30) * 60 * 1000);

    const { error } = await supabase.from("appointments").insert({
      business_id: businessId,
      customer_id: customerId,
      service_id: form.service_id,
      employee_id: form.employee_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      price_cents: service?.price_cents || 0,
      status: "confirmed",
      notes: form.notes || null,
    });

    if (error) { toast("Randevu oluşturulamadı: " + error.message, "error"); return; }

    toast("Randevu oluşturuldu!", "success");
    setForm({ customer_id: "", service_id: "", employee_id: "", date: "", time: "", notes: "", newCustomerName: "", newCustomerPhone: "", useNewCustomer: false });
    setShowModal(false);
    loadAppointments();
    loadOptions();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments(appointments.map((a) => a.id === id ? { ...a, status } : a));
  }

  if (loading) return <><Topbar title="Randevular" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  const statusLabel: Record<string, string> = { pending: "Bekliyor", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal", no_show: "Gelmedi" };
  const statusVariant: Record<string, "warning" | "success" | "info" | "danger" | "default"> = { pending: "warning", confirmed: "success", completed: "info", cancelled: "danger", no_show: "default" };

  return (
    <>
      <Topbar title="Randevular" subtitle="Tüm randevuları görüntüle ve yönet." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">{appointments.length} randevu</p>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> Randevu oluştur</Button>
        </div>

        {appointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Henüz randevu yok"
            description="Yeni randevu oluşturun veya müşterileriniz online booking sayfanızdan randevu alsın."
          >
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> İlk randevuyu oluştur</Button>
          </EmptyState>
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
                  {apt.status === "confirmed" && (
                    <Button variant="secondary" className="h-7 text-xs" onClick={() => updateStatus(apt.id, "completed")}>Tamamla</Button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni randevu oluştur">
        <div className="grid gap-4">
          {/* Müşteri seçimi */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Müşteri</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, useNewCustomer: !form.useNewCustomer })}
                className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                {form.useNewCustomer ? "Mevcut müşteri seç" : "+ Yeni müşteri"}
              </button>
            </div>
            {form.useNewCustomer ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input className="h-10 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none" placeholder="Ad Soyad" value={form.newCustomerName} onChange={(e) => setForm({ ...form, newCustomerName: e.target.value })} />
                <input className="h-10 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm outline-none" placeholder="Telefon" value={form.newCustomerPhone} onChange={(e) => setForm({ ...form, newCustomerPhone: e.target.value })} />
              </div>
            ) : (
              <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Müşteri seçin</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
              </select>
            )}
          </div>

          {/* Hizmet */}
          <div>
            <label className="text-sm font-semibold">Hizmet</label>
            <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
              <option value="">Hizmet seçin</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} dk - {formatMoney(s.price_cents)})</option>)}
            </select>
          </div>

          {/* Personel */}
          <div>
            <label className="text-sm font-semibold">Personel</label>
            <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
              <option value="">Personel seçin</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </div>

          {/* Tarih ve Saat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Tarih</label>
              <input type="date" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Saat</label>
              <input type="time" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>

          {/* Not */}
          <div>
            <label className="text-sm font-semibold">Not (opsiyonel)</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Ek bilgi..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <Button onClick={handleCreate} className="mt-2">
            <Plus size={18} /> Randevu oluştur
          </Button>
        </div>
      </Modal>
    </>
  );
}
