import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-gradient-to-r from-[#b07c4f] to-[#d4956a] text-white shadow-sm shadow-[#b07c4f]/25 hover:opacity-90 dark:from-[#c9956b] dark:to-[#e8c4a0] dark:text-neutral-950",
        variant === "secondary" && "border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10",
        variant === "ghost" && "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/10",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
