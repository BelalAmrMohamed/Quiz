// service-worker.js - Performance Optimized with Intelligent Caching
const CACHE_VERSION = "v1.0.4";
const CACHE_NAME = `quiz-master-${CACHE_VERSION}`;

const BASE_PATH = self.location.pathname.includes("/Quiz/") ? "/Quiz" : "";
const EXAM_MANIFEST_URL = `${BASE_PATH}/Script/examManifest.js`;

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

// Cache state tracking
let cachingInProgress = false;
let cachingPaused = false;

// Install: Cache only core assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version", CACHE_VERSION);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      let successCount = 0;
      let failCount = 0;

      // Cache core assets individually for better error handling
      for (const asset of CORE_ASSETS) {
        try {
          await cache.add(asset);
          successCount++;
        } catch (err) {
          console.warn("[SW] Failed to cache:", asset, err.message);
          failCount++;
        }
      }

      console.log(`[SW] ✅ Core cached: ${successCount}/${CORE_ASSETS.length}`);
      await self.skipWaiting();
    })()
  );
});

// Activate: Clean up and start intelligent caching
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
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();

      // Notify clients
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION });
      });

      console.log("[SW] Activated! Version:", CACHE_VERSION);

      // Start intelligent background caching (non-blocking)
      scheduleBackgroundCaching();
    })()
  );
});

// Intelligent background caching with idle callbacks
async function scheduleBackgroundCaching() {
  // Wait a bit before starting to let the app initialize
  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (cachingInProgress) return;
  cachingInProgress = true;

  console.log("[SW] 🚀 Scheduling intelligent background caching...");

  try {
    await cacheExamsIntelligently();
  } catch (error) {
    console.error("[SW] Background caching error:", error);
  } finally {
    cachingInProgress = false;
  }
}

// Intelligent caching strategy
async function cacheExamsIntelligently() {
  const cache = await caches.open(CACHE_NAME);

  // Fetch manifest
  const manifestResponse = await fetch(EXAM_MANIFEST_URL);
  if (!manifestResponse.ok) {
    throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
  }

  const manifestText = await manifestResponse.text();
  const examListMatch = manifestText.match(
    /export const examList = (\[[\s\S]*?\]);/
  );

  if (!examListMatch) {
    console.error("[SW] Could not parse examList from manifest");
    return;
  }

  const examList = JSON.parse(examListMatch[1]);
  console.log(`[SW] Found ${examList.length} exams to cache`);

  // Convert paths
  const examPaths = examList.map((exam) => {
    const cleanPath = exam.path.replace(/^\.\.\//, "");
    return `${BASE_PATH}/${cleanPath}`;
  });

  // Get recently accessed exams (priority caching)
  const recentExams = await getRecentExams();
  const priorityPaths = examPaths.filter((path) =>
    recentExams.some((recent) => path.includes(recent))
  );
  const remainingPaths = examPaths.filter(
    (path) => !priorityPaths.includes(path)
  );

  let cached = 0;
  let alreadyCached = 0;
  let failed = 0;

  // Phase 1: Cache priority exams (recently accessed)
  if (priorityPaths.length > 0) {
    console.log(`[SW] 📌 Caching ${priorityPaths.length} priority exams...`);
    const result = await cacheExamBatch(cache, priorityPaths, 3);
    cached += result.cached;
    alreadyCached += result.alreadyCached;
    failed += result.failed;
  }

  // Phase 2: Cache remaining exams during idle time
  console.log(
    `[SW] ⏳ Caching ${remainingPaths.length} remaining exams during idle...`
  );

  // Adaptive batch size based on device (smaller batches = less lag)
  const batchSize = getAdaptiveBatchSize();

  for (let i = 0; i < remainingPaths.length; i += batchSize) {
    // Check if we should pause (e.g., user is actively using the app)
    if (cachingPaused) {
      console.log("[SW] ⏸️ Pausing background caching");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      cachingPaused = false;
    }

    const batch = remainingPaths.slice(i, i + batchSize);

    // Use longer delays between batches to avoid blocking
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await cacheExamBatch(cache, batch, batchSize);
    cached += result.cached;
    alreadyCached += result.alreadyCached;
    failed += result.failed;

    // Throttled progress updates (every 15 exams instead of 10)
    if ((i + batchSize) % 15 === 0 || i + batchSize >= remainingPaths.length) {
      const total = cached + alreadyCached;
      console.log(
        `[SW] Progress: ${total}/${examPaths.length} (${Math.round(
          (total / examPaths.length) * 100
        )}%)`
      );

      // Notify clients less frequently to reduce overhead
      notifyClients({
        type: "CACHE_PROGRESS",
        cached: total,
        total: examPaths.length,
      });
    }
  }

  const total = cached + alreadyCached;
  console.log(
    `[SW] ✅ Complete! ${total}/${examPaths.length} cached, ${failed} failed`
  );

  notifyClients({
    type: "CACHE_COMPLETE",
    cached: total,
    failed: failed,
    total: examPaths.length,
  });
}

// Cache a batch of exams
async function cacheExamBatch(cache, paths, batchSize) {
  let cached = 0;
  let alreadyCached = 0;
  let failed = 0;

  // Process in smaller parallel groups
  const parallelLimit = Math.min(batchSize, 3); // Max 3 simultaneous requests

  for (let i = 0; i < paths.length; i += parallelLimit) {
    const batch = paths.slice(i, i + parallelLimit);

    await Promise.all(
      batch.map(async (path) => {
        try {
          const cachedResponse = await cache.match(path);
          if (cachedResponse) {
            alreadyCached++;
            return;
          }

          const response = await fetch(path);
          if (response.ok) {
            await cache.put(path, response);
            cached++;
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (err) {
          failed++;
          console.warn(`[SW] Failed: ${path}`);
        }
      })
    );
  }

  return { cached, alreadyCached, failed };
}

// Adaptive batch sizing based on device capabilities
function getAdaptiveBatchSize() {
  // Try to detect device capability (simple heuristic)
  const connection = self.navigator?.connection;

  if (connection) {
    // Slow connection = smaller batches
    if (
      connection.effectiveType === "2g" ||
      connection.effectiveType === "slow-2g"
    ) {
      return 2;
    }
    if (connection.effectiveType === "3g") {
      return 3;
    }
  }

  // Default: 4 exams per batch (balanced)
  return 4;
}

// Get recently accessed exams for priority caching
async function getRecentExams() {
  const clients = await self.clients.matchAll();
  const recentExams = [];

  // Try to get recent exam info from clients
  // This is a simple implementation - you could enhance it
  return recentExams;
}

// Notify all clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage(message));
}

// Fetch: Optimized cache-first strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  event.respondWith(
    (async () => {
      // Try cache first
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      // Not in cache, fetch from network
      try {
        const networkResponse = await fetch(request);

        // Cache successful responses (but don't block the response)
        if (networkResponse?.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone()).catch(() => {});
        }

        return networkResponse;
      } catch (error) {
        // Fallback for documents
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

// Message handling
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CHECK_FOR_UPDATES") {
    event.waitUntil(checkForUpdates());
  }

  if (event.data.type === "CACHE_EXAMS_NOW") {
    event.waitUntil(scheduleBackgroundCaching());
  }

  if (event.data.type === "PAUSE_CACHING") {
    cachingPaused = true;
  }

  if (event.data.type === "RESUME_CACHING") {
    cachingPaused = false;
  }

  if (event.data.type === "GET_CACHE_STATUS") {
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
    console.error("[SW] Cache status error:", error);
  }
}

// Check for updates
async function checkForUpdates() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedManifest = await cache.match(EXAM_MANIFEST_URL);
    const networkManifest = await fetch(EXAM_MANIFEST_URL);

    if (cachedManifest && networkManifest) {
      const cachedText = await cachedManifest.text();
      const networkText = await networkManifest.text();

      if (cachedText !== networkText) {
        await cache.put(EXAM_MANIFEST_URL, networkManifest.clone());

        notifyClients({
          type: "NEW_QUIZZES_AVAILABLE",
          message: "New quizzes are available!",
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || `${BASE_PATH}/`)
    );
  }
});
