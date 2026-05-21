import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "İletişim · Randevora",
  description: "Randevora ile iletişime geçin.",
};

export default function Page() {
  return (
    <LegalPage title="İletişim" updatedAt="01.05.2026">
      <LegalSection title="Bize Ulaşın">
        <p>
          Hesabınız, ödemeniz, abonelik iptali veya destek talebi için bize her zaman
          ulaşabilirsiniz. E-posta talepleri en geç 2 iş günü içerisinde yanıtlanır.
        </p>
      </LegalSection>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Mail size={20} />
          </div>
          <h3 className="mt-4 text-lg font-bold">E-posta</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Genel sorular & destek
          </p>
          <a
            href="mailto:iletisim@randevora.com.tr"
            className="mt-2 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            iletisim@randevora.com.tr
          </a>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Phone size={20} />
          </div>
          <h3 className="mt-4 text-lg font-bold">Telefon</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Hafta içi 09:00 – 18:00
          </p>
          <a
            href="tel:+905456036547"
            className="mt-2 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            0545 603 65 47
          </a>
        </div>

        <div className="glass rounded-2xl p-5 md:col-span-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <MapPin size={20} />
          </div>
          <h3 className="mt-4 text-lg font-bold">Adres</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Meridyen Yazılım Teknoloji Ticaret Ltd. Şti.
          </p>
          <p className="mt-1 text-sm">
            İstanbul / Türkiye
          </p>
        </div>
      </div>

      <LegalSection title="Yasal Bilgiler">
        <p className="text-sm text-[var(--muted)]">
          Ticaret Sicil No: 000000-00 · Mersis No: 00000000000000000 · KEP:
          meridyen@hs01.kep.tr
        </p>
      </LegalSection>
    </LegalPage>
  );
}
