// Script/install-prompt.js - PWA Installation Prompt (FIXED)

let deferredPrompt = null;
let isInstallBannerDismissed = false;

export const InstallPrompt = {
  // Initialize install prompt
  init() {
    console.log("[Install] Initializing...");

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("[Install] beforeinstallprompt event fired!");

      // Prevent default mini-infobar
      e.preventDefault();

      // Store the event for later use
      deferredPrompt = e;

      // Show custom install banner immediately on first visit
      if (!this.hasBeenDismissed() && !this.isInstalled()) {
        setTimeout(() => this.showInstallBanner(), 1000);
      }

      // Notify that install is available (for menu button)
      this.notifyInstallAvailable();
    });

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      console.log("[Install] PWA installed successfully!");
      this.hideInstallBanner();
      deferredPrompt = null;
      this.showSuccessMessage();
    });

    // Check if already installed (standalone mode)
    if (this.isInstalled()) {
      console.log("[Install] App is already installed");
    }

    // Load dismissed state
    isInstallBannerDismissed =
      localStorage.getItem("install_banner_dismissed") === "true";
  },

  // Notify that install is available
  notifyInstallAvailable() {
    // Dispatch custom event for menu button to show
    window.dispatchEvent(new CustomEvent("installAvailable"));
  },

  // Check if install prompt can be shown
  canInstall() {
    return deferredPrompt !== null && !this.isInstalled();
  },

  // Show install (called from menu button)
  showInstall() {
    console.log(
      "[Install] showInstall called, deferredPrompt:",
      !!deferredPrompt
    );

    if (this.isInstalled()) {
      this.showModal(
        "Already Installed",
        "Quiz Master is already installed on this device!"
      );
      return;
    }

    if (deferredPrompt) {
      this.triggerInstall();
    } else {
      // Show manual instructions if prompt not available
      this.showManualInstructions();
    }
  },

  // Check if install prompt has been dismissed
  hasBeenDismissed() {
    return isInstallBannerDismissed;
  },

  // Mark install prompt as dismissed
  markDismissed() {
    isInstallBannerDismissed = true;
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
        </div>
        <div class="install-banner-actions">
          <button class="install-btn" id="installBtn">Install</button>
          <button class="dismiss-btn" id="dismissBtn">×</button>
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
      this.showManualInstructions();
      return;
    }

    try {
      // Show the install prompt
      console.log("[Install] Showing install prompt...");
      deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("[Install] User accepted the install prompt");
      } else {
        console.log("[Install] User dismissed the install prompt");
        this.markDismissed();
      }
    } catch (error) {
      console.error("[Install] Error triggering install:", error);
      this.showManualInstructions();
    }

    // Clear the deferred prompt
    deferredPrompt = null;
    this.hideInstallBanner();
  },

  // Show manual installation instructions
  showManualInstructions() {
    const modal = document.createElement("div");
    modal.className = "install-modal";
    modal.innerHTML = `
      <div class="install-modal-content">
        <button class="modal-close-btn" onclick="this.closest('.install-modal').remove()">×</button>
        <h2>📱 Install Quiz Master</h2>
        <p>Follow these steps to install the app on your device:</p>
        
        <div class="install-steps">
          <div class="install-step">
            <h3>🤖 Android (Chrome/Edge)</h3>
            <ol>
              <li>Tap the menu button (⋮) in the top right</li>
              <li>Select "Install app" or "Add to Home screen"</li>
              <li>Confirm to install</li>
            </ol>
          </div>
          
          <div class="install-step">
            <h3>🍎 iOS (Safari)</h3>
            <ol>
              <li>Tap the Share button at the bottom</li>
              <li>Scroll and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
          
          <div class="install-step">
            <h3>💻 Desktop (Chrome/Edge/Brave)</h3>
            <ol>
              <li>Look for the install icon (⊕) in the address bar</li>
              <li>Click it and select "Install"</li>
              <li>Or use browser menu → "Install Quiz Master"</li>
            </ol>
          </div>
        </div>
        
        <button class="modal-primary-btn" onclick="this.closest('.install-modal').remove()">
          Got it!
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 100);
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

  // Show simple modal
  showModal(title, message) {
    const modal = document.createElement("div");
    modal.className = "install-modal";
    modal.innerHTML = `
      <div class="install-modal-content">
        <button class="modal-close-btn" onclick="this.closest('.install-modal').remove()">×</button>
        <h2>${title}</h2>
        <p>${message}</p>
        <button class="modal-primary-btn" onclick="this.closest('.install-modal').remove()">OK</button>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 100);
  },

  // Check if app is installed
  isInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  },
};
