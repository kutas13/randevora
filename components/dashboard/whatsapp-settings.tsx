"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  Save,
  ShieldAlert,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Status = {
  status: "disconnected" | "pending" | "connected";
  phone_number: string | null;
  connected_at: string | null;
  last_seen_at: string | null;
  worker_state: "idle" | "starting" | "qr" | "connecting" | "open" | "close" | null;
  worker_configured: boolean;
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

const VARS_HINT =
  "Kullanabileceğin değişkenler: {customer_name}, {customer_phone}, {date}, {time}, {services}, {business_name}";

export function WhatsAppSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tpl, setTpl] = useState<Templates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showQrPanel, setShowQrPanel] = useState(false);
  const { toast } = useToast();
  const pollerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    load();
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, []);

  async function load() {
    try {
      const [st, t] = await Promise.all([
        fetch("/api/whatsapp/status", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/whatsapp/templates", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setStatus(st);
      setTpl(t);
      if (st.status === "connected") {
        setShowQrPanel(false);
        setQrDataUrl(null);
        stopPolling();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startPolling() {
    if (pollerRef.current) clearInterval(pollerRef.current);
    pollerRef.current = setInterval(async () => {
      try {
        const [stRes, qrRes] = await Promise.all([
          fetch("/api/whatsapp/status", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/whatsapp/qr", { cache: "no-store" }).then(async (r) => ({
            ok: r.ok,
            status: r.status,
            data: r.ok ? await r.json() : null,
          })),
        ]);
        setStatus(stRes);

        if (stRes.status === "connected") {
          stopPolling();
          setShowQrPanel(false);
          setQrDataUrl(null);
          toast("WhatsApp bağlandı!", "success");
          return;
        }

        if (qrRes.ok && qrRes.data?.dataUrl) {
          setQrDataUrl(qrRes.data.dataUrl);
        }
      } catch {}
    }, 2500);
  }

  function stopPolling() {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }

  async function requestQr() {
    setRequesting(true);
    setShowQrPanel(true);
    try {
      const res = await fetch("/api/whatsapp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_qr" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "QR oluşturulamadı", "error");
        setShowQrPanel(false);
        setRequesting(false);
        return;
      }

      setQrLoading(true);
      // QR'i cek
      const qrRes = await fetch("/api/whatsapp/qr", { cache: "no-store" });
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        if (qrData.dataUrl) setQrDataUrl(qrData.dataUrl);
      }
      setQrLoading(false);

      // Polling baslat
      startPolling();
    } catch (err: any) {
      toast(err?.message || "Hata", "error");
    } finally {
      setRequesting(false);
    }
  }

  async function disconnect() {
    if (!confirm("WhatsApp bağlantısını kesmek istediğine emin misin?")) return;
    stopPolling();
    const res = await fetch("/api/whatsapp/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }),
    });
    if (!res.ok) {
      toast("Bağlantı kesilemedi.", "error");
      return;
    }
    setQrDataUrl(null);
    setShowQrPanel(false);
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
      <section className="glass animate-fade-in rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MessageCircle size={20} /> WhatsApp Bildirimleri
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">Yükleniyor...</p>
      </section>
    );
  }

  const isConnected = status?.status === "connected";
  const isPending = status?.status === "pending" || showQrPanel;
  const workerOk = status?.worker_configured ?? false;

  return (
    <section className="glass animate-fade-in rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle size={20} /> WhatsApp Bildirimleri
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Randevu onayı, 24 saat ve 3 saat öncesi hatırlatma müşteriye; yeni randevu bilgisi tüm
            çalışanlara otomatik WhatsApp ile gönderilir.
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
          {isConnected ? <CheckCircle2 size={12} /> : isPending ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
          {isConnected ? "Bağlı" : isPending ? "QR bekleniyor" : "Bağlı değil"}
        </span>
      </div>

      {/* Worker olmayinca uyari */}
      {!workerOk && !isConnected && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <strong>WhatsApp worker tanımlı değil.</strong> WhatsApp bağlantısı için bir Baileys worker
          (bkz. <code>whatsapp-worker/</code>) deploy edip Vercel&apos;e şu env&apos;leri ekleyin:
          <ul className="mt-2 grid gap-1 pl-4">
            <li>• <code>WHATSAPP_WORKER_URL=https://worker-adresin/</code></li>
            <li>• <code>NOTIFY_WEBHOOK_SECRET=&lt;güçlü-anahtar&gt;</code> (worker ile aynı)</li>
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3">
          {isConnected ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 dark:bg-emerald-400/10">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                <Smartphone size={14} /> {status?.phone_number || "Bağlı numara"}
              </p>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Bağlantı tarihi: {status?.connected_at ? new Date(status.connected_at).toLocaleString("tr-TR") : "—"}
              </p>
              <Button variant="ghost" onClick={disconnect} className="mt-3 h-9 px-3 text-sm text-red-600">
                <Trash2 size={14} /> Bağlantıyı kes
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
              <p className="text-sm leading-6">
                <strong>WhatsApp bağla</strong> butonuna tıkla → telefonundan WhatsApp uygulamasını aç →{" "}
                <em>Ayarlar → Bağlı cihazlar → Cihaz bağla</em> ile QR&apos;ı okut. Bağlantı kurulunca
                tüm bildirimler otomatik WhatsApp&apos;tan gönderilir.
              </p>
              <Button
                onClick={requestQr}
                disabled={requesting || !workerOk}
                className="mt-3 h-11 px-5 text-sm"
              >
                <RefreshCw size={14} className={requesting ? "animate-spin" : ""} />
                {showQrPanel ? "Yeni QR oluştur" : "WhatsApp bağla"}
              </Button>
            </div>
          )}
        </div>

        {/* QR Paneli */}
        {showQrPanel && !isConnected && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm dark:bg-neutral-900">
            {qrLoading || (!qrDataUrl && !isConnected) ? (
              <div className="grid size-[220px] place-items-center text-[var(--muted)]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="text-[11px]">QR oluşturuluyor…</span>
                </div>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl!} alt="WhatsApp QR" width={220} height={220} className="rounded-lg" />
            )}
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              <QrCode size={11} /> Telefondan tara
            </span>
            <p className="max-w-[220px] text-center text-[10px] leading-4 text-[var(--muted)]">
              QR ~20 sn&apos;de bir yenilenir. Bağlantı kurulduğunda otomatik bağlı duruma geçer.
            </p>
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
              <div key={key} className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                <label className="text-sm font-semibold">{TEMPLATE_LABELS[key].label}</label>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{TEMPLATE_LABELS[key].description}</p>
                <textarea
                  value={tpl[key]}
                  onChange={(e) => setTpl({ ...tpl, [key]: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] p-2.5 text-sm outline-none focus:border-[var(--accent)]"
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
