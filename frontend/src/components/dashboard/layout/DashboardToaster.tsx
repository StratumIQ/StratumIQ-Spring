"use client";

import { Toaster } from "sonner";

export default function DashboardToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "d-toast",
          title: "d-toast-title",
          description: "d-toast-desc",
        },
      }}
    />
  );
}
