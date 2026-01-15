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
    });

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[Install] App is running in standalone mode");
    }

    // Create manual install button in header (always visible)
    this.createInstallButton();
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
            <li>🔌 Works offline</li>
            <li>⚡ Lightning fast</li>
            <li>🔔 Get notifications</li>
          </ul>
        </div>
        <div class="install-banner-actions">
          <button class="install-btn" id="installBtn">
            <span>📥</span> Install App
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
      alert(
        "Install prompt not available. Try adding to home screen manually from your browser menu."
      );
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

  // Create permanent install button in header
  createInstallButton() {
    // Only show if not installed and prompt is available
    window.addEventListener("beforeinstallprompt", () => {
      const headerInstallBtn = document.createElement("button");
      headerInstallBtn.id = "headerInstallBtn";
      headerInstallBtn.className = "header-install-btn";
      headerInstallBtn.innerHTML = "📥";
      headerInstallBtn.title = "Install App";

      headerInstallBtn.addEventListener("click", () => {
        this.triggerInstall();
      });

      // Try to add to header
      const header =
        document.querySelector("header") || document.querySelector(".header");
      if (header) {
        header.appendChild(headerInstallBtn);
      }
    });
  },

  // Check if app is installed
  isInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  },

  // Get install instructions for different platforms
  getInstallInstructions() {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("android")) {
      return {
        platform: "Android",
        steps: [
          "Tap the menu button (three dots) in your browser",
          'Select "Install app" or "Add to Home screen"',
          "Follow the prompts to install",
        ],
      };
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
      return {
        platform: "iOS",
        steps: [
          "Tap the Share button (square with arrow)",
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner',
        ],
      };
    } else {
      return {
        platform: "Desktop",
        steps: [
          "Look for the install icon in your address bar",
          "Click it and follow the prompts",
          "Or use the menu → Install Quiz Master",
        ],
      };
    }
  },

  // Show install instructions modal
  showInstallInstructions() {
    const instructions = this.getInstallInstructions();

    const modal = document.createElement("div");
    modal.className = "install-instructions-modal";
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('.install-instructions-modal').remove()">✕</button>
        <h2>Install on ${instructions.platform}</h2>
        <ol class="install-steps">
          ${instructions.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
        <img src="/Quiz/images/icon.png" alt="Quiz Master" class="modal-icon">
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 100);
  },
};
