import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  delta,
  icon,
  tone = "teal",
}: {
  title: string;
  value: string;
  delta: string;
  icon: ReactNode;
  tone?: "teal" | "orange" | "indigo" | "neutral";
}) {
  return (
    <section className="glass rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">{title}</p>
          <strong className="mt-2 block text-2xl">{value}</strong>
        </div>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            tone === "teal" && "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-200",
            tone === "orange" && "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200",
            tone === "indigo" && "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200",
            tone === "neutral" && "bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-100",
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-300">{delta}</p>
    </section>
  );
}
