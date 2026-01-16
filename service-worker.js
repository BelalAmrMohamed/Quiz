// service-worker.js - Minimal PWA support
const CACHE_VERSION = "v2.0.0";

// Install: Just complete immediately, no caching
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  self.skipWaiting(); // Activate immediately
});

// Activate: Clean up and claim clients
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    (async () => {
      // Delete ALL old caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      await self.clients.claim();

      console.log("[SW] Activated! (No caching enabled)");
    })()
  );
});

// Fetch: Pass everything through to network - NO caching whatsoever
self.addEventListener("fetch", (event) => {
  // Just let all requests go through normally
  // No interception, no caching, nothing
  return;
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
