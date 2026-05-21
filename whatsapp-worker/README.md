# Randevora WhatsApp Worker (Multi-tenant)

Her işletmenin **kendi WhatsApp hesabını** Randevora paneli üzerinden bağladığı küçük bir Node.js servisi. Baileys (WhatsApp Web protokolü) ile çalışır.

```
┌─────────────────┐         ┌───────────────────┐         ┌──────────────────┐
│   Randevora     │  HTTPS  │   Bu Worker       │   WS    │   WhatsApp Web   │
│   (Vercel)      │ ──────► │   (sizin sunucu)  │ ──────► │   sunucuları     │
└─────────────────┘         └───────────────────┘         └──────────────────┘
                              auth/<businessId>/
                              (oturum dosyaları)
```

> **ÖNEMLİ:** Bu servis **Vercel'de çalışmaz** (uzun süre açık WebSocket gerekir). VPS / Raspberry Pi / Railway / Render kullanın.

---

## 1) Worker'ı bir yere kur

### Yol A — Hetzner VPS (önerilen, ~4 €/ay)

```bash
ssh root@<sunucu-ip>
git clone https://github.com/kutas13/randevora.git
cd randevora/whatsapp-worker
cp .env.example .env
nano .env   # NOTIFY_WEBHOOK_SECRET'i guclu bir deger ile doldur
npm install
npm install -g pm2
pm2 start server.js --name wa
pm2 save && pm2 startup
```

HTTPS için (Caddy önerilir, otomatik Let's Encrypt):

```bash
apt install -y caddy
cat > /etc/caddy/Caddyfile <<EOF
wa.randevora.com.tr {
  reverse_proxy localhost:3001
}
EOF
systemctl reload caddy
```

DNS'te `wa.randevora.com.tr` → sunucu IP'si A kaydını ekleyin.

### Yol B — Railway / Render

- Yeni proje → Bu repo → root directory: `whatsapp-worker`
- Start command: `node server.js`
- Persistent disk: `/app/auth`
- Env:
  - `NOTIFY_WEBHOOK_SECRET=<güçlü-değer>`
  - `PORT=3001` (Railway/Render kendi `PORT`'unu enjekte eder)

### Yol C — Docker

```bash
cd whatsapp-worker
docker build -t randevora-wa .
docker run -d --name wa --restart=always \
  -p 3001:3001 \
  -v $PWD/auth:/app/auth \
  -e NOTIFY_WEBHOOK_SECRET=... \
  randevora-wa
```

---

## 2) Vercel'e env ekle

Vercel projesinde:

```
WHATSAPP_WORKER_URL=https://wa.randevora.com.tr
NOTIFY_WEBHOOK_SECRET=<worker'daki ile AYNI>
```

Sonra **Redeploy** edin.

---

## 3) Test et

Randevora paneline gir → **Ayarlar** → "WhatsApp Bildirimleri" → **"WhatsApp bağla"** butonuna tıkla → QR çıkar.

Telefondan:
- WhatsApp → Ayarlar → **Bağlı cihazlar** → **Cihaz bağla** → QR'ı okut.

Birkaç saniye içinde "Bağlı" durumuna geçer.

---

## Endpoint Referansı

> Hepsi `Authorization: Bearer <NOTIFY_WEBHOOK_SECRET>` ister. (`/qr` hariç)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/` | Tüm aktif session'ların özeti |
| POST | `/sessions/:businessId/start` | Session başlat (idempotent) |
| GET | `/sessions/:businessId/status` | Durum: `idle/qr/connecting/open/close` |
| GET | `/sessions/:businessId/qr?format=json` | QR (`{ dataUrl }` veya `{ state }`) |
| GET | `/sessions/:businessId/qr` | HTML QR sayfası (preview) |
| GET | `/sessions/:businessId/qr?format=png` | PNG QR |
| POST | `/sessions/:businessId/pair` | `{ phone }` → 8 haneli pairing kodu |
| POST | `/sessions/:businessId/send` | `{ recipient, message }` |
| POST | `/sessions/:businessId/logout` | Oturumu kapat + auth temizle |

---

## Stabilite ipuçları

1. **`auth/` klasörünü silmeyin!** Tüm bağlı işletmelerin oturumu burada. Backup alın.
2. WhatsApp protokolünde **toplu mesaj/spam ban riski** taşır. Yalnızca **işlemsel** mesaj atın (randevu onay, hatırlatma).
3. Aynı işletme numarasını hem Baileys hem Meta Cloud API'sinde kullanmayın — çakışır.
4. Worker yeniden başlarsa, oturumlar `auth/` dosyalarından otomatik geri yüklenir.

---

## Disclaimer

Baileys, WhatsApp tarafından resmi desteklenmiyor. Ölçekli kullanım için **Twilio** veya **Meta Cloud API** önerilir. Spam yapanlar banlanır — sorumluluk size aittir.
