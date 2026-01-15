// Script/notifications.js - Local Notification Manager (No Server Required)

const NOTIFICATION_STORAGE_KEY = "quiz_notifications_settings";
const LAST_ACTIVITY_KEY = "quiz_last_activity";

export const NotificationManager = {
  // Initialize notification system
  async init() {
    // Request permission if not already granted
    if ("Notification" in window && Notification.permission === "default") {
      // Don't auto-request, let user enable from settings
      console.log("[Notifications] Permission not yet requested");
    }

    // Check for streak reminders on page load
    this.checkStreakReminder();

    // Update last activity
    this.updateLastActivity();

    // Schedule daily check
    this.scheduleDailyCheck();

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
          dailyReminder: false,
          dailyReminderTime: "18:00",
          streakReminder: true,
          achievementPopups: true,
          newQuizAlerts: true,
        };
  },

  // Save notification settings
  saveSettings(settings) {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  },

  // Request notification permission
  async requestPermission() {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  // Update last activity timestamp
  updateLastActivity() {
    localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
  },

  // Check if user has been inactive for 3+ days
  checkStreakReminder() {
    const settings = this.getSettings();
    if (!settings.streakReminder) return;

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return;

    const lastDate = new Date(lastActivity);
    const now = new Date();
    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 3) {
      this.showStreakReminderBanner(daysDiff);
    }
  },

  // Show streak reminder banner (in-app, not push notification)
  showStreakReminderBanner(days) {
    const banner = document.createElement("div");
    banner.className = "notification-banner streak-reminder";
    banner.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🔥</span>
        <div class="notification-text">
          <strong>Your streak is waiting!</strong>
          <p>You haven't studied in ${days} days. Keep your momentum going!</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Auto-remove after 10 seconds
    setTimeout(() => banner.remove(), 10000);
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

    // Play sound if available
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
  },

  // Schedule daily reminder check
  scheduleDailyCheck() {
    const settings = this.getSettings();
    if (!settings.dailyReminder) return;

    // Check every minute if it's time for daily reminder
    setInterval(() => {
      this.checkDailyReminder();
    }, 60000); // Every minute
  },

  // Check if it's time for daily reminder
  checkDailyReminder() {
    const settings = this.getSettings();
    if (!settings.dailyReminder) return;

    const now = new Date();
    const [targetHour, targetMinute] = settings.dailyReminderTime
      .split(":")
      .map(Number);

    // Check if current time matches reminder time (within 1 minute)
    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
      const lastReminder = localStorage.getItem("last_daily_reminder");
      const today = now.toDateString();

      // Only show once per day
      if (lastReminder !== today) {
        this.sendDailyReminder();
        localStorage.setItem("last_daily_reminder", today);
      }
    }
  },

  // Send daily reminder notification
  async sendDailyReminder() {
    if (Notification.permission === "granted") {
      new Notification("Quiz Master - Daily Practice", {
        body: "Time to sharpen your skills! 🎯",
        icon: "/Quiz/images/icon.png",
        badge: "/Quiz/images/icon.png",
        tag: "daily-reminder",
        requireInteraction: false,
      });
    } else {
      // Show in-app banner instead
      const banner = document.createElement("div");
      banner.className = "notification-banner daily-reminder";
      banner.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">🎯</span>
          <div class="notification-text">
            <strong>Daily Practice Time!</strong>
            <p>Ready to test your knowledge?</p>
          </div>
          <button class="notification-action" onclick="window.location.href='/Quiz/'">Start Quiz</button>
          <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
      `;
      document.body.appendChild(banner);
    }
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

  // Create notification center UI
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
        <div class="notification-setting">
          <div class="setting-info">
            <label>📅 Daily Study Reminder</label>
            <p>Get reminded to practice every day</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="dailyReminderToggle" ${
              settings.dailyReminder ? "checked" : ""
            }>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="notification-setting time-picker ${
          settings.dailyReminder ? "" : "disabled"
        }">
          <label>⏰ Reminder Time</label>
          <input type="time" id="dailyReminderTime" value="${
            settings.dailyReminderTime
          }" ${settings.dailyReminder ? "" : "disabled"}>
        </div>

        <div class="notification-setting">
          <div class="setting-info">
            <label>🔥 Streak Reminders</label>
            <p>Get notified after 3 days of inactivity</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="streakReminderToggle" ${
              settings.streakReminder ? "checked" : ""
            }>
            <span class="toggle-slider"></span>
          </label>
        </div>

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

        <button class="enable-push-btn" id="enablePushBtn">
          ${
            Notification.permission === "granted"
              ? "✅ Push Notifications Enabled"
              : "🔔 Enable Push Notifications"
          }
        </button>

        <p class="notification-note">
          💡 Note: Notifications work best when the app is installed on your device.
        </p>
      </div>
    `;

    document.body.appendChild(container);

    // Attach event listeners
    this.attachEventListeners();
  },

  // Attach event listeners to notification center
  attachEventListeners() {
    const dailyToggle = document.getElementById("dailyReminderToggle");
    const dailyTime = document.getElementById("dailyReminderTime");
    const streakToggle = document.getElementById("streakReminderToggle");
    const achievementToggle = document.getElementById(
      "achievementPopupsToggle"
    );
    const newQuizToggle = document.getElementById("newQuizAlertsToggle");
    const enablePushBtn = document.getElementById("enablePushBtn");

    dailyToggle?.addEventListener("change", (e) => {
      const settings = this.getSettings();
      settings.dailyReminder = e.target.checked;
      this.saveSettings(settings);

      const timePicker = dailyTime.closest(".time-picker");
      if (e.target.checked) {
        timePicker?.classList.remove("disabled");
        dailyTime.disabled = false;
      } else {
        timePicker?.classList.add("disabled");
        dailyTime.disabled = true;
      }
    });

    dailyTime?.addEventListener("change", (e) => {
      const settings = this.getSettings();
      settings.dailyReminderTime = e.target.value;
      this.saveSettings(settings);
    });

    streakToggle?.addEventListener("change", (e) => {
      const settings = this.getSettings();
      settings.streakReminder = e.target.checked;
      this.saveSettings(settings);
    });

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

    enablePushBtn?.addEventListener("click", async () => {
      if (Notification.permission === "granted") {
        alert("Push notifications are already enabled! ✅");
      } else {
        const granted = await this.requestPermission();
        if (granted) {
          enablePushBtn.textContent = "✅ Push Notifications Enabled";
          alert("Push notifications enabled! You will now receive reminders.");
        } else {
          alert(
            "Please enable notifications in your browser settings to receive reminders."
          );
        }
      }
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
