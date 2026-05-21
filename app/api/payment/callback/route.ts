import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { iyzicoVerify } from "@/lib/payment/iyzico";

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

  return NextResponse.redirect(`${base}/booking-complete?status=success&aid=${aid}`);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
