/**
 * Worker tarafiyla konusan kuçuk istemci.
 * WHATSAPP_WORKER_URL ve NOTIFY_WEBHOOK_SECRET env'leri bekler.
 */

const WORKER_URL = (process.env.WHATSAPP_WORKER_URL || "").replace(/\/+$/, "");
const SECRET = process.env.NOTIFY_WEBHOOK_SECRET || "";

export function isWorkerConfigured(): boolean {
  return Boolean(WORKER_URL);
}

type WorkerStatus = {
  state: "idle" | "starting" | "qr" | "connecting" | "open" | "close";
  ready: boolean;
  user?: { id?: string; name?: string } | null;
  lastError?: string | null;
  hasQr?: boolean;
  pairingCode?: string | null;
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (SECRET) headers["Authorization"] = `Bearer ${SECRET}`;
  return headers;
}

export async function workerStart(businessId: string): Promise<WorkerStatus | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/sessions/${businessId}/start`, {
      method: "POST",
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as WorkerStatus;
  } catch {
    return null;
  }
}

export async function workerStatus(businessId: string): Promise<WorkerStatus | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/sessions/${businessId}/status`, {
      method: "GET",
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as WorkerStatus;
  } catch {
    return null;
  }
}

export async function workerQrDataUrl(businessId: string): Promise<{ dataUrl: string; state: string } | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/sessions/${businessId}/qr?format=json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { dataUrl: string; state: string };
  } catch {
    return null;
  }
}

export async function workerLogout(businessId: string): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/sessions/${businessId}/logout`, {
      method: "POST",
      headers: authHeaders(),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function workerSend(businessId: string, recipient: string, message: string): Promise<{ ok: boolean; error?: string }> {
  if (!WORKER_URL) return { ok: false, error: "worker not configured" };
  try {
    const res = await fetch(`${WORKER_URL}/sessions/${businessId}/send`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ recipient, message, channel: "whatsapp" }),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `worker ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
