// Script/pwa-init.js - Initialize All PWA Features (FIXED)

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

    // 6. Integrate PWA features into side menu
    this.integratePWAIntoSideMenu();

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

      case "CACHE_PROGRESS":
        console.log(`[PWA] Caching progress: ${data.cached}/${data.total}`);
        this.updateCacheProgress(data.cached, data.total);
        break;

      case "CACHE_COMPLETE":
        console.log(
          `[PWA] ✅ Caching complete! ${data.cached}/${data.total} exams cached`
        );
        this.showCacheCompleteNotification(data.cached, data.total);
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

  // Show update notification (in-app banner)
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

  // Update cache progress indicator
  updateCacheProgress(cached, total) {
    const progressBar = document.getElementById("cacheProgressBar");

    if (!progressBar) {
      // Create progress bar if it doesn't exist
      const progressContainer = document.createElement("div");
      progressContainer.className = "cache-progress-container";
      progressContainer.innerHTML = `
        <div class="cache-progress-content">
          <div class="cache-progress-icon">📥</div>
          <div class="cache-progress-text">
            <strong>Downloading quizzes for offline use</strong>
            <p><span id="cacheProgressText">${cached}/${total}</span> quizzes</p>
          </div>
          <div class="cache-progress-bar-wrapper">
            <div class="cache-progress-bar" id="cacheProgressBar" style="width: ${
              (cached / total) * 100
            }%"></div>
          </div>
        </div>
      `;
      document.body.appendChild(progressContainer);
      setTimeout(() => progressContainer.classList.add("show"), 100);
    } else {
      // Update existing progress bar
      const percentage = (cached / total) * 100;
      progressBar.style.width = percentage + "%";
      document.getElementById(
        "cacheProgressText"
      ).textContent = `${cached}/${total}`;
    }
  },

  // Show cache complete notification
  showCacheCompleteNotification(cached, total) {
    // Remove progress bar
    const progressContainer = document.querySelector(
      ".cache-progress-container"
    );
    if (progressContainer) {
      progressContainer.classList.remove("show");
      setTimeout(() => progressContainer.remove(), 300);
    }

    // Show completion message
    const notification = document.createElement("div");
    notification.className = "cache-complete-notification";
    notification.innerHTML = `
      <div class="cache-complete-content">
        <div class="cache-complete-icon">✅</div>
        <div class="cache-complete-text">
          <strong>Ready for offline use!</strong>
          <p>${cached} quizzes are now available offline</p>
        </div>
        <button class="cache-complete-dismiss" onclick="this.closest('.cache-complete-notification').remove()">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 100);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 5000);
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

  // Integrate PWA features into the side menu
  integratePWAIntoSideMenu() {
    // Wait for DOM to be ready
    const waitForSideMenu = setInterval(() => {
      const sideMenu = document.getElementById("sideMenu");
      if (sideMenu) {
        clearInterval(waitForSideMenu);
        this.addPWAMenuItems(sideMenu);
      }
    }, 100);

    // Stop trying after 5 seconds
    setTimeout(() => clearInterval(waitForSideMenu), 5000);
  },

  // Add PWA menu items to the side menu
  addPWAMenuItems(sideMenu) {
    const nav = sideMenu.querySelector("nav");
    if (!nav) return;

    // Create PWA section
    const pwaSection = document.createElement("div");
    pwaSection.className = "pwa-section";
    pwaSection.innerHTML = `
      <div class="menu-divider"></div>
      <div class="pwa-section-header">App Features</div>
      
      <!-- Install App Button -->
      <button class="menu-item pwa-install-btn" id="pwaInstallBtn" style="display: none;">
        <span class="menu-item-icon">📱</span>
        <span class="menu-item-text">Install App</span>
      </button>

      <!-- Notification Settings Button -->
      <button class="menu-item pwa-notifications-btn" id="pwaNotificationsBtn">
        <span class="menu-item-icon">🔔</span>
        <span class="menu-item-text">Notification Settings</span>
      </button>
    `;

    // Add to nav (before the last child or at the end)
    nav.appendChild(pwaSection);

    // Attach event listeners
    this.attachPWAEventListeners();

    // Update UI based on current state
    this.updatePWAMenuUI();
  },

  // Attach event listeners to PWA menu items
  attachPWAEventListeners() {
    // Install button
    const installBtn = document.getElementById("pwaInstallBtn");
    if (installBtn) {
      installBtn.addEventListener("click", () => {
        InstallPrompt.showInstall();
        // Close menu after action
        document.getElementById("sideMenu")?.classList.remove("open");
      });
    }

    // Notifications button
    const notificationsBtn = document.getElementById("pwaNotificationsBtn");
    if (notificationsBtn) {
      notificationsBtn.addEventListener("click", () => {
        NotificationManager.openNotificationCenter();
        // Close menu after action
        document.getElementById("sideMenu")?.classList.remove("open");
      });
    }

    // Listen for custom install available event
    window.addEventListener("installAvailable", () => {
      console.log("[PWA] Install is available!");
      this.updatePWAMenuUI();
    });

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed!");
      this.updatePWAMenuUI();
    });

    // Listen for online/offline events
    window.addEventListener("online", () => this.updatePWAMenuUI());
    window.addEventListener("offline", () => this.updatePWAMenuUI());
  },

  // Update PWA menu UI based on current state
  updatePWAMenuUI() {
    const installBtn = document.getElementById("pwaInstallBtn");

    // Show/hide install button based on availability
    if (installBtn) {
      if (InstallPrompt.canInstall()) {
        installBtn.style.display = "flex";
        console.log("[PWA] Showing install button in menu");
      } else {
        installBtn.style.display = "none";
        console.log("[PWA] Hiding install button in menu");
      }
    }
  },

  // Get PWA status
  getStatus() {
    return {
      serviceWorkerReady: this.serviceWorkerReady,
      isInstalled: InstallPrompt.isInstalled(),
      isOnline: navigator.onLine,
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
