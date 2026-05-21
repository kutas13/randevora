import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_TEMPLATES,
  normalizePhone,
  renderTemplate,
  type TemplateKind,
  type TemplateVars,
} from "./templates";

type QueueArgs = {
  admin: SupabaseClient;
  businessId: string;
  appointmentId: string;
  customerName: string;
  customerPhone: string;
  date: string;       // "21.05.2026"
  time: string;       // "14:00"
  services: string;   // "Saç Kesimi, Sakal Tıraşı"
  businessName: string;
  startsAt: string;   // ISO
  employeePhones?: string[];
};

const REMINDER_24H_MS = 24 * 60 * 60 * 1000;
const REMINDER_3H_MS = 3 * 60 * 60 * 1000;

export async function queueAppointmentNotifications(args: QueueArgs) {
  const {
    admin, businessId, appointmentId,
    customerName, customerPhone,
    date, time, services, businessName,
    startsAt, employeePhones = [],
  } = args;

  // Sablonlari cek (yoksa default kullan)
  const { data: tplRow } = await admin
    .from("business_message_templates")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  const tpls: Record<TemplateKind, string> = {
    customer_confirmation: tplRow?.customer_confirmation || DEFAULT_TEMPLATES.customer_confirmation,
    customer_reminder_24h: tplRow?.customer_reminder_24h || DEFAULT_TEMPLATES.customer_reminder_24h,
    customer_reminder_3h: tplRow?.customer_reminder_3h || DEFAULT_TEMPLATES.customer_reminder_3h,
    employee_new_booking: tplRow?.employee_new_booking || DEFAULT_TEMPLATES.employee_new_booking,
  };

  const vars: TemplateVars = {
    customer_name: customerName,
    customer_phone: customerPhone,
    date,
    time,
    services,
    business_name: businessName,
  };

  const now = new Date();
  const startsAtDate = new Date(startsAt);
  const remind24At = new Date(startsAtDate.getTime() - REMINDER_24H_MS);
  const remind3At = new Date(startsAtDate.getTime() - REMINDER_3H_MS);
  const phone = normalizePhone(customerPhone);

  const rows: Array<Record<string, unknown>> = [];

  if (phone) {
    rows.push({
      business_id: businessId,
      appointment_id: appointmentId,
      kind: "customer_confirmation",
      channel: "whatsapp",
      recipient: phone,
      message: renderTemplate(tpls.customer_confirmation, vars),
      scheduled_at: now.toISOString(),
    });

    // 24h once — eger randevu zaten 24 saatten az ileride ise atla
    if (remind24At.getTime() > now.getTime()) {
      rows.push({
        business_id: businessId,
        appointment_id: appointmentId,
        kind: "customer_reminder_24h",
        channel: "whatsapp",
        recipient: phone,
        message: renderTemplate(tpls.customer_reminder_24h, vars),
        scheduled_at: remind24At.toISOString(),
      });
    }

    if (remind3At.getTime() > now.getTime()) {
      rows.push({
        business_id: businessId,
        appointment_id: appointmentId,
        kind: "customer_reminder_3h",
        channel: "whatsapp",
        recipient: phone,
        message: renderTemplate(tpls.customer_reminder_3h, vars),
        scheduled_at: remind3At.toISOString(),
      });
    }
  }

  // Calisanlara bildirim
  for (const empPhone of employeePhones) {
    const normalized = normalizePhone(empPhone);
    if (!normalized) continue;
    rows.push({
      business_id: businessId,
      appointment_id: appointmentId,
      kind: "employee_new_booking",
      channel: "whatsapp",
      recipient: normalized,
      message: renderTemplate(tpls.employee_new_booking, vars),
      scheduled_at: now.toISOString(),
    });
  }

  if (rows.length === 0) return { queued: 0 };

  const { error } = await admin.from("message_queue").insert(rows);
  if (error) {
    console.error("[notifications] queue insert failed:", error.message);
    return { queued: 0, error: error.message };
  }
  return { queued: rows.length };
}
