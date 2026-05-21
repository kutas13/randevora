import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAnyProviderConfigured } from "@/lib/notifications/sender";
import {
  isWorkerConfigured,
  workerLogout,
  workerStart,
  workerStatus,
} from "@/lib/whatsapp/worker-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveBusinessId(): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", user.id)
    .single();
  return profile?.business_id || null;
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await admin()
    .from("business_whatsapp")
    .select("status, phone_number, connected_at, last_seen_at")
    .eq("business_id", businessId)
    .maybeSingle();

  // Worker varsa canli durumu al
  let workerState: string | null = null;
  let workerUser: any = null;
  if (isWorkerConfigured()) {
    const w = await workerStatus(businessId);
    if (w) {
      workerState = w.state;
      workerUser = w.user || null;
      // DB ile esitle
      let dbStatus: "disconnected" | "pending" | "connected" = "disconnected";
      if (w.state === "open") dbStatus = "connected";
      else if (w.state === "qr" || w.state === "starting" || w.state === "connecting") dbStatus = "pending";

      const phoneNumber = workerUser?.id ? String(workerUser.id).split(":")[0].split("@")[0] : data?.phone_number || null;

      if (dbStatus !== (data?.status as string)) {
        await admin()
          .from("business_whatsapp")
          .upsert({
            business_id: businessId,
            status: dbStatus,
            phone_number: phoneNumber,
            connected_at: dbStatus === "connected" ? new Date().toISOString() : data?.connected_at || null,
            updated_at: new Date().toISOString(),
          });
      }
    }
  }

  // DB'den guncel veriyi al
  const { data: fresh } = await admin()
    .from("business_whatsapp")
    .select("status, phone_number, connected_at, last_seen_at")
    .eq("business_id", businessId)
    .maybeSingle();

  return NextResponse.json({
    status: fresh?.status || "disconnected",
    phone_number: fresh?.phone_number || null,
    connected_at: fresh?.connected_at || null,
    last_seen_at: fresh?.last_seen_at || null,
    worker_state: workerState,
    worker_configured: isWorkerConfigured(),
    provider_configured: isAnyProviderConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action === "request_qr") {
    if (!isWorkerConfigured()) {
      return NextResponse.json(
        {
          error:
            "Worker yapilandirilmamis. Vercel'e WHATSAPP_WORKER_URL ve NOTIFY_WEBHOOK_SECRET env degiskenlerini ekleyin.",
        },
        { status: 503 },
      );
    }

    const w = await workerStart(businessId);
    if (!w) {
      return NextResponse.json(
        { error: "Worker'a ulasilamadi. Worker calisiyor mu?" },
        { status: 503 },
      );
    }

    await admin()
      .from("business_whatsapp")
      .upsert({
        business_id: businessId,
        status: "pending",
        qr_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ ok: true, state: w.state });
  }

  if (action === "disconnect") {
    if (isWorkerConfigured()) {
      await workerLogout(businessId);
    }
    await admin()
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
