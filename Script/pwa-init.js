// Script/pwa-init.js - Initialize All PWA Features

import { NotificationManager } from "./notifications.js";
import { InstallPrompt } from "./install-prompt.js";
import { OfflineIndicator } from "./offline-indicator.js";

// Global PWA Manager
window.PWAManager = {
  serviceWorkerReady: false,

  // Initialize all PWA features
  async init() {
    console.log("[PWA] Initializing...");

    // 1. Register Service Worker
    await this.registerServiceWorker();

    // 2. Initialize Offline Indicator
    OfflineIndicator.init();

    // 3. Initialize Install Prompt
    InstallPrompt.init();

    // 4. Initialize Notification System
    await NotificationManager.init();

    // 5. Check for updates periodically
    this.startUpdateChecker();

    // 6. Create notification center button
    this.createNotificationButton();

    console.log("[PWA] Initialization complete!");
  },

  // Register service worker
  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.warn("[PWA] Service Workers not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/Quiz/service-worker.js",
        {
          scope: "/Quiz/",
        }
      );

      console.log("[PWA] Service Worker registered:", registration.scope);

      // Check for updates on page load
      registration.update();

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker is ready
            this.showUpdateNotification();
          }
        });
      });

      // Service worker is ready
      if (registration.active) {
        this.serviceWorkerReady = true;
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    } catch (error) {
      console.error("[PWA] Service Worker registration failed:", error);
    }
  },

  // Handle messages from service worker
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case "SW_ACTIVATED":
        console.log("[PWA] Service Worker activated, version:", data.version);
        this.serviceWorkerReady = true;
        break;

      case "EXAMS_UPDATED":
        console.log("[PWA] Exam manifest updated");
        this.showUpdateNotification();
        break;

      case "NEW_QUIZZES_AVAILABLE":
        NotificationManager.showNewQuizNotification();
        break;

      default:
        console.log("[PWA] Received message:", data);
    }
  },

  // Show update notification
  showUpdateNotification() {
    const banner = document.createElement("div");
    banner.className = "update-notification";
    banner.innerHTML = `
      <div class="update-content">
        <span class="update-icon">🔄</span>
        <div class="update-text">
          <strong>Update Available</strong>
          <p>A new version is ready to install</p>
        </div>
        <button class="update-btn" onclick="window.PWAManager.applyUpdate()">Update Now</button>
        <button class="update-dismiss" onclick="this.closest('.update-notification').remove()">Later</button>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add("show"), 100);
  },

  // Apply update by reloading
  applyUpdate() {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  },

  // Check for updates periodically (every 30 minutes)
  startUpdateChecker() {
    setInterval(async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration(
          "/Quiz/"
        );
        if (registration) {
          registration.update();

          // Also check for new exam content
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "CHECK_FOR_UPDATES",
            });
          }
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  },

  // Create notification center button in header
  createNotificationButton() {
    const btn = document.createElement("button");
    btn.id = "notificationCenterBtn";
    btn.className = "notification-center-btn";
    btn.innerHTML = "🔔";
    btn.title = "Notification Settings";
    btn.onclick = () => NotificationManager.openNotificationCenter();

    // Try to add to header
    const header =
      document.querySelector("header") || document.querySelector(".header");
    if (header) {
      header.appendChild(btn);
    } else {
      // Fallback: Create floating button
      btn.classList.add("floating");
      document.body.appendChild(btn);
    }
  },

  // Get PWA status
  getStatus() {
    return {
      serviceWorkerReady: this.serviceWorkerReady,
      isInstalled: InstallPrompt.isInstalled(),
      isOnline: navigator.onLine,
      notificationsEnabled: Notification.permission === "granted",
    };
  },
};

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.PWAManager.init());
} else {
  window.PWAManager.init();
}

// Export for use in other scripts
export default window.PWAManager;
