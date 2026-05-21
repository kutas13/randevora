import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.WHATSAPP_WORKER_URL || "";
  const secret = process.env.NOTIFY_WEBHOOK_SECRET || "";

  if (!url) {
    return NextResponse.json({ error: "WHATSAPP_WORKER_URL bos" });
  }

  const normalized = url.replace(/\/+$/, "");
  const out: any = {
    worker_url_set: true,
    worker_url_length: url.length,
    worker_url_normalized_length: normalized.length,
    worker_url_starts_with_https: url.startsWith("https://"),
    secret_set: !!secret,
    secret_length: secret.length,
    test_business_id: "debug-test-123",
  };

  // Root endpoint test (no auth)
  try {
    const r1 = await fetch(`${normalized}/`, { cache: "no-store" });
    out.root_status = r1.status;
    out.root_body = (await r1.text()).slice(0, 300);
  } catch (e: any) {
    out.root_error = e?.message || "unknown";
  }

  // Status endpoint test (auth)
  try {
    const r2 = await fetch(`${normalized}/sessions/debug-test-123/status`, {
      method: "GET",
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
      cache: "no-store",
    });
    out.status_endpoint_code = r2.status;
    out.status_endpoint_body = (await r2.text()).slice(0, 300);
  } catch (e: any) {
    out.status_endpoint_error = e?.message || "unknown";
  }

  return NextResponse.json(out);
}
