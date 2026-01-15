// Script/install-prompt.js - PWA Installation Prompt

let deferredPrompt = null;

export const InstallPrompt = {
  // Initialize install prompt
  init() {
    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent default mini-infobar
      e.preventDefault();

      // Store the event for later use
      deferredPrompt = e;

      // Notify that install is available
      window.dispatchEvent(new Event("beforeinstallprompt"));

      // Show custom install prompt immediately on first visit
      if (!this.hasBeenDismissed()) {
        this.showInstallBanner();
      }
    });

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      console.log("[Install] PWA installed successfully");
      this.hideInstallBanner();
      deferredPrompt = null;

      // Show success message
      this.showSuccessMessage();

      // Notify app installed
      window.dispatchEvent(new Event("appinstalled"));
    });

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[Install] App is running in standalone mode");
    }
  },

  // Check if install prompt can be shown
  canInstall() {
    return deferredPrompt !== null && !this.isInstalled();
  },

  // Show install (called from menu button)
  showInstall() {
    if (deferredPrompt) {
      this.triggerInstall();
    } else if (!this.isInstalled()) {
      // Show manual instructions if prompt not available
      alert(
        "To install this app:\n\n" +
          "• On Android/Chrome: Tap menu (⋮) → Install app\n" +
          "• On iOS/Safari: Tap Share (⎙) → Add to Home Screen\n" +
          "• On Desktop: Look for the install icon in the address bar"
      );
    }
  },

  // Check if install prompt has been dismissed
  hasBeenDismissed() {
    return localStorage.getItem("install_banner_dismissed") === "true";
  },

  // Mark install prompt as dismissed
  markDismissed() {
    localStorage.setItem("install_banner_dismissed", "true");
  },

  // Show install banner
  showInstallBanner() {
    // Don't show if already dismissed or if already installed
    if (this.hasBeenDismissed() || this.isInstalled()) {
      return;
    }

    // Remove existing banner if any
    const existingBanner = document.getElementById("installBanner");
    if (existingBanner) {
      return; // Banner already showing
    }

    const banner = document.createElement("div");
    banner.id = "installBanner";
    banner.className = "install-banner";
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon">
          <img src="/Quiz/images/icon.png" alt="Quiz Master">
        </div>
        <div class="install-banner-text">
          <h3>Install Quiz Master</h3>
          <p>Get faster access and work offline!</p>
          <ul class="install-features">
            <li>📱 Quick access from home screen</li>
            <li>📌 Works offline</li>
            <li>⚡ Lightning fast</li>
            <li>🔔 Get notifications</li>
          </ul>
        </div>
        <div class="install-banner-actions">
          <button class="install-btn" id="installBtn">
            <span>🔥</span> Install App
          </button>
          <button class="dismiss-btn" id="dismissBtn">
            Maybe Later
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Attach event listeners
    document.getElementById("installBtn")?.addEventListener("click", () => {
      this.triggerInstall();
    });

    document.getElementById("dismissBtn")?.addEventListener("click", () => {
      this.hideInstallBanner();
      this.markDismissed();
    });

    // Show banner with animation
    setTimeout(() => banner.classList.add("show"), 100);
  },

  // Hide install banner
  hideInstallBanner() {
    const banner = document.getElementById("installBanner");
    if (banner) {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }
  },

  // Trigger install prompt
  async triggerInstall() {
    if (!deferredPrompt) {
      console.log("[Install] No deferred prompt available");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[Install] User accepted the install prompt");
    } else {
      console.log("[Install] User dismissed the install prompt");
      this.markDismissed();
    }

    // Clear the deferred prompt
    deferredPrompt = null;
    this.hideInstallBanner();

    // Update UI
    window.dispatchEvent(new Event("appinstalled"));
  },

  // Show success message after install
  showSuccessMessage() {
    const message = document.createElement("div");
    message.className = "install-success";
    message.innerHTML = `
      <div class="install-success-content">
        <div class="success-icon">✅</div>
        <h3>Successfully Installed!</h3>
        <p>Quiz Master is now on your home screen</p>
      </div>
    `;
    document.body.appendChild(message);

    setTimeout(() => message.classList.add("show"), 100);
    setTimeout(() => {
      message.classList.remove("show");
      setTimeout(() => message.remove(), 300);
    }, 4000);
  },

  // Check if app is installed
  isInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  },
};
