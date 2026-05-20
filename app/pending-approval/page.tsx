import Link from "next/link";
import { Clock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingApprovalPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="glass animate-in w-full max-w-md rounded-xl p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-400/15">
          <Clock size={32} className="text-orange-600" />
        </div>

        <h1 className="mt-6 text-2xl font-black">Başvurunuz alındı!</h1>
        <p className="mt-3 text-[var(--muted)]">
          İşletmeniz başarıyla oluşturuldu ve onay için Super Admin'e iletildi.
        </p>

        <div className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-4 text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-teal-600" />
            <div>
              <p className="text-sm font-semibold">Onay süreci</p>
              <p className="text-xs text-[var(--muted)]">Super admin başvurunuzu inceleyecek</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Mail size={20} className="text-teal-600" />
            <div>
              <p className="text-sm font-semibold">Bilgilendirme</p>
              <p className="text-xs text-[var(--muted)]">Onay sonrası giriş yapabileceksiniz</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-orange-300 bg-orange-50 p-3 text-xs text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-200">
          Onay verilene kadar panele erişim kapalıdır.
        </div>

        <Link href="/login" className="mt-6 inline-block">
          <Button variant="secondary">Giriş sayfasına dön</Button>
        </Link>
      </section>
    </main>
  );
}
