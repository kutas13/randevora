export type BookingLang = "tr" | "en" | "de" | "ru";

export const LANGS: { code: BookingLang; label: string; flag: string }[] = [
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
];

type BookingDict = {
  // header / status
  online_booking: string;
  // step labels
  step_service: string;
  step_employee: string;
  step_datetime: string;
  step_info: string;
  // service step
  select_service: string;
  multi_select_hint: string;
  variable_price: string;
  deposit_label: string;
  services_selected: (n: number) => string;
  deposit_now: string;
  continue_btn: string;
  back_btn: string;
  // employee step
  select_employee: string;
  default_staff_title: string;
  // datetime step
  select_date_time: string;
  this_week: string;
  available_times: string;
  total_duration: string;
  // info step
  your_details: string;
  full_name: string;
  full_name_ph: string;
  phone: string;
  phone_ph: string;
  email: string;
  email_required: string;
  email_optional: string;
  email_ph: string;
  email_for_deposit: string;
  booking_summary: string;
  service_label: string;
  date_label: string;
  duration_label: string;
  price_label: string;
  price_range_note: string;
  deposit_pay_now: string;
  iyzico_note: string;
  err_name_phone: string;
  err_email_deposit: string;
  err_booking: string;
  submitting: string;
  book_btn: string;
  book_with_deposit: (amt: string) => string;
  // done
  done_title: string;
  done_subtitle: string;
  // duration short / long
  hour_short: string;
  hour_long: string;
  minute_short: string;
  minute_long: string;
  // weekday short labels (Sunday first)
  weekdays_short: [string, string, string, string, string, string, string];
  months_short: [string, string, string, string, string, string, string, string, string, string, string, string];
  with_randevora: string;
};

const tr: BookingDict = {
  online_booking: "Online randevu",
  step_service: "Hizmet",
  step_employee: "Personel",
  step_datetime: "Tarih & Saat",
  step_info: "Bilgiler",
  select_service: "Hizmet seçin",
  multi_select_hint: "(birden fazla seçebilirsiniz)",
  variable_price: "Değişkenlik gösterebilir",
  deposit_label: "Kapora",
  services_selected: (n) => `${n} hizmet seçildi`,
  deposit_now: "Şimdi ödenecek kapora",
  continue_btn: "Devam",
  back_btn: "Geri",
  select_employee: "Personel seçin",
  default_staff_title: "Personel",
  select_date_time: "Tarih ve saat seçin",
  this_week: "Bu hafta",
  available_times: "Uygun saatler",
  total_duration: "Toplam Süre",
  your_details: "Bilgileriniz",
  full_name: "Ad Soyad",
  full_name_ph: "Adınız Soyadınız",
  phone: "Telefon",
  phone_ph: "+90 5xx xxx xx xx",
  email: "E-posta",
  email_required: "*",
  email_optional: "(opsiyonel)",
  email_ph: "ornek@eposta.com",
  email_for_deposit: "Kapora ödemesi için e-posta gerekli.",
  booking_summary: "Randevu özeti",
  service_label: "Hizmet",
  date_label: "Tarih",
  duration_label: "Toplam Süre",
  price_label: "Ücret",
  price_range_note: "(aralık)",
  deposit_pay_now: "Şimdi ödenecek kapora",
  iyzico_note: '"Randevu al ve kaporayı öde" butonuna bastığınızda iyzico güvenli ödeme sayfasına yönlendirileceksiniz.',
  err_name_phone: "Ad ve telefon gerekli.",
  err_email_deposit: "Kapora ödemesi için e-posta gerekli.",
  err_booking: "Randevu oluşturulamadı.",
  submitting: "Yönlendiriliyor...",
  book_btn: "Randevu al",
  book_with_deposit: (amt) => `Randevu al ve ${amt} kapora öde`,
  done_title: "Randevunuz alındı!",
  done_subtitle: "Randevunuz kesinleşti. Detaylar e-posta/WhatsApp ile iletildi.",
  hour_short: "sa",
  hour_long: "saat",
  minute_short: "dk",
  minute_long: "dakika",
  weekdays_short: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  months_short: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
  with_randevora: "Randevora ile güvenle randevu alın",
};

const en: BookingDict = {
  online_booking: "Online booking",
  step_service: "Service",
  step_employee: "Staff",
  step_datetime: "Date & Time",
  step_info: "Details",
  select_service: "Select a service",
  multi_select_hint: "(you can pick more than one)",
  variable_price: "May vary",
  deposit_label: "Deposit",
  services_selected: (n) => `${n} service${n === 1 ? "" : "s"} selected`,
  deposit_now: "Deposit due now",
  continue_btn: "Continue",
  back_btn: "Back",
  select_employee: "Select staff",
  default_staff_title: "Staff",
  select_date_time: "Select date and time",
  this_week: "This week",
  available_times: "Available times",
  total_duration: "Total duration",
  your_details: "Your details",
  full_name: "Full name",
  full_name_ph: "Your full name",
  phone: "Phone",
  phone_ph: "+90 5xx xxx xx xx",
  email: "Email",
  email_required: "*",
  email_optional: "(optional)",
  email_ph: "you@email.com",
  email_for_deposit: "Email is required for deposit payment.",
  booking_summary: "Booking summary",
  service_label: "Service",
  date_label: "Date",
  duration_label: "Total duration",
  price_label: "Price",
  price_range_note: "(range)",
  deposit_pay_now: "Deposit due now",
  iyzico_note: 'When you tap "Book and pay deposit" you will be redirected to iyzico secure checkout.',
  err_name_phone: "Name and phone are required.",
  err_email_deposit: "Email is required for deposit payment.",
  err_booking: "Could not create booking.",
  submitting: "Redirecting...",
  book_btn: "Book appointment",
  book_with_deposit: (amt) => `Book and pay ${amt} deposit`,
  done_title: "Your booking is confirmed!",
  done_subtitle: "Details have been sent via email/WhatsApp.",
  hour_short: "h",
  hour_long: "hour",
  minute_short: "min",
  minute_long: "minutes",
  weekdays_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  with_randevora: "Booked securely with Randevora",
};

const de: BookingDict = {
  online_booking: "Online-Buchung",
  step_service: "Dienst",
  step_employee: "Mitarbeiter",
  step_datetime: "Datum & Uhrzeit",
  step_info: "Daten",
  select_service: "Dienst wählen",
  multi_select_hint: "(Sie können mehrere wählen)",
  variable_price: "Kann variieren",
  deposit_label: "Anzahlung",
  services_selected: (n) => `${n} Dienst${n === 1 ? "" : "e"} ausgewählt`,
  deposit_now: "Jetzt fällige Anzahlung",
  continue_btn: "Weiter",
  back_btn: "Zurück",
  select_employee: "Mitarbeiter wählen",
  default_staff_title: "Mitarbeiter",
  select_date_time: "Datum und Uhrzeit wählen",
  this_week: "Diese Woche",
  available_times: "Verfügbare Zeiten",
  total_duration: "Gesamtdauer",
  your_details: "Ihre Angaben",
  full_name: "Name",
  full_name_ph: "Ihr vollständiger Name",
  phone: "Telefon",
  phone_ph: "+90 5xx xxx xx xx",
  email: "E-Mail",
  email_required: "*",
  email_optional: "(optional)",
  email_ph: "name@beispiel.de",
  email_for_deposit: "E-Mail ist für die Anzahlung erforderlich.",
  booking_summary: "Buchungsübersicht",
  service_label: "Dienst",
  date_label: "Datum",
  duration_label: "Gesamtdauer",
  price_label: "Preis",
  price_range_note: "(Bereich)",
  deposit_pay_now: "Jetzt fällige Anzahlung",
  iyzico_note: 'Bei Klick auf "Buchen und Anzahlung zahlen" werden Sie zur sicheren iyzico-Kasse weitergeleitet.',
  err_name_phone: "Name und Telefon sind erforderlich.",
  err_email_deposit: "E-Mail ist für die Anzahlung erforderlich.",
  err_booking: "Buchung konnte nicht erstellt werden.",
  submitting: "Weiterleitung...",
  book_btn: "Termin buchen",
  book_with_deposit: (amt) => `Buchen und ${amt} Anzahlung zahlen`,
  done_title: "Ihre Buchung ist bestätigt!",
  done_subtitle: "Details wurden per E-Mail/WhatsApp gesendet.",
  hour_short: "Std",
  hour_long: "Stunden",
  minute_short: "Min",
  minute_long: "Minuten",
  weekdays_short: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  months_short: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  with_randevora: "Sicher buchen mit Randevora",
};

const ru: BookingDict = {
  online_booking: "Онлайн-запись",
  step_service: "Услуга",
  step_employee: "Мастер",
  step_datetime: "Дата и время",
  step_info: "Данные",
  select_service: "Выберите услугу",
  multi_select_hint: "(можно выбрать несколько)",
  variable_price: "Может меняться",
  deposit_label: "Предоплата",
  services_selected: (n) => `Выбрано услуг: ${n}`,
  deposit_now: "К оплате сейчас",
  continue_btn: "Далее",
  back_btn: "Назад",
  select_employee: "Выберите мастера",
  default_staff_title: "Мастер",
  select_date_time: "Выберите дату и время",
  this_week: "На этой неделе",
  available_times: "Доступное время",
  total_duration: "Общая длительность",
  your_details: "Ваши данные",
  full_name: "Имя и фамилия",
  full_name_ph: "Ваше имя и фамилия",
  phone: "Телефон",
  phone_ph: "+90 5xx xxx xx xx",
  email: "E-mail",
  email_required: "*",
  email_optional: "(необязательно)",
  email_ph: "you@email.com",
  email_for_deposit: "E-mail необходим для оплаты предоплаты.",
  booking_summary: "Сводка записи",
  service_label: "Услуга",
  date_label: "Дата",
  duration_label: "Общая длительность",
  price_label: "Цена",
  price_range_note: "(диапазон)",
  deposit_pay_now: "К оплате сейчас",
  iyzico_note: 'Нажав «Записаться и оплатить предоплату», вы будете перенаправлены на безопасную страницу iyzico.',
  err_name_phone: "Укажите имя и телефон.",
  err_email_deposit: "E-mail необходим для оплаты предоплаты.",
  err_booking: "Не удалось создать запись.",
  submitting: "Перенаправление...",
  book_btn: "Записаться",
  book_with_deposit: (amt) => `Записаться и оплатить ${amt}`,
  done_title: "Запись подтверждена!",
  done_subtitle: "Детали отправлены по e-mail/WhatsApp.",
  hour_short: "ч",
  hour_long: "часов",
  minute_short: "мин",
  minute_long: "минут",
  weekdays_short: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  months_short: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  with_randevora: "Безопасная запись через Randevora",
};

export const DICTS: Record<BookingLang, BookingDict> = { tr, en, de, ru };

export function getDict(lang: BookingLang): BookingDict {
  return DICTS[lang] || DICTS.tr;
}
