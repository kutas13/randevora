import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { iyzicoVerify } from "@/lib/payment/iyzico";
import { queueAppointmentNotifications } from "@/lib/notifications/queue";

export const runtime = "nodejs";

async function handle(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const url = new URL(request.url);
  const aid = url.searchParams.get("aid");

  let token = url.searchParams.get("token");
  if (!token) {
    try {
      const form = await request.formData();
      token = form.get("token")?.toString() || null;
    } catch {}
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  if (!token || !aid) {
    return NextResponse.redirect(`${base}/booking-complete?status=error&reason=missing_token`);
  }

  const result = await iyzicoVerify(token);

  if (!result.ok) {
    await admin.from("appointments").update({ payment_status: "failed" }).eq("id", aid);
    return NextResponse.redirect(`${base}/booking-complete?status=error&reason=verify_failed`);
  }

  if (result.status !== "SUCCESS") {
    await admin.from("appointments").update({ payment_status: "failed" }).eq("id", aid);
    return NextResponse.redirect(`${base}/booking-complete?status=failed&aid=${aid}`);
  }

  await admin
    .from("appointments")
    .update({
      payment_status: "paid",
      payment_ref: result.paymentId,
      status: "confirmed",
    })
    .eq("id", aid);

  // Odeme basarili - bildirimleri kuyruga ekle
  try {
    const { data: apt } = await admin
      .from("appointments")
      .select("id, business_id, starts_at, customer_id, customer_email")
      .eq("id", aid)
      .single();

    if (apt) {
      const [bizRes, custRes, empRes] = await Promise.all([
        admin.from("businesses").select("name").eq("id", apt.business_id).single(),
        admin.from("customers").select("full_name, phone").eq("id", apt.customer_id).maybeSingle(),
        admin
          .from("employees")
          .select("phone")
          .eq("business_id", apt.business_id)
          .eq("active", true),
      ]);

      const start = new Date(apt.starts_at);
      const date = start.toLocaleDateString("tr-TR");
      const time = start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

      // Hizmetleri al
      const { data: aptDetails } = await admin
        .from("appointments")
        .select("service_id")
        .eq("id", aid)
        .single();
      let serviceNames = "Hizmet";
      if (aptDetails?.service_id) {
        const { data: svc } = await admin
          .from("services")
          .select("name")
          .eq("id", aptDetails.service_id)
          .single();
        if (svc) serviceNames = svc.name;
      }

      if (custRes.data) {
        await queueAppointmentNotifications({
          admin,
          businessId: apt.business_id,
          appointmentId: apt.id,
          customerName: custRes.data.full_name,
          customerPhone: custRes.data.phone || "",
          date,
          time,
          services: serviceNames,
          businessName: bizRes.data?.name || "İşletme",
          startsAt: apt.starts_at,
          employeePhones: (empRes.data || []).map((e) => e.phone).filter((p): p is string => !!p),
        });
      }
    }
  } catch (err) {
    console.error("[payment/callback] notification queue failed:", err);
  }

  return NextResponse.redirect(`${base}/booking-complete?status=success&aid=${aid}`);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
