// Script/dashboard.js
import { gameEngine } from "./gameEngine.js";
import { examList } from "./examManifest.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = gameEngine.getUserData();

  // --- 1. Render Stats ---
  const totalPointsEl = document.getElementById("totalPoints");
  const examsTakenEl = document.getElementById("examsTaken");
  const accuracyEl = document.getElementById("accuracy");

  if (totalPointsEl) totalPointsEl.textContent = user.points || 0;
  if (examsTakenEl)
    examsTakenEl.textContent = user.history ? user.history.length : 0;

  if (accuracyEl && user.history && user.history.length > 0) {
    const totalScore = user.history.reduce((acc, curr) => acc + curr.score, 0);
    const totalPossible = user.history.reduce(
      (acc, curr) => acc + curr.total,
      0
    );
    const avg = Math.round((totalScore / totalPossible) * 100);
    accuracyEl.textContent = `${avg}%`;
  }

  // --- 2. Render History ---
  const historyList = document.getElementById("historyList");
  if (historyList) {
    if (!user.history || user.history.length === 0) {
      historyList.innerHTML = `<p class="empty-state">No exams completed yet. Start a quiz to see your progress!</p>`;
    } else {
      // Show last 5 attempts
      historyList.innerHTML = user.history
        .slice(-5)
        .reverse()
        .map((attempt) => {
          const exam = examList.find((e) => e.id === attempt.examId);
          const title = exam
            ? attempt.examId.replace(/-/g, " ")
            : "Deleted Quiz";
          const date = new Date(attempt.date).toLocaleDateString();

          return `
                    <div class="history-item">
                        <div class="history-info">
                            <h4>${title}</h4>
                            <small>${date} • Mode: ${
            attempt.mode || "Exam"
          }</small>
                        </div>
                        <div class="history-score">
                            <span class="score-pill">${attempt.score}/${
            attempt.total
          }</span>
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
              <p>No bookmarks yet. Star questions during a quiz to find them later!</p>
          </div>`;
    } else {
      bookmarkList.innerHTML = keys
        .map((key) => {
          const [examId, qIdx] = key.split("_");
          const cleanName = examId.replace(/-/g, " ").toUpperCase();

          // FIX: Added &startAt=${qIdx} to the URL
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

  // --- 4. Render Badges (FIXED ID: badgeContainer) ---
  const badgeContainer = document.getElementById("badgeContainer");
  if (badgeContainer) {
    const badges = user.badges || [];
    if (badges.length === 0) {
      badgeContainer.innerHTML = `<p class="empty-state">Keep practicing to earn badges!</p>`;
    } else {
      badgeContainer.innerHTML = badges
        .map((badge) => {
          // Safety check for earnedDate to prevent "undefined"
          const displayDate = badge.earnedDate
            ? `Earned on: ${badge.earnedDate}`
            : "Achievement Unlocked";

          return `
          <div class="badge-item active" title="${displayDate}">
              <div class="badge-icon">${badge.icon || "🏆"}</div>
              <div class="badge-name">${badge.name || "Badge"}</div>
          </div>
        `;
        })
        .join("");
    }
  }

  // --- 5. Render Leaderboard (FIXED ID: leaderboard) ---
  const leaderboardEl = document.getElementById("leaderboard");
  if (leaderboardEl) {
    // Simulated leaderboard based on your current points
    leaderboardEl.innerHTML = `
        <div class="history-item" style="padding: 10px; margin-bottom: 8px; border-left: 4px solid var(--color-primary);">
            <small>Rank 1 (You)</small>
            <strong style="margin-left: auto;">${user.points || 0} pts</strong>
        </div>
        <div class="history-item" style="padding: 10px; margin-bottom: 8px; opacity: 0.7;">
            <small>Rank 2 (AI Explorer)</small>
            <strong style="margin-left: auto;">1,250 pts</strong>
        </div>
        <div class="history-item" style="padding: 10px; opacity: 0.7;">
            <small>Rank 3 (Study Master)</small>
            <strong style="margin-left: auto;">980 pts</strong>
        </div>
    `;
  }
});
