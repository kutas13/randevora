"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, QrCode, RefreshCw, Save, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Status = {
  status: "disconnected" | "pending" | "connected";
  phone_number: string | null;
  connected_at: string | null;
  last_seen_at: string | null;
  qr_token: string | null;
  qr_expires_at: string | null;
  provider_configured: boolean;
};

type Templates = {
  customer_confirmation: string;
  customer_reminder_24h: string;
  customer_reminder_3h: string;
  employee_new_booking: string;
};

const TEMPLATE_LABELS: Record<keyof Templates, { label: string; description: string }> = {
  customer_confirmation: {
    label: "Müşteri – Randevu onayı",
    description: "Müşteri randevu alır almaz gönderilir.",
  },
  customer_reminder_24h: {
    label: "Müşteri – 24 saat önce hatırlatma",
    description: "Randevudan 24 saat önce müşteriye gönderilir.",
  },
  customer_reminder_3h: {
    label: "Müşteri – 3 saat önce hatırlatma",
    description: "Randevudan 3 saat önce müşteriye gönderilir.",
  },
  employee_new_booking: {
    label: "Çalışan – Yeni randevu bilgisi",
    description: "Aktif çalışanların hepsine yeni randevu olduğunda gönderilir.",
  },
};

const VARS_HINT = "Kullanabileceğin değişkenler: {customer_name}, {customer_phone}, {date}, {time}, {services}, {business_name}";

function qrUrl(token: string, size = 240) {
  // Worker (whatsapp-web.js) bu URL'i kendi auth token'i ile dolduracak.
  // Simdilik baglanti adresini kodluyoruz - worker ayagi yapilana kadar gostergedir.
  const data = `randevora://whatsapp-connect/${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`;
}

export function WhatsAppSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tpl, setTpl] = useState<Templates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [st, t] = await Promise.all([
        fetch("/api/whatsapp/status").then((r) => r.json()),
        fetch("/api/whatsapp/templates").then((r) => r.json()),
      ]);
      setStatus(st);
      setTpl(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function requestQr() {
    setRequesting(true);
    try {
      const res = await fetch("/api/whatsapp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_qr" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("QR oluşturulamadı: " + (data.error || ""), "error");
      } else {
        toast("QR hazır. Telefonundan tara.", "success");
        await load();
      }
    } finally {
      setRequesting(false);
    }
  }

  async function disconnect() {
    if (!confirm("WhatsApp bağlantısını kesmek istediğine emin misin?")) return;
    const res = await fetch("/api/whatsapp/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }),
    });
    if (!res.ok) {
      toast("Bağlantı kesilemedi.", "error");
      return;
    }
    toast("Bağlantı kesildi.", "success");
    await load();
  }

  async function saveTemplates() {
    if (!tpl) return;
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tpl),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("Şablon kaydedilemedi: " + (data.error || ""), "error");
      } else {
        toast("Şablonlar kaydedildi!", "success");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="glass animate-fade-in rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MessageCircle size={20} /> WhatsApp Bildirimleri
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">Yükleniyor...</p>
      </section>
    );
  }

  const isConnected = status?.status === "connected";
  const isPending = status?.status === "pending";
  const providerConfigured = status?.provider_configured ?? false;

  return (
    <section className="glass animate-fade-in rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle size={20} /> WhatsApp Bildirimleri
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Randevu onayı, 24 saat ve 3 saat öncesi hatırlatma müşteriye; yeni randevu bilgisi tüm çalışanlara otomatik WhatsApp ile gönderilir.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isConnected
              ? "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300"
              : isPending
                ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
          }`}
        >
          {isConnected ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
          {isConnected ? "Bağlı" : isPending ? "QR bekleniyor" : "Bağlı değil"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3">
          {isConnected ? (
            <div className="rounded-lg border border-green-500/20 bg-green-50 p-3 dark:bg-green-400/10">
              <p className="flex items-center gap-2 text-sm font-semibold text-green-800 dark:text-green-200">
                <Smartphone size={14} /> {status?.phone_number || "Bilinmiyor"}
              </p>
              <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                Bağlantı tarihi: {status?.connected_at ? new Date(status.connected_at).toLocaleString("tr-TR") : "—"}
              </p>
              <Button variant="ghost" onClick={disconnect} className="mt-3 h-9 px-3 text-sm text-red-600">
                <Trash2 size={14} /> Bağlantıyı kes
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
              <p className="text-sm">
                <strong>WhatsApp QR Kodu Oluştur</strong>&apos;a tıkla, telefondan WhatsApp uygulamasını aç →{" "}
                <em>Bağlı cihazlar → Cihaz bağla</em> ile QR&apos;ı okut. Bağlantı kurulunca tüm bildirimler otomatik WhatsApp&apos;tan gönderilir.
              </p>
              <Button onClick={requestQr} disabled={requesting} className="mt-3 h-10 px-4 text-sm">
                <RefreshCw size={14} className={requesting ? "animate-spin" : ""} />
                {isPending ? "Yeni QR oluştur" : "WhatsApp QR Kodu Oluştur"}
              </Button>
              {isPending && status?.qr_expires_at && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  QR son geçerlilik: {new Date(status.qr_expires_at).toLocaleTimeString("tr-TR")}
                </p>
              )}
            </div>
          )}

          {!providerConfigured && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
              <strong>Önemli:</strong> Şu an &quot;geliştirme modu&quot; aktif. Mesajlar kuyruğa atılıyor ama henüz gerçek WhatsApp&apos;a gönderilmiyor. Vercel&apos;de aşağıdaki ortam değişkenlerinden en az birini ayarladığında mesajlar canlıya geçer:
              <ul className="mt-2 grid gap-1 pl-4">
                <li>• <code>NOTIFY_WEBHOOK_URL</code> – kendi WhatsApp Web worker&apos;ın</li>
                <li>• <code>TWILIO_ACCOUNT_SID</code> + <code>TWILIO_AUTH_TOKEN</code> + <code>TWILIO_FROM</code> – Twilio WhatsApp Business</li>
                <li>• <code>META_WA_TOKEN</code> + <code>META_WA_PHONE_ID</code> – Meta Cloud API</li>
              </ul>
            </div>
          )}
        </div>

        {isPending && status?.qr_token && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl(status.qr_token)} alt="WhatsApp QR" width={200} height={200} className="rounded-md" />
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              <QrCode size={11} /> Telefondan tara
            </span>
          </div>
        )}
      </div>

      {/* Mesaj Sablonlari */}
      {tpl && (
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <h3 className="text-base font-bold">Mesaj şablonları</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">{VARS_HINT}</p>
          <div className="mt-4 grid gap-4">
            {(Object.keys(TEMPLATE_LABELS) as Array<keyof Templates>).map((key) => (
              <div key={key} className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                <label className="text-sm font-semibold">{TEMPLATE_LABELS[key].label}</label>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{TEMPLATE_LABELS[key].description}</p>
                <textarea
                  value={tpl[key]}
                  onChange={(e) => setTpl({ ...tpl, [key]: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--background)] p-2.5 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
            ))}
          </div>

          <Button onClick={saveTemplates} disabled={saving} className="mt-4">
            <Save size={16} /> {saving ? "Kaydediliyor..." : "Şablonları kaydet"}
          </Button>
        </div>
      )}
    </section>
  );
}
