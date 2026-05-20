"use client";

import { useEffect, useRef } from "react";
import { Bell, CalendarCheck, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    id: "1",
    type: "appointment_created" as const,
    title: "Yeni randevu oluşturuldu",
    description: "Ayşe Demir · Saç Kesimi · 09:30",
    time: "2 dk önce",
  },
  {
    id: "2",
    type: "appointment_reminder" as const,
    title: "Yaklaşan randevu hatırlatması",
    description: "Can Yılmaz · Sakal · 10:30",
    time: "15 dk önce",
  },
  {
    id: "3",
    type: "appointment_cancelled" as const,
    title: "Randevu iptal edildi",
    description: "Mehmet Öz · Danışmanlık · 14:00",
    time: "1 saat önce",
  },
];

const typeConfig = {
  appointment_created: { icon: CalendarCheck, variant: "success" as const, label: "Yeni" },
  appointment_reminder: { icon: Clock, variant: "warning" as const, label: "Hatırlatma" },
  appointment_cancelled: { icon: X, variant: "danger" as const, label: "İptal" },
  appointment_changed: { icon: Bell, variant: "info" as const, label: "Değişiklik" },
};

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="animate-in absolute right-0 top-12 z-50 w-80 rounded-xl border border-[var(--line)] bg-[var(--background)] p-4 shadow-2xl sm:w-96"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Bildirimler</h3>
        <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)]">
          <X size={18} />
        </button>
      </div>
      <div className="mt-4 grid gap-2">
        {notifications.map((n) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          return (
            <div key={n.id} className="flex gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-white/10">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{n.description}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <button className="mt-3 w-full rounded-lg border border-[var(--line)] py-2 text-center text-xs font-semibold text-[var(--muted)] transition hover:bg-black/5 dark:hover:bg-white/5">
        Tüm bildirimleri gör
      </button>
    </div>
  );
}
