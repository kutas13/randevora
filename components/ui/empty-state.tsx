import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn("grid place-items-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel-strong)] p-10 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-[var(--muted)] dark:bg-white/10">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
