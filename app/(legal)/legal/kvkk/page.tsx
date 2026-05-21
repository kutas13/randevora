import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni · Randevora",
  description:
    "6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

export default function Page() {
  return (
    <LegalPage title="KVKK Aydınlatma Metni" updatedAt="01.05.2026">
      <LegalSection title="Veri Sorumlusu">
        <p>
          <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong> (&quot;Randevora&quot;),
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında
          veri sorumlusudur. Sitemizi kullanırken paylaştığınız kişisel verilerinizin
          gizliliği ve güvenliği bizim için önceliklidir.
        </p>
      </LegalSection>

      <LegalSection title="İşlenen Kişisel Veriler">
        <LegalList
          items={[
            "Kimlik bilgileri (ad, soyad)",
            "İletişim bilgileri (e-posta, telefon, adres)",
            "İşletme bilgileri (işletme adı, hizmetler, çalışanlar)",
            "Müşteri ve randevu kayıtları",
            "Ödeme tahsilat bilgileri (kart numarası DEĞİL, yalnızca işlem referansı)",
            "Sistem güvenliği için log kayıtları (IP, tarayıcı, oturum zamanı)",
          ]}
        />
      </LegalSection>

      <LegalSection title="İşleme Amaçları">
        <LegalList
          items={[
            "Üyelik ve hesap yönetimi",
            "Hizmetin sunulması ve geliştirilmesi",
            "Abonelik ve ödeme süreçlerinin yürütülmesi",
            "Kullanıcı destek ve iletişim faaliyetleri",
            "Yasal yükümlülüklerin yerine getirilmesi",
            "Bilgi güvenliği, dolandırıcılık ve kötüye kullanım önleme",
          ]}
        />
      </LegalSection>

      <LegalSection title="Hukuki Sebep">
        <p>KVKK m.5/2 kapsamında:</p>
        <LegalList
          items={[
            "Sözleşmenin kurulması ve ifası için zorunlu olması",
            "Kanunlarda açıkça öngörülmesi",
            "Veri sorumlusunun meşru menfaati",
            "Açık rıza (pazarlama amaçlı iletişim için)",
          ]}
        />
      </LegalSection>

      <LegalSection title="Verilerin Aktarılması">
        <p>
          Kişisel verileriniz; ödeme altyapısı (iyzico), bulut hizmet sağlayıcılarımız
          (Vercel, Supabase), e-posta servis sağlayıcımız ve hukuken yetkili kamu
          kurum/kuruluşları ile sınırlı olmak üzere paylaşılabilir.
        </p>
      </LegalSection>

      <LegalSection title="Veri Sahibinin Hakları">
        <p>KVKK m.11 uyarınca aşağıdaki haklara sahipsiniz:</p>
        <LegalList
          items={[
            "Kişisel verinizin işlenip işlenmediğini öğrenme",
            "İşlenmişse buna ilişkin bilgi talep etme",
            "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
            "Yurt içi/yurt dışında aktarıldığı üçüncü kişileri bilme",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
            "Silinmesini veya yok edilmesini isteme",
            "Aleyhine bir sonuç ortaya çıkan otomatik analizlere itiraz etme",
            "Hukuka aykırı işleme nedeniyle uğranılan zararın giderilmesini talep etme",
          ]}
        />
        <p>
          Başvurularınızı <strong>iletisim@randevora.com.tr</strong> üzerinden veya
          KEP adresimize iletebilirsiniz. Başvurular en geç 30 gün içinde
          yanıtlanır.
        </p>
      </LegalSection>

      <LegalSection title="Güvenlik">
        <p>
          Kişisel verileriniz; SSL/TLS şifreleme, rol bazlı yetkilendirme, düzenli
          yedekleme ve güncel güvenlik politikaları ile korunur. Kart bilgileri{" "}
          <strong>kesinlikle Randevora sunucularında saklanmaz</strong>; PCI-DSS
          uyumlu iyzico altyapısı kullanılır.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
