// Script/dashboard.js - Enhanced with All Features
import { gameEngine, BADGES } from "./gameEngine.js";
import { examList } from "./examManifest.js";

// Delete history entry
window.deleteHistory = function (index) {
  if (!confirm("Are you sure you want to delete this quiz result?")) return;

  const user = gameEngine.getUserData();
  user.history.splice(index, 1);
  gameEngine.saveUserData(user);

  // Reload the page to refresh
  location.reload();
};

// Remove bookmark
window.removeBookmark = function (key) {
  if (!confirm("Remove this bookmark?")) return;

  const user = gameEngine.getUserData();
  if (user.bookmarks && user.bookmarks[key]) {
    delete user.bookmarks[key];
    gameEngine.saveUserData(user);
  }

  // Reload the page to refresh
  location.reload();
};

document.addEventListener("DOMContentLoaded", () => {
  const user = gameEngine.getUserData();
  const levelInfo = gameEngine.calculateLevel(user.totalPoints);

  // --- 1. Render Enhanced Stats ---
  const totalPointsEl = document.getElementById("totalPoints");
  const totalQuizzesEl = document.getElementById("totalQuizzes");
  const totalBadgesEl = document.getElementById("totalBadges");
  const currentLevelEl = document.getElementById("currentLevel");

  if (totalPointsEl)
    totalPointsEl.textContent = user.totalPoints?.toLocaleString() || 0;
  if (totalQuizzesEl)
    totalQuizzesEl.textContent = user.history ? user.history.length : 0;
  if (totalBadgesEl)
    totalBadgesEl.textContent = user.badges ? user.badges.length : 0;
  if (currentLevelEl) currentLevelEl.textContent = levelInfo.level;

  // --- 2. Render Level Progress ---
  const levelTitleEl = document.getElementById("levelTitle");
  const levelSubtitleEl = document.getElementById("levelSubtitle");
  const levelBadgeEl = document.getElementById("levelBadge");
  const levelProgressBarEl = document.getElementById("levelProgressBar");
  const currentXPEl = document.getElementById("currentXP");
  const nextLevelXPEl = document.getElementById("nextLevelXP");

  if (levelTitleEl) levelTitleEl.textContent = levelInfo.title;
  if (levelSubtitleEl) {
    levelSubtitleEl.textContent = `Level ${levelInfo.level} - ${
      levelInfo.level < 5
        ? "Keep learning!"
        : levelInfo.level < 10
        ? "You're improving!"
        : levelInfo.level < 15
        ? "Great progress!"
        : levelInfo.level < 20
        ? "Expert in training!"
        : "Mastermind!"
    }`;
  }
  if (levelBadgeEl) {
    levelBadgeEl.innerHTML = `<span class="level-number">${levelInfo.level}</span>`;
  }
  if (levelProgressBarEl) {
    levelProgressBarEl.style.width = `${levelInfo.progressPercent}%`;
  }
  if (currentXPEl) {
    currentXPEl.textContent = `${levelInfo.pointsInCurrentLevel} XP`;
  }
  if (nextLevelXPEl) {
    nextLevelXPEl.textContent = `${levelInfo.pointsNeededForNext} XP to next level`;
  }

  // --- 3. Render Statistics ---
  const accuracyRateEl = document.getElementById("accuracyRate");
  const perfectScoresEl = document.getElementById("perfectScores");
  const currentStreakEl = document.getElementById("currentStreak");
  const bestStreakEl = document.getElementById("bestStreak");

  if (user.history && user.history.length > 0) {
    // Calculate accuracy
    const totalCorrect = user.history.reduce((sum, h) => sum + h.score, 0);
    const totalQuestions = user.history.reduce((sum, h) => sum + h.total, 0);
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    // Count perfect scores
    const perfectCount = user.history.filter(
      (h) => h.percentage === 100
    ).length;

    if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
    if (perfectScoresEl) perfectScoresEl.textContent = perfectCount;
  } else {
    if (accuracyRateEl) accuracyRateEl.textContent = "0%";
    if (perfectScoresEl) perfectScoresEl.textContent = "0";
  }

  if (currentStreakEl) {
    const streak = user.streaks?.currentDaily || 0;
    currentStreakEl.textContent = `${streak} day${streak !== 1 ? "s" : ""}`;
  }
  if (bestStreakEl) {
    const best = user.streaks?.longestStreak || 0;
    bestStreakEl.textContent = `${best} day${best !== 1 ? "s" : ""}`;
  }

  // --- 4. Render History with Delete Buttons ---
  const historyList = document.getElementById("historyList");
  if (historyList) {
    if (!user.history || user.history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3 style="margin-bottom: 8px;">No History Yet</h3>
          <p style="color: var(--color-text-secondary);">Start a quiz to see your progress!</p>
        </div>
      `;
    } else {
      historyList.innerHTML = user.history
        .map((attempt, index) => {
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
                <h4 style="margin:0 0 4px 0;">${title}</h4>
                <small style="color: var(--color-text-tertiary);">${date} • Mode: ${
            attempt.mode || "Exam"
          }</small>
              </div>
              <div class="history-actions">
                <div class="history-score ${isPassing ? "pass" : "fail"}">
                  ${percentage}%
                </div>
                <button class="delete-btn" onclick="deleteHistory(${index})" title="Delete this result">
                  🗑️
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // --- 5. Render Bookmarked Questions with Unstar Buttons ---
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
        <div class="empty-state">
          <div class="empty-state-icon">⭐</div>
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
            <div class="history-item">
              <div class="history-info">
                <h4 style="margin:0 0 4px 0;">${cleanName}</h4>
                <small style="color: var(--color-text-tertiary)">Question #${
                  parseInt(qIdx) + 1
                }</small>
              </div>
              <div class="history-actions">
                <button class="nav-btn primary" 
                        style="padding: 10px 18px; font-size: 0.9rem;" 
                        onclick="location.href='quiz.html?id=${examId}&mode=practice&startAt=${qIdx}'">
                  Jump to Question
                </button>
                <button class="unstar-btn" onclick="removeBookmark('${key}')" title="Remove bookmark">
                  ⭐
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // --- 6. Render Enhanced Badges ---
  const badgeContainer = document.getElementById("badgeContainer");
  if (badgeContainer) {
    const userBadgeIds = user.badges || [];

    if (userBadgeIds.length === 0) {
      badgeContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🏆</div>
          <h3 style="margin-bottom: 8px;">No Badges Yet</h3>
          <p style="color: var(--color-text-secondary);">Keep practicing to earn badges!</p>
        </div>
      `;
    } else {
      badgeContainer.innerHTML = userBadgeIds
        .map((badgeId) => {
          const badge = BADGES.find((b) => b.id === badgeId);
          if (!badge) return "";

          return `
            <div class="dash-badge" title="${badge.desc}">
              <div class="badge-icon">${badge.icon}</div>
              <div class="badge-title">${badge.title}</div>
              <div class="badge-desc">${badge.desc}</div>
            </div>
          `;
        })
        .join("");
    }
  }

  // --- 7. Render Enhanced Leaderboard ---
  const leaderboardEl = document.getElementById("leaderboard");
  if (leaderboardEl) {
    // More diverse leaderboard with realistic names
    const mockUsers = [
      { name: "QuizMaster Pro", points: 12500, rank: 1 },
      { name: "Sarah Johnson", points: 10200, rank: 2 },
      { name: "Alex Chen", points: 9800, rank: 3 },
      { name: "Emma Williams", points: 8500, rank: 4 },
      { name: "Michael Brown", points: 7800, rank: 5 },
      { name: "Jessica Davis", points: 7200, rank: 6 },
      { name: "David Miller", points: 6900, rank: 7 },
      { name: "Sophia Garcia", points: 6400, rank: 8 },
      { name: "James Wilson", points: 5800, rank: 9 },
      { name: "Olivia Martinez", points: 5500, rank: 10 },
      { name: "Ethan Taylor", points: 5100, rank: 11 },
      { name: "Isabella Anderson", points: 4700, rank: 12 },
      { name: "Noah Thomas", points: 4300, rank: 13 },
      { name: "Ava Jackson", points: 3900, rank: 14 },
      { name: "Liam White", points: 3500, rank: 15 },
    ];

    const currentUser = {
      name: "You",
      points: user.totalPoints,
      rank: 0,
      isUser: true,
    };

    const all = [...mockUsers, currentUser].sort((a, b) => b.points - a.points);
    const rankedList = all.map((u, i) => ({ ...u, rank: i + 1 }));

    leaderboardEl.innerHTML = rankedList
      .slice(0, 15) // Top 15
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
          <div class="lb-row ${isCurrentUser ? "highlight" : ""}">
            <div class="lb-rank">
              <span style="font-size: 1.2rem; min-width: 30px;">${medalEmoji}</span>
              <small style="font-weight: ${
                isCurrentUser ? "700" : "500"
              }; min-width: 25px;">
                ${entry.rank}.
              </small>
              <span style="font-weight: ${isCurrentUser ? "700" : "500"};">
                ${entry.name}
              </span>
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
