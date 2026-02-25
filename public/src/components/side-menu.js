(function () {
  const menu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("sideMenuBackdrop");
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeMenuBtn");
  const animationToggle = document.getElementById("animationToggle");

  const FOCUSABLE =
    'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  // ✅ Replace with:
  animationToggle.addEventListener("change", () => {
    themeManager.applyAnimations(animationToggle.checked);
  });

  function openMenu() {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    backdrop.classList.add("visible");
    menuBtn.setAttribute("aria-expanded", "true");
    // Focus first focusable item
    const first = menu.querySelectorAll(FOCUSABLE)[0];
    if (first) first.focus();
  }

  function closeMenu() {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("visible");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.focus(); // restore focus
  }

  // Focus trap
  menu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = [...menu.querySelectorAll(FOCUSABLE)];
    const first = focusable[0],
      last = focusable[focusable.length - 1];
    if (
      e.shiftKey
        ? document.activeElement === first
        : document.activeElement === last
    ) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });

  menuBtn.addEventListener("click", () =>
    menu.classList.contains("open") ? closeMenu() : openMenu(),
  );
  closeBtn.addEventListener("click", closeMenu);
  backdrop.addEventListener("click", closeMenu);

  // Action buttons
  menu.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fn = window[btn.dataset.action];
      if (typeof fn === "function") fn();
      closeMenu();
    });
  });

  // Theme buttons
  // ✅ Replace with:
  menu.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      themeManager.applyTheme(btn.dataset.theme);
    });
  });

  // ── Contact Developer button ──────────────────────────────────────────────
  const contactDevBtn = document.getElementById("contactDevBtn");
  if (contactDevBtn) {
    contactDevBtn.addEventListener("click", () => {
      closeMenu();
      // Allow menu close animation to finish before showing overlay
      setTimeout(() => {
        if (typeof window.openContactOverlay === "function") {
          window.openContactOverlay();
        }
      }, 150);
    });
  }
})();

// Initialize Lucide icons (covers side-menu icons + any page-level icons)
if (typeof lucide !== "undefined") {
  lucide.createIcons();
} else {
  // Fallback: wait for the CDN script if it loads after the module
  window.addEventListener("load", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();
  });
}

// ============================================================================
// CONTACT OVERLAY
// ============================================================================

window.openContactOverlay = function () {
  const overlay = document.getElementById("contactDevOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
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

// Close overlay on backdrop click
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("contactDevOverlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeContactOverlay();
    });
  }
});
