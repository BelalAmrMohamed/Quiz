// theme-controller.js - Enhanced Theme Management System

const THEME_KEY = "quiz_theme_pref";
const ANIMATIONS_KEY = "quiz_animations_pref";

export const themeManager = {
  themes: {
    light: { name: "Light", icon: "☀️", label: "Light Mode" },
    "dark-slate": { name: "Dark Slate", icon: "🌙", label: "Dark Slate" },
    dark: { name: "Dark", icon: "🌑", label: "Dark Mode" },
  },

  init() {
    // Load saved preferences or use defaults
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    const savedAnimations = localStorage.getItem(ANIMATIONS_KEY) !== "disabled";

    this.applyTheme(savedTheme);
    this.applyAnimations(savedAnimations);

    // Setup controls when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupControls());
    } else {
      this.setupControls();
    }
  },

  applyTheme(theme) {
    // Validate theme
    if (!this.themes[theme]) {
      theme = "light";
    }

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update UI if elements exist
    this.updateThemeUI(theme);
  },

  // applyAnimations(enabled) {
  //   document.documentElement.setAttribute(
  //     "data-animations",
  //     enabled ? "enabled" : "disabled"
  //   );
  //   localStorage.setItem(ANIMATIONS_KEY, enabled ? "enabled" : "disabled");

  //   // Update UI if elements exist
  //   this.updateAnimationsUI(enabled);
  // },

  applyAnimations(enabled) {
    // 1. Manage the physical CSS file in the <head>
    const ANIM_ID = "dynamic-animations-stylesheet";
    let link = document.getElementById(ANIM_ID);

    if (enabled) {
      if (!link) {
        link = document.createElement("link");
        link.id = ANIM_ID;
        link.rel = "stylesheet";
        link.href = "CSS/animations.css"; // Ensure this path matches your folder structure
        document.head.appendChild(link);
      }
    } else {
      if (link) {
        link.remove(); // This completely unloads the file and its rules
      }
    }

    // 2. Existing logic for attributes and storage
    document.documentElement.setAttribute(
      "data-animations",
      enabled ? "enabled" : "disabled"
    );
    localStorage.setItem(ANIMATIONS_KEY, enabled ? "enabled" : "disabled");

    // 3. Update UI
    this.updateAnimationsUI(enabled);
  },

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  },

  getAnimationsEnabled() {
    return (
      document.documentElement.getAttribute("data-animations") !== "disabled"
    );
  },

  cycleTheme() {
    const themeKeys = Object.keys(this.themes);
    const currentTheme = this.getCurrentTheme();
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];

    this.applyTheme(nextTheme);
  },

  toggleAnimations() {
    const enabled = this.getAnimationsEnabled();
    this.applyAnimations(!enabled);
  },

  updateThemeUI(theme) {
    // Update simple theme toggle button (legacy support)
    const themeIcon = document.querySelector(".theme-icon-display");
    if (themeIcon) {
      themeIcon.textContent = this.themes[theme].icon;
    }

    // Update theme selector buttons
    document.querySelectorAll(".theme-selector-btn").forEach((btn) => {
      const btnTheme = btn.dataset.theme;
      if (btnTheme === theme) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update theme label
    const themeLabel = document.querySelector(".current-theme-label");
    if (themeLabel) {
      themeLabel.textContent = this.themes[theme].label;
    }
  },

  updateAnimationsUI(enabled) {
    // Update animation toggle switches
    document.querySelectorAll(".animation-toggle-switch").forEach((toggle) => {
      if (enabled) {
        toggle.classList.add("active");
      } else {
        toggle.classList.remove("active");
      }
    });

    // Update animation toggle checkboxes
    document
      .querySelectorAll('input[type="checkbox"][data-control="animations"]')
      .forEach((checkbox) => {
        checkbox.checked = enabled;
      });

    // Update animation status label
    const animLabel = document.querySelector(".animation-status-label");
    if (animLabel) {
      animLabel.textContent = enabled ? "On" : "Off";
    }
  },

  setupControls() {
    // Legacy theme toggle button (cycles through themes)
    const legacyToggle = document.getElementById("themeToggle");
    if (legacyToggle) {
      legacyToggle.onclick = () => this.cycleTheme();
    }

    // Modern theme selector buttons
    document.querySelectorAll(".theme-selector-btn").forEach((btn) => {
      btn.onclick = () => {
        const theme = btn.dataset.theme;
        if (theme) {
          this.applyTheme(theme);
        }
      };
    });

    // Animation toggle switches/buttons
    document.querySelectorAll(".animation-toggle-btn").forEach((btn) => {
      btn.onclick = () => this.toggleAnimations();
    });

    document.querySelectorAll(".animation-toggle-switch").forEach((toggle) => {
      toggle.onclick = () => this.toggleAnimations();
    });

    // Animation toggle checkboxes
    document
      .querySelectorAll('input[type="checkbox"][data-control="animations"]')
      .forEach((checkbox) => {
        checkbox.onchange = (e) => this.applyAnimations(e.target.checked);
      });

    // Initialize UI state
    this.updateThemeUI(this.getCurrentTheme());
    this.updateAnimationsUI(this.getAnimationsEnabled());
  },
};

// Auto-initialize when script loads
themeManager.init();
