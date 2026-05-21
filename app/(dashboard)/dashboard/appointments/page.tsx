"use client";

import { useEffect, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Edit3, Phone, Plus, Search, Trash2, User } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useBusinessId } from "@/lib/hooks/use-business";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Appointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  price_cents: number;
  notes: string | null;
  customer_id: string;
  employee_id: string;
  service_id: string;
  customer: { full_name: string; phone: string } | null;
  employee: { full_name: string } | null;
  service: { name: string; color: string; duration_minutes: number; price_cents: number } | null;
};

type ServiceOption = { id: string; name: string; duration_minutes: number; price_cents: number };
type EmployeeOption = { id: string; full_name: string };
type CustomerOption = { id: string; full_name: string; phone: string };

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_id: "", service_ids: [] as string[], employee_id: "", date: "", time: "", notes: "", newCustomerName: "", newCustomerPhone: "", useNewCustomer: false });
  const [editForm, setEditForm] = useState({ service_id: "", employee_id: "", date: "", time: "", notes: "", status: "" });

  const [userRole, setUserRole] = useState("");
  const [myEmployeeId, setMyEmployeeId] = useState("");
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [slotMerge, setSlotMerge] = useState(true);

  const [blockedDates, setBlockedDates] = useState<{ employee_id: string; starts_at: string; reason: string | null; recurring: boolean }[]>([]);

  const { businessId } = useBusinessId();
  const supabase = createClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    if (!businessId) return;
    loadAppointments();
    loadOptions();
    loadBlockedDates();
  }, [businessId]);

  async function loadUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (profile) setUserRole(profile.role);

    // Personelse kendi employee_id'sini bul
    const { data: emp } = await supabase.from("employees").select("id").eq("user_id", user.id).single();
    if (emp) {
      setMyEmployeeId(emp.id);
      setForm((f) => ({ ...f, employee_id: emp.id }));
    }
  }

  async function loadAppointments() {
    if (!businessId) return;
    const { data } = await supabase
      .from("appointments")
      .select("*, customer:customers(full_name, phone), employee:employees(full_name), service:services(name, color, duration_minutes, price_cents)")
      .eq("business_id", businessId)
      .order("starts_at", { ascending: false })
      .limit(50);
    setAppointments(data || []);
    setLoading(false);
  }

  async function loadOptions() {
    if (!businessId) return;
    const [sRes, eRes, cRes] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, duration_minutes, price_cents")
        .eq("business_id", businessId)
        .eq("active", true),
      supabase
        .from("employees")
        .select("id, full_name")
        .eq("business_id", businessId)
        .eq("active", true),
      supabase
        .from("customers")
        .select("id, full_name, phone")
        .eq("business_id", businessId)
        .order("full_name"),
    ]);
    setServices(sRes.data || []);
    setEmployees(eRes.data || []);
    setCustomers(cRes.data || []);

    const { data: biz } = await supabase.from("businesses").select("slot_merge").eq("id", businessId).single();
    if (biz) setSlotMerge(biz.slot_merge !== false);
  }

  async function loadBusySlots(date: string, employeeId: string) {
    if (!date || !employeeId) { setBusySlots([]); return; }
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;
    const { data } = await supabase
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("employee_id", employeeId)
      .gte("starts_at", start)
      .lte("starts_at", end)
      .in("status", ["pending", "confirmed"]);

    const busy: string[] = [];
    (data || []).forEach((a) => {
      const s = new Date(a.starts_at);
      const e = new Date(a.ends_at);
      let current = new Date(s);
      while (current < e) {
        busy.push(`${String(current.getHours()).padStart(2, "0")}:00`);
        current = new Date(current.getTime() + 60 * 60 * 1000);
      }
    });
    setBusySlots(busy);
  }

  useEffect(() => {
    const empId = isPersonel ? myEmployeeId : form.employee_id;
    loadBusySlots(form.date, empId);
  }, [form.date, form.employee_id, myEmployeeId]);

  const isPersonel = userRole === "employee";

  async function handleCreate() {
    if (!businessId) { toast("İşletme bilgisi bulunamadı.", "error"); return; }
    setSubmitting(true);

    let customerId = form.customer_id;

    if (form.useNewCustomer) {
      if (!form.newCustomerName || !form.newCustomerPhone) {
        toast("Müşteri adı ve telefonu gerekli.", "error"); setSubmitting(false); return;
      }
      const { data: newCust, error: custErr } = await supabase
        .from("customers")
        .insert({ full_name: form.newCustomerName, phone: form.newCustomerPhone, business_id: businessId })
        .select("id")
        .single();
      if (custErr) { toast("Müşteri oluşturulamadı: " + custErr.message, "error"); setSubmitting(false); return; }
      customerId = newCust.id;
    }

    const employeeId = isPersonel ? myEmployeeId : form.employee_id;

    if (!customerId || form.service_ids.length === 0 || !employeeId || !form.date || !form.time) {
      toast("Tüm alanları doldurun.", "error"); setSubmitting(false); return;
    }

    const selectedSvcs = form.service_ids.map((id) => services.find((s) => s.id === id)).filter(Boolean);
    const totalMinutes = selectedSvcs.reduce((sum, s) => sum + (s?.duration_minutes || 60), 0);
    const totalPrice = selectedSvcs.reduce((sum, s) => sum + (s?.price_cents || 0), 0);
    const totalHours = Math.ceil(totalMinutes / 60);
    const slotsToBlock = slotMerge ? Math.ceil(totalHours / 2) : totalHours;

    const startsAt = new Date(`${form.date}T${form.time}`);
    const endsAt = new Date(startsAt.getTime() + slotsToBlock * 60 * 60 * 1000);

    const serviceNames = selectedSvcs.map((s) => s?.name).join(", ");
    const noteText = form.notes ? `${serviceNames} | ${form.notes}` : serviceNames;

    const { error } = await supabase.from("appointments").insert({
      business_id: businessId,
      customer_id: customerId,
      service_id: form.service_ids[0],
      employee_id: employeeId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      price_cents: totalPrice,
      status: "confirmed",
      notes: noteText,
    });

    if (error) { toast("Randevu oluşturulamadı: " + error.message, "error"); }
    else {
      toast("Randevu oluşturuldu!", "success");
      setForm({ customer_id: "", service_ids: [], employee_id: isPersonel ? myEmployeeId : "", date: "", time: "", notes: "", newCustomerName: "", newCustomerPhone: "", useNewCustomer: false });
      setShowModal(false);
      loadAppointments();
      loadOptions();
    }
    setSubmitting(false);
  }

  function openEdit(apt: Appointment) {
    setEditingApt(apt);
    const start = new Date(apt.starts_at);
    setEditForm({
      service_id: apt.service_id,
      employee_id: apt.employee_id,
      date: start.toISOString().split("T")[0],
      time: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      notes: apt.notes || "",
      status: apt.status,
    });
    setEditModal(true);
  }

  async function handleEdit() {
    if (!editingApt) return;
    setSubmitting(true);

    const service = services.find((s) => s.id === editForm.service_id);
    const startsAt = new Date(`${editForm.date}T${editForm.time}`);
    const endsAt = new Date(startsAt.getTime() + (service?.duration_minutes || 60) * 60 * 1000);

    const { error } = await supabase.from("appointments").update({
      service_id: editForm.service_id,
      employee_id: editForm.employee_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      price_cents: service?.price_cents || editingApt.price_cents,
      status: editForm.status,
      notes: editForm.notes || null,
    }).eq("id", editingApt.id);

    if (error) { toast("Güncellenemedi: " + error.message, "error"); }
    else { toast("Randevu güncellendi!", "success"); setEditModal(false); loadAppointments(); }
    setSubmitting(false);
  }

  async function loadBlockedDates() {
    if (!businessId) return;
    const { data } = await supabase
      .from("blocked_dates")
      .select("employee_id, starts_at, reason, recurring")
      .eq("business_id", businessId);
    setBlockedDates(data || []);
  }

  function isBlockedDay(dateStr: string, employeeId: string) {
    if (!dateStr || !employeeId) return false;
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    return blockedDates.some((bd) => {
      if (bd.employee_id !== employeeId) return false;
      const isRecurring = bd.recurring || (bd.reason && bd.reason.startsWith("recurring:"));
      if (isRecurring) {
        const blockedDay = bd.reason ? parseInt(bd.reason.split(":")[1]) : new Date(bd.starts_at).getDay();
        return dayOfWeek === blockedDay;
      }
      const start = new Date(bd.starts_at);
      start.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === start.getTime();
    });
  }

  async function removeAppointment(id: string) {
    const ok = await confirm({
      title: "Randevuyu sil",
      message: "Bu randevuyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      confirmText: "Sil",
      cancelText: "Vazgeç",
      variant: "danger",
    });
    if (!ok) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) { toast("Silinemedi: " + error.message, "error"); return; }
    toast("Randevu silindi.", "success");
    setAppointments(appointments.filter((a) => a.id !== id));
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments(appointments.map((a) => a.id === id ? { ...a, status } : a));
  }

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) return <><Topbar title="Randevular" subtitle="Yükleniyor..." /><main className="p-8 text-center text-[var(--muted)]">Yükleniyor...</main></>;

  const statusLabel: Record<string, string> = { pending: "Bekliyor", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal", no_show: "Gelmedi" };
  const statusVariant: Record<string, "warning" | "success" | "info" | "danger" | "default"> = { pending: "warning", confirmed: "success", completed: "info", cancelled: "danger", no_show: "default" };

  const filtered = appointments.filter((apt) => {
    if (filterStatus !== "all" && apt.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (apt.customer?.full_name || "").toLowerCase().includes(q) ||
        (apt.service?.name || "").toLowerCase().includes(q) ||
        (apt.employee?.full_name || "").toLowerCase().includes(q) ||
        (apt.customer?.phone || "").includes(q);
    }
    return true;
  });

  const todayStr = new Date().toDateString();
  const todayCount = appointments.filter((a) => new Date(a.starts_at).toDateString() === todayStr).length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <>
      <Topbar title="Randevular" subtitle="Tüm randevuları görüntüle ve yönet." />
      <main className="grid gap-5 p-4 md:p-8">
        {/* Üst istatistik kartları */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-[var(--muted)]">Toplam</p>
            <strong className="text-2xl">{appointments.length}</strong>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-[var(--muted)]">Bugün</p>
            <strong className="text-2xl text-[var(--accent)]">{todayCount}</strong>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-[var(--muted)]">Bekleyen</p>
            <strong className="text-2xl text-orange-500">{pendingCount}</strong>
          </div>
          <div className="glass rounded-xl p-4 flex items-center justify-center">
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> Yeni Randevu</Button>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] pl-10 pr-3 text-sm outline-none placeholder:text-[var(--muted)]"
              placeholder="Müşteri, hizmet veya personel ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[{ key: "all", label: "Tümü" }, { key: "pending", label: "Bekleyen" }, { key: "confirmed", label: "Onaylı" }, { key: "completed", label: "Tamamlanan" }, { key: "cancelled", label: "İptal" }].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filterStatus === f.key ? "bg-[var(--accent)] text-white" : "bg-[var(--panel-strong)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Randevu bulunamadı" description="Filtreyi değiştirin veya yeni randevu oluşturun.">
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> Randevu oluştur</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-3">
            {filtered.map((apt) => (
              <article key={apt.id} className="glass group relative flex flex-col gap-3 rounded-2xl p-5 transition hover:shadow-lg md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-[var(--panel-strong)] to-transparent px-3 py-2 text-center min-w-[60px]">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">{new Date(apt.starts_at).toLocaleDateString("tr-TR", { month: "short" })}</span>
                    <strong className="text-lg leading-tight">{new Date(apt.starts_at).getDate()}</strong>
                    <span className="text-xs font-semibold text-[var(--accent)]">{new Date(apt.starts_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[var(--muted)]" />
                      <strong className="text-sm">{apt.customer?.full_name || "Bilinmiyor"}</strong>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full" style={{ background: apt.service?.color || "#888" }} />
                        {apt.service?.name || "Hizmet"}
                      </span>
                      <span>{apt.employee?.full_name || "Atanmamış"}</span>
                    </div>
                    {apt.customer?.phone && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Phone size={10} />
                        {apt.customer.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {apt.price_cents > 0 && <span className="rounded-lg bg-[var(--panel-strong)] px-2 py-1 text-xs font-bold">{formatMoney(apt.price_cents)}</span>}
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
                  <button onClick={() => openEdit(apt)} className="flex size-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => removeAppointment(apt.id)} className="flex size-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Oluşturma Modalı */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni randevu oluştur">
        <div className="grid gap-4">
          {/* Müşteri */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Müşteri</label>
              <button type="button" onClick={() => setForm({ ...form, useNewCustomer: !form.useNewCustomer })} className="text-xs font-semibold text-[var(--accent)] hover:underline">
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

          {/* Hizmet - çoklu seçim */}
          <div>
            <label className="text-sm font-semibold">Hizmet <span className="font-normal text-[var(--muted)]">(birden fazla seçebilirsiniz)</span></label>
            <div className="mt-2 grid gap-2 max-h-48 overflow-y-auto">
              {services.map((s) => {
                const isChecked = form.service_ids.includes(s.id);
                return (
                  <label key={s.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${isChecked ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--line)] hover:border-[var(--accent)]/50"}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setForm({ ...form, service_ids: isChecked ? form.service_ids.filter((id) => id !== s.id) : [...form.service_ids, s.id] })}
                      className="accent-[var(--accent)] size-4"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="ml-2 text-xs text-[var(--muted)]">{s.duration_minutes} dk · {formatMoney(s.price_cents)}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.service_ids.length > 0 && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-[var(--accent)]/5 px-3 py-2 text-sm">
                <span>{form.service_ids.length} hizmet seçildi</span>
                <span className="font-bold">{formatMoney(form.service_ids.reduce((sum, id) => sum + (services.find((s) => s.id === id)?.price_cents || 0), 0))}</span>
              </div>
            )}
          </div>

          {/* Personel - sadece admin/owner görür */}
          {!isPersonel && (
            <div>
              <label className="text-sm font-semibold">Personel</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                <option value="">Personel seçin</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
              </select>
            </div>
          )}
          {isPersonel && (
            <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3 text-sm">
              <span className="font-semibold text-[var(--accent)]">Personel: </span>
              <span>{employees.find((e) => e.id === myEmployeeId)?.full_name || "Siz"}</span>
            </div>
          )}

          {/* Tarih Seçici - Modern */}
          <div>
            <label className="text-sm font-semibold">Tarih</label>
            <DatePicker
              value={form.date}
              onChange={(d) => setForm({ ...form, date: d, time: "" })}
              isBlocked={(d) => isBlockedDay(d, isPersonel ? myEmployeeId : form.employee_id)}
            />
          </div>

          {/* Saat Slotları */}
          {form.date && (
            <div>
              <label className="text-sm font-semibold">Saat</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBusy = busySlots.includes(slot);
                  const isSelected = form.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBusy}
                      onClick={() => setForm({ ...form, time: slot })}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        isBusy
                          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through dark:border-red-400/20 dark:bg-red-400/10"
                          : isSelected
                          ? "border-[var(--accent)] bg-gradient-to-r from-[#b07c4f] to-[#d4956a] text-white shadow-sm"
                          : "border-[var(--line)] bg-[var(--panel-strong)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
                      }`}
                    >
                      {slot}
                      {isBusy && <span className="ml-1 text-[10px]">Dolu</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not */}
          <div>
            <label className="text-sm font-semibold">Not (opsiyonel)</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Ek bilgi..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <Button onClick={handleCreate} disabled={submitting} className="mt-2">
            <Plus size={18} /> {submitting ? "Oluşturuluyor..." : "Randevu oluştur"}
          </Button>
        </div>
      </Modal>

      {/* Düzenleme Modalı */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Randevu düzenle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Hizmet</label>
            <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.service_id} onChange={(e) => setEditForm({ ...editForm, service_id: e.target.value })}>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {!isPersonel && (
            <div>
              <label className="text-sm font-semibold">Personel</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.employee_id} onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Tarih</label>
              <input type="date" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Saat</label>
              <input type="time" className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Durum</label>
            <select className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="pending">Bekliyor</option>
              <option value="confirmed">Onaylandı</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
              <option value="no_show">Gelmedi</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Not</label>
            <input className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none" placeholder="Ek bilgi..." value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
          </div>
          <Button onClick={handleEdit} disabled={submitting} className="mt-2">
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function DatePicker({ value, onChange, isBlocked }: { value: string; onChange: (d: string) => void; isBlocked?: (dateStr: string) => boolean }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= totalDays; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  function isDisabled(day: number) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (d < t) return true;
    if (isBlocked) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (isBlocked(dateStr)) return true;
    }
    return false;
  }

  function isSelected(day: number) {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return d === value;
  }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  function selectDay(day: number) {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(d);
  }

  return (
    <div className="mt-2 rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold">{monthNames[month]} {year}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="flex size-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-[var(--muted)]">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day ? (
              <button
                type="button"
                disabled={isDisabled(day)}
                onClick={() => selectDay(day)}
                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  isDisabled(day)
                    ? "cursor-not-allowed text-[var(--muted)]/40"
                    : isSelected(day)
                    ? "bg-gradient-to-r from-[#b07c4f] to-[#d4956a] text-white shadow-sm"
                    : isToday(day)
                    ? "border border-[var(--accent)] text-[var(--accent)]"
                    : "hover:bg-[var(--accent)]/10"
                }`}
              >
                {day}
              </button>
            ) : <span />}
          </div>
        ))}
      </div>
    </div>
  );
}
