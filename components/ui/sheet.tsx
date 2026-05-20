"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
};

export function Sheet({ open, onClose, children, side = "left" }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cn(
          "fixed top-0 z-50 h-full w-80 overflow-y-auto bg-[var(--background)] shadow-2xl transition-transform duration-300 ease-out",
          side === "left" ? "left-0" : "right-0",
          open
            ? "translate-x-0"
            : side === "left"
              ? "-translate-x-full"
              : "translate-x-full",
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </>
  );
}
