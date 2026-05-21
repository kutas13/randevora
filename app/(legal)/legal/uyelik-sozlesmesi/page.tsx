import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Üyelik Sözleşmesi · Randevora",
  description:
    "Randevora platformu üyelik koşullarına ilişkin kullanıcı sözleşmesi.",
};

export default function Page() {
  return (
    <LegalPage title="Üyelik Sözleşmesi" updatedAt="01.05.2026">
      <LegalSection title="1. Taraflar ve Tanımlar">
        <p>
          İşbu sözleşme, <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong>{" "}
          (&quot;Randevora&quot;) ile randevora.com.tr platformuna üye olan
          gerçek/tüzel kişi (&quot;Üye&quot;) arasında akdedilmiştir.
        </p>
      </LegalSection>

      <LegalSection title="2. Hizmetin Tanımı">
        <p>
          Randevora; berber, kuaför, güzellik, sağlık, danışmanlık gibi randevu ile
          çalışan işletmelerin online randevu kabul etmesi, müşteri yönetimi, takvim
          yönetimi ve raporlama yapmasını sağlayan SaaS yazılımdır.
        </p>
      </LegalSection>

      <LegalSection title="3. Üyelik">
        <LegalList
          items={[
            "Üyelik için 18 yaşını doldurmuş olmak gereklidir.",
            "Kayıt sırasında verilen bilgilerin doğruluğundan Üye sorumludur.",
            "Bir Üye birden fazla işletme hesabı oluşturamaz. (İstisnalar için iletişime geçilmelidir.)",
            "Üye, hesabına ait şifreyi gizli tutmakla yükümlüdür.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Üyenin Yükümlülükleri">
        <LegalList
          items={[
            "Üye, hizmeti yürürlükteki mevzuata, kamu düzenine ve genel ahlaka uygun şekilde kullanır.",
            "Üye, platform üzerinden sahte randevu, taciz, dolandırıcılık, spam gibi eylemler gerçekleştirmemeyi taahhüt eder.",
            "Üye, kendi müşterilerinden topladığı kişisel verilerin işlenmesinden veri sorumlusu sıfatıyla kendisi de yükümlüdür.",
            "Üye, hizmeti üçüncü kişilere kiralayamaz, satamaz veya alt lisans veremez.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Fikri Mülkiyet">
        <p>
          Randevora&apos;nın yazılım, marka, logo, içerik ve tasarımları üzerindeki tüm
          fikri ve sınai mülkiyet hakları Meridyen Yazılım Ltd. Şti.&apos;ne aittir.
          Üye, hizmeti kullanırken bu haklara saygı göstermeyi taahhüt eder.
        </p>
      </LegalSection>

      <LegalSection title="6. Ücret ve Ödeme">
        <p>
          Hizmet, abonelik bedeli karşılığında sunulmaktadır. Ödeme koşulları, deneme
          süresi (10 gün), otomatik yenileme ve iptal kuralları{" "}
          <strong>Mesafeli Satış Sözleşmesi</strong>&apos;nde detaylı şekilde açıklanmıştır.
        </p>
      </LegalSection>

      <LegalSection title="7. Hizmetin Askıya Alınması / Feshi">
        <LegalList
          items={[
            "Üye, dilediği zaman panelden veya iletişim adresimizden hesabını kapatabilir.",
            "Randevora; sözleşmeye, hukuka veya genel ahlaka aykırı kullanım tespit ettiği durumlarda hesabı bildirim yapmaksızın askıya alabilir veya feshedebilir.",
            "Feshedilen hesabın verileri 30 gün boyunca yedek olarak tutulur, ardından kalıcı olarak silinir.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Sorumluluk Sınırı">
        <p>
          Randevora hizmeti &quot;olduğu gibi&quot; sunulur. Üyenin kendi müşterileriyle
          arasında çıkan ihtilaflarda, randevuya gelinmemesinden, hizmetin ifa
          edilememesinden veya benzer durumlardan Randevora sorumlu tutulamaz.
        </p>
      </LegalSection>

      <LegalSection title="9. Uygulanacak Hukuk ve Yetkili Mahkeme">
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır.
          İstanbul Çağlayan Mahkemeleri ve İcra Daireleri yetkilidir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
