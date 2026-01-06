// Website/Script/summary.js
import { examList } from "./examManifest.js";

const result = JSON.parse(localStorage.getItem("last_quiz_result"));
if (!result) window.location.href = "index.html";

// Helper to check if question is essay
const isEssayQuestion = (q) => {
  return q.options && q.options.length === 1;
};

document.addEventListener("DOMContentLoaded", async () => {
  const scoreHeader = document.getElementById("scoreHeader");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const statsDisplay = document.getElementById("statsDisplay");
  const container = document.getElementById("reviewContainer");
  const backBtn = document.getElementById("backHomeBtn");

  backBtn && (backBtn.onclick = goHome);

  // 1. Re-load the exam data using the ID from results
  const config = examList.find((e) => e.id === result.examId);
  const module = await import(config.path);
  const questions = module.questions;

  // compute counts - EXCLUDE essay questions from score calculation
  const totalScorable = result.total; // Already calculated in quiz.js
  const totalQuestions = questions.length;
  let correct = 0;
  let skipped = 0;
  let essayCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const q = questions[i];
    const ua = result.userAnswers[i];

    if (isEssayQuestion(q)) {
      essayCount++;
      // Don't count essays in correct/wrong/skipped
      continue;
    }

    // Only process MCQ/True-False
    if (ua === undefined || ua === null) {
      skipped++;
    } else if (ua === q.correct) {
      correct++;
    }
  }

  const wrong = totalScorable - correct - skipped;

  // Header
  renderHeader(
    scoreHeader,
    scoreDisplay,
    statsDisplay,
    result,
    totalScorable,
    correct,
    wrong,
    skipped,
    essayCount
  );

  // Review
  renderReview(container, questions, result.userAnswers);
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
  essayCount
) {
  const percentage = total > 0 ? Math.round((data.score / total) * 100) : 0;
  const timeStr = `${Math.floor(data.timeElapsed / 60)}m ${
    data.timeElapsed % 60
  }s`;

  if (scoreHeader)
    scoreHeader.innerHTML = `
        <div class="score-circle ${percentage >= 70 ? "pass" : "fail"}">
            <span>${percentage}%</span>
        </div>
        <div class="stats-text">
            <h2>${percentage >= 70 ? "Great Job!" : "Keep Practicing"}</h2>
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
        </div>
    `;

  if (scoreDisplay) scoreDisplay.textContent = `${data.score} / ${total}`;
  if (statsDisplay) {
    statsDisplay.textContent = `Correct: ${correct}    Wrong: ${wrong}    Skipped: ${skipped}`;
    if (essayCount > 0) {
      statsDisplay.textContent += `    Essays: ${essayCount}`;
    }
  }
}

// Escape HTML so any tags in question text/options render as text
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
      // Render Essay Question Review
      const userText = userAns ? escapeHTML(userAns) : "Not answered";
      const formalAnswer = escapeHTML(q.options[0]);
      const explanationText = q.explanation ? escapeHTML(q.explanation) : "";

      // Check if answers match (case-insensitive, trimmed)
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
              ? `
            <div class="essay-match-notice">
              ✅ Your answer matches the formal answer!
            </div>
          `
              : `
            <div class="essay-mismatch-notice">
              ⚠️ Your answer differs from the formal answer. However, it might still be correct in a different way.
            </div>
          `
          }
          
          ${
            explanationText
              ? `<div class="explanation"><strong>💡 Explanation:</strong> ${explanationText}</div>`
              : ""
          }
        </div>
      `;
    } else {
      // Render MCQ/True-False Review (existing logic)
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
