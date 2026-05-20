import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Randevora | Online Randevu Sistemi",
  description: "Berberlerden danışmanlara kadar her işletme için ultra hızlı online randevu sistemi. Randevunuz bizde.",
  keywords: ["randevu", "booking", "berber", "kuaför", "güzellik merkezi", "online randevu", "randevora"],
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
