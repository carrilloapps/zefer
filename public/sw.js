const VERSION = "zefer-v4";
const STATIC_CACHE = VERSION + "-static";
const DYNAMIC_CACHE = VERSION + "-dynamic";

const APP_SHELL = [
  "/",
  "/how",
  "/project",
  "/device",
  "/install",
  "/install/guide",
  "/privacy",
  "/terms",
  "/security",
  "/conduct",
  "/vs/hat-sh",
  "/vs/picocrypt",
  "/vs/bitwarden-send",
  "/vs/cryptomator",
  "/vs/veracrypt",
  "/icon.svg",
  "/manifest.webmanifest",
];

// Install: precache the full app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old version caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== STATIC_CACHE && n !== DYNAMIC_CACHE)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, and chrome-extension
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API: /api/author is cacheable (static profile), others are network-only
  if (url.pathname.startsWith("/api/") && url.pathname !== "/api/author") return;

  // Static assets: cache-first (immutable by hash)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages: stale-while-revalidate (instant offline, fresh when online)
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (cached) return cached;
          // Offline fallback: return cached home page for any HTML request
          if (request.headers.get("accept") && request.headers.get("accept").includes("text/html")) {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });

      // Serve cached immediately, update in background
      return cached || networkFetch;
    })
  );
});
