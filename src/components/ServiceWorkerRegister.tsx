"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js (offline fallback page). Production only: in development a
 * service worker would get in the way of hot reloading.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not fatal: the app works the same without it.
    });
  }, []);
  return null;
}
