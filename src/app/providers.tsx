"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useStore((s) => s.setHydrated);

  useEffect(() => {
    // Ensure the persisted store is rehydrated on the client.
    const persist = useStore.persist;
    if (persist && !useStore.getState().hydrated) {
      persist.rehydrate?.();
    }
    setHydrated(true);
  }, [setHydrated]);

  return <ToastProvider>{children}</ToastProvider>;
}
