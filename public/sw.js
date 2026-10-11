/*
 * Service worker for Sports Tracker. Deliberately tiny.
 *
 * It does exactly one thing: when you open a page with no connection, you get a
 * friendly "you're offline" page instead of the browser's error. It never caches league
 * data or API responses, so scores and tables are always live (a cached table during a
 * match would be worse than no table).
 *
 * Registered by src/components/ServiceWorkerRegister.tsx in production builds only.
 * Bump VERSION when OFFLINE_ASSETS change, so old caches are cleaned up.
 */
const VERSION = "v1";
const CACHE = `sports-tracker-${VERSION}`;
const OFFLINE_URL = "/offline";
const OFFLINE_ASSETS = [OFFLINE_URL, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Only page loads; everything else (data, scripts, images) goes straight to the network.
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
