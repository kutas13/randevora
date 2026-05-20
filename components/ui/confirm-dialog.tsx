"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType>({ confirm: async () => false });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  function handleConfirm() {
    state?.resolve(true);
    setState(null);
  }

  function handleCancel() {
    state?.resolve(false);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-sm animate-in rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${state.variant === "danger" ? "bg-red-100 text-red-600 dark:bg-red-400/15" : state.variant === "warning" ? "bg-orange-100 text-orange-600 dark:bg-orange-400/15" : "bg-[var(--accent)]/10 text-[var(--accent)]"}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{state.title || "Onay"}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{state.message}</p>
              </div>
              <button onClick={handleCancel} className="flex size-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--panel-strong)]">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCancel}>
                {state.cancelText || "İptal"}
              </Button>
              <Button variant={state.variant === "danger" ? "danger" : "primary"} onClick={handleConfirm}>
                {state.confirmText || "Onayla"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
