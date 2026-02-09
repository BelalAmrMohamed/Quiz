export function showNotificationBadge(badge, displayName) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${badge.icon}</span>
      <div>
        <strong>Congratulations, ${displayName}!</strong>
        <p>You've earned the ${badge.title} badge!</p>
      </div>
      <button class="close-btn">×</button>
    </div>
  `;
  document.getElementById("notification-container").appendChild(notification);
  setTimeout(() => notification.classList.add("show"), 100);
  const timeout = setTimeout(() => removeNotificationBadge(notification), 5000);
  notification.querySelector(".close-btn").addEventListener("click", () => {
    clearTimeout(timeout);
    removeNotificationBadge(notification);
  });
}

function removeNotificationBadge(notif) {
  notif.classList.add("hide");
  setTimeout(() => notif.remove(), 300);
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