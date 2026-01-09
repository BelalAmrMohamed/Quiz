// Script/dashboard.js
import { gameEngine } from "./gameEngine.js";
import { examList } from "./examManifest.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = gameEngine.getUserData();

  // --- 1. Render Stats (FIXED) ---
  const totalPointsEl = document.getElementById("totalPoints");
  const totalQuizzesEl = document.getElementById("totalQuizzes");
  const totalBadgesEl = document.getElementById("totalBadges");

  if (totalPointsEl) totalPointsEl.textContent = user.totalPoints || 0;
  if (totalQuizzesEl)
    totalQuizzesEl.textContent = user.history ? user.history.length : 0;
  if (totalBadgesEl)
    totalBadgesEl.textContent = user.badges ? user.badges.length : 0;

  // --- 2. Render History (FIXED - No limit, show all) ---
  const historyList = document.getElementById("historyList");
  if (historyList) {
    if (!user.history || user.history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state" style="text-align:center; padding: 40px; background: var(--color-background-secondary); border-radius: 15px;">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">📝</div>
          <h3 style="margin-bottom: 8px;">No History Yet</h3>
          <p style="color: var(--color-text-secondary);">Start a quiz to see your progress!</p>
        </div>
      `;
    } else {
      // Show ALL attempts, most recent first
      historyList.innerHTML = user.history
        .map((attempt) => {
          const exam = examList.find((e) => e.id === attempt.examId);
          const title = exam
            ? exam.title || attempt.examId.replace(/-/g, " ")
            : "Deleted Quiz";
          const date = new Date(attempt.date).toLocaleDateString();
          const percentage =
            attempt.percentage ||
            Math.round((attempt.score / attempt.total) * 100);
          const isPassing = percentage >= 60;

          return `
            <div class="history-item">
              <div class="history-info">
                <h4>${title}</h4>
                <small>${date} • Mode: ${attempt.mode || "Exam"}</small>
              </div>
              <div class="history-score ${isPassing ? "pass" : "fail"}">
                ${percentage}%
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // --- 3. Render Bookmarked Questions ---
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    const bookmarkSection = document.createElement("div");
    bookmarkSection.id = "bookmarks-section";
    bookmarkSection.style.marginTop = "40px";
    bookmarkSection.innerHTML = `
      <div class="section-header" style="margin-bottom: 20px;">
        <h2 style="display: flex; align-items: center; gap: 10px;">
          <span style="color: var(--color-warning);">⭐</span> Bookmarked Questions
        </h2>
        <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Review items you've flagged for study.</p>
      </div>
      <div id="bookmarkList" class="history-list"></div>
    `;
    mainContent.appendChild(bookmarkSection);

    const bookmarkList = document.getElementById("bookmarkList");
    const bookmarks = user.bookmarks || {};
    const keys = Object.keys(bookmarks);

    if (keys.length === 0) {
      bookmarkList.innerHTML = `
        <div class="empty-state" style="text-align:center; padding: 40px; background: var(--color-background-secondary); border-radius: 15px;">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">⭐</div>
          <h3 style="margin-bottom: 8px;">No Bookmarks Yet</h3>
          <p style="color: var(--color-text-secondary);">Star questions during a quiz to find them later!</p>
        </div>
      `;
    } else {
      bookmarkList.innerHTML = keys
        .map((key) => {
          const [examId, qIdx] = key.split("_");
          const exam = examList.find((e) => e.id === examId);
          const cleanName = exam ? exam.title : examId.replace(/-/g, " ");

          return `
            <div class="history-item" style="display: flex; justify-content: space-between; align-items: center;">
              <div class="history-info">
                <h4 style="margin:0">${cleanName}</h4>
                <small style="color: var(--color-text-tertiary)">Question #${
                  parseInt(qIdx) + 1
                }</small>
              </div>
              <button class="nav-btn primary" 
                      style="width:auto; padding: 8px 16px; font-size: 0.85rem; cursor: pointer;" 
                      onclick="location.href='quiz.html?id=${examId}&mode=practice&startAt=${qIdx}'">
                Jump to Question
              </button>
            </div>
          `;
        })
        .join("");
    }
  }

  // --- 4. Render Badges (FIXED) ---
  const badgeContainer = document.getElementById("badgeContainer");
  if (badgeContainer) {
    const userBadgeIds = user.badges || [];

    if (userBadgeIds.length === 0) {
      badgeContainer.innerHTML = `
        <div class="empty-state" style="text-align:center; padding: 40px; background: var(--color-background-secondary); border-radius: 15px;">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">🏆</div>
          <h3 style="margin-bottom: 8px;">No Badges Yet</h3>
          <p style="color: var(--color-text-secondary);">Keep practicing to earn badges!</p>
        </div>
      `;
    } else {
      // Import BADGES from gameEngine to get full badge details
      import("./gameEngine.js").then((module) => {
        const BADGES = [
          {
            id: "perfect-score",
            icon: "🏆",
            title: "Perfectionist",
            desc: "Score 100% on a quiz",
          },
          {
            id: "speed-demon",
            icon: "⚡",
            title: "Speed Demon",
            desc: "Complete a quiz in under 2 minutes",
          },
          {
            id: "week-warrior",
            icon: "🔥",
            title: "Week Warrior",
            desc: "Take quizzes 7 days in a row",
          },
          {
            id: "novice",
            icon: "🌱",
            title: "First Step",
            desc: "Complete your first quiz",
          },
        ];

        badgeContainer.innerHTML = userBadgeIds
          .map((badgeId) => {
            const badge = BADGES.find((b) => b.id === badgeId);
            if (!badge) return "";

            return `
              <div class="dash-badge" title="${badge.desc}">
                <div style="font-size: 2rem; margin-bottom: 4px;">${badge.icon}</div>
                <div style="font-size: 0.75rem; font-weight: 600;">${badge.title}</div>
              </div>
            `;
          })
          .join("");
      });
    }
  }

  // --- 5. Render Leaderboard (FIXED) ---
  const leaderboardEl = document.getElementById("leaderboard");
  if (leaderboardEl) {
    const leaderboard = gameEngine.getLeaderboard();

    leaderboardEl.innerHTML = leaderboard
      .slice(0, 10) // Top 10 only
      .map((entry) => {
        const isCurrentUser = entry.isUser;
        const medalEmoji =
          entry.rank === 1
            ? "🥇"
            : entry.rank === 2
            ? "🥈"
            : entry.rank === 3
            ? "🥉"
            : "";

        return `
          <div class="lb-row ${isCurrentUser ? "highlight" : ""}" 
               style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--color-border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.2rem; min-width: 24px;">${medalEmoji}</span>
              <small style="font-weight: ${isCurrentUser ? "700" : "500"};">
                ${entry.rank}. ${entry.name}
              </small>
            </div>
            <strong style="color: ${
              isCurrentUser
                ? "var(--color-primary)"
                : "var(--color-text-primary)"
            };">
              ${entry.points.toLocaleString()} pts
            </strong>
          </div>
        `;
      })
      .join("");
  }
});
