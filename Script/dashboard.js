// Script/dashboard.js - Enhanced with All Features
import { gameEngine, BADGES } from "./gameEngine.js";
import { examList } from "./examManifest.js";

import { confirmationNotification } from "./notifications.js";


function refreshUI() {
  const user = gameEngine.getUserData();
  renderStats(user);
  renderHistory(user);
  renderBookmarks(user);
  renderBadges(user);
  renderLeaderboard(user);
  
  // Update username display
  const nameDisplay = document.getElementById("userNameDisplay");
  if (nameDisplay) {
    const currentName = localStorage.getItem("username") || "User";
    nameDisplay.textContent = currentName;
  }
}

// Delete history entry
window.deleteHistory = async function (index) {
  if (!await confirmationNotification("Are you sure you want to delete this quiz result?")) return;

  const user = gameEngine.getUserData();
  user.history.splice(index, 1);
  gameEngine.saveUserData(user);

  // Update UI immediately without reload
  refreshUI();
};

// Remove bookmark
window.removeBookmark = async function (key) {
  if (!await confirmationNotification("Remove this bookmark?")) return;

  const user = gameEngine.getUserData();
  if (user.bookmarks && user.bookmarks[key]) {
    delete user.bookmarks[key];
    gameEngine.saveUserData(user);
  }

  // Update UI immediately without reload
  refreshUI();
};

// Change username
window.changeUsername = function () {
  const currentName = localStorage.getItem("username") || "User";
  const newName = prompt("Enter your new display name:", currentName);
  if (!newName || !newName.trim()) return;

  localStorage.setItem("username", newName.trim());
  refreshUI();
};

document.addEventListener("DOMContentLoaded", () => {
  refreshUI();
});

function renderStats(user) {
  const levelInfo = gameEngine.calculateLevel(user.totalPoints);

  // Core Stats
  document.getElementById("totalPoints").textContent =
    user.totalPoints?.toLocaleString() || 0;
  document.getElementById("totalQuizzes").textContent = user.history
    ? user.history.length
    : 0;
  document.getElementById("totalBadges").textContent = user.badges
    ? user.badges.length
    : 0;
  document.getElementById("currentLevel").textContent = levelInfo.level;

  // Level Details
  document.getElementById("levelTitle").textContent = levelInfo.title;
  document.getElementById("levelBadge").innerHTML =
    `<span class="level-number">${levelInfo.level}</span>`;
  document.getElementById("levelProgressBar").style.width = `${
    levelInfo.progressPercent || 0
  }%`;
  document.getElementById("currentXP").textContent = `${
    levelInfo.pointsInCurrentLevel || 0
  } XP`;
  document.getElementById("nextLevelXP").textContent = `${
    levelInfo.pointsNeededForNext || 0
  } XP to next level`;

  // Statistics Sidebar
  const accuracyRateEl = document.getElementById("accuracyRate");
  const perfectScoresEl = document.getElementById("perfectScores");

  if (user.history && user.history.length > 0) {
    const totalCorrect = user.history.reduce(
      (sum, h) => sum + (h.score || 0),
      0,
    );
    const totalQuestions = user.history.reduce(
      (sum, h) => sum + (h.total || 0),
      0,
    );
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;
    const perfectCount = user.history.filter(
      (h) => h.percentage === 100,
    ).length;

    accuracyRateEl.textContent = `${accuracy}%`;
    perfectScoresEl.textContent = perfectCount;
  }

  document.getElementById("currentStreak").textContent = `${
    user.streaks?.currentDaily || 0
  } days`;
  document.getElementById("bestStreak").textContent = `${
    user.streaks?.longestStreak || 0
  } days`;
}

function renderHistory(user) {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  if (!user.history || user.history.length === 0) {
    historyList.innerHTML = `<div class="empty-state"><h3>No History Yet</h3></div>`;
    return;
  }

  historyList.innerHTML = user.history
    .map((attempt, index) => {
      const exam = examList.find((e) => e.id === attempt.examId);
      const title = exam ? exam.title : "Deleted Quiz";
      const date = new Date(attempt.date).toLocaleDateString();
      const percentage =
        attempt.percentage || Math.round((attempt.score / attempt.total) * 100);

      return `
      <div class="history-item">
        <div class="history-info">
          <h4>${title}</h4>
          <small>${date} • ${attempt.mode || "Exam"}</small>
        </div>
        <div class="history-actions">
          <div class="history-score ${
            percentage >= 60 ? "pass" : "fail"
          }">${percentage}%</div>
          <button class="delete-btn" onclick="deleteHistory(${index})">🗑️</button>
        </div>
      </div>`;
    })
    .join("");
}

function renderBookmarks(user) {
  // Ensure we don't duplicate the section if refreshUI is called
  let bookmarkSection = document.getElementById("bookmarks-section");
  if (!bookmarkSection) {
    bookmarkSection = document.createElement("div");
    bookmarkSection.id = "bookmarks-section";
    document.querySelector(".main-content").appendChild(bookmarkSection);
  }

  const keys = Object.keys(user.bookmarks || {});

  bookmarkSection.innerHTML = `
    <h2 style="margin-top:40px;">⭐ Bookmarks</h2>
    <div class="history-list">
      ${
        keys.length === 0
          ? "<p>No bookmarks yet.</p>"
          : keys
              .map((key) => {
                const [examId, qIdx] = key.split("_");
                const exam = examList.find((e) => e.id === examId);
                return `
          <div class="history-item">
            <div class="history-info">
              <h4>${exam ? exam.title : examId}</h4>
              <small>Question #${parseInt(qIdx) + 1}</small>
            </div>
            <div class="history-actions">
              <button class="unstar-btn" onclick="removeBookmark('${key}')">⭐</button>
            </div>
          </div>`;
              })
              .join("")
      }
    </div>`;
}

function renderBadges(user) {
  const container = document.getElementById("badgeContainer");
  if (!container) return;

  container.innerHTML =
    (user.badges || [])
      .map((id) => {
        const b = BADGES.find((x) => x.id === id);
        return b
          ? `<div class="dash-badge" title="${b.desc}"><div class="badge-icon">${b.icon}</div><div>${b.title}</div></div>`
          : "";
      })
      .join("") || "Earn badges by completing quizzes!";
}

function renderLeaderboard(user) {
  const leaderboardEl = document.getElementById("leaderboard");
  if (!leaderboardEl) return;

  const mockUsers = [
    { name: "QuizMaster Pro", points: 3000 },
    { name: "Sarah Johnson", points: 2000 },
    { name: "Alex Chen", points: 1500 },
    { name: "Emma Williams", points: 1000 },
    { name: "Michael Brown", points: 500 },
    { name: "Jessica Davis", points: 100 },
  ];

  const displayName = localStorage.getItem("username") || "User";
  const currentUser = {
    name: `${displayName} (You)`,
    points: user.totalPoints || 0,
    isUser: true,
  };

  const all = [...mockUsers, currentUser].sort((a, b) => b.points - a.points);
  const rankedList = all.map((u, i) => ({ ...u, rank: i + 1 }));

  leaderboardEl.innerHTML = rankedList
    .map(
      (entry) => `
    <div class="lb-row ${entry.isUser ? "highlight" : ""}">
      <span>${entry.rank}. ${entry.name}</span>
      <strong>${entry.points.toLocaleString()} pts</strong>
    </div>
  `,
    )
    .join("");
}
