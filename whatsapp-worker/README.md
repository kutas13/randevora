# Randevora WhatsApp Worker

Bağımsız küçük bir Node.js servisi. **Baileys** (WhatsApp Web) ile WhatsApp'a bağlanır ve Randevora'nın gönderdiği bildirimleri müşterinize/çalışanınıza WhatsApp mesajı olarak iletir.

> **Önemli:** Bu servis Vercel'de **çalıştırılamaz** (uzun süre açık kalan WebSocket gerekir). Bir VPS, Raspberry Pi, ev sunucusu veya Render/Railway gibi sürekli açık bir hosting kullanın.

---

## Hızlı başlangıç (yerel)

```bash
cd whatsapp-worker
cp .env.example .env
# .env içindeki NOTIFY_WEBHOOK_SECRET'i güçlü bir değerle doldurun
npm install
npm start
```

Çıktıda `Worker dinleniyor` görünce tarayıcıdan açın:

- `http://localhost:3001/qr` — QR kodunu telefonunuzdan okutun
  - WhatsApp → Ayarlar → **Bağlı Cihazlar** → **Cihaz Bağla**
- Bağlantı tamamlandığında `http://localhost:3001/status` → `state: "open"` olur.

> Alternatif: telefon doğrulamayla 8 haneli pairing kodu:
> ```bash
> curl -X POST http://localhost:3001/pair \
>   -H "Authorization: Bearer <NOTIFY_WEBHOOK_SECRET>" \
>   -H "Content-Type: application/json" \
>   -d '{"phone":"+905456036547"}'
> ```

---

## Endpoint'ler

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/` | Worker bilgisi |
| GET | `/status` | Bağlantı durumu (`state: starting/qr/connecting/open/close`) |
| GET | `/qr` | Aktif QR kodu (HTML ile render) — `Accept: image/png` ile PNG döner |
| POST | `/pair` | Pairing kodu iste — body: `{ "phone": "+905..." }` |
| POST | `/send` | Mesaj gönder — body: `{ "recipient": "+905...", "message": "..." }` |
| POST | `/logout` | Oturumu kapat |

> `POST` endpoint'leri **`Authorization: Bearer <NOTIFY_WEBHOOK_SECRET>`** ister.

---

## Randevora (Vercel) tarafı

Vercel projesinin ortam değişkenlerine ekleyin:

```
NOTIFY_WEBHOOK_URL=https://<worker-domainin>.com/send
NOTIFY_WEBHOOK_SECRET=<aynı-değer>
```

Artık Randevora'da bir randevu alındığında veya kapora ödendiğinde, `app/api/cron/process-notifications` günde bir kez (Hobby plan) veya dış cron servisiyle daha sık tetiklenince bu worker'a POST atar; worker mesajı WhatsApp üzerinden gönderir.

---

## Production deploy seçenekleri

### Seçenek A — Hetzner / Contabo VPS (~3-5 €/ay)

```bash
# Sunucuya ssh
git clone <bu repo>
cd whatsapp-worker
cp .env.example .env
nano .env   # değişkenleri doldur
npm install
# PM2 ile her zaman ayakta tut
npm i -g pm2
pm2 start server.js --name wa
pm2 save && pm2 startup
```

Sonra Caddy/Nginx ile **HTTPS** verin:

```caddy
wa.randevora.com.tr {
  reverse_proxy localhost:3001
}
```

`NOTIFY_WEBHOOK_URL=https://wa.randevora.com.tr/send`

### Seçenek B — Docker

```bash
cd whatsapp-worker
docker build -t randevora-wa .
docker run -d --name wa --restart=always \
  -p 3001:3001 \
  -v $PWD/auth:/app/auth \
  -e NOTIFY_WEBHOOK_SECRET=... \
  randevora-wa
```

### Seçenek C — Railway / Render / Fly.io

- Servis tipini **Worker** veya **Web Service** seç
- Persistent disk: `/app/auth`
- Env: `NOTIFY_WEBHOOK_SECRET`
- Start command: `node server.js`

---

## QR & WhatsApp Web stabilite ipuçları

1. **Telefonunuz internete bağlı olmalı.** Baileys, telefonunuzdaki resmi WhatsApp ile multi-device protokolü konuşur; mesaj göndermek için telefonun açık olması gerekmez ama ilk eşleşme için gerekir.
2. **`auth/` klasörünü silmeyin!** Bu klasör silinirse her yeniden başlatmada QR ister.
3. WhatsApp 5-15 dakikada bir kez ban kontrolü yapar. **Spam göndermeyin.** Saatte 50'den fazla yeni numaraya mesaj atmayın.
4. Aynı numarayı resmi WhatsApp Business API'sinde de kullanıyorsanız çakışır — sadece birini kullanın.

---

## Disclaimer

Baileys, WhatsApp tarafından resmi olarak desteklenen bir kütüphane değildir. Toplu mesaj/spam kullanımı hesap banı riski taşır. Üretimde ölçekli kullanım için **Meta Cloud API** veya **Twilio** tercih edilebilir. Bu worker ile sadece **işlemsel** (randevu onay, hatırlatma) mesajları gönderin.
