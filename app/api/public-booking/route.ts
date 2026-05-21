import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { queueAppointmentNotifications } from "@/lib/notifications/queue";

export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const body = await request.json();
  const {
    businessId,
    name,
    phone,
    email,
    serviceId,
    employeeId,
    startsAt,
    endsAt,
    priceCents,
    serviceIds,
  } = body;

  if (!businessId || !name || !phone || !serviceId || !employeeId || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  }

  // Secilen hizmetlerin kapora toplamini hesapla
  const ids: string[] = Array.isArray(serviceIds) && serviceIds.length > 0 ? serviceIds : [serviceId];
  const { data: svcRows } = await admin
    .from("services")
    .select("id, name, deposit_cents, price_cents, latest_booking_time")
    .in("id", ids)
    .eq("business_id", businessId);

  const services = svcRows || [];
  const depositTotal = services.reduce((sum, s) => sum + (s.deposit_cents || 0), 0);

  // En gec randevu saati kontrolu
  const startDate = new Date(startsAt);
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  for (const s of services) {
    if (!s.latest_booking_time) continue;
    const parts = String(s.latest_booking_time).split(":");
    const limit = (parseInt(parts[0] || "0") || 0) * 60 + (parseInt(parts[1] || "0") || 0);
    if (startMinutes > limit) {
      return NextResponse.json(
        { error: `"${s.name}" hizmeti için en geç ${String(s.latest_booking_time).slice(0, 5)} saatine kadar randevu alabilirsiniz.` },
        { status: 400 },
      );
    }
  }

  // Musteri olustur/guncelle
  const { data: customer, error: custErr } = await admin
    .from("customers")
    .upsert(
      { full_name: name, phone, email: email || null, business_id: businessId },
      { onConflict: "business_id,phone" },
    )
    .select("id")
    .single();

  if (custErr || !customer) {
    return NextResponse.json(
      { error: "Müşteri kaydı oluşturulamadı: " + (custErr?.message || "") },
      { status: 500 },
    );
  }

  // Randevu olustur — kapora olsa bile direkt CONFIRMED.
  // Kapora /api/payment/callback'da ayrica islenir (payment_status).
  const paymentStatus = depositTotal > 0 ? "pending" : "none";

  const { data: appointment, error: aptErr } = await admin
    .from("appointments")
    .insert({
      business_id: businessId,
      customer_id: customer.id,
      service_id: serviceId,
      employee_id: employeeId,
      starts_at: startsAt,
      ends_at: endsAt,
      price_cents: priceCents || 0,
      status: "confirmed",
      deposit_amount_cents: depositTotal,
      payment_status: paymentStatus,
      customer_email: email || null,
    })
    .select("id")
    .single();

  if (aptErr || !appointment) {
    return NextResponse.json({ error: "Randevu oluşturulamadı: " + (aptErr?.message || "") }, { status: 500 });
  }

  // Bildirimleri her durumda kuyruga ekle (kapora olsa da olmasa da)
  try {
    const { data: biz } = await admin
      .from("businesses")
      .select("name")
      .eq("id", businessId)
      .single();

    const { data: emps } = await admin
      .from("employees")
      .select("id, phone")
      .eq("business_id", businessId)
      .eq("active", true);

    const start = new Date(startsAt);
    const TZ = "Europe/Istanbul";
    const date = start.toLocaleDateString("tr-TR", { timeZone: TZ });
    const time = start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
    const serviceNames = services.map((s) => s.name).join(", ");

    await queueAppointmentNotifications({
      admin,
      businessId,
      appointmentId: appointment.id,
      customerName: name,
      customerPhone: phone,
      date,
      time,
      services: serviceNames,
      businessName: biz?.name || "İşletme",
      startsAt,
      employeePhones: (emps || []).map((e) => e.phone).filter((p): p is string => !!p),
    });
  } catch (err) {
    console.error("[public-booking] notification queue failed:", err);
  }

  return NextResponse.json({
    success: true,
    appointmentId: appointment.id,
    customerId: customer.id,
    depositCents: depositTotal,
    requiresPayment: depositTotal > 0,
    services: services.map((s) => ({ id: s.id, name: s.name, deposit: s.deposit_cents || 0 })),
  });
}
