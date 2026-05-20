# randevora — Modern SaaS Randevu Sistemi

Ultra hızlı, multi-tenant SaaS tabanlı online randevu ve işletme yönetim platformu.

## Teknoloji Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript** — Tam tip güvenliği
- **Tailwind CSS 4** — Utility-first styling
- **Supabase** — Auth, PostgreSQL, Realtime, RLS
- **Recharts** — Grafik ve veri görselleştirme
- **dnd-kit** — Drag & drop takvim
- **Zod** — Form ve API validasyonu
- **Lucide** — İkon sistemi

## Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Çevre değişkenlerini ayarla
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini gir

# Supabase'de schema.sql'i çalıştır
# supabase/schema.sql dosyasını Supabase SQL editöründe çalıştır

# Development sunucusunu başlat
npm run dev
```

## Proje Yapısı

```
app/
├── (dashboard)/          # Dashboard layout grubu
│   ├── dashboard/
│   │   ├── appointments/ # Randevu yönetimi
│   │   ├── billing/      # Plan ve ödeme
│   │   ├── calendar/     # Takvim (günlük/haftalık/aylık)
│   │   ├── customers/    # Müşteri kartları
│   │   ├── employees/    # Çalışan yönetimi
│   │   ├── services/     # Hizmet yönetimi
│   │   └── settings/     # İşletme ayarları
│   └── layout.tsx
├── api/
│   ├── appointments/     # Randevu CRUD API
│   ├── notifications/    # Bildirim API
│   └── slots/            # Uygun saat hesaplama
├── auth/                 # Server actions
├── book/[slug]/          # Public booking sayfası
├── login/                # Giriş sayfası
├── register/             # İşletme oluşturma
├── super-admin/          # Sistem yönetimi
├── [slug]/               # İşletme public sayfası
└── page.tsx              # Landing page

components/
├── booking/              # Booking flow bileşenleri
├── dashboard/            # Dashboard bileşenleri
├── providers/            # Theme provider
└── ui/                   # Reusable UI kit

lib/
├── supabase/             # Supabase client/server
├── booking.ts            # Slot hesaplama algoritması
├── mock-data.ts          # Demo verileri
├── types.ts              # TypeScript tipleri
└── utils.ts              # Yardımcı fonksiyonlar
```

## Özellikler

### Multi-tenant SaaS
- Her işletme kendi verisini görür (PostgreSQL RLS)
- Unique slug ile public booking sayfası
- Free / Pro / Enterprise plan sistemi

### Dashboard
- Gerçek zamanlı metrik kartları
- Gelir ve randevu grafikleri
- Ekip kapasitesi görünümü
- Bildirim paneli

### Randevu Sistemi
- Otomatik çakışma kontrolü (DB constraint)
- Uygun saat hesaplama algoritması
- Durum yönetimi (pending → confirmed → completed)
- Drag & drop takvim

### Takvim
- Günlük, haftalık, aylık görünümler
- Çalışan bazlı filtreleme
- Renk kodlu randevular

### Public Booking
- Kayıt gerektirmeyen randevu
- Adım adım hizmet/çalışan/saat seçimi
- Mobil uyumlu, ultra hızlı

### Bildirim Sistemi
- Randevu oluşturuldu
- Yaklaşan randevu hatırlatması
- İptal ve değişiklik bildirimi
- WhatsApp entegrasyonu için hazır altyapı

### Dark / Light Mode
- Sistem tercihine göre otomatik
- Manuel toggle
- CSS custom properties ile temiz geçiş

## Kullanıcı Tipleri

| Rol | Yetkiler |
|-----|----------|
| Super Admin | Tüm tenantları görür, sistem metrikleri |
| İşletme Sahibi | Kendi işletmesini yönetir |
| Çalışan | Sadece kendi randevularını görür |

## SaaS Plan Limitleri

| Özellik | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Randevu / ay | 30 | ∞ | ∞ |
| Çalışan | 1 | ∞ | ∞ |
| Raporlar | Temel | Gelişmiş | Özel |
| WhatsApp | ✗ | ✓ | ✓ |
| Özel domain | ✗ | ✗ | ✓ |

## Database

Multi-tenant PostgreSQL mimarisi:
- Row Level Security (RLS) ile veri izolasyonu
- `btree_gist` ile randevu çakışma kontrolü
- Optimized indexes

## Geliştirme

```bash
npm run dev          # Development
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript kontrolü
```
