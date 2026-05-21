import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "İade ve İptal Koşulları · Randevora",
  description: "Randevora abonelik iade, iptal ve otomatik yenileme koşulları.",
};

export default function Page() {
  return (
    <LegalPage title="İade ve İptal Koşulları" updatedAt="01.05.2026">
      <LegalSection title="Özet">
        <LegalList
          items={[
            "Tüm yeni hesaplarda 10 gün ücretsiz deneme süresi vardır.",
            "Deneme süresince kart bilgisi alınmaz, ücretlendirme yapılmaz.",
            "Abonelik başlatıldıktan sonra aylık dönemler için otomatik yenileme aktiftir.",
            "Yenilemeyi panel üzerinden veya iletisim@randevora.com.tr adresine yazarak iptal edebilirsiniz.",
            "Hizmet kullanılmadıysa 14 gün içinde tam iade yapılır.",
          ]}
        />
      </LegalSection>

      <LegalSection title="1. Deneme Süresi">
        <p>
          Randevora&apos;ya yeni kayıt olan tüm üyelere{" "}
          <strong>10 (on) gün ücretsiz deneme</strong> süresi tanınır. Bu süre boyunca
          tüm özellikler kısıtsız kullanılabilir, kart bilgisi istenmez ve herhangi bir
          tahsilat yapılmaz.
        </p>
      </LegalSection>

      <LegalSection title="2. Aboneliğin İptali">
        <LegalList
          items={[
            "Dashboard > Ayarlar > Abonelik bölümünden &apos;Aboneliği iptal et&apos; düğmesi ile aktif aboneliğinizi tek tıkla sonlandırabilirsiniz.",
            "Alternatif olarak iletisim@randevora.com.tr adresine yazılı talep gönderilebilir.",
            "İptal anında kabul edilir; sonraki dönem için ücretlendirme YAPILMAZ.",
            "İptal sonrası ödenen mevcut dönemin sonuna kadar hizmet kullanılmaya devam edilebilir.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. İade Koşulları">
        <LegalList
          items={[
            "Ücret tahsil edilmiş ve hizmet HİÇ kullanılmamışsa: 14 gün içinde tam iade.",
            "Ücret tahsil edilmiş ve hizmet kullanılmaya başlanmışsa: ilgili dönem için iade YAPILMAZ; otomatik yenileme iptal edilir.",
            "İade kararı verildiğinde 14 iş günü içinde, ödemenin yapıldığı kart hesabına iade edilir.",
            "Yıllık ön ödemeli planlarda kullanılmayan aylar orantılı olarak iade edilir.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Otomatik Yenileme">
        <p>
          Abonelik aylık olarak otomatik yenilenir. Yenileme tarihinden{" "}
          <strong>3 gün önce</strong> e-posta ile bilgilendirilirsiniz. İstemediğiniz
          takdirde önceden iptal edebilirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="5. İletişim">
        <p>
          İptal/iade taleplerinizi <strong>iletisim@randevora.com.tr</strong>{" "}
          adresine gönderebilirsiniz. Talepleriniz en geç 2 iş günü içinde
          yanıtlanır.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
