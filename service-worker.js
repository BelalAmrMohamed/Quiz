// service-worker.js - PWA Service Worker with Smart Caching (FIXED)
const CACHE_VERSION = "v1.0.3";
const CACHE_NAME = `quiz-master-${CACHE_VERSION}`;

// Determine the base path dynamically
const BASE_PATH = self.location.pathname.includes("/Quiz/") ? "/Quiz" : "";
const EXAM_MANIFEST_URL = `${BASE_PATH}/Script/examManifest.js`;

// Core app shell (always cached immediately)
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

// Install: Cache only core assets (fast install)
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version", CACHE_VERSION);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache core assets first
      console.log("[SW] Caching core assets...");
      let successCount = 0;
      let failCount = 0;

      for (const asset of CORE_ASSETS) {
        try {
          await cache.add(asset);
          successCount++;
        } catch (err) {
          console.warn("[SW] Failed to cache:", asset, err.message);
          failCount++;
        }
      }

      console.log(
        `[SW] ✅ Core assets cached: ${successCount} success, ${failCount} failed`
      );

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
    console.log("[SW] Fetching manifest from:", EXAM_MANIFEST_URL);
    const manifestResponse = await fetch(EXAM_MANIFEST_URL);

    if (!manifestResponse.ok) {
      throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
    }

    const manifestText = await manifestResponse.text();

    // Parse the manifest to extract exam paths
    // The manifest is a JS module, so we need to extract the examList array
    const examListMatch = manifestText.match(
      /export const examList = (\[[\s\S]*?\]);/
    );

    if (!examListMatch) {
      console.error("[SW] Could not parse examList from manifest");
      return;
    }

    // Parse the exam list JSON
    const examListStr = examListMatch[1];
    const examList = JSON.parse(examListStr);

    console.log(`[SW] Found ${examList.length} exams in manifest`);

    // Convert relative paths to absolute paths
    const examPaths = examList.map((exam) => {
      // exam.path looks like: "../Exams/Computer Network/Lecture 1 MCQ.js"
      // Convert to: "/Exams/Computer Network/Lecture 1 MCQ.js" or "/Quiz/Exams/..."
      const cleanPath = exam.path.replace(/^\.\.\//, "");
      return `${BASE_PATH}/${cleanPath}`;
    });

    console.log("[SW] Sample exam paths:", examPaths.slice(0, 3));

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
              console.log(`[SW] ✓ Cached: ${path}`);
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (err) {
            failed++;
            console.warn(`[SW] ✗ Failed to cache ${path}:`, err.message);
          }
        })
      );

      // Progress update every 10 exams
      const progress = i + BATCH_SIZE;
      if (progress % 10 === 0 || progress >= examPaths.length) {
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

    // Notify clients about the error
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "CACHE_ERROR",
        error: error.message,
      });
    });
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
          const fallback = await cache.match(`${BASE_PATH}/index.html`);
          if (fallback) return fallback;
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
    icon: `${BASE_PATH}/images/icon.png`,
    badge: `${BASE_PATH}/images/icon.png`,
    vibrate: [200, 100, 200],
    data: data.url || `${BASE_PATH}/`,
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
    event.waitUntil(
      clients.openWindow(event.notification.data || `${BASE_PATH}/`)
    );
  }
});
