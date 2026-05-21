import type { Metadata } from "next";
import { CalendarCheck, ShieldCheck, Sparkles, Users } from "lucide-react";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Hakkımızda · Randevora",
  description:
    "Randevora hakkında: kuruluş amacımız, kimler için, hangi sorunu çözüyoruz.",
};

const purposes = [
  {
    icon: CalendarCheck,
    title: "Randevu yönetimi",
    text:
      "Berber, kuaför, güzellik merkezi, danışman, freelancer gibi randevu ile çalışan tüm sektörler için online randevu kabul etmeyi kolaylaştırıyoruz.",
  },
  {
    icon: Users,
    title: "Ekip ve müşteri yönetimi",
    text:
      "Çalışan ekleme, izin yönetimi, müşteri kartları ve geçmiş randevular tek panelde.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli altyapı",
    text:
      "SSL/TLS, rol bazlı erişim, KVKK uyumlu veri saklama ve PCI-DSS uyumlu ödeme altyapısı.",
  },
  {
    icon: Sparkles,
    title: "Sade ve modern arayüz",
    text:
      "Telefonda da masaüstünde de aynı akıcılıkta çalışan, sade ve modern bir yönetim paneli.",
  },
];

export default function Page() {
  return (
    <LegalPage title="Hakkımızda" updatedAt="01.05.2026">
      <LegalSection title="Kullanım amacı">
        <p>
          Randevora, küçük ve orta ölçekli işletmelerin telefonda randevu alma
          sorununu ortadan kaldırmak için kuruldu. Müşteriler özel link üzerinden,
          işletme açık olmasa bile, kayıt olmadan, 30 saniyede randevu alabilir.
          İşletme sahibi ise tüm randevuları, çalışanları, müşterileri ve gelirini
          tek bir panelden yönetir.
        </p>
        <p>
          Hizmet bir SaaS abonelik modeli ile sunulur. Yeni kullanıcılara{" "}
          <strong>10 gün ücretsiz deneme</strong> süresi tanınır ve bu süre boyunca
          kart bilgisi alınmaz. Deneme sonrası kullanıcı bilinçli olarak bir plan
          seçerek aboneliğini başlatır.
        </p>
      </LegalSection>

      <div className="grid gap-4 md:grid-cols-2">
        {purposes.map(({ icon: Icon, title, text }) => (
          <article key={title} className="glass rounded-2xl p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Icon size={20} />
            </div>
            <h3 className="mt-4 text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{text}</p>
          </article>
        ))}
      </div>

      <LegalSection title="Kurucu firma">
        <p>
          <strong>Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.</strong> bünyesinde
          geliştirilen Randevora, Türkiye merkezli yerli bir yazılımdır. Sunucularımız
          Avrupa içinde KVKK & GDPR uyumlu sağlayıcılarda barındırılır.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
