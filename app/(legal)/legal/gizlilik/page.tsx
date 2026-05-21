import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Gizlilik Politikası · Randevora",
  description:
    "Randevora kişisel verilerinizi nasıl topluyor, işliyor ve koruyoruz?",
};

export default function Page() {
  return (
    <LegalPage title="Gizlilik Politikası" updatedAt="01.05.2026">
      <LegalSection title="1. Veri Sorumlusu">
        <p>
          Bu gizlilik politikası, Türkiye Cumhuriyeti sınırları içinde faaliyet
          gösteren <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong>{" "}
          (&quot;Randevora&quot;) tarafından sunulan randevora.com.tr platformu için
          geçerlidir.
        </p>
      </LegalSection>

      <LegalSection title="2. Topladığımız Veriler">
        <LegalList
          items={[
            "Kimlik bilgileri: Ad, soyad, e-posta, telefon",
            "İşletme bilgileri: İşletme adı, adres, slug, çalışma saatleri",
            "Ödeme verileri: Kart bilgisi Randevora&apos;da SAKLANMAZ. Ödeme sağlayıcı iyzico tarafından PCI-DSS uyumlu şekilde işlenir. Yalnızca kart sahibi adı ve tahsilat tutarı kayıtlarımızda yer alır.",
            "Kullanım verileri: Giriş zamanları, IP adresi, tarayıcı bilgisi",
            "Müşteri verileri: Üyenin platformu kullanırken eklediği müşteri adı, telefon, randevu geçmişi",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Verileri Hangi Amaçla İşliyoruz?">
        <LegalList
          items={[
            "Hizmetin sunulması, randevu oluşturma ve takvim yönetimi",
            "Üyelik ve ödeme yönetimi, otomatik yenileme",
            "Yasal yükümlülüklerin (fatura, KVKK, mali mevzuat) yerine getirilmesi",
            "Güvenlik, dolandırıcılık önleme",
            "Hizmet iyileştirme, performans takibi (kişiye özel reklam YAPILMAZ)",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Verilerin Aktarılması">
        <LegalList
          items={[
            "Ödeme altyapısı sağlayıcısı: iyzico Ödeme Hizmetleri A.Ş.",
            "Bulut hosting: Vercel Inc. ve Supabase Inc. (sözleşmesel KVKK uyumu)",
            "E-posta gönderim: Resend / SendGrid gibi mail sağlayıcıları",
            "Yasal merciler: Mahkeme veya yetkili kamu kurumları talep ederse",
          ]}
        />
        <p className="text-sm text-[var(--muted)]">
          Verileriniz yurt dışına aktarıldığında, ilgili sağlayıcılarla KVKK ve GDPR
          uyumu kapsamında veri işleme sözleşmeleri mevcuttur.
        </p>
      </LegalSection>

      <LegalSection title="5. Verilerin Saklanma Süresi">
        <LegalList
          items={[
            "Aktif üyelik boyunca veriler saklanır.",
            "Hesap kapatıldığında veriler 30 gün içinde anonimleştirilir veya silinir.",
            "Mali kayıt ve faturalar, vergi mevzuatı gereği 10 yıl boyunca tutulur.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. KVKK Kapsamında Haklarınız">
        <p>
          6698 sayılı KVKK&apos;nın 11. maddesi gereği aşağıdaki haklara sahipsiniz:
        </p>
        <LegalList
          items={[
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
            "İşlenmişse buna ilişkin bilgi talep etme",
            "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
            "Yasal şartlar uygunsa silinmesini veya yok edilmesini isteme",
            "Otomatik sistemlerle yapılan değerlendirme sonucuna itiraz etme",
            "Zarara uğramanız halinde tazminat talep etme",
          ]}
        />
        <p>
          Haklarınızı kullanmak için: <strong>iletisim@randevora.com.tr</strong>
        </p>
      </LegalSection>

      <LegalSection title="7. Güvenlik Önlemleri">
        <LegalList
          items={[
            "Tüm trafik SSL/TLS ile şifrelenir (HTTPS zorunlu).",
            "Şifreler bcrypt/argon2 ile hash&apos;lenerek saklanır; asla düz metin olarak tutulmaz.",
            "Kart verisi PCI-DSS sertifikalı iyzico altyapısında, Randevora sunucularına HİÇ ULAŞMADAN tutulur.",
            "Veritabanı erişimi rol bazlı yetkilendirme (RLS) ile korunur.",
            "Periyodik güvenlik testleri ve yedekleme uygulanır.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Çerezler">
        <p>
          Platformumuz oturum yönetimi ve güvenlik amacıyla çerezler kullanır.
          Detaylar için <a className="text-[var(--accent)] underline" href="/legal/cerez-politikasi">Çerez Politikası</a> sayfamızı
          inceleyiniz.
        </p>
      </LegalSection>

      <LegalSection title="9. İletişim">
        <p>
          <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong>
          <br />
          E-posta: iletisim@randevora.com.tr
          <br />
          Web: https://randevora.com.tr/iletisim
        </p>
      </LegalSection>
    </LegalPage>
  );
}
