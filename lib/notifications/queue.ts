import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_TEMPLATES,
  normalizePhone,
  renderTemplate,
  type TemplateKind,
  type TemplateVars,
} from "./templates";
import { sendNotification } from "./sender";

type QueueArgs = {
  admin: SupabaseClient;
  businessId: string;
  appointmentId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  services: string;
  businessName: string;
  startsAt: string; // ISO
  employeePhones?: string[];
};

const REMINDER_24H_MS = 24 * 60 * 60 * 1000;
const REMINDER_2H_MS = 2 * 60 * 60 * 1000;

export async function queueAppointmentNotifications(args: QueueArgs) {
  const {
    admin,
    businessId,
    appointmentId,
    customerName,
    customerPhone,
    date,
    time,
    services,
    businessName,
    startsAt,
    employeePhones = [],
  } = args;

  const { data: tplRow } = await admin
    .from("business_message_templates")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  const tpls: Record<TemplateKind, string> = {
    customer_confirmation: tplRow?.customer_confirmation || DEFAULT_TEMPLATES.customer_confirmation,
    customer_reminder_24h: tplRow?.customer_reminder_24h || DEFAULT_TEMPLATES.customer_reminder_24h,
    customer_reminder_2h:
      tplRow?.customer_reminder_2h || tplRow?.customer_reminder_3h || DEFAULT_TEMPLATES.customer_reminder_2h,
    employee_new_booking: tplRow?.employee_new_booking || DEFAULT_TEMPLATES.employee_new_booking,
    employee_reminder_24h: tplRow?.employee_reminder_24h || DEFAULT_TEMPLATES.employee_reminder_24h,
    employee_reminder_2h: tplRow?.employee_reminder_2h || DEFAULT_TEMPLATES.employee_reminder_2h,
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
  const remind2At = new Date(startsAtDate.getTime() - REMINDER_2H_MS);
  const customerPhoneN = normalizePhone(customerPhone);

  const rows: Array<Record<string, unknown>> = [];

  // --- MÜŞTERİ ---
  if (customerPhoneN) {
    // Anında onay
    rows.push(
      mkRow(businessId, appointmentId, "customer_confirmation", customerPhoneN, renderTemplate(tpls.customer_confirmation, vars), now),
    );
    // 24 saat önce
    if (remind24At.getTime() > now.getTime()) {
      rows.push(
        mkRow(businessId, appointmentId, "customer_reminder_24h", customerPhoneN, renderTemplate(tpls.customer_reminder_24h, vars), remind24At),
      );
    }
    // 2 saat önce
    if (remind2At.getTime() > now.getTime()) {
      rows.push(
        mkRow(businessId, appointmentId, "customer_reminder_2h", customerPhoneN, renderTemplate(tpls.customer_reminder_2h, vars), remind2At),
      );
    }
  }

  // --- ÇALIŞANLAR ---
  for (const empPhoneRaw of employeePhones) {
    const empPhone = normalizePhone(empPhoneRaw);
    if (!empPhone) continue;

    // Anında yeni randevu bilgisi
    rows.push(
      mkRow(businessId, appointmentId, "employee_new_booking", empPhone, renderTemplate(tpls.employee_new_booking, vars), now),
    );
    // 24 saat önce
    if (remind24At.getTime() > now.getTime()) {
      rows.push(
        mkRow(businessId, appointmentId, "employee_reminder_24h", empPhone, renderTemplate(tpls.employee_reminder_24h, vars), remind24At),
      );
    }
    // 2 saat önce
    if (remind2At.getTime() > now.getTime()) {
      rows.push(
        mkRow(businessId, appointmentId, "employee_reminder_2h", empPhone, renderTemplate(tpls.employee_reminder_2h, vars), remind2At),
      );
    }
  }

  if (rows.length === 0) return { queued: 0 };

  // Kuyruga ekle
  const { data: inserted, error } = await admin
    .from("message_queue")
    .insert(rows)
    .select("id, business_id, kind, channel, recipient, message, scheduled_at");

  if (error) {
    console.error("[notifications] queue insert failed:", error.message);
    return { queued: 0, error: error.message };
  }

  // Hemen gonderilecek olanlari (scheduled_at <= now) ANINDA gonder.
  const nowMs = Date.now();
  const dueNow = (inserted || []).filter((r) => new Date(r.scheduled_at as string).getTime() <= nowMs);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < dueNow.length; i += 5) {
    const batch = dueNow.slice(i, i + 5);
    await Promise.all(
      batch.map(async (row) => {
        await admin.from("message_queue").update({ status: "sending" }).eq("id", row.id);
        const result = await sendNotification({
          recipient: row.recipient as string,
          message: row.message as string,
          channel: row.channel as string,
          businessId: row.business_id as string,
        });
        if (result.ok) {
          await admin
            .from("message_queue")
            .update({ status: "sent", sent_at: new Date().toISOString(), attempts: 1 })
            .eq("id", row.id);
          sent++;
        } else {
          await admin
            .from("message_queue")
            .update({ status: "pending", attempts: 1, last_error: result.error || "unknown" })
            .eq("id", row.id);
          failed++;
          console.warn("[notifications] immediate send failed:", row.kind, result.error);
        }
      }),
    );
  }

  return { queued: rows.length, immediateSent: sent, immediateFailed: failed };
}

function mkRow(
  businessId: string,
  appointmentId: string,
  kind: TemplateKind,
  recipient: string,
  message: string,
  scheduledAt: Date,
): Record<string, unknown> {
  return {
    business_id: businessId,
    appointment_id: appointmentId,
    kind,
    channel: "whatsapp",
    recipient,
    message,
    scheduled_at: scheduledAt.toISOString(),
  };
}
