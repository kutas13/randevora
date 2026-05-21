import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi · Randevora",
  description:
    "Randevora hizmet abonelik satışına ilişkin mesafeli satış sözleşmesi metni.",
};

export default function Page() {
  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      updatedAt="01.05.2026"
      description="Randevora abonelik hizmeti için 6502 sayılı kanun kapsamındaki mesafeli satış koşulları."
    >
      <LegalSection title="1. Taraflar">
        <p>
          İşbu Mesafeli Satış Sözleşmesi (&quot;Sözleşme&quot;), bir tarafta{" "}
          <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong> (&quot;Satıcı&quot; veya
          &quot;Randevora&quot;) ile diğer tarafta randevora.com.tr internet sitesi üzerinden
          dijital hizmetlerden faydalanmak için kayıt yaptıran ve aboneliği başlatan
          gerçek/tüzel kişi (&quot;Alıcı&quot;) arasında aşağıdaki şartlarda imzalanmıştır.
        </p>
      </LegalSection>

      <LegalSection title="2. Konu">
        <p>
          İşbu sözleşmenin konusu, Alıcı&apos;nın Randevora&apos;ya ait yazılımın abonelik
          modeli ile kullanımı, deneme süresi, otomatik yenileme, ödeme, cayma ve iade
          haklarına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.
        </p>
      </LegalSection>

      <LegalSection title="3. Hizmetin Niteliği ve Fiyatı">
        <LegalList
          items={[
            "Hizmet, internet üzerinden sunulan bulut tabanlı (SaaS) bir randevu yönetim yazılımıdır.",
            "Hizmet maddi olmayan, dijital nitelikte bir abonelik hizmetidir.",
            "Aylık ücretler ana sayfada (Başlangıç: 999 TL/ay, Profesyonel: 1.999 TL/ay) açıkça gösterilmektedir. KDV dahildir.",
            "Fiyat değişikliği halinde Alıcı en az 30 gün önceden e-posta ile bilgilendirilir.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Deneme Süresi">
        <p>
          Yeni üyelere <strong>10 gün ücretsiz deneme</strong> süresi tanınır. Deneme
          süresi boyunca kart bilgisi alınmaz ve herhangi bir ücretlendirme yapılmaz.
          Deneme süresi sonunda Alıcı bir plan seçerek aboneliği başlatabilir; aksi
          takdirde hesap pasif duruma alınır ve ücret yansıtılmaz.
        </p>
      </LegalSection>

      <LegalSection title="5. Otomatik Yenileme">
        <LegalList
          items={[
            "Abonelik aylık olarak otomatik yenilenir. Alıcı, ödeme yöntemini onayladığında bu yenilemeyi açıkça kabul etmiş sayılır.",
            "Otomatik yenileme, abonelik tarihinden sonraki aynı gün gerçekleştirilir.",
            "Alıcı yenilemeyi dilediği zaman panel > Ayarlar > Abonelik bölümünden veya iletisim@randevora.com.tr adresine talep göndererek iptal edebilir.",
            "İptal işlemi anında hüküm doğurur; sonraki dönem için ücret tahsil edilmez.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Ödeme Yöntemi">
        <LegalList
          items={[
            "Tüm ödemeler 3D Secure destekli sanal POS altyapısı (iyzico) üzerinden alınır.",
            "Kart bilgileri Randevora sunucularında saklanmaz; PCI-DSS uyumlu iyzico altyapısında token olarak tutulur.",
            "Tekrarlayan tahsilat için kart saklama izni, ödeme sayfasında ayrıca onaylanır.",
            "Tüm bağlantılar SSL/TLS şifreleme ile korunur.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Cayma Hakkı">
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği çerçevesinde, dijital içerik / dijital hizmet aboneliklerinde
          hizmet ifasının başlamasından önce <strong>14 gün içinde cayma hakkı</strong>{" "}
          mevcuttur. Hizmetin ifası başladıktan sonra (yani Alıcı aktif olarak yazılıma
          giriş yapıp veri girişine başladıktan sonra) cayma hakkı kullanılamaz.
        </p>
        <p>
          Cayma hakkını kullanmak isteyen Alıcı, hizmet başlamadan önce{" "}
          <strong>iletisim@randevora.com.tr</strong> adresine yazılı bildirimde
          bulunmalıdır.
        </p>
      </LegalSection>

      <LegalSection title="8. İade Koşulları">
        <LegalList
          items={[
            "Deneme süresi boyunca ücret tahsil edilmediğinden iade söz konusu olmaz.",
            "Aylık ücret tahsil edilmiş ve hizmet kullanılmaya başlanmamışsa, talep tarihinden itibaren 14 gün içinde iade yapılır.",
            "Hizmet kullanılmış aylık abonelik ücretleri orantılı olarak iade edilmez; sonraki dönem otomatik yenileme iptal edilir.",
            "İade, ödemenin alındığı kart hesabına yapılır.",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Yürürlük">
        <p>
          Alıcı, ödeme sayfasında işbu sözleşmeyi okuduğunu ve kabul ettiğini açıkça
          beyan ettiği anda sözleşme yürürlüğe girer.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
