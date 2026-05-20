import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Randevora | Online Randevu Sistemi - Türkiye'nin En Hızlı Randevu Yazılımı",
  description: "Randevora ile işletmeniz için online randevu sistemi kurun. Berber, kuaför, güzellik merkezi, danışmanlık ve tüm hizmet sektörleri için ultra hızlı randevu yönetimi. Randevunuz bizde.",
  keywords: ["randevora", "randevu sistemi", "online randevu", "randevu yazılımı", "berber randevu", "kuaför randevu", "güzellik merkezi randevu", "randevu uygulaması", "appointment booking", "türkiye randevu sistemi"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  metadataBase: new URL("https://randevora.com.tr"),
  openGraph: {
    title: "Randevora | Online Randevu Sistemi",
    description: "İşletmeniz için ultra hızlı, güvenli ve şık online randevu sistemi. Müşterileriniz kolayca randevu alsın.",
    url: "https://randevora.com.tr",
    siteName: "Randevora",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Randevora | Online Randevu Sistemi",
    description: "İşletmeniz için ultra hızlı online randevu sistemi. Randevunuz bizde.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://randevora.com.tr",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
