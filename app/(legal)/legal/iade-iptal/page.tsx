import type { Metadata } from "next";
import { LegalCallout, LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Teslimat ve İade Koşulları · Randevora",
  description:
    "Randevora dijital hizmet teslimatı, abonelik iadesi, iptal ve otomatik yenileme koşulları.",
};

export default function Page() {
  return (
    <LegalPage
      title="Teslimat ve İade Koşulları"
      updatedAt="01.05.2026"
      description="SaaS hizmetimizin teslimatı, deneme süresi, abonelik iptali ve iade süreçleri."
    >
      <LegalCallout title="Kısaca özet" tone="info">
        Randevora dijital bir hizmettir. Ödeme onaylandığı anda kullanıma açılır.
        Tüm yeni hesaplarda <strong>10 gün ücretsiz deneme</strong> vardır; deneme
        sırasında kart bilgisi alınmaz. Aboneliği panel üzerinden tek tıkla iptal
        edebilirsiniz.
      </LegalCallout>

      <LegalSection title="Önemli noktalar">
        <LegalList
          items={[
            "Randevora bir SaaS yazılım hizmetidir; fiziksel ürün teslimatı yapılmaz, hizmet ödeme sonrası anında dijital olarak kullanıma açılır.",
            "Tüm yeni hesaplarda 10 gün ücretsiz deneme süresi vardır.",
            "Deneme süresince kart bilgisi alınmaz, ücretlendirme yapılmaz.",
            "Abonelik başlatıldıktan sonra aylık dönemler için otomatik yenileme aktiftir.",
            "Yenilemeyi panel üzerinden veya iletisim@randevora.com.tr / 0545 603 65 47 üzerinden iptal edebilirsiniz.",
            "Hizmet kullanılmadıysa 14 gün içinde tam iade yapılır.",
          ]}
        />
      </LegalSection>

      <LegalSection title="1. Hizmet Teslimatı">
        <p>
          Randevora dijital bir hizmettir; fiziksel ürün gönderimi yapılmaz. Ödeme
          onaylandıktan hemen sonra kullanıcı hesabınız üzerinden tüm özellikler
          aktif olur ve <strong>randevora.com.tr</strong> adresinden erişebilirsiniz.
          Hizmet, internet bağlantınız olduğu sürece 7/24 kullanılabilir.
        </p>
      </LegalSection>

      <LegalSection title="2. Deneme Süresi">
        <p>
          Randevora&apos;ya yeni kayıt olan tüm üyelere{" "}
          <strong>10 (on) gün ücretsiz deneme</strong> süresi tanınır. Bu süre boyunca
          tüm özellikler kısıtsız kullanılabilir, kart bilgisi istenmez ve herhangi bir
          tahsilat yapılmaz.
        </p>
      </LegalSection>

      <LegalSection title="3. Aboneliğin İptali">
        <LegalList
          items={[
            "Dashboard > Ayarlar > Abonelik bölümünden &apos;Aboneliği iptal et&apos; düğmesi ile aktif aboneliğinizi tek tıkla sonlandırabilirsiniz.",
            "Alternatif olarak iletisim@randevora.com.tr adresine yazılı talep gönderilebilir.",
            "İptal anında kabul edilir; sonraki dönem için ücretlendirme YAPILMAZ.",
            "İptal sonrası ödenen mevcut dönemin sonuna kadar hizmet kullanılmaya devam edilebilir.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. İade Koşulları">
        <LegalList
          items={[
            "Ücret tahsil edilmiş ve hizmet HİÇ kullanılmamışsa: 14 gün içinde tam iade.",
            "Ücret tahsil edilmiş ve hizmet kullanılmaya başlanmışsa: ilgili dönem için iade YAPILMAZ; otomatik yenileme iptal edilir.",
            "İade kararı verildiğinde 14 iş günü içinde, ödemenin yapıldığı kart hesabına iade edilir.",
            "Yıllık ön ödemeli planlarda kullanılmayan aylar orantılı olarak iade edilir.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Otomatik Yenileme">
        <p>
          Abonelik aylık olarak otomatik yenilenir. Yenileme tarihinden{" "}
          <strong>3 gün önce</strong> e-posta ile bilgilendirilirsiniz. İstemediğiniz
          takdirde önceden iptal edebilirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="6. İletişim">
        <p>
          İptal/iade taleplerinizi <strong>iletisim@randevora.com.tr</strong>{" "}
          adresine veya <strong>0545 603 65 47</strong> numaramıza iletebilirsiniz.
          Talepleriniz en geç 2 iş günü içinde yanıtlanır.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
