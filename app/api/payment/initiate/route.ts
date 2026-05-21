import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { iyzicoInitiate, isIyzicoConfigured } from "@/lib/payment/iyzico";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (!isIyzicoConfigured()) {
    return NextResponse.json(
      { error: "Sanal POS henüz yapılandırılmamış. Yönetici iyzico API anahtarlarını eklemeli." },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { appointmentId } = body;
  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId gerekli" }, { status: 400 });
  }

  // Randevuyu cek
  const { data: apt, error: aptErr } = await admin
    .from("appointments")
    .select("id, business_id, customer_id, service_id, deposit_amount_cents, payment_status, starts_at")
    .eq("id", appointmentId)
    .single();

  if (aptErr || !apt) {
    return NextResponse.json({ error: "Randevu bulunamadi" }, { status: 404 });
  }

  if (apt.payment_status === "paid") {
    return NextResponse.json({ error: "Bu randevu icin odeme zaten alindi" }, { status: 400 });
  }

  if (!apt.deposit_amount_cents || apt.deposit_amount_cents <= 0) {
    return NextResponse.json({ error: "Bu randevu icin kapora gerekmiyor" }, { status: 400 });
  }

  // Musteri bilgilerini cek
  const { data: customer } = await admin
    .from("customers")
    .select("id, full_name, phone, email")
    .eq("id", apt.customer_id)
    .single();

  // Hizmet bilgisi
  const { data: service } = await admin
    .from("services")
    .select("id, name")
    .eq("id", apt.service_id)
    .single();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  const nameParts = (customer?.full_name || "Musteri Randevu").trim().split(/\s+/);
  const buyerName = nameParts[0] || "Musteri";
  const buyerSurname = nameParts.slice(1).join(" ") || "Randevu";

  const callbackBase =
    process.env.IYZICO_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback`;
  const callbackUrl = `${callbackBase}?aid=${appointmentId}`;

  const result = await iyzicoInitiate({
    conversationId: appointmentId,
    price: apt.deposit_amount_cents,
    buyer: {
      id: customer?.id || appointmentId,
      name: buyerName,
      surname: buyerSurname,
      email: customer?.email || "musteri@example.com",
      gsmNumber: customer?.phone?.startsWith("+") ? customer.phone : `+90${customer?.phone || "5555555555"}`,
      ip,
    },
    basketItems: [
      {
        id: service?.id || apt.service_id,
        name: `Kapora: ${service?.name || "Randevu"}`,
        category: "Randevu",
        price: apt.deposit_amount_cents,
      },
    ],
    callbackUrl,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Token'i sakla (callback'te dogrulama icin)
  await admin
    .from("appointments")
    .update({ payment_token: result.token, payment_status: "pending" })
    .eq("id", appointmentId);

  return NextResponse.json({
    success: true,
    paymentPageUrl: result.paymentPageUrl,
    token: result.token,
  });
}
