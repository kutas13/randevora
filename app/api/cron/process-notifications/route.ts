import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/notifications/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATCH_SIZE = 30;
const MAX_ATTEMPTS = 3;

export async function GET(request: NextRequest) {
  // Yetkilendirme: Vercel cron veya manuel tetikleme icin secret
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (process.env.CRON_SECRET && auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const nowIso = new Date().toISOString();

  const { data: pending } = await admin
    .from("message_queue")
    .select("id, business_id, kind, channel, recipient, message, attempts")
    .eq("status", "pending")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (!pending || pending.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    await admin
      .from("message_queue")
      .update({ status: "sending" })
      .eq("id", row.id);

    const res = await sendNotification({
      recipient: row.recipient,
      message: row.message,
      channel: row.channel,
      businessId: row.business_id,
    });

    if (res.ok) {
      await admin
        .from("message_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: (row.attempts || 0) + 1,
        })
        .eq("id", row.id);
      sent++;
    } else {
      const attempts = (row.attempts || 0) + 1;
      const finalStatus = attempts >= MAX_ATTEMPTS ? "failed" : "pending";
      await admin
        .from("message_queue")
        .update({
          status: finalStatus,
          attempts,
          last_error: res.error || "unknown",
        })
        .eq("id", row.id);
      failed++;
    }
  }

  return NextResponse.json({ processed: pending.length, sent, failed });
}

// POST aynı isi yapar (manuel deneme icin)
export const POST = GET;
