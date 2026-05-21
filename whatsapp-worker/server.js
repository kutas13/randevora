/**
 * Randevora WhatsApp Worker (Multi-tenant)
 * -----------------------------------------
 * Baileys (WhatsApp Web) ile her isletmenin kendi WhatsApp hesabini bagladigi
 * cok kiracili bir HTTP servis. Vercel/Randevora dashboard'dan gelen istekleri
 * isletme bazinda yonetir.
 *
 * Endpoint'ler (tum POST'lar Bearer auth ister):
 *   POST   /sessions/:businessId/start          -> Session baslat (idempotent)
 *   GET    /sessions/:businessId/status         -> Baglanti durumu
 *   GET    /sessions/:businessId/qr             -> Aktif QR (PNG veya HTML)
 *   POST   /sessions/:businessId/pair {phone}   -> Pairing kodu iste
 *   POST   /sessions/:businessId/send {recipient, message}
 *   POST   /sessions/:businessId/logout         -> Oturumu kapat
 *   GET    /                                    -> Worker bilgisi
 *
 * Calistirma:
 *   1) cp .env.example .env
 *   2) npm install
 *   3) npm start
 */

import 'dotenv/config';
import { mkdir } from 'node:fs/promises';
import { rm } from 'node:fs/promises';
import express from 'express';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from 'baileys';

const PORT = Number(process.env.PORT || 3001);
const AUTH_SECRET = process.env.NOTIFY_WEBHOOK_SECRET || '';
const AUTH_ROOT = process.env.AUTH_DIR || './auth';

// Production'da JSON log, dev'de pino-pretty (varsa)
const usePretty = process.env.NODE_ENV !== 'production' && process.env.LOG_PRETTY !== '0';
let logger;
try {
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(usePretty ? { transport: { target: 'pino-pretty', options: { colorize: true } } } : {}),
  });
} catch {
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
}

// ---------- Per-business session state ----------
/** Map<businessId, { sock, qr, state, lastError, pairingCode }> */
const sessions = new Map();

function getOrCreateMeta(businessId) {
  let meta = sessions.get(businessId);
  if (!meta) {
    meta = { sock: null, qr: null, state: 'idle', lastError: null, pairingCode: null };
    sessions.set(businessId, meta);
  }
  return meta;
}

function sessionDir(businessId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(businessId)) {
    throw new Error('Gecersiz businessId');
  }
  return `${AUTH_ROOT}/${businessId}`;
}

async function startSession(businessId) {
  const meta = getOrCreateMeta(businessId);
  if (meta.sock && meta.state !== 'close') {
    return meta;
  }

  const dir = sessionDir(businessId);
  await mkdir(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();
  logger.info({ businessId, version: version.join('.') }, 'Session baslatiliyor');

  meta.state = 'starting';

  const sock = makeWASocket({
    version,
    logger: logger.child({ mod: 'baileys', bid: businessId }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
  });

  meta.sock = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;

    if (qr) {
      meta.qr = qr;
      meta.state = 'qr';
      logger.info({ businessId }, 'Yeni QR uretildi');
    }
    if (connection === 'connecting') {
      meta.state = 'connecting';
    }
    if (connection === 'open') {
      meta.qr = null;
      meta.state = 'open';
      meta.lastError = null;
      meta.pairingCode = null;
      const me = sock?.user;
      logger.info({ businessId, id: me?.id, name: me?.name }, 'WhatsApp baglandi');
    }
    if (connection === 'close') {
      meta.state = 'close';
      const reason = lastDisconnect?.error
        ? new Boom(lastDisconnect.error).output?.statusCode
        : null;
      meta.lastError = lastDisconnect?.error?.message || `code ${reason}`;
      const isLoggedOut = reason === DisconnectReason.loggedOut;
      logger.warn({ businessId, reason, isLoggedOut }, 'Baglanti kapandi');
      if (isLoggedOut) {
        // Logout: auth temizle ve session'i sifirla
        try {
          await rm(sessionDir(businessId), { recursive: true, force: true });
        } catch {}
        sessions.delete(businessId);
      } else {
        // Tekrar bagla
        setTimeout(() => {
          startSession(businessId).catch((e) => logger.error({ businessId, err: e.message }, 'reconnect hatasi'));
        }, 3000);
      }
    }
  });

  return meta;
}

// ---------- Express ----------
const app = express();
app.use(express.json({ limit: '256kb' }));

function requireAuth(req, res, next) {
  if (!AUTH_SECRET) return next();
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (token !== AUTH_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'randevora-whatsapp-worker',
    sessions: [...sessions.entries()].map(([bid, m]) => ({
      businessId: bid,
      state: m.state,
      user: m.sock?.user || null,
    })),
  });
});

// Session başlat (varsa idempotent)
app.post('/sessions/:businessId/start', requireAuth, async (req, res) => {
  try {
    const meta = await startSession(req.params.businessId);
    res.json({
      state: meta.state,
      user: meta.sock?.user || null,
      hasQr: !!meta.qr,
    });
  } catch (err) {
    logger.error({ err: err.message }, 'start hatasi');
    res.status(500).json({ error: err.message });
  }
});

// Status
app.get('/sessions/:businessId/status', requireAuth, async (req, res) => {
  const meta = sessions.get(req.params.businessId);
  if (!meta) return res.json({ state: 'idle', ready: false });
  res.json({
    state: meta.state,
    ready: meta.state === 'open',
    user: meta.sock?.user || null,
    lastError: meta.lastError,
    hasQr: !!meta.qr,
    pairingCode: meta.pairingCode,
  });
});

// QR (HTML render veya PNG)
app.get('/sessions/:businessId/qr', async (req, res) => {
  // QR endpoint'i auth gerektirmez (panele iframe gomulebilir)
  // Ama yine de hassas degil cunku QR aliciya ozel ve 20 sn yasiyor.
  const meta = sessions.get(req.params.businessId);
  if (!meta) {
    return res.status(404).json({ error: 'Session yok. Once /start cagrilmali.' });
  }
  if (meta.state === 'open') {
    return res.json({ state: 'open', message: 'Zaten bagli' });
  }
  if (!meta.qr) {
    return res.status(409).json({ error: 'QR henuz uretilmedi', state: meta.state });
  }

  const accept = String(req.headers.accept || '');
  const format = String(req.query.format || '');

  if (format === 'json') {
    const dataUrl = await QRCode.toDataURL(meta.qr, { margin: 1, scale: 6 });
    return res.json({ state: meta.state, dataUrl });
  }
  if (accept.includes('image/png') || format === 'png') {
    const png = await QRCode.toBuffer(meta.qr, { type: 'png', margin: 1, scale: 8 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(png);
  }

  const dataUrl = await QRCode.toDataURL(meta.qr, { margin: 1, scale: 6 });
  res.setHeader('Cache-Control', 'no-store');
  res.send(
    `<!doctype html><html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#fafafa">
      <h2>WhatsApp baglantisi</h2>
      <img src="${dataUrl}" style="width:340px;height:340px;border:1px solid #e5e5e5;border-radius:12px;padding:8px;background:#fff" />
      <p style="margin-top:16px;color:#666">WhatsApp uygulamasi &rarr; Ayarlar &rarr; Bagli cihazlar &rarr; Cihaz baglayin</p>
      <p style="color:#999;font-size:12px">QR ~20 sn'de bir yenilenir.</p>
    </body></html>`
  );
});

// Pairing kodu iste
app.post('/sessions/:businessId/pair', requireAuth, async (req, res) => {
  try {
    const meta = await startSession(req.params.businessId);
    if (meta.state === 'open') return res.status(409).json({ error: 'Zaten bagli' });
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone gerekli' });
    const digits = String(phone).replace(/\D/g, '');
    if (!meta.sock) return res.status(503).json({ error: 'Socket hazir degil' });
    const code = await meta.sock.requestPairingCode(digits);
    meta.pairingCode = code;
    res.json({ pairingCode: code });
  } catch (err) {
    logger.error({ err: err.message }, 'pair hatasi');
    res.status(500).json({ error: err.message });
  }
});

// Mesaj gonder
app.post('/sessions/:businessId/send', requireAuth, async (req, res) => {
  try {
    const meta = sessions.get(req.params.businessId);
    if (!meta || meta.state !== 'open') {
      return res.status(503).json({ error: 'WhatsApp bagli degil', state: meta?.state || 'idle' });
    }
    const { recipient, message, channel } = req.body || {};
    if (!recipient || !message) return res.status(400).json({ error: 'recipient ve message gerekli' });
    if (channel && channel !== 'whatsapp') {
      return res.status(400).json({ error: `Sadece whatsapp destekleniyor, alindi: ${channel}` });
    }
    const digits = String(recipient).replace(/\D/g, '');
    if (!digits) return res.status(400).json({ error: 'recipient gecersiz' });
    const jid = `${digits}@s.whatsapp.net`;
    await meta.sock.sendMessage(jid, { text: String(message) });
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err: err.message }, 'send hatasi');
    res.status(500).json({ error: err.message });
  }
});

// Logout
app.post('/sessions/:businessId/logout', requireAuth, async (req, res) => {
  try {
    const meta = sessions.get(req.params.businessId);
    if (!meta) return res.json({ ok: true });
    try {
      if (meta.sock) await meta.sock.logout();
    } catch {}
    try {
      await rm(sessionDir(req.params.businessId), { recursive: true, force: true });
    } catch {}
    sessions.delete(req.params.businessId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Internal scheduler ----------
// Vercel cron Hobby'de gunde 1 kez calisir. Bizim isimiz daha hassas:
// randevu saatlerine gore (24h/2h once) hatirlatma gondermek.
// Worker zaten 24/7 ayakta oldugu icin DB'yi kendisi periyodik tarayip
// "scheduled_at <= now" olan kayitlari Randevora'nin cron endpoint'ine
// vurarak gondertir.
const RANDEVORA_URL = (process.env.RANDEVORA_URL || '').replace(/\/+$/, '');
const CRON_SECRET = process.env.CRON_SECRET || '';
const SCHEDULER_INTERVAL_MS = Number(process.env.SCHEDULER_INTERVAL_MS || 60_000);

async function pollDueNotifications() {
  if (!RANDEVORA_URL) return;
  try {
    const res = await fetch(`${RANDEVORA_URL}/api/cron/process-notifications`, {
      method: 'GET',
      headers: CRON_SECRET ? { Authorization: `Bearer ${CRON_SECRET}` } : {},
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && (data.processed || 0) > 0) {
        logger.info({ ...data }, 'Bildirim islendi');
      }
    } else {
      logger.warn({ status: res.status }, 'cron endpoint yanit hatasi');
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'cron poll hatasi');
  }
}

// ---------- Run ----------
app.listen(PORT, () => {
  logger.info({ port: PORT, interval_ms: SCHEDULER_INTERVAL_MS }, 'WhatsApp worker dinleniyor');
  if (RANDEVORA_URL) {
    logger.info({ url: RANDEVORA_URL }, 'Internal scheduler aktif');
    setInterval(pollDueNotifications, SCHEDULER_INTERVAL_MS);
    // Acilista da hemen bir kez tara
    setTimeout(pollDueNotifications, 5_000);
  } else {
    logger.warn('RANDEVORA_URL tanimsiz; internal scheduler kapali');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM alindi, kapaniyor');
  process.exit(0);
});
