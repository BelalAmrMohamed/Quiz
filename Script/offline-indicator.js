// Script/offline-indicator.js - Offline/Online Status Indicator

export const OfflineIndicator = {
  indicator: null,

  // Initialize offline indicator
  init() {
    this.createIndicator();
    this.updateStatus();

    // Listen for online/offline events
    window.addEventListener("online", () => this.updateStatus());
    window.addEventListener("offline", () => this.updateStatus());

    // Periodically check connection
    setInterval(() => this.checkConnection(), 30000); // Every 30 seconds
  },

  // Create offline indicator element
  createIndicator() {
    this.indicator = document.createElement("div");
    this.indicator.id = "offlineIndicator";
    this.indicator.className = "offline-indicator";
    document.body.appendChild(this.indicator);
  },

  // Update status based on navigator.onLine
  updateStatus() {
    if (!this.indicator) return;

    if (navigator.onLine) {
      this.showOnline();
    } else {
      this.showOffline();
    }
  },

  // Show offline status
  showOffline() {
    this.indicator.className = "offline-indicator offline show";
    this.indicator.innerHTML = `
      <div class="indicator-content">
        <span class="indicator-icon">📡</span>
        <span class="indicator-text">Offline Mode</span>
      </div>
    `;
  },

  // Show online status (briefly)
  showOnline() {
    // Only show "back online" if we were previously offline
    if (this.indicator.classList.contains("offline")) {
      this.indicator.className = "offline-indicator online show";
      this.indicator.innerHTML = `
        <div class="indicator-content">
          <span class="indicator-icon">✅</span>
          <span class="indicator-text">Back Online</span>
        </div>
      `;

      // Hide after 3 seconds
      setTimeout(() => {
        this.indicator.classList.remove("show");
      }, 3000);
    } else {
      // Just hide it if we're online and were online
      this.indicator.classList.remove("show");
    }
  },

  // Check connection by making a lightweight request
  async checkConnection() {
    try {
      const response = await fetch("/Quiz/manifest.json", {
        method: "HEAD",
        cache: "no-cache",
      });

      if (response.ok && !navigator.onLine) {
        // Browser says offline but we can reach the server
        window.dispatchEvent(new Event("online"));
      }
    } catch (error) {
      if (navigator.onLine) {
        // Browser says online but we can't reach the server
        window.dispatchEvent(new Event("offline"));
      }
    }
  },
};
