/**
 * Randevora WhatsApp Worker
 * -------------------------
 * Baileys (WhatsApp Web) ile WhatsApp Web'e baglanan kucuk HTTP servis.
 * Vercel/Next.js tarafindan `NOTIFY_WEBHOOK_URL`'e gelen POST'lari karsilar
 * ve WhatsApp mesaji olarak gonderir.
 *
 * Calistirma:
 *   1) cp .env.example .env  -> degerleri doldur
 *   2) npm install
 *   3) npm start
 *   4) GET http://localhost:3001/qr  -> QR kodu okut, WhatsApp Web baglansin
 *
 * Endpoint'ler:
 *   GET  /status              -> baglanti durumu
 *   GET  /qr                  -> guncel QR (PNG data URL) veya pairing kodu
 *   POST /pair   {phone}      -> 8 haneli pairing kodu iste (telefon: +9054... gibi)
 *   POST /send   {recipient,message}  -> mesaj gonder (Bearer auth)
 *   POST /logout              -> oturumu kapat
 */

import 'dotenv/config';
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
const AUTH_DIR = process.env.AUTH_DIR || './auth';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

// ---------- State ----------
let sock = null;
let currentQr = null;
let connectionState = 'starting'; // starting | qr | connecting | open | close
let lastError = null;
let lastPairingCode = null;

// ---------- Helpers ----------
function formatJid(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) throw new Error('Bos telefon');
  return `${digits}@s.whatsapp.net`;
}

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  logger.info({ version: version.join('.') }, 'Baileys baglaniyor');

  sock = makeWASocket({
    version,
    logger: logger.child({ mod: 'baileys' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;

    if (qr) {
      currentQr = qr;
      connectionState = 'qr';
      logger.info('Yeni QR uretildi. GET /qr ile alabilirsin.');
    }

    if (connection === 'connecting') {
      connectionState = 'connecting';
    }

    if (connection === 'open') {
      currentQr = null;
      connectionState = 'open';
      lastError = null;
      lastPairingCode = null;
      const me = sock?.user;
      logger.info({ id: me?.id, name: me?.name }, 'WhatsApp baglandi');
    }

    if (connection === 'close') {
      connectionState = 'close';
      const reason = lastDisconnect?.error
        ? new Boom(lastDisconnect.error).output?.statusCode
        : null;
      lastError = lastDisconnect?.error?.message || `code ${reason}`;
      const isLoggedOut = reason === DisconnectReason.loggedOut;
      logger.warn({ reason, isLoggedOut }, 'Baglanti kapandi');
      if (!isLoggedOut) {
        setTimeout(() => startSock().catch((e) => logger.error(e)), 3000);
      }
    }
  });
}

// ---------- Express ----------
const app = express();
app.use(express.json({ limit: '256kb' }));

function requireAuth(req, res, next) {
  if (!AUTH_SECRET) return next(); // dev modda izin ver
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (token !== AUTH_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/', (_req, res) => {
  res.json({
    name: 'randevora-whatsapp-worker',
    status: connectionState,
    user: sock?.user || null,
  });
});

app.get('/status', (_req, res) => {
  res.json({
    state: connectionState,
    ready: connectionState === 'open',
    user: sock?.user || null,
    lastError,
    hasQr: !!currentQr,
    pairingCode: lastPairingCode,
  });
});

app.get('/qr', async (req, res) => {
  if (connectionState === 'open') {
    return res.json({ state: 'open', message: 'Zaten bagli' });
  }
  if (!currentQr) {
    return res.status(409).json({ error: 'QR henuz uretilmedi', state: connectionState });
  }
  const accept = String(req.headers.accept || '');
  if (accept.includes('image/png')) {
    const png = await QRCode.toBuffer(currentQr, { type: 'png', margin: 1, scale: 8 });
    res.setHeader('Content-Type', 'image/png');
    return res.send(png);
  }
  const dataUrl = await QRCode.toDataURL(currentQr, { margin: 1, scale: 6 });
  res.send(
    `<!doctype html><html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#fafafa">
      <h2>WhatsApp baglantisi</h2>
      <img src="${dataUrl}" style="width:340px;height:340px;border:1px solid #e5e5e5;border-radius:12px;padding:8px;background:#fff" />
      <p style="margin-top:16px;color:#666">WhatsApp uygulamasi &rarr; Ayarlar &rarr; Bagli cihazlar &rarr; Cihaz baglayin</p>
      <p style="color:#999;font-size:12px">QR ~20 sn'de bir yenilenir. Sayfayi yenileyin.</p>
    </body></html>`
  );
});

app.post('/pair', requireAuth, async (req, res) => {
  try {
    if (!sock) return res.status(503).json({ error: 'Socket hazir degil' });
    if (connectionState === 'open') return res.status(409).json({ error: 'Zaten bagli' });
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone gerekli (orn: +905456036547)' });
    const digits = String(phone).replace(/\D/g, '');
    const code = await sock.requestPairingCode(digits);
    lastPairingCode = code;
    res.json({ pairingCode: code });
  } catch (err) {
    logger.error(err, 'pair hatasi');
    res.status(500).json({ error: err.message });
  }
});

app.post('/send', requireAuth, async (req, res) => {
  try {
    if (!sock || connectionState !== 'open') {
      return res.status(503).json({ error: 'WhatsApp bagli degil', state: connectionState });
    }
    const { recipient, message, channel } = req.body || {};
    if (!recipient || !message) return res.status(400).json({ error: 'recipient ve message gerekli' });
    if (channel && channel !== 'whatsapp') {
      return res.status(400).json({ error: `Bu worker sadece whatsapp gonderir, alindi: ${channel}` });
    }
    const jid = formatJid(recipient);
    await sock.sendMessage(jid, { text: String(message) });
    res.json({ ok: true });
  } catch (err) {
    logger.error(err, 'send hatasi');
    res.status(500).json({ error: err.message });
  }
});

app.post('/logout', requireAuth, async (_req, res) => {
  try {
    if (sock) await sock.logout();
    connectionState = 'close';
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Run ----------
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Worker dinleniyor');
});

startSock().catch((e) => {
  logger.fatal(e, 'startSock catiyor');
  process.exit(1);
});
