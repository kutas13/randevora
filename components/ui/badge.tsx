import { cn } from "@/lib/utils";

type BadgeProps = {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  warning: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200",
  danger: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-200",
  info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}
