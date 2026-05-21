import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isWorkerConfigured, workerQrDataUrl, workerStart } from "@/lib/whatsapp/worker-client";

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

export async function GET() {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!isWorkerConfigured()) {
    return NextResponse.json(
      { error: "worker_not_configured", message: "WHATSAPP_WORKER_URL tanimli degil" },
      { status: 503 },
    );
  }

  // Idempotent: yoksa baslat
  await workerStart(businessId);

  // 5 sn boyunca QR'i bekle (QR uretimi 1-2 sn surer)
  const deadline = Date.now() + 5000;
  let last: { dataUrl: string; state: string } | null = null;
  while (Date.now() < deadline) {
    last = await workerQrDataUrl(businessId);
    if (last?.dataUrl) break;
    if (last?.state === "open") break;
    await new Promise((r) => setTimeout(r, 350));
  }

  if (!last) {
    return NextResponse.json({ error: "worker_unreachable" }, { status: 503 });
  }

  if (last.state === "open") {
    return NextResponse.json({ state: "open" });
  }
  if (!last.dataUrl) {
    return NextResponse.json({ state: last.state, error: "qr_not_ready" }, { status: 202 });
  }

  return NextResponse.json({ state: last.state, dataUrl: last.dataUrl });
}
