// Script/summary.js
import { examList } from "./examManifest.js";

// Download functions
import { exportToQuiz } from "./exportToQuiz.js";
import { exportToHtml } from "./exportToHtml.js";
import { exportToPdf } from "./exportToPdf.js";
import { exportToWord } from "./exportToWord.js";
import { exportToPptx } from "./exportToPptx.js";
import { exportToMarkdown } from "./exportToMarkdown.js";

// Notifications
import  {showNotificationBadge} from "./notifications.js";

// Helpers
const currentName = localStorage.getItem("username") || "User";
const result = JSON.parse(localStorage.getItem("last_quiz_result"));
if (!result) window.location.href = "index.html";

const isEssayQuestion = (q) => q.options && q.options.length === 1;

// === Helper: Render Question Image ===
const renderQuestionImage = (imageUrl) => {
  if (!imageUrl) return "";
  return `
    <div class="question-image-container">
      <img 
        src="${escapeHTML(imageUrl)}" 
        alt="Question context image" 
        class="question-image"
        onerror="this.parentElement.style.display='none'"
      />
    </div>
  `;
};

document.addEventListener("DOMContentLoaded", async () => {
  const scoreHeader = document.getElementById("scoreHeader");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const statsDisplay = document.getElementById("statsDisplay");
  const container = document.getElementById("reviewContainer");
  const backBtn = document.getElementById("backHomeBtn");
  const exportMdBtn = document.getElementById("exportMdBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const exportWordBtn = document.getElementById("exportWordBtn");
  const exportPptxBtn = document.getElementById("exportPptxBtn");
  const exportHtmlBtn = document.getElementById("exportHtmlBtn");
  const exportQuizBtn = document.getElementById("exportQuizBtn");

  const config = examList.find((e) => e.id === result.examId) || {
    id: result.examId,
    title: result.examTitle || "User Quiz",
    description: "Custom user-created quiz",
    path: null,
  };

  let questions = [];
  if (config.path) {
    try {
      const module = await import(config.path);
      questions = module.questions;
    } catch (e) {
      console.error("Failed to load questions", e);
    }
  } else if (result.questions) {
    questions = result.questions;
  } else {
     // Fallback: Try to find in user_quizzes
      try {
        const userQuizzes = JSON.parse(localStorage.getItem("user_quizzes") || "[]");
        const found = userQuizzes.find(q => q.id === result.examId);
        if(found){
            questions = found.questions;
            config.title = found.title;
        }
      } catch(e){
        console.error("Error loading user quiz questions", e);
      }
  }

  backBtn && (backBtn.onclick = goHome);
  exportMdBtn &&
    (exportMdBtn.onclick = () =>
      exportToMarkdown(config, questions, result.userAnswers));
  exportPdfBtn &&
    (exportPdfBtn.onclick = async () =>
      await exportToPdf(config, questions, result.userAnswers));
  exportWordBtn &&
    (exportWordBtn.onclick = async () =>
      await exportToWord(config, questions, result.userAnswers));
  exportPptxBtn &&
    (exportPptxBtn.onclick = async () =>
      await exportToPptx(config, questions, result.userAnswers));
  exportHtmlBtn &&
    (exportHtmlBtn.onclick = () =>
      exportToHtml(config, questions, result.userAnswers));
  exportQuizBtn &&
    (exportQuizBtn.onclick = () => exportToQuiz(config, questions));

  const totalScorable = result.total;
  const totalQuestions = questions.length;
  let correct = 0,
    skipped = 0,
    essayCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const q = questions[i];
    const ua = result.userAnswers[i];
    if (isEssayQuestion(q)) {
      essayCount++;
      continue;
    }
    if (ua === undefined || ua === null) skipped++;
    else if (ua === q.correct) correct++;
  }

  const wrong = totalScorable - correct - skipped;

  renderHeader(
    scoreHeader,
    scoreDisplay,
    statsDisplay,
    result,
    totalScorable,
    correct,
    wrong,
    skipped,
    essayCount,
  );
  renderReview(container, questions, result.userAnswers);

  const userName = localStorage.getItem("username") || "User";
  const newBadges = result.gamification ? result.gamification.newBadges : [];
  newBadges.forEach((badge, index) => {
    setTimeout(() => showNotificationBadge(badge, userName), index * 500);
  });
});

function goHome() {
  window.location.href = "index.html";
}

function renderHeader(
  scoreHeader,
  scoreDisplay,
  statsDisplay,
  data,
  total,
  correct,
  wrong,
  skipped,
  essayCount,
) {
  const percentage = total > 0 ? Math.round((data.score / total) * 100) : 0;
  const timeStr = `${Math.floor(data.timeElapsed / 60)}m ${
    data.timeElapsed % 60
  }s`;
  const points = data.gamification ? data.gamification.pointsEarned : 0;
  const newBadges = data.gamification ? data.gamification.newBadges : [];

  let badgeHTML = "";
  if (newBadges.length > 0) {
    badgeHTML = `
      <div class="new-badges-section">
        <h3>🎉 Badges Unlocked!</h3>
        <div class="badge-grid">
          ${newBadges
            .map(
              (b) => `
            <div class="badge-item">
              <span class="badge-icon">${b.icon}</span>
              <span class="badge-name">${b.title}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (scoreHeader)
    scoreHeader.innerHTML = `
    <div class="score-circle ${percentage >= 70 ? "pass" : "fail"}">
      <span>${percentage}%</span>
    </div>
    <div class="stats-text">
      <h2>${
        percentage >= 70
          ? `Great Job! ${currentName}`
          : `Keep Practicing ${currentName}`
      }</h2>
      <div class="points-pill"><span>💎 +${points} Points</span></div>
      <p>Score: ${data.score} / ${total}</p>
      <p>Correct: ${correct} • Wrong: ${wrong} • Skipped: ${skipped}</p>
      ${
        essayCount > 0
          ? `<p class="essay-note">📝 ${essayCount} Essay Question${
              essayCount > 1 ? "s" : ""
            } (Not Counted in Score)</p>`
          : ""
      }
      <p>Time: ${timeStr}</p>
      ${badgeHTML}
    </div>
  `;

  if (scoreDisplay) scoreDisplay.textContent = `${data.score} / ${total}`;
  if (statsDisplay) {
    statsDisplay.textContent = `Correct: ${correct}    Wrong: ${wrong}    Skipped: ${skipped}`;
    if (essayCount > 0) statsDisplay.textContent += `    Essays: ${essayCount}`;
  }
}

function escapeHTML(input) {
  if (input === undefined || input === null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderReview(container, questions, userAnswers) {
  if (!container) return;
  let html = "";

  questions.forEach((q, index) => {
    const isEssay = isEssayQuestion(q);
    const userAns = userAnswers[index];

    if (isEssay) {
      const userText = userAns ? escapeHTML(userAns) : "Not answered";
      const formalAnswer = escapeHTML(q.options[0]);
      const explanationText = q.explanation ? escapeHTML(q.explanation) : "";
      const userAnswerLower = String(userAns || "")
        .trim()
        .toLowerCase();
      const correctAnswerLower = String(q.options[0] || "")
        .trim()
        .toLowerCase();
      const matches = userAnswerLower === correctAnswerLower;

      html += `
        <div class="review-card essay-card">
          <div class="review-header" style="display:flex; justify-content:space-between; align-items:center">
            <span class="q-num">#${index + 1}</span>
            <span class="essay-badge">📝 Essay (Not Scored)</span>
          </div>
          <p class="q-text">${escapeHTML(q.q)}</p>
          ${renderQuestionImage(q.image)}
          <div class="essay-comparison">
            <div class="essay-answer-box user-essay">
              <small>Your Answer:</small>
              <div class="essay-text">${userText}</div>
            </div>
            <div class="essay-answer-box formal-essay">
              <small>Formal Answer:</small>
              <div class="essay-text">${formalAnswer}</div>
            </div>
          </div>
          ${
            matches
              ? `<div class="essay-match-notice">✅ Your answer matches the formal answer!</div>`
              : `<div class="essay-mismatch-notice">⚠️ Your answer differs from the formal answer. However, it might still be correct in a different way.</div>`
          }
          ${
            explanationText
              ? `<div class="explanation"><strong>💡 Explanation:</strong> ${explanationText}</div>`
              : ""
          }
        </div>
      `;
    } else {
      const isSkipped = userAns === undefined || userAns === null;
      const isCorrect = !isSkipped && userAns === q.correct;
      const statusClass = isCorrect
        ? "correct"
        : isSkipped
          ? "skipped"
          : "wrong";
      const statusIcon = isCorrect ? "✅" : isSkipped ? "⚪" : "❌";
      const qText = escapeHTML(q.q);
      const userText = isSkipped ? "Skipped" : escapeHTML(q.options[userAns]);
      const correctText = escapeHTML(q.options[q.correct]);
      const explanationText = q.explanation ? escapeHTML(q.explanation) : "";

      html += `
        <div class="review-card ${statusClass}">
          <div class="review-header" style="display:flex; justify-content:space-between; align-items:center">
            <span class="q-num">#${index + 1}</span>
            <span class="status-icon">${statusIcon}</span>
          </div>
          <p class="q-text">${qText}</p>
          ${renderQuestionImage(q.image)}
          <div class="ans-comparison">
            <div class="ans-box your-ans">
              <small>Your Answer:</small>
              <span>${userText}</span>
            </div>
            <div class="ans-box correct-ans">
              <small>Correct Answer:</small>
              <span>${correctText}</span>
            </div>
          </div>
          ${
            explanationText
              ? `<div class="explanation"><strong>💡 Explanation:</strong> ${explanationText}</div>`
              : ""
          }
        </div>
      `;
    }
  });

  container.innerHTML = html;
}
