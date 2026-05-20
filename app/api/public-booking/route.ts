import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const body = await request.json();
  const { businessId, name, phone, serviceId, employeeId, startsAt, endsAt, priceCents } = body;

  if (!businessId || !name || !phone || !serviceId || !employeeId || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  }

  // Müşteri oluştur veya güncelle
  const { data: customer, error: custErr } = await admin
    .from("customers")
    .upsert(
      { full_name: name, phone, business_id: businessId },
      { onConflict: "business_id,phone" }
    )
    .select("id")
    .single();

  if (custErr || !customer) {
    return NextResponse.json({ error: "Müşteri kaydı oluşturulamadı: " + (custErr?.message || "") }, { status: 500 });
  }

  // Randevu oluştur
  const { error: aptErr } = await admin.from("appointments").insert({
    business_id: businessId,
    customer_id: customer.id,
    service_id: serviceId,
    employee_id: employeeId,
    starts_at: startsAt,
    ends_at: endsAt,
    price_cents: priceCents || 0,
    status: "pending",
  });

  if (aptErr) {
    return NextResponse.json({ error: "Randevu oluşturulamadı: " + aptErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
