// Script/notifications.js
// Import in a JS file:
// import { showNotification, showNotificationBadge, confirmationNotification } from "./notifications.js";
// Include the CSS file in an HTML page:
// <link rel="stylesheet" href="CSS/notificatinos.css">

// ==================
// Notification Badge
// ==================

export function showNotificationBadge(strongText, message = "", icon = "info") {
  const notification = document.createElement("div");
  switch (icon){
    case "info":
      icon = "ℹ️";
      notification.className = "notification info";
      break;

      case "success":
      icon = "✅";
      notification.className = "notification success";
      break;

      case "error":        
      icon = "❌";
      notification.className = "notification error";
      break;

      case "warning":
      icon = "⚠️";
      notification.className = "notification warning";
      break;

      default:
      notification.className = "notification";

  }  
  notification.innerHTML = `
    <div class="notification-content">
    
    ${isURL(icon) ? `<img src="${icon}" alt="Context Icon" class="notification-image">` : `<span class="notification-icon">${icon}</span>`}      
      <div>
        <strong>${strongText}!</strong>
        <p>${message}</p>
      </div>
      <button class="close-btn">×</button>
    </div>
  `;
  document.getElementById("notification-container").appendChild(notification);
  setTimeout(() => notification.classList.add("show"), 100);
  const timeout = setTimeout(() => removeNotificationBadge(notification), 50000);
  notification.querySelector(".close-btn").addEventListener("click", () => {
    clearTimeout(timeout);
    removeNotificationBadge(notification);
  });
}

function removeNotificationBadge(notif) {
  notif.classList.add("hide");
  setTimeout(() => notif.remove(), 300);
}

function isURL(string) {
  try {
    const url = new URL(string);
    // Optional: Ensure the protocol is http or https
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;  
  }
}
/* ============================ 
    Smaller notifications
   ============================ */

export function showNotification(message, type = "info") {
  // 1. Get or Create Container
  let container = document.querySelector(".notification-container-small");
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container-small";
    document.body.appendChild(container);
  }

  // 2. Create Toast
  const toast = document.createElement("div");
  toast.className = `notification-toast ${type}`;

  // Icon based on type
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${escapeHtml(message)}</div>
  `;

  // 3. Append to Container (Newest at bottom)
  container.appendChild(toast);

  // 4. Auto Dismiss
  // Handle rapid fire: each toast has its own timer
  setTimeout(() => {
    toast.classList.add("hiding");

    // Remove from DOM after animation
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 5000);
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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
