"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";
type Toast = { id: string; message: string; variant: ToastVariant };

const ToastContext = createContext<{ toast: (message: string, variant?: ToastVariant) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const emojis: Record<ToastVariant, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] grid gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-in flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3 shadow-xl backdrop-blur",
            )}
          >
            <span className="text-lg">{emojis[t.variant]}</span>
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-2 text-[var(--muted)] hover:text-[var(--foreground)]">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
