// Script/notifications.js - In-App Notification Manager (No Push Notifications)

const NOTIFICATION_STORAGE_KEY = "quiz_notifications_settings";

export const NotificationManager = {
  // Initialize notification system
  async init() {
    console.log("[Notifications] Initializing in-app notifications...");

    // Listen for new quiz updates from service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NEW_QUIZZES_AVAILABLE") {
          this.showNewQuizNotification();
        }
      });
    }
  },

  // Get notification settings
  getSettings() {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          achievementPopups: true,
          newQuizAlerts: true,
        };
  },

  // Save notification settings
  saveSettings(settings) {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  },

  // Show achievement popup
  showAchievement(badge) {
    const settings = this.getSettings();
    if (!settings.achievementPopups) return;

    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-badge">${badge.icon}</div>
        <h3>Achievement Unlocked!</h3>
        <p class="achievement-title">${badge.title}</p>
        <p class="achievement-desc">${badge.desc}</p>
      </div>
    `;
    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => popup.classList.add("show"), 100);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }, 5000);

    // Play sound
    this.playNotificationSound();
  },

  // Show new quiz notification banner
  showNewQuizNotification() {
    const settings = this.getSettings();
    if (!settings.newQuizAlerts) return;

    const banner = document.createElement("div");
    banner.className = "notification-banner new-quiz";
    banner.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">📚</span>
        <div class="notification-text">
          <strong>New quizzes available!</strong>
          <p>Fresh content has been added. Check them out!</p>
        </div>
        <button class="notification-action" onclick="window.location.reload()">Refresh</button>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Show badge on app icon if supported
    this.updateAppBadge(1);

    // Play sound
    this.playNotificationSound();
  },

  // Update app badge (number on icon)
  updateAppBadge(count) {
    if ("setAppBadge" in navigator) {
      navigator.setAppBadge(count).catch((err) => {
        console.log("[Notifications] Badge not supported:", err);
      });
    }
  },

  // Clear app badge
  clearAppBadge() {
    if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch((err) => {
        console.log("[Notifications] Badge not supported:", err);
      });
    }
  },

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OScTgwMUKrk8LJjHAU7kdry"
      );
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if autoplay blocked
    } catch (error) {
      // Silently fail
    }
  },

  // Create notification center UI (side panel)
  createNotificationCenter() {
    const container = document.createElement("div");
    container.id = "notificationCenter";
    container.className = "notification-center";

    const settings = this.getSettings();

    container.innerHTML = `
      <div class="notification-center-header">
        <h3>🔔 Notification Settings</h3>
        <button class="close-btn" onclick="document.getElementById('notificationCenter').classList.remove('show')">✕</button>
      </div>
      
      <div class="notification-center-body">
        <p class="notification-intro">
          All notifications appear as in-app popups while you're using the quiz app.
        </p>

        <div class="notification-setting">
          <div class="setting-info">
            <label>🏆 Achievement Popups</label>
            <p>Show popups when you earn badges</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="achievementPopupsToggle" ${
              settings.achievementPopups ? "checked" : ""
            }>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="notification-setting">
          <div class="setting-info">
            <label>📚 New Quiz Alerts</label>
            <p>Get notified when new quizzes are added</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="newQuizAlertsToggle" ${
              settings.newQuizAlerts ? "checked" : ""
            }>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="notification-info-box">
          <p>💡 <strong>Note:</strong> All notifications appear as popups within the app. They will only show when you have the quiz app open in your browser or installed on your device.</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Attach event listeners
    this.attachEventListeners();
  },

  // Attach event listeners to notification center
  attachEventListeners() {
    const achievementToggle = document.getElementById(
      "achievementPopupsToggle"
    );
    const newQuizToggle = document.getElementById("newQuizAlertsToggle");

    achievementToggle?.addEventListener("change", (e) => {
      const settings = this.getSettings();
      settings.achievementPopups = e.target.checked;
      this.saveSettings(settings);
    });

    newQuizToggle?.addEventListener("change", (e) => {
      const settings = this.getSettings();
      settings.newQuizAlerts = e.target.checked;
      this.saveSettings(settings);
    });
  },

  // Open notification center
  openNotificationCenter() {
    let center = document.getElementById("notificationCenter");
    if (!center) {
      this.createNotificationCenter();
      center = document.getElementById("notificationCenter");
    }
    center?.classList.add("show");
  },
};
