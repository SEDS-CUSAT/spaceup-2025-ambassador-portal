"use client";

import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      expand
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-white/20 bg-[#0f1535]/95 text-white backdrop-blur-sm",
          title: "font-semibold",
          description: "text-sm text-white/80",
          actionButton:
            "rounded-lg bg-white/90 px-3 py-1 text-sm font-semibold text-[#0f1535] hover:bg-white",
        },
      }}
    />
  );
}
