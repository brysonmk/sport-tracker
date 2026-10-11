/*
 * Service worker for Sports Tracker. Deliberately tiny.
 *
 * It does one thing: when you open a page with no connection, you get a friendly
 * "you're offline" page instead of the browser's error. It keeps copies only of that page
 * and of the build's static files (CSS/JS, which never change). It never caches league
 * data or API responses, so scores and tables are always live (a cached table during a
 * match would be worse than no table).
 *
 * Registered by src/components/ServiceWorkerRegister.tsx in production builds only.
 * Bump VERSION when OFFLINE_ASSETS change, so old caches are cleaned up.
 */
const VERSION = "v2";
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
  const url = new URL(event.request.url);

  // Page loads: network first; with no connection, the offline page.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Build files (/_next/static/...) have a content hash in their name and never change,
  // so keeping a copy is safe. That's what lets the offline page keep its styles.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            }
            return response;
          }),
      ),
    );
  }
  // Everything else (league data, API calls, images) goes straight to the network.
});
