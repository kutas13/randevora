/**
 * Bildirim gondericisi.
 *
 * Mevcut sistem 3 olasi WhatsApp/SMS gateway turunu destekler. ENV ile yapilandirilir:
 *
 * 1) Webhook (kendi worker'iniz - whatsapp-web.js, baileys vb.):
 *    NOTIFY_WEBHOOK_URL=https://your-worker.com/send
 *    NOTIFY_WEBHOOK_SECRET=...
 *    POST body: { recipient, message, channel, businessId }
 *
 * 2) Twilio (WhatsApp Business / SMS):
 *    TWILIO_ACCOUNT_SID=...
 *    TWILIO_AUTH_TOKEN=...
 *    TWILIO_FROM=whatsapp:+14155238886
 *
 * 3) Meta Cloud API:
 *    META_WA_TOKEN=...
 *    META_WA_PHONE_ID=...
 *
 * Hicbiri yapilandirilmamissa konsola log dusulur (gelistirme modu).
 */

type SendResult = { ok: boolean; error?: string; provider?: string };

type SendArgs = {
  recipient: string;
  message: string;
  channel?: string;
  businessId?: string | null;
};

export async function sendNotification(args: SendArgs): Promise<SendResult> {
  const { recipient, message, channel = "whatsapp", businessId } = args;

  // 1) Webhook
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

  // 2) Twilio
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

  // 3) Meta Cloud API (sadece WhatsApp icin)
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

  // 4) Geliştirme modu: konsola yaz, basarilı say
  console.log("[notifications:dev]", { recipient, channel, message: message.slice(0, 80) + "…" });
  return { ok: true, provider: "console" };
}

export function isAnyProviderConfigured(): boolean {
  return Boolean(
    process.env.NOTIFY_WEBHOOK_URL ||
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) ||
      (process.env.META_WA_TOKEN && process.env.META_WA_PHONE_ID),
  );
}
