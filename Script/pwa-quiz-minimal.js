// Script/pwa-quiz-minimal.js - Minimal PWA for Quiz Page
// This version doesn't show any UI elements during the exam
// but ensures the service worker is active

(async function () {
  "use strict";

  // Only ensure service worker is registered (no UI)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/Quiz/service-worker.js",
        { scope: "/Quiz/" }
      );

      // Silently check for updates
      registration.update();

      console.log("[Quiz PWA] Service worker active");
    } catch (error) {
      console.warn("[Quiz PWA] Service worker registration failed:", error);
    }
  }

  // Listen for service worker messages (for critical updates only)
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      // Only handle critical messages during quiz
      if (event.data.type === "NEW_QUIZZES_AVAILABLE") {
        // Store flag to show notification after quiz ends
        sessionStorage.setItem("quiz_updates_available", "true");
      }
    });
  }

  // Show subtle offline indicator if needed
  if (!navigator.onLine) {
    showOfflineIndicator();
  }

  window.addEventListener("online", hideOfflineIndicator);
  window.addEventListener("offline", showOfflineIndicator);

  function showOfflineIndicator() {
    const indicator = document.getElementById("quizOfflineIndicator");
    if (!indicator) {
      const div = document.createElement("div");
      div.id = "quizOfflineIndicator";
      div.className = "quiz-offline-indicator";
      div.innerHTML = "📡 Offline Mode";
      document.body.appendChild(div);
    }
  }

  function hideOfflineIndicator() {
    const indicator = document.getElementById("quizOfflineIndicator");
    if (indicator) {
      indicator.remove();
    }
  }
})();
