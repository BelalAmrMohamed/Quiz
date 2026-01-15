// service-worker.js - PWA Service Worker with Smart Caching
const CACHE_VERSION = "v1.0.2";
const CACHE_NAME = `quiz-master-${CACHE_VERSION}`;
const EXAM_MANIFEST_URL = "/Quiz/Script/examManifest.js";

// Core app shell (always cached immediately)
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
  "/Quiz/CSS/pwa.css",
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

// Install: Cache only core assets (fast install)
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version", CACHE_VERSION);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache core assets first
      console.log("[SW] Caching core assets...");
      try {
        await cache.addAll(CORE_ASSETS);
        console.log("[SW] ✅ Core assets cached successfully");
      } catch (error) {
        console.error("[SW] Failed to cache some core assets:", error);
        // Cache them individually
        for (const asset of CORE_ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn("[SW] Failed to cache:", asset, err.message);
          }
        }
      }

      // Skip waiting to activate immediately
      await self.skipWaiting();
      console.log("[SW] Installation complete! Version:", CACHE_VERSION);
    })()
  );
});

// Activate: Clean up old caches and start background caching
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version", CACHE_VERSION);

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

      console.log("[SW] Activated! Version:", CACHE_VERSION);

      // Start caching exams in background (don't wait for it)
      cacheExamsInBackground();
    })()
  );
});

// Background exam caching (runs after activation)
async function cacheExamsInBackground() {
  console.log("[SW] 🚀 Starting background exam caching...");

  try {
    const cache = await caches.open(CACHE_NAME);

    // Fetch exam manifest
    const manifestResponse = await fetch(EXAM_MANIFEST_URL);
    const manifestText = await manifestResponse.text();

    // Extract exam paths from manifest
    const pathMatches = manifestText.match(/"path":\s*"([^"]+)"/g);
    if (!pathMatches) {
      console.log("[SW] No exam paths found in manifest");
      return;
    }

    const examPaths = pathMatches
      .map((match) => match.match(/"path":\s*"([^"]+)"/)[1])
      .map((path) => path.replace(/^\.\.\//, "/Quiz/"));

    console.log(`[SW] Found ${examPaths.length} exams to cache`);

    let cached = 0;
    let failed = 0;
    let alreadyCached = 0;

    // Cache exams in batches to avoid overwhelming the browser
    const BATCH_SIZE = 5;
    for (let i = 0; i < examPaths.length; i += BATCH_SIZE) {
      const batch = examPaths.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (path) => {
          try {
            // Check if already cached
            const cachedResponse = await cache.match(path);
            if (cachedResponse) {
              alreadyCached++;
              return;
            }

            // Cache the exam
            const response = await fetch(path);
            if (response.ok) {
              await cache.put(path, response);
              cached++;
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (err) {
            failed++;
            console.warn(`[SW] Failed to cache ${path}:`, err.message);
          }
        })
      );

      // Progress update every 10 exams
      if ((i + BATCH_SIZE) % 10 === 0) {
        const total = cached + alreadyCached;
        console.log(`[SW] Progress: ${total}/${examPaths.length} exams cached`);

        // Notify clients about progress
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: "CACHE_PROGRESS",
            cached: total,
            total: examPaths.length,
          });
        });
      }

      // Small delay between batches to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const total = cached + alreadyCached;
    console.log(
      `[SW] ✅ Exam caching complete! Cached: ${total}/${examPaths.length}, Failed: ${failed}`
    );

    // Notify all clients that caching is complete
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "CACHE_COMPLETE",
        cached: total,
        failed: failed,
        total: examPaths.length,
      });
    });
  } catch (error) {
    console.error("[SW] Background caching failed:", error);
  }
}

// Fetch: Cache-first strategy
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
        // Return cached version
        return cachedResponse;
      }

      // Not in cache, fetch from network
      try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          // Clone the response before caching
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

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CHECK_FOR_UPDATES") {
    event.waitUntil(checkForUpdates());
  }

  if (event.data.type === "CACHE_EXAMS_NOW") {
    // Manual trigger to cache exams
    event.waitUntil(cacheExamsInBackground());
  }

  if (event.data.type === "GET_CACHE_STATUS") {
    // Return current cache status
    event.waitUntil(getCacheStatus(event.source));
  }
});

// Get cache status
async function getCacheStatus(client) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const examCount = keys.filter((req) => req.url.includes("/Exams/")).length;

    client.postMessage({
      type: "CACHE_STATUS",
      totalCached: keys.length,
      examsCached: examCount,
    });
  } catch (error) {
    console.error("[SW] Failed to get cache status:", error);
  }
}

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

// Push notification support
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
