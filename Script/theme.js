// Script/theme.js
const THEME_KEY = "quiz_theme_pref";

export const themeManager = {
  init() {
    const saved = localStorage.getItem(THEME_KEY);
    // Default to light if nothing is saved
    const theme = saved || "light";
    this.applyTheme(theme);

    // Setup toggle only if the button exists (e.g., on the main page menu)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupToggle());
    } else {
      this.setupToggle();
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    const icon = document.querySelector(".theme-icon-display");
    if (icon) icon.textContent = theme === "dark" ? "🌙" : "☀️";
  },

  toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    this.applyTheme(current === "dark" ? "light" : "dark");
  },

  setupToggle() {
    const btn = document.getElementById("themeToggle");
    if (btn) btn.onclick = () => this.toggle();
  },
};

themeManager.init();
