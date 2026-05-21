export type TemplateKind =
  | "customer_confirmation"
  | "customer_reminder_24h"
  | "customer_reminder_3h"
  | "employee_new_booking";

export type TemplateVars = {
  customer_name?: string;
  customer_phone?: string;
  date?: string;
  time?: string;
  services?: string;
  business_name?: string;
};

export const DEFAULT_TEMPLATES: Record<TemplateKind, string> = {
  customer_confirmation:
    "Merhaba {customer_name}, randevunuz oluşturuldu. ✅\nTarih: {date} {time}\nHizmet: {services}\n{business_name}",
  customer_reminder_24h:
    "Merhaba {customer_name}, yarın {time} saatinde randevunuz var. {business_name} olarak sizi bekliyoruz! 🙌",
  customer_reminder_3h:
    "Merhaba {customer_name}, bugün {time} saatindeki randevunuza birkaç saat kaldı. Görüşmek üzere! 👋",
  employee_new_booking:
    "Yeni randevu! 📅\n{customer_name} ({customer_phone})\nTarih: {date} {time}\nHizmet: {services}",
};

export function renderTemplate(template: string, vars: TemplateVars): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    const safe = value === undefined || value === null ? "" : String(value);
    out = out.replaceAll(`{${key}}`, safe);
  }
  return out;
}

export function normalizePhone(input: string): string {
  if (!input) return "";
  let phone = input.replace(/[^\d+]/g, "");
  if (phone.startsWith("00")) phone = "+" + phone.slice(2);
  if (!phone.startsWith("+")) {
    if (phone.startsWith("0")) phone = "+9" + phone;
    else if (phone.startsWith("9")) phone = "+" + phone;
    else if (phone.length === 10) phone = "+90" + phone;
  }
  return phone;
}
