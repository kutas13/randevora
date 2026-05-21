/**
 * Bildirim gondericisi.
 *
 * Oncelik sirasi:
 *
 * 1) WHATSAPP_WORKER_URL  -> Baileys worker (multi-tenant, isletme basina)
 *    NOTIFY_WEBHOOK_SECRET ile auth.
 *    POST {WORKER}/sessions/<businessId>/send {recipient, message}
 *
 * 2) NOTIFY_WEBHOOK_URL   -> Tek-kiraciı eski webhook (geriye uyumluluk)
 *    POST {URL} {recipient, message, channel, businessId}
 *
 * 3) TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 * 4) META_WA_TOKEN + META_WA_PHONE_ID
 *
 * Hicbiri yapilandirilmamissa konsola log dusulur.
 */

import { isWorkerConfigured, workerSend } from "@/lib/whatsapp/worker-client";

type SendResult = { ok: boolean; error?: string; provider?: string };

type SendArgs = {
  recipient: string;
  message: string;
  channel?: string;
  businessId?: string | null;
};

export async function sendNotification(args: SendArgs): Promise<SendResult> {
  const { recipient, message, channel = "whatsapp", businessId } = args;

  // 1) Multi-tenant worker (her isletme kendi WhatsApp'i)
  if (isWorkerConfigured() && businessId && channel === "whatsapp") {
    const r = await workerSend(businessId, recipient, message);
    if (r.ok) return { ok: true, provider: "worker" };
    return { ok: false, error: r.error || "worker error", provider: "worker" };
  }

  // 2) Eski webhook
  if (process.env.NOTIFY_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.NOTIFY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NOTIFY_WEBHOOK_SECRET
            ? { Authorization: `Bearer ${process.env.NOTIFY_WEBHOOK_SECRET}` }
            : {}),
        },
        body: JSON.stringify({ recipient, message, channel, businessId }),
      });
      if (!res.ok) {
        return { ok: false, error: `webhook ${res.status}`, provider: "webhook" };
      }
      return { ok: true, provider: "webhook" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, provider: "webhook" };
    }
  }

  // 3) Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const from = process.env.TWILIO_FROM;
      const to = channel === "whatsapp" ? `whatsapp:${recipient}` : recipient;

      const body = new URLSearchParams({ From: from, To: to, Body: message });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, error: `twilio ${res.status} ${text.slice(0, 200)}`, provider: "twilio" };
      }
      return { ok: true, provider: "twilio" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, provider: "twilio" };
    }
  }

  // 4) Meta Cloud API
  if (channel === "whatsapp" && process.env.META_WA_TOKEN && process.env.META_WA_PHONE_ID) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${process.env.META_WA_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipient.replace(/^\+/, ""),
            type: "text",
            text: { body: message },
          }),
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, error: `meta ${res.status} ${text.slice(0, 200)}`, provider: "meta" };
      }
      return { ok: true, provider: "meta" };
    } catch (err) {
      return { ok: false, error: (err as Error).message, provider: "meta" };
    }
  }

  // 5) Dev mode
  console.log("[notifications:dev]", { recipient, channel, businessId, message: message.slice(0, 80) + "…" });
  return { ok: true, provider: "console" };
}

export function isAnyProviderConfigured(): boolean {
  return Boolean(
    isWorkerConfigured() ||
      process.env.NOTIFY_WEBHOOK_URL ||
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) ||
      (process.env.META_WA_TOKEN && process.env.META_WA_PHONE_ID),
  );
}
