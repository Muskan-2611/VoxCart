// VoxCart Safe Offline Static Cache Service Worker
// Dynamically caching assets and falls back to cached states when offline.

const CACHE_NAME = "voxcart-static-v1";

// Asset groups to prime/cache on install
const PRE_CACHE = [
  "/",
  "/index.html"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Prerouting core layout pages");
      return cache.addAll(PRE_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate & Clean Outmoded caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Cleaning deprecated cache stores: ", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Dynamic Asset Interceptor for fetch requests
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip state altering API POST/PUT/DELETE routes to avoid caching mutated data
  if (requestUrl.pathname.startsWith("/api") || requestUrl.search.includes("action=")) {
    // Direct network queries
    return;
  }

  // Handle static local assets and Unsplash/PicSum external icons
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return resource from cache, then fetch fresh in background (Stale While Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {}); // catch silent failures offline
        return cachedResponse;
      }

      // If not cached, retrieve over network, and cache clone results dynamically
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback triggers
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
