// service-worker.js - PWA Service Worker with Aggressive Caching
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `quiz-master-${CACHE_VERSION}`;
const EXAM_MANIFEST_URL = "/Quiz/Script/examManifest.js";

// Core app shell (always cached)
const CORE_ASSETS = [
  "/Quiz/",
  "/Quiz/index.html",
  "/Quiz/quiz.html",
  "/Quiz/summary.html",
  "/Quiz/dashboard.html",
  "/Quiz/CSS/styles.css",
  "/Quiz/CSS/quiz.css",
  "/Quiz/CSS/summary.css",
  "/Quiz/CSS/animations.css",
  "/Quiz/CSS/themes.css",
  "/Quiz/CSS/dashboard.css",
  "/Quiz/Script/index.js",
  "/Quiz/Script/quiz.js",
  "/Quiz/Script/summary.js",
  "/Quiz/Script/dashboard.js",
  "/Quiz/Script/gameEngine.js",
  "/Quiz/Script/examManifest.js",
  "/Quiz/Script/anti-flash.js",
  "/Quiz/Script/theme-controller.js",
  "/Quiz/Script/notifications.js",
  "/Quiz/Script/install-prompt.js",
  "/Quiz/Script/offline-indicator.js",
  "/Quiz/Script/pwa-init.js",
  "/Quiz/images/icon.png",
  "/Quiz/images/thumbnail.png",
  "/Quiz/manifest.json",
];

// Install: Cache core assets + all exam files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache core assets first
      console.log("[SW] Caching core assets...");
      await cache.addAll(CORE_ASSETS);

      // Fetch and cache ALL exam files
      try {
        console.log("[SW] Fetching exam list...");
        const manifestResponse = await fetch(EXAM_MANIFEST_URL);
        const manifestText = await manifestResponse.text();

        // Extract exam paths from manifest
        const pathMatches = manifestText.match(/"path":\s*"([^"]+)"/g);
        if (pathMatches) {
          const examPaths = pathMatches
            .map((match) => match.match(/"path":\s*"([^"]+)"/)[1])
            .map((path) => path.replace(/^\.\.\//, "/Quiz/"));

          console.log(`[SW] Found ${examPaths.length} exams to cache`);

          // Cache exams in batches to avoid overwhelming
          const batchSize = 10;
          for (let i = 0; i < examPaths.length; i += batchSize) {
            const batch = examPaths.slice(i, i + batchSize);
            await Promise.allSettled(
              batch.map((path) =>
                cache.add(path).catch((err) => {
                  console.warn(`[SW] Failed to cache ${path}:`, err);
                })
              )
            );
            console.log(
              `[SW] Cached batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
                examPaths.length / batchSize
              )}`
            );
          }
        }
      } catch (error) {
        console.error("[SW] Failed to cache exams:", error);
      }

      // Skip waiting to activate immediately
      await self.skipWaiting();
      console.log("[SW] Installation complete!");
    })()
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (name) => name.startsWith("quiz-master-") && name !== CACHE_NAME
          )
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );

      // Take control of all pages
      await self.clients.claim();

      // Notify all clients that SW is ready
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION });
      });

      console.log("[SW] Activated!");
    })()
  );
});

// Fetch: Cache-first strategy for assets, network-first for API/dynamic content
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      // Try cache first
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        // Return cached version and update in background
        event.waitUntil(updateCache(request));
        return cachedResponse;
      }

      // Not in cache, fetch from network
      try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        console.error("[SW] Fetch failed:", error);

        // Return offline page for HTML requests
        if (request.destination === "document") {
          const cache = await caches.open(CACHE_NAME);
          return cache.match("/Quiz/index.html");
        }

        throw error;
      }
    })()
  );
});

// Background sync for updating cache
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());

      // Check if this is the exam manifest - notify about updates
      if (request.url.includes("examManifest.js")) {
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({ type: "EXAMS_UPDATED" });
        });
      }
    }
  } catch (error) {
    // Silently fail background updates
  }
}

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CHECK_FOR_UPDATES") {
    event.waitUntil(checkForUpdates());
  }
});

// Check for exam manifest updates
async function checkForUpdates() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedManifest = await cache.match(EXAM_MANIFEST_URL);
    const networkManifest = await fetch(EXAM_MANIFEST_URL);

    if (cachedManifest && networkManifest) {
      const cachedText = await cachedManifest.text();
      const networkText = await networkManifest.text();

      if (cachedText !== networkText) {
        // Update cache
        await cache.put(EXAM_MANIFEST_URL, networkManifest.clone());

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: "NEW_QUIZZES_AVAILABLE",
            message: "New quizzes are available!",
          });
        });
      }
    }
  } catch (error) {
    console.error("[SW] Update check failed:", error);
  }
}

// Push notification support (for future server integration)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || "You have a new notification",
    icon: "/Quiz/images/icon.png",
    badge: "/Quiz/images/icon.png",
    vibrate: [200, 100, 200],
    data: data.url || "/Quiz/",
    actions: [
      { action: "open", title: "Open Quiz Master" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(self.registration.showNotification("Quiz Master", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data || "/Quiz/"));
  }
});
