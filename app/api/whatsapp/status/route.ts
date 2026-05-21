import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAnyProviderConfigured } from "@/lib/notifications/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveBusinessId(): Promise<string | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", user.id)
    .single();
  return profile?.business_id || null;
}

export async function GET() {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await admin
    .from("business_whatsapp")
    .select("status, phone_number, connected_at, last_seen_at, qr_token, qr_expires_at")
    .eq("business_id", businessId)
    .maybeSingle();

  return NextResponse.json({
    status: data?.status || "disconnected",
    phone_number: data?.phone_number || null,
    connected_at: data?.connected_at || null,
    last_seen_at: data?.last_seen_at || null,
    qr_token: data?.qr_token || null,
    qr_expires_at: data?.qr_expires_at || null,
    provider_configured: isAnyProviderConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (action === "request_qr") {
    // QR baglanti tokeni olustur. Worker bu tokeni okuyup gercek QR'i bagliyor.
    // Worker yoksa simdilik baglanti URL'i olarak doner.
    const token = `${businessId}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await admin
      .from("business_whatsapp")
      .upsert({
        business_id: businessId,
        status: "pending",
        qr_token: token,
        qr_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      });
    return NextResponse.json({ ok: true, qr_token: token, qr_expires_at: expiresAt });
  }

  if (action === "disconnect") {
    await admin
      .from("business_whatsapp")
      .upsert({
        business_id: businessId,
        status: "disconnected",
        phone_number: null,
        session_id: null,
        connected_at: null,
        qr_token: null,
        qr_expires_at: null,
        updated_at: new Date().toISOString(),
      });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
