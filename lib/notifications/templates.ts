export type TemplateKind =
  | "customer_confirmation"
  | "customer_reminder_24h"
  | "customer_reminder_2h"
  | "employee_new_booking"
  | "employee_reminder_24h"
  | "employee_reminder_2h";

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
    "Sayın {customer_name},\n\nRandevunuz başarıyla oluşturulmuştur.\n\n• Tarih: {date}\n• Saat: {time}\n• Hizmet: {services}\n\nBelirtilen tarihte sizi aramızda görmekten memnuniyet duyacağız.\n\nSaygılarımızla,\n{business_name}",
  customer_reminder_24h:
    "Sayın {customer_name},\n\nYarın saat {time}'de {business_name} adına alınan randevunuzu hatırlatmak isteriz.\n\n• Tarih: {date}\n• Saat: {time}\n• Hizmet: {services}\n\nDeğişiklik veya iptal talepleriniz için lütfen bizimle iletişime geçiniz.\n\nSaygılarımızla,\n{business_name}",
  customer_reminder_2h:
    "Sayın {customer_name},\n\nBugün saat {time}'deki randevunuza 2 saat kalmıştır.\n\n• Hizmet: {services}\n\nSizi aramızda görmekten memnuniyet duyacağız.\n\nSaygılarımızla,\n{business_name}",
  employee_new_booking:
    "Yeni randevu kaydı:\n\n• Müşteri: {customer_name}\n• Telefon: {customer_phone}\n• Tarih: {date}\n• Saat: {time}\n• Hizmet: {services}\n\n{business_name}",
  employee_reminder_24h:
    "Yarın saat {time}'de randevunuz bulunmaktadır:\n\n• Müşteri: {customer_name}\n• Telefon: {customer_phone}\n• Hizmet: {services}\n\n{business_name}",
  employee_reminder_2h:
    "2 saat sonra randevunuz bulunmaktadır:\n\n• Saat: {time}\n• Müşteri: {customer_name}\n• Telefon: {customer_phone}\n• Hizmet: {services}\n\n{business_name}",
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
