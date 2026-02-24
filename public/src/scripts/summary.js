// src/scripts/summary.js
import { getManifest } from "./quizManifest.js";

// Download functions
import { exportToQuiz } from "../export/export-to-quiz.js";
import { exportToHtml } from "../export/export-to-html.js";
import { exportToPdf } from "../export/export-to-pdf.js";
import { exportToWord } from "../export/export-to-word.js";
import { exportToPptx } from "../export/export-to-pptx.js";
import { exportToMarkdown } from "../export/export-to-markdown.js";

// Notifications
import { showNotification } from "../components/notifications.js";

// Helpers
const currentName = localStorage.getItem("username") || "User";
const result = JSON.parse(localStorage.getItem("last_quiz_result"));
if (!result) window.location.href = "index.html";

// ─── Helper: HTML escape (raw user-supplied strings only) ────────────────────
function escapeHTML(input) {
  if (input === undefined || input === null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Helper: Markdown-lite renderer (matches quiz.js) ────────────────────────
function renderMarkdown(str) {
  if (str === null || str === undefined) return "";
  str = String(str);
  const codeBlocks = [];

  // 1. Extract fenced code blocks (preserve inner newlines verbatim)
  str = str.replace(/```([\s\S]*?)```/g, (_, code) => {
    const idx = codeBlocks.length;
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre class="code-block"><code>${escaped.trim()}</code></pre>`,
    );
    return `\x00CODE${idx}\x00`;
  });

  // 2. Escape remaining HTML
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // 3. Inline code
  str = str.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  // 4. Newlines → <br>
  str = str.replace(/\n/g, "<br>");

  // 5. Restore fenced code blocks
  str = str.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

  return str;
}

// ─── Helper: Grade Essay (matches quiz.js) ───────────────────────────────────
function gradeEssay(userInput, modelAnswer) {
  const normalize = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[.,;:!?()\[\]{}"'\/\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const userNorm = normalize(userInput);
  const modelNorm = normalize(modelAnswer);

  if (!userNorm) return 0;

  const extractNums = (s) => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
  const modelNums = extractNums(modelNorm);
  const userNums = extractNums(userNorm);
  const modelNoNums = modelNorm.replace(/\d+(\.\d+)?/g, "").trim();
  if (modelNums.length > 0 && modelNoNums.length < 8) {
    const allMatch = modelNums.every((mn) =>
      userNums.some((un) => Math.abs(un - mn) / (Math.abs(mn) || 1) < 0.02),
    );
    return allMatch ? 5 : userNums.length > 0 ? 1 : 0;
  }

  const stopWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "shall",
    "can",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "for",
    "with",
    "from",
    "and",
    "or",
    "but",
    "if",
    "as",
    "it",
    "its",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",
    "not",
    "no",
    "so",
    "also",
  ]);
  const keywords = modelNorm
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0)
    return userNorm.includes(modelNorm) || modelNorm.includes(userNorm) ? 5 : 0;

  const matched = keywords.filter((kw) => userNorm.includes(kw)).length;
  const ratio = matched / keywords.length;

  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  if (matched > 0) return 1;
  return 0;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isEssayQuestion = (q) => q.options && q.options.length === 1;

const renderQuestionImage = (imageUrl) => {
  if (!imageUrl) return "";
  return `
    <div class="question-image-container">
      <img src="${escapeHTML(imageUrl)}" alt="Question image"
           class="question-image" onerror="this.parentElement.style.display='none'"/>
    </div>`;
};

const starRating = (score, max = 5) =>
  `<span class="star-rating" aria-label="Score ${score} of ${max}">` +
  "★".repeat(score) +
  `<span class="star-empty">${"★".repeat(max - score)}</span>` +
  `</span>`;

function resetLucidIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    window.addEventListener("load", () => {
      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  const scoreHeader = document.getElementById("scoreHeader");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const container = document.getElementById("reviewContainer");
  const backBtn = document.getElementById("backHomeBtn");
  const exportMdBtn = document.getElementById("exportMdBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const exportWordBtn = document.getElementById("exportWordBtn");
  const exportPptxBtn = document.getElementById("exportPptxBtn");
  const exportHtmlBtn = document.getElementById("exportHtmlBtn");
  const exportQuizBtn = document.getElementById("exportQuizBtn");

  let examList = [];
  try {
    const manifest = await getManifest();
    examList = manifest.examList || [];
  } catch (e) {
    console.error("Failed to load manifest", e);
  }

  const config = examList.find((e) => e.id === result.examId) || {
    id: result.examId,
    title: result.examTitle || "User Quiz",
    description: "Custom user-created quiz",
    path: null,
  };

  let questions = [];
  if (config.path) {
    try {
      const baseUrl = new URL(import.meta.url);
      const quizUrl = new URL(config.path, baseUrl);
      if (config.path.toLowerCase().endsWith(".json")) {
        const res = await fetch(quizUrl.href);
        if (res.ok) {
          const data = await res.json();
          questions = data.questions || [];
        }
      } else {
        const loaded = await import(quizUrl.href);
        questions = loaded.questions || [];
      }
    } catch (e) {
      console.error("Failed to load questions", e);
    }
  } else if (result.questions) {
    questions = result.questions;
  } else {
    try {
      const userQuizzes = JSON.parse(
        localStorage.getItem("user_quizzes") || "[]",
      );
      const found = userQuizzes.find((q) => q.id === result.examId);
      if (found) {
        questions = found.questions;
        config.title = found.title;
      }
    } catch (e) {
      console.error("Error loading user quiz questions", e);
    }
  }

  document.title = `نتائج إمتحان ${config.title}`;

  backBtn && (backBtn.onclick = goHome);
  exportMdBtn &&
    (exportMdBtn.onclick = () =>
      exportToMarkdown(config, questions, result.userAnswers));
  exportPdfBtn &&
    (exportPdfBtn.onclick = async () =>
      await exportToPdf(config, questions, result.userAnswers, result));
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

  // ── Score breakdown ────────────────────────────────────────────────────────
  const totalQuestions = questions.length;
  let mcqCorrect = 0,
    mcqWrong = 0,
    mcqSkipped = 0,
    mcqTotal = 0;
  let essayCount = 0,
    essayScoreTotal = 0,
    essayMaxTotal = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const q = questions[i];
    const ua = result.userAnswers[i];
    if (isEssayQuestion(q)) {
      essayCount++;
      essayScoreTotal += gradeEssay(ua, q.options[0]);
      essayMaxTotal += 5;
    } else {
      mcqTotal++;
      const correctIdx = q.correct ?? q.answer;
      if (ua === undefined || ua === null) mcqSkipped++;
      else if (ua === correctIdx) mcqCorrect++;
      else mcqWrong++;
    }
  }

  // Support both old result format and new (with mcqScore + essayScore fields)
  const displayScore =
    result.score !== undefined ? result.score : mcqCorrect + essayScoreTotal;
  const displayTotal =
    result.total !== undefined ? result.total : mcqTotal + essayMaxTotal;

  renderHeader(
    scoreHeader,
    scoreDisplay,
    result,
    displayScore,
    displayTotal,
    mcqCorrect,
    mcqWrong,
    mcqSkipped,
    mcqTotal,
    essayCount,
    essayScoreTotal,
    essayMaxTotal,
  );
  renderReview(container, questions, result.userAnswers);
  resetLucidIcons();

  const newBadges = result.gamification ? result.gamification.newBadges : [];
  newBadges.forEach((badge, index) => {
    setTimeout(
      () =>
        showNotification(
          `Congratulations, ${currentName}`,
          `You've earned the ${badge.title} badge`,
          `${badge.icon}`,
        ),
      index * 500,
    );
  });
});

function goHome() {
  window.location.href = "index.html";
}

function renderHeader(
  scoreHeader,
  scoreDisplay,
  data,
  displayScore,
  displayTotal,
  mcqCorrect,
  mcqWrong,
  mcqSkipped,
  mcqTotal,
  essayCount,
  essayScoreTotal,
  essayMaxTotal,
) {
  const percentage =
    displayTotal > 0 ? Math.round((displayScore / displayTotal) * 100) : 0;
  const timeStr = `${Math.floor(data.timeElapsed / 60)}m ${data.timeElapsed % 60}s`;
  const points = data.gamification ? data.gamification.pointsEarned : 0;
  const newBadges = data.gamification ? data.gamification.newBadges : [];

  let badgeHTML = "";
  if (newBadges.length > 0) {
    badgeHTML = `
      <div class="new-badges-section">
        <h3><i data-lucide="award"></i> شارات تم إكتسابها</h3>
        <div class="badge-grid">
          ${newBadges
            .map(
              (b) => `
            <div class="badge-item">
              <span class="badge-icon">${b.icon}</span>
              <span class="badge-name">${b.title}</span>
            </div>`,
            )
            .join("")}
        </div>
      </div>`;
  }

  // MCQ row — only show if there are MCQ questions
  const mcqRow =
    mcqTotal > 0
      ? `
    <div class="score-breakdown">
      <span class="breakdown-item breakdown-correct"><i data-lucide="check"></i> ${mcqCorrect} صحيح</span>
      <span class="breakdown-item breakdown-wrong"><i data-lucide="x"></i> ${mcqWrong} خطأ</span>
      ${mcqSkipped > 0 ? `<span class="breakdown-item breakdown-skipped"><i data-lucide="minus"></i> ${mcqSkipped} متخطى</span>` : ""}
    </div>`
      : "";

  // Essay row — only show if there are essay questions
  const essayRow =
    essayCount > 0
      ? `
    <div class="essay-score-row">
      <i data-lucide="scroll-text"></i>
      <span>المقالي: ${essayScoreTotal} / ${essayMaxTotal}</span>
      ${starRating(Math.round(essayScoreTotal / Math.max(essayCount, 1)), 5)}
    </div>`
      : "";

  if (scoreHeader)
    scoreHeader.innerHTML = `
    <div class="score-circle ${percentage >= 70 ? "pass" : "fail"}">
      <span>${percentage}%</span>
    </div>
    <div class="stats-text">
      <h2>${percentage >= 70 ? `أحسنت يا ${currentName}!` : `استمر في المذاكرة يا ${currentName}`}</h2>
      <div class="points-pill"><i data-lucide="gem"></i> +${points} نقطة</div>
      <p class="total-score-line">النتيجة: <strong>${displayScore} / ${displayTotal}</strong></p>
      ${mcqRow}
      ${essayRow}
      <p class="time-line"><i data-lucide="clock"></i> الوقت: ${timeStr}</p>
      ${badgeHTML}
    </div>
  `;

  if (scoreDisplay)
    scoreDisplay.textContent = `${displayScore} / ${displayTotal}`;
}

function renderReview(container, questions, userAnswers) {
  if (!container) return;
  let html = "";

  questions.forEach((q, index) => {
    const isEssay = isEssayQuestion(q);
    const userAns = userAnswers[index];

    if (isEssay) {
      const score = gradeEssay(userAns, q.options[0]);
      const stars = starRating(score);
      const scoreLabel =
        score >= 4
          ? "ممتاز"
          : score === 3
            ? "جيد"
            : score === 2
              ? "مقبول"
              : score === 1
                ? "ضعيف"
                : userAns?.trim()
                  ? "صفر"
                  : "لم يُجَب";

      const scoreLabelClass =
        score >= 4
          ? "essay-score-excellent"
          : score >= 3
            ? "essay-score-good"
            : score >= 1
              ? "essay-score-poor"
              : "essay-score-none";

      const userText = userAns
        ? renderMarkdown(String(userAns))
        : "<em>Not answered</em>";
      const formalText = renderMarkdown(q.options[0]);
      const explanationText = q.explanation
        ? renderMarkdown(q.explanation)
        : "";

      html += `
        <div class="review-card essay-card">
          <div class="review-header">
            <span class="q-num">#${index + 1}</span>
            <div class="review-header-right">
              <span class="essay-badge"><i data-lucide="scroll-text"></i> Essay</span>
              <span class="essay-score-badge ${scoreLabelClass}">${stars} ${scoreLabel} (${score}/5)</span>
            </div>
          </div>
          <p class="q-text">${renderMarkdown(q.q)}</p>
          ${renderQuestionImage(q.image)}
          <div class="essay-comparison">
            <div class="essay-answer-box user-essay">
              <small><i data-lucide="pencil-line"></i> Your Answer:</small>
              <div class="essay-text">${userText}</div>
            </div>
            <div class="essay-answer-box formal-essay">
              <small><i data-lucide="book-open"></i> Formal Answer:</small>
              <div class="essay-text">${formalText}</div>
            </div>
          </div>
          ${
            explanationText
              ? `
          <div class="explanation">
            <strong><i data-lucide="lightbulb"></i> Explanation:</strong>
            <div class="explanation-body">${explanationText}</div>
          </div>`
              : ""
          }
        </div>`;
    } else {
      const correctIdx = q.correct ?? q.answer;
      const isSkipped = userAns === undefined || userAns === null;
      const isCorrect = !isSkipped && userAns === correctIdx;
      const statusClass = isCorrect
        ? "correct"
        : isSkipped
          ? "skipped"
          : "wrong";
      const statusIcon = isCorrect
        ? `<i data-lucide="circle-check"></i>`
        : isSkipped
          ? `<i data-lucide="circle-minus"></i>`
          : `<i data-lucide="circle-x"></i>`;

      const userText = isSkipped
        ? "<em>Skipped</em>"
        : renderMarkdown(q.options[userAns]);
      const correctText = renderMarkdown(q.options[correctIdx]);
      const explanationText = q.explanation
        ? renderMarkdown(q.explanation)
        : "";

      html += `
        <div class="review-card ${statusClass}">
          <div class="review-header">
            <span class="q-num">#${index + 1}</span>
            <span class="status-icon status-${statusClass}">${statusIcon}</span>
          </div>
          <p class="q-text">${renderMarkdown(q.q)}</p>
          ${renderQuestionImage(q.image)}
          <div class="ans-comparison">
            <div class="ans-box ${isCorrect ? "ans-correct" : isSkipped ? "ans-skipped" : "ans-wrong"}">
              <small><i data-lucide="pencil-line"></i> Your Answer:</small>
              <div class="ans-text">${userText}</div>
            </div>
            ${
              !isCorrect
                ? `
            <div class="ans-box ans-correct-answer">
              <small><i data-lucide="check-circle"></i> Correct Answer:</small>
              <div class="ans-text">${correctText}</div>
            </div>`
                : ""
            }
          </div>
          ${
            explanationText
              ? `
          <div class="explanation">
            <strong><i data-lucide="lightbulb"></i> Explanation:</strong>
            <div class="explanation-body">${explanationText}</div>
          </div>`
              : ""
          }
        </div>`;
    }
  });

  container.innerHTML = html;
}
