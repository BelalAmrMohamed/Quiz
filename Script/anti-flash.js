// Script/anti-flash.js - Load theme BEFORE page renders
// This MUST be inline in <head> or loaded as first script (not module)

(function () {
  const THEME_KEY = "quiz_theme_pref";
  const ANIMATIONS_KEY = "quiz_animations_pref";

  // Apply theme immediately
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  const savedAnimations = localStorage.getItem(ANIMATIONS_KEY) !== "disabled";

  document.documentElement.setAttribute("data-theme", savedTheme);
  document.documentElement.setAttribute(
    "data-animations",
    savedAnimations ? "enabled" : "disabled"
  );
})();
