// service-worker.js - TRUE NETWORK-FIRST: Always use online version when available
const CACHE_VERSION = "v1.0.2";
const CACHE_NAME = `quiz-master-${CACHE_VERSION}`;

// Only cache truly essential offline fallback files
const CORE_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/quiz.html`,
  `${BASE_PATH}/summary.html`,
  `${BASE_PATH}/dashboard.html`,
  `${BASE_PATH}/CSS/styles.css`,
  `${BASE_PATH}/CSS/quiz.css`,
  `${BASE_PATH}/CSS/summary.css`,
  `${BASE_PATH}/CSS/animations.css`,
  `${BASE_PATH}/CSS/themes.css`,
  `${BASE_PATH}/CSS/dashboard.css`,
  `${BASE_PATH}/CSS/pwa.css`,
  `${BASE_PATH}/Script/index.js`,
  `${BASE_PATH}/Script/quiz.js`,
  `${BASE_PATH}/Script/summary.js`,
  `${BASE_PATH}/Script/dashboard.js`,
  `${BASE_PATH}/Script/gameEngine.js`,
  `${BASE_PATH}/Script/examManifest.js`,
  `${BASE_PATH}/Script/anti-flash.js`,
  `${BASE_PATH}/Script/theme-controller.js`,
  `${BASE_PATH}/Script/notifications.js`,
  `${BASE_PATH}/Script/install-prompt.js`,
  `${BASE_PATH}/Script/offline-indicator.js`,
  `${BASE_PATH}/Script/pwa-init.js`,
  `${BASE_PATH}/images/icon.png`,
  `${BASE_PATH}/images/thumbnail.png`,
  `${BASE_PATH}/manifest.json`,
];

// Install: Cache only minimal core files
self.addEventListener("fetch", (event) => {
  // We only want to intercept GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    // Always try the network first
    fetch(event.request)
      .then((networkResponse) => {
        // If successful, update the cache with the fresh version for next time
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Only if the network fails (offline), fall back to the cache
        return caches.match(event.request);
      })
  );
});

// Activate: Clean old caches and start background exam caching
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("quiz-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();

      // Notify activation
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION });
      });

      // Start background exam caching (non-blocking)
      cacheAllExamsInBackground();

      console.log("[SW] Activated!");
    })()
  );
});

// Background exam caching (doesn't block anything)
async function cacheAllExamsInBackground() {
  try {
    console.log("[SW] Starting background exam caching...");

    const manifestResponse = await fetch("/Quiz/Script/examManifest.js");
    if (!manifestResponse.ok) {
      console.log("[SW] Could not fetch manifest");
      return;
    }

    const manifestText = await manifestResponse.text();
    const pathMatches = manifestText.match(/"path":\s*"([^"]+)"/g);

    if (!pathMatches) {
      console.log("[SW] No exam paths found");
      return;
    }

    const examPaths = pathMatches
      .map((match) => match.match(/"path":\s*"([^"]+)"/)[1])
      .map((path) => path.replace(/^\.\.\//, "/Quiz/"));

    const total = examPaths.length;
    let cached = 0;
    let failed = 0;

    console.log(`[SW] Found ${total} exams to cache`);

    const cache = await caches.open(CACHE_NAME);

    // Cache in small batches
    const batchSize = 5;
    for (let i = 0; i < examPaths.length; i += batchSize) {
      const batch = examPaths.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (path) => {
          try {
            const response = await fetch(path);
            if (response.ok) {
              await cache.put(path, response);
              cached++;

              // Notify progress every 10 files
              if (cached % 10 === 0) {
                notifyClients({
                  type: "CACHE_PROGRESS",
                  cached,
                  total,
                });
              }
              return true;
            }
            failed++;
            return false;
          } catch (err) {
            failed++;
            return false;
          }
        })
      );

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[SW] Caching complete: ${cached} cached, ${failed} failed`);

    // Notify completion
    notifyClients({
      type: "CACHE_COMPLETE",
      cached,
      total,
      failed,
    });
  } catch (error) {
    console.error("[SW] Background caching error:", error);
    notifyClients({
      type: "CACHE_ERROR",
      error: error.message,
    });
  }
}

// Helper to notify all clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage(message));
}

// FETCH: **TRUE NETWORK-FIRST** - Always try network first, cache only for offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first for ALL requests
  event.respondWith(
    (async () => {
      try {
        // ALWAYS TRY NETWORK FIRST
        const networkResponse = await fetch(request);

        // If successful, update cache in background and return network response
        if (networkResponse && networkResponse.ok) {
          // Clone before caching
          const responseToCache = networkResponse.clone();

          // Update cache in background (don't wait)
          event.waitUntil(
            (async () => {
              try {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, responseToCache);
              } catch (err) {
                // Ignore cache errors
              }
            })()
          );

          return networkResponse;
        }

        // Network returned error status, try cache
        throw new Error("Network response not ok");
      } catch (error) {
        // NETWORK FAILED - Try cache as fallback
        console.log("[SW] Network failed, trying cache:", url.pathname);

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          console.log("[SW] Serving from cache:", url.pathname);
          return cachedResponse;
        }

        // No cache either - return offline page for HTML
        if (request.destination === "document") {
          const cache = await caches.open(CACHE_NAME);
          const offlinePage = await cache.match("/Quiz/index.html");
          if (offlinePage) {
            return offlinePage;
          }
        }

        // Nothing worked
        throw error;
      }
    })()
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CHECK_FOR_UPDATES") {
    checkForManifestUpdates();
  }

  if (event.data.type === "RECACHE_EXAMS") {
    cacheAllExamsInBackground();
  }
});

// Check for manifest updates
async function checkForManifestUpdates() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedManifest = await cache.match("/Quiz/Script/examManifest.js");
    const networkManifest = await fetch("/Quiz/Script/examManifest.js");

    if (!networkManifest.ok) return;

    if (cachedManifest) {
      const cachedText = await cachedManifest.text();
      const networkText = await networkManifest.text();

      if (cachedText !== networkText) {
        console.log("[SW] Manifest updated - recaching exams");

        // Update cached manifest
        await cache.put(
          "/Quiz/Script/examManifest.js",
          networkManifest.clone()
        );

        // Recache all exams
        cacheAllExamsInBackground();

        // Notify clients
        notifyClients({
          type: "NEW_QUIZZES_AVAILABLE",
          message: "New quizzes available!",
        });
      }
    } else {
      // First time - cache manifest
      await cache.put("/Quiz/Script/examManifest.js", networkManifest);
    }
  } catch (error) {
    console.error("[SW] Update check failed:", error);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification("Quiz Master", {
      body: data.body || "You have a new notification",
      icon: "/Quiz/images/icon.png",
      badge: "/Quiz/images/icon.png",
      data: data.url || "/Quiz/",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || "/Quiz/"));
});
