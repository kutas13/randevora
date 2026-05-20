import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "randevora | Modern SaaS Randevu Sistemi",
  description: "Berberlerden danışmanlara kadar her işletme için ultra hızlı online randevu ve işletme yönetimi platformu.",
  keywords: ["randevu", "booking", "saas", "berber", "kuaför", "güzellik merkezi", "online randevu"],
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
