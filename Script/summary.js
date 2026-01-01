// Website/Script/summary.js
import { examList } from "./examManifest.js";

const result = JSON.parse(localStorage.getItem("last_quiz_result"));
if (!result) window.location.href = "index.html";

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

  // compute counts
  const total = questions.length;
  let correct = 0;
  let skipped = 0;
  for (let i = 0; i < total; i++) {
    const ua = result.userAnswers[i];
    if (ua === undefined || ua === null) skipped++;
    else if (ua === questions[i].correct) correct++;
  }
  const wrong = total - correct - skipped;

  // Header
  renderHeader(
    scoreHeader,
    scoreDisplay,
    statsDisplay,
    result,
    total,
    correct,
    wrong,
    skipped
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
  skipped
) {
  const percentage = Math.round((data.score / total) * 100);
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
            <p>Time: ${timeStr}</p>
        </div>
    `;

  if (scoreDisplay) scoreDisplay.textContent = `${data.score} / ${total}`;
  if (statsDisplay)
    statsDisplay.textContent = `Correct: ${correct}    Wrong: ${wrong}    Skipped: ${skipped}`;
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
    const userAns = userAnswers[index];
    const isSkipped = userAns === undefined || userAns === null;
    const isCorrect = !isSkipped && userAns === q.correct;
    const statusClass = isCorrect ? "correct" : isSkipped ? "skipped" : "wrong";
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
  });

  container.innerHTML = html;
}
