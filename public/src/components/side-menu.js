// ============================================================================
// side-menu.js — Persistent collapsible icon-rail sidebar
// Desktop: 64px collapsed ↔ 240px expanded, state in localStorage
// Mobile (≤768px): overlay from left with backdrop
// ============================================================================

(function () {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sideMenuBackdrop");
  const hamburgerBtn = document.getElementById("menuBtn"); // mobile-only
  const closeBtn = document.getElementById("closeMenuBtn"); // mobile-only
  const toggleBtn = document.getElementById("sidebarToggle"); // desktop-only
  const animationToggle = document.getElementById("animationToggle");

  const MOBILE_BP = 768;
  const STORAGE_KEY = "sidebar_expanded";
  const FOCUSABLE =
    'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  // ── Helpers ────────────────────────────────────────────────────────────────

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  /** Apply sidebar expanded/collapsed state on desktop */
  function applyDesktopState(expanded) {
    if (expanded) {
      sidebar.classList.add("expanded");
      document.body.classList.add("sidebar-expanded");
    } else {
      sidebar.classList.remove("expanded");
      document.body.classList.remove("sidebar-expanded");
    }
  }

  /** Open the sidebar (mobile overlay mode) */
  function openMobileSidebar() {
    sidebar.classList.add("expanded");
    backdrop.classList.add("visible");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // prevent scroll behind overlay
    // Focus first focusable item
    const first = sidebar.querySelectorAll(FOCUSABLE)[0];
    if (first) first.focus();
  }

  /** Close the sidebar (mobile overlay mode) */
  function closeMobileSidebar() {
    sidebar.classList.remove("expanded");
    backdrop.classList.remove("visible");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    hamburgerBtn.focus();
  }

  // ── Initialise ─────────────────────────────────────────────────────────────

  function init() {
    if (!sidebar) return;

    if (isMobile()) {
      // Mobile: sidebar starts hidden
      sidebar.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    } else {
      // Desktop: restore saved preference
      const saved = localStorage.getItem(STORAGE_KEY);
      const expanded = saved === null ? false : saved === "true";
      applyDesktopState(expanded);
      sidebar.setAttribute("aria-hidden", "false");
    }

    // Sync theme buttons pressed state
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    sidebar.querySelectorAll("[data-theme]").forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.dataset.theme === currentTheme ? "true" : "false",
      );
    });

    // Sync animation toggle state
    if (animationToggle) {
      const animsEnabled =
        document.documentElement.getAttribute("data-animations") !== "disabled";
      animationToggle.checked = animsEnabled;
    }
  }

  // ── Desktop Toggle ──────────────────────────────────────────────────────────

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const willExpand = !sidebar.classList.contains("expanded");
      applyDesktopState(willExpand);
      try {
        localStorage.setItem(STORAGE_KEY, String(willExpand));
      } catch (_) {}
    });
  }

  // ── Mobile Hamburger ────────────────────────────────────────────────────────

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      if (sidebar.classList.contains("expanded")) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  // ── Mobile Close Button ─────────────────────────────────────────────────────

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileSidebar);
  }

  // ── Backdrop Click ──────────────────────────────────────────────────────────

  if (backdrop) {
    backdrop.addEventListener("click", closeMobileSidebar);
  }

  // ── Focus trap (mobile keyboard) ───────────────────────────────────────────

  if (sidebar) {
    sidebar.addEventListener("keydown", (e) => {
      if (!isMobile()) return;

      if (e.key === "Escape") {
        closeMobileSidebar();
        return;
      }

      if (e.key !== "Tab") return;
      const focusable = [...sidebar.querySelectorAll(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        e.shiftKey
          ? document.activeElement === first
          : document.activeElement === last
      ) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    });
  }

  // ── Resize: reset state on breakpoint cross ─────────────────────────────────

  let lastMobile = isMobile();
  window.addEventListener("resize", () => {
    const nowMobile = isMobile();
    if (nowMobile === lastMobile) return;
    lastMobile = nowMobile;

    if (!nowMobile) {
      // Switched to desktop — restore preference, remove overlay artefacts
      backdrop.classList.remove("visible");
      document.body.style.overflow = "";
      sidebar.setAttribute("aria-hidden", "false");
      const saved = localStorage.getItem(STORAGE_KEY);
      applyDesktopState(saved === "true");
    } else {
      // Switched to mobile — close/reset
      sidebar.classList.remove("expanded");
      document.body.classList.remove("sidebar-expanded");
      backdrop.classList.remove("visible");
      sidebar.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  });

  // ── Action buttons (data-action) ────────────────────────────────────────────

  sidebar.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fn = window[btn.dataset.action];
      if (typeof fn === "function") fn();
      if (isMobile()) closeMobileSidebar();
    });
  });

  // ── Theme buttons ───────────────────────────────────────────────────────────

  sidebar.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (typeof themeManager !== "undefined" && themeManager.applyTheme) {
        themeManager.applyTheme(btn.dataset.theme);
      }
      // Update pressed states
      sidebar.querySelectorAll("[data-theme]").forEach((b) => {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  // ── Animation toggle ────────────────────────────────────────────────────────

  if (animationToggle) {
    animationToggle.addEventListener("change", () => {
      if (typeof themeManager !== "undefined" && themeManager.applyAnimations) {
        themeManager.applyAnimations(animationToggle.checked);
      }
    });
  }

  // ── Contact Developer button ────────────────────────────────────────────────

  const contactDevBtn = document.getElementById("contactDevBtn");
  if (contactDevBtn) {
    contactDevBtn.addEventListener("click", () => {
      if (isMobile()) closeMobileSidebar();
      else {
        // The side bar is expanded
        const sideBarIsNotExpanded = !sidebar.classList.contains("expanded");

        if (!sideBarIsNotExpanded) {
          applyDesktopState(sideBarIsNotExpanded);
          try {
            localStorage.setItem(STORAGE_KEY, String(sideBarIsNotExpanded));
          } catch (_) {}
        }
      }

      setTimeout(
        () => {
          if (typeof window.openContactOverlay === "function") {
            window.openContactOverlay();
          }
        },
        isMobile() ? 150 : 0,
      );
    });
  }

  // ── Run ─────────────────────────────────────────────────────────────────────
  init();
})();

// ============================================================================
// CONTACT OVERLAY
// ============================================================================

const phoneNumber = "201118482193";
const emailAddress = "belalamrofficial@gmail.com";

window.openContactOverlay = function () {
  const overlay = document.getElementById("contactDevOverlay");
  if (overlay) overlay.style.display = "flex";
};

window.closeContactOverlay = function () {
  const overlay = document.getElementById("contactDevOverlay");
  if (overlay) overlay.style.display = "none";
};

window.contactViaWhatsApp = function () {
  window.open(`https://wa.me/${phoneNumber}`, "_blank");
  closeContactOverlay();
};

window.contactViaTelegram = function () {
  window.open("https://t.me/BelalAmrMohamed", "_blank");
  closeContactOverlay();
};

window.contactViaEmail = function () {
  window.location.href = `mailto:${emailAddress}`;
  closeContactOverlay();
};

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("contactDevOverlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeContactOverlay();
    });
  }
});
