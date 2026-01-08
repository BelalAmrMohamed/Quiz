import { gameEngine } from "./gameEngine.js";
import { examList } from "./examManifest.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = gameEngine.getUserData();
  const leaderboard = gameEngine.getLeaderboard();

  // 1. Render Stats
  document.getElementById("totalPoints").textContent =
    user.totalPoints.toLocaleString();
  document.getElementById("totalQuizzes").textContent = user.history.length;
  document.getElementById("totalBadges").textContent = user.badges.length;

  // 2. Render History
  const historyContainer = document.getElementById("historyList");
  if (user.history.length === 0) {
    historyContainer.innerHTML = `<div class="empty-state">No quizzes taken yet. <a href="index.html">Start one!</a></div>`;
  } else {
    historyContainer.innerHTML = user.history
      .map((entry) => {
        // Find exam title
        const examConfig = examList.find((e) => e.id === entry.examId);
        const title = examConfig
          ? getExamTitle(examConfig.path)
          : "Unknown Quiz";
        const date = new Date(entry.date).toLocaleDateString();

        return `
                <div class="history-item">
                    <div class="history-info">
                        <h4>${title}</h4>
                        <small>${date}</small>
                    </div>
                    <div class="history-score ${
                      entry.percentage >= 70 ? "pass" : "fail"
                    }">
                        ${entry.percentage}%
                    </div>
                </div>
            `;
      })
      .join("");
  }

  // 3. Render Badges
  const badgeContainer = document.getElementById("badgeContainer");
  // We need to define badges list here or export it from gameEngine.
  // Ideally export BADGES from gameEngine, but for now let's map IDs.
  const unlockedBadges = user.badges; // array of strings
  if (unlockedBadges.length === 0) {
    badgeContainer.innerHTML = `<p class="text-muted">No badges yet.</p>`;
  } else {
    // Simple rendering assuming IDs are descriptive or fetching definitions
    // To do this right, export BADGES from gameEngine.js
    badgeContainer.innerHTML = unlockedBadges
      .map(
        (bid) => `
             <div class="dash-badge" title="${bid}">
                <span>🏅</span>
                <small>${bid.replace("-", " ")}</small>
             </div>
        `
      )
      .join("");
  }

  // 4. Render Leaderboard
  const lbContainer = document.getElementById("leaderboard");
  lbContainer.innerHTML = leaderboard
    .map(
      (u) => `
        <div class="lb-row ${u.isUser ? "highlight" : ""}">
            <span class="rank">#${u.rank}</span>
            <span class="name">${u.name}</span>
            <span class="pts">${u.points}</span>
        </div>
    `
    )
    .join("");
});

// Helper to clean names
function getExamTitle(path) {
  const parts = path.replace(/\\/g, "/").split("/");
  const filename = parts[parts.length - 1] || "";
  return filename.replace(/\.js$/i, "").replace(/[_-]+/g, " ");
}
