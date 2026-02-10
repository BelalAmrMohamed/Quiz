// Script/notifications.js
// Import in a JS file:
// import { showNotification, showNotificationBadge, confirmationNotification } from "./notifications.js";
// Include the CSS file in an HTML page:
// <link rel="stylesheet" href="CSS/notificatinos.css">

/* =========================================
   Unified Notification System
   Look: Glassmorphism (Gamified)
   Logic: Stackable Toasts with Auto-Dismiss
   ========================================= */

export function showNotification(title, message = "", type = "info") {
  // 1. Get or Create Container (Logic from Function 2)
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }

  // 2. Determine Icon and Class (Hybrid Logic)
  let icon = type; // Default to passing string directly
  let typeClass = "info";

  switch (type) {
    case "success":
      icon = "✅";
      typeClass = "success";
      break;
    case "error":
      icon = "❌";
      typeClass = "error";
      break;
    case "warning":
      icon = "⚠️";
      typeClass = "warning";
      break;
    case "info":
    default:
      icon = "ℹ️";
      typeClass = "info";
      break;
  }

  // Check if the 'type' passed was actually a custom URL or Icon string override
  // If the user passed a specific string instead of a type keyword, usage adaptation:
  if (!["success", "error", "warning", "info"].includes(type)) {
     icon = type; // The type argument is treated as the icon
     typeClass = "default";
  }

  // 3. Create Notification Element
  const toast = document.createElement("div");
  // We apply 'toast-enter' animation immediately via CSS
  toast.className = `notification glass-toast ${typeClass}`;

  // 4. Construct HTML (Visual Structure from Function 1, Safety from Function 2)
  const iconHTML = isURL(icon) 
    ? `<img src="${icon}" alt="Icon" class="notification-image">` 
    : `<span class="notification-icon">${icon}</span>`;

  toast.innerHTML = `
    <div class="notification-content">
      ${iconHTML}
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
      <button class="close-btn">×</button>
    </div>
  `;

  // 5. Append to Container
  // Prepend makes new ones appear at the top, Append at the bottom. 
  // Based on your CSS (bottom-right), 'prepend' usually looks better so the stack pushes up.
  container.prepend(toast); 

  // 6. Lifecycle Management
  
  // A. Auto Dismiss Timer
  const autoDismissTimeout = setTimeout(() => {
    removeToast(toast);
  }, 5000);

  // B. Manual Close Button
  const closeBtn = toast.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    clearTimeout(autoDismissTimeout); // Stop the auto-timer
    removeToast(toast); // Remove immediately
  });
}

// Helper: Remove with Animation
function removeToast(toast) {
  toast.style.animation = "toastSlideOut 0.4s forwards cubic-bezier(0.68, -0.55, 0.27, 1.55)";
  toast.addEventListener("animationend", () => {
    toast.remove();
  });
}

// Helper: Security (From Logic Source)
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Helper: URL Check (From Visual Source)
function isURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;  
  }
}
/* ============================
    Confirmation Modal
   ============================ */

export function confirmationNotification(message) {
  return new Promise((resolve) => {
    // 1. Create Overlay
    const overlay = document.createElement("div");
    overlay.className = "confirmation-overlay";
    
    // 2. Create Modal
    const modal = document.createElement("div");
    modal.className = "confirmation-modal";
    
    // 3. Content
    modal.innerHTML = `
      <div class="confirmation-content">
        <p class="confirmation-message">${escapeHtml(message)}</p>
        <div class="confirmation-actions">
          <button class="confirmation-btn cancel">Cancel</button>
          <button class="confirmation-btn confirm">Ok</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 4. Focus Management
    const confirmBtn = modal.querySelector(".confirm");
    const cancelBtn = modal.querySelector(".cancel");
    const previousActiveElement = document.activeElement;

    // Animation entry
    requestAnimationFrame(() => {
      overlay.classList.add("show");
      modal.classList.add("show");
      confirmBtn.focus();
    });

    // 5. Cleanup function
    const cleanup = () => {
      window.removeEventListener("keydown", handleKeydown);
      overlay.classList.remove("show");
      modal.classList.remove("show");
      
      // Wait for animation to finish
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (previousActiveElement && document.body.contains(previousActiveElement)) {
          previousActiveElement.focus();
        }
      }, 300);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    // 6. Keyboard support (Escape and Tab trapping)
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleCancel();
      } else if (e.key === "Tab") {
        const focusable = modal.querySelectorAll("button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    // Event Listeners
    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
    window.addEventListener("keydown", handleKeydown);
    
    // Click outside treats as cancel
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) handleCancel();
    });
  });
} 
