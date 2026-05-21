import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Çerez Politikası · Randevora",
  description: "Randevora platformunda kullanılan çerezler ve amaçları.",
};

export default function Page() {
  return (
    <LegalPage
      title="Çerez Politikası"
      updatedAt="01.05.2026"
      description="Randevora&apos;da kullanılan çerezler, amaçları ve tercihlerinizi nasıl yönetebileceğiniz."
    >
      <LegalSection title="Çerez Nedir?">
        <p>
          Çerezler (cookies), tarayıcınız üzerinden cihazınıza yerleştirilen küçük metin
          dosyalarıdır. Web sitesinin sizi hatırlamasını, oturumunuzun açık kalmasını
          ve performansın iyileştirilmesini sağlar.
        </p>
      </LegalSection>

      <LegalSection title="Hangi Çerezleri Kullanıyoruz?">
        <LegalList
          items={[
            "Zorunlu çerezler: Oturum açma, güvenlik ve sayfa yönlendirmeleri için kullanılır. Devre dışı bırakılamaz.",
            "İşlevsel çerezler: Tema tercihi, dil seçimi gibi ayarları hatırlamak için kullanılır.",
            "Analitik çerezler: Anonim kullanım istatistikleri için, kullanıcıyı tanımlamaz.",
          ]}
        />
        <p className="text-sm text-[var(--muted)]">
          Üçüncü taraf reklam çerezleri kullanmıyoruz. Kişiselleştirilmiş reklam
          yapmıyoruz.
        </p>
      </LegalSection>

      <LegalSection title="Çerez Yönetimi">
        <p>
          Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz. Tüm çerezleri
          devre dışı bırakırsanız platformun bazı özellikleri çalışmayabilir (özellikle
          oturum yönetimi).
        </p>
      </LegalSection>

      <LegalSection title="İletişim">
        <p>
          Sorularınız için: <strong>iletisim@randevora.com.tr</strong>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
