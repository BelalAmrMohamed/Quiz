// Website/Script/summary.js
import { examList } from "./examManifest.js";

const currentName = localStorage.getItem("username") || "User";
const result = JSON.parse(localStorage.getItem("last_quiz_result"));
if (!result) window.location.href = "index.html";

const isEssayQuestion = (q) => q.options && q.options.length === 1;

document.addEventListener("DOMContentLoaded", async () => {
  const scoreHeader = document.getElementById("scoreHeader");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const statsDisplay = document.getElementById("statsDisplay");
  const container = document.getElementById("reviewContainer");
  const backBtn = document.getElementById("backHomeBtn");
  const exportMdBtn = document.getElementById("exportMdBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const exportHtmlBtn = document.getElementById("exportHtmlBtn");
  const exportQuizBtn = document.getElementById("exportQuizBtn");

  const config = examList.find((e) => e.id === result.examId);
  const module = await import(config.path);
  const questions = module.questions;

  backBtn && (backBtn.onclick = goHome);
  exportMdBtn &&
    (exportMdBtn.onclick = () =>
      exportToMarkdown(config, questions, result.userAnswers));
  exportPdfBtn &&
    (exportPdfBtn.onclick = () =>
      exportToPdf(config, questions, result.userAnswers));
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
    setTimeout(() => showNotification(badge, userName), index * 500);
  });
});

function showNotification(badge, displayName) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${badge.icon}</span>
      <div>
        <strong>Congratulations, ${displayName}!</strong>
        <p>You've earned the ${badge.title} badge!</p>
      </div>
      <button class="close-btn">×</button>
    </div>
  `;
  document.getElementById("notification-container").appendChild(notification);
  setTimeout(() => notification.classList.add("show"), 100);
  const timeout = setTimeout(() => removeNotification(notification), 5000);
  notification.querySelector(".close-btn").addEventListener("click", () => {
    clearTimeout(timeout);
    removeNotification(notification);
  });
}

function removeNotification(notif) {
  notif.classList.add("hide");
  setTimeout(() => notif.remove(), 300);
}

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
  const timeStr = `${Math.floor(data.timeElapsed / 60)}m ${data.timeElapsed % 60}s`;
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
      <h2>${percentage >= 70 ? `Great Job! ${currentName}` : `Keep Practicing ${currentName}`}</h2>
      <div class="points-pill"><span>💎 +${points} Points</span></div>
      <p>Score: ${data.score} / ${total}</p>
      <p>Correct: ${correct} • Wrong: ${wrong} • Skipped: ${skipped}</p>
      ${essayCount > 0 ? `<p class="essay-note">📝 ${essayCount} Essay Question${essayCount > 1 ? "s" : ""} (Not Counted in Score)</p>` : ""}
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
          ${matches ? `<div class="essay-match-notice">✅ Your answer matches the formal answer!</div>` : `<div class="essay-mismatch-notice">⚠️ Your answer differs from the formal answer. However, it might still be correct in a different way.</div>`}
          ${explanationText ? `<div class="explanation"><strong>💡 Explanation:</strong> ${explanationText}</div>` : ""}
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
          ${explanationText ? `<div class="explanation"><strong>💡 Explanation:</strong> ${explanationText}</div>` : ""}
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

// ==========================================
// Export to Markdown (with user answers)
// ==========================================
function exportToMarkdown(config, questions, userAnswers) {
  let hasMCQ = false,
    hasTrueFalse = false,
    hasEssay = false;
  questions.forEach((q) => {
    if (isEssayQuestion(q)) hasEssay = true;
    else if (q.options.length === 2) hasTrueFalse = true;
    else hasMCQ = true;
  });

  let questionType = "";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";
  else if (hasMCQ && hasTrueFalse) questionType = "MCQ and True/False";
  else if (hasTrueFalse) questionType = "True/False only";
  else questionType = "MCQ only";

  let markdown = `# ${config.title || "Quiz"}\n**Number of questions:** ${questions.length}\n**Questions' type:** ${questionType}\n\n---\n\n`;

  questions.forEach((q, index) => {
    const userAns = userAnswers[index];
    markdown += `### Question ${index + 1}\n${q.q}\n\n`;

    if (isEssayQuestion(q)) {
      const userText = userAns || "Not answered";
      markdown += `**Your Answer:**\n\n${userText}\n\n**Formal Answer:**\n\n${q.options[0]}\n\n`;
    } else {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        markdown += `${letter}. ${opt}\n`;
      });
      markdown += `\n`;
      const isSkipped = userAns === undefined || userAns === null;
      const userLetter = isSkipped
        ? "Skipped"
        : String.fromCharCode(65 + userAns);
      const userAnswer = isSkipped ? "Skipped" : q.options[userAns];
      markdown += `**Your Answer:** ${userLetter}${isSkipped ? "" : `. ${userAnswer}`}\n\n`;
      const correctLetter = String.fromCharCode(65 + q.correct);
      markdown += `**Correct Answer:** ${correctLetter}. ${q.options[q.correct]}\n\n`;
    }

    if (q.explanation) markdown += `**Explanation:**\n${q.explanation}\n\n`;
    markdown += `---\n\n`;
  });

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.title || "quiz_export"}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// Export to HTML (with user answers)
// ==========================================
function exportToHtml(config, questions, userAnswers) {
  let hasMCQ = false,
    hasTrueFalse = false,
    hasEssay = false;
  questions.forEach((q) => {
    if (isEssayQuestion(q)) hasEssay = true;
    else if (q.options.length === 2) hasTrueFalse = true;
    else hasMCQ = true;
  });

  let questionType = "Multiple Choice";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";

  const date = new Date().toLocaleDateString();

  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title || "Quiz Examination"}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #e0e0e0; background: #121212; }
        h1 { color: #ffffff; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; text-align: center; }
        .meta { text-align: center; color: #888; margin-bottom: 40px; font-style: italic; }
        .question-card { background: #1e1e1e; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid #333; }
        .q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 0.9rem; color: #aaa; }
        .q-text { font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 20px; }
        .options-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .option { padding: 10px 15px; margin-bottom: 8px; border-radius: 6px; background: rgba(255,255,255,0.05); font-size: 0.95rem; }
        .user-answer { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; font-weight: 600; margin-top: 15px; padding: 12px 15px; border-radius: 8px; }
        .user-answer.wrong { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
        .user-answer.skipped { background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid #6b7280; }
        .correct-answer { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; font-weight: 600; margin-top: 15px; padding: 12px 15px; border-radius: 8px; }
        .explanation { margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; color: #dbeafe; font-size: 0.95rem; }
        .essay-box { background: #2a2a2a; padding: 15px; border-radius: 8px; border-left: 3px solid #f59e0b; margin-top: 10px; }
        .footer { text-align: center; margin-top: 50px; color: #888; font-size: 0.8rem; border-top: 1px solid #333; padding-top: 20px; }
    </style>
</head>
<body>
    <h1>${config.title || "Quiz Examination"}</h1>
    <div class="meta">Total Questions: ${questions.length} • Type: ${questionType} • Date: ${date}</div>
`;

  questions.forEach((q, index) => {
    const userAns = userAnswers[index];
    const isSkipped = userAns === undefined || userAns === null;
    const isCorrect =
      !isSkipped && userAns === q.correct && !isEssayQuestion(q);

    htmlContent += `
    <div class="question-card">
        <div class="q-header">
            <span>Question ${index + 1}</span>
            <span>${isEssayQuestion(q) ? "Essay" : "MCQ"}</span>
        </div>
        <div class="q-text">${q.q}</div>`;

    if (isEssayQuestion(q)) {
      const userText = userAns || "Not answered";
      htmlContent += `
        <div class="essay-box" style="border-left: 3px solid #3b82f6;">
            <strong style="color: #60a5fa; display:block; margin-bottom:5px;">Your Answer:</strong>
            ${userText}
        </div>
        <div class="essay-box">
            <strong style="color: #f59e0b; display:block; margin-bottom:5px;">Formal Answer / Key Points:</strong>
            ${q.options[0]}
        </div>`;
    } else {
      htmlContent += `<div class="options-list">`;
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        htmlContent += `<div class="option"><strong>${letter}.</strong> ${opt}</div>`;
      });
      htmlContent += `</div>`;

      const userClass = isSkipped ? "skipped" : isCorrect ? "" : "wrong";
      const userLetter = isSkipped ? "" : String.fromCharCode(65 + userAns);
      const userAnswer = isSkipped
        ? "Skipped"
        : `${userLetter}. ${q.options[userAns]}`;
      const userIcon = isSkipped ? "⚪" : isCorrect ? "✅" : "❌";

      htmlContent += `<div class="user-answer ${userClass}">${userIcon} Your Answer: ${userAnswer}</div>`;

      const correctLetter = String.fromCharCode(65 + q.correct);
      htmlContent += `<div class="correct-answer">✓ Correct Answer: ${correctLetter}. ${q.options[q.correct]}</div>`;
    }

    if (q.explanation) {
      htmlContent += `<div class="explanation"><strong>💡 Explanation:</strong> ${q.explanation}</div>`;
    }

    htmlContent += `</div>`;
  });

  htmlContent += `<div class="footer">Generated by Quiz App</div></body></html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.title || "quiz_export"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// Export to PDF (with user answers)
// ==========================================
/**
 * GAMIFIED PDF EXPORT FUNCTION - FIXED VERSION
 * - Safe standard fonts (no encoding issues)
 * - 2 questions per page optimization
 * - Enhanced background patterns
 * - Mobile-friendly design
 */

function exportToPdf(config, questions, userAnswers) {
  try {
    // ===========================
    // VALIDATION
    // ===========================
    if (!config || !questions || !Array.isArray(questions)) {
      throw new Error(
        "Invalid parameters: config and questions array required",
      );
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("jsPDF library not loaded");
    }

    // ===========================
    // INITIALIZATION
    // ===========================
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // CRITICAL FIX: Set font immediately and use only standard fonts
    doc.setFont("helvetica");

    // ===========================
    // GAMIFICATION COLORS
    // ===========================
    const COLORS = Object.freeze({
      // Primary gamification palette
      primary: [106, 90, 205], // Slate Blue
      secondary: [255, 215, 0], // Gold
      accent: [255, 105, 180], // Hot Pink

      // Status colors
      success: [46, 213, 115], // Bright Green
      error: [255, 71, 87], // Bright Red
      warning: [255, 168, 1], // Amber
      info: [52, 172, 224], // Sky Blue

      // UI colors
      cardBg: [255, 255, 255], // White
      cardBorder: [106, 90, 205], // Matches primary
      pageBg: [248, 250, 252], // Light Gray

      // Text colors
      textDark: [30, 41, 59], // Dark Slate
      textLight: [100, 116, 139], // Light Slate
      textWhite: [255, 255, 255], // White

      // Button colors
      buttonCorrect: [16, 185, 129], // Emerald
      buttonWrong: [239, 68, 68], // Red
      buttonNeutral: [203, 213, 225], // Slate 300

      // Special effects
      progressBarBg: [226, 232, 240], // Light gray
      progressBarFill: [255, 215, 0], // Gold
      trophy: [255, 215, 0], // Gold
    });

    // ===========================
    // OPTIMIZED SIZES (2 questions per page)
    // ===========================
    const SIZES = Object.freeze({
      // Headers & footers
      headerHeight: 18,
      footerHeight: 12,
      progressBarHeight: 6,

      // Cards - REDUCED for 2 per page
      cardPadding: 8,
      cardMargin: 6,
      cardCornerRadius: 3,
      cardShadowOffset: 0.8,

      // Typography
      titleFont: 24,
      headingFont: 16,
      questionFont: 11,
      optionFont: 10,
      labelFont: 9,
      footerFont: 8,

      // Buttons
      buttonHeight: 10,
      buttonPadding: 3,
      buttonRadius: 2,

      // Spacing
      sectionSpacing: 8,
      questionSpacing: 12,
      optionSpacing: 4,
    });

    const MARGINS = Object.freeze({
      top: 22,
      right: 12,
      bottom: 18,
      left: 12,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - MARGINS.left - MARGINS.right;

    let currentY = MARGINS.top;
    let currentLevel = 1;

    // ===========================
    // ENHANCED DECORATIVE HELPERS
    // ===========================

    /**
     * Enhanced background with multiple patterns
     */
    const drawBackgroundPattern = () => {
      // Base color
      doc.setFillColor(...COLORS.pageBg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Pattern 1: Diagonal lines
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.15);
      for (let i = -pageHeight; i < pageWidth + pageHeight; i += 12) {
        doc.line(i, 0, i + pageHeight, pageHeight);
      }

      // Pattern 2: Dots pattern (sparse)
      doc.setFillColor(215, 215, 225);
      for (let x = 10; x < pageWidth; x += 15) {
        for (let y = 10; y < pageHeight; y += 15) {
          doc.circle(x, y, 0.3, "F");
        }
      }

      // Pattern 3: Corner decorations
      doc.setFillColor(230, 230, 240);
      // Top-left corner decoration
      doc.triangle(0, 0, 15, 0, 0, 15, "F");
      // Top-right corner decoration
      doc.triangle(pageWidth, 0, pageWidth - 15, 0, pageWidth, 15, "F");
      // Bottom-left corner decoration
      doc.triangle(0, pageHeight, 15, pageHeight, 0, pageHeight - 15, "F");
      // Bottom-right corner decoration
      doc.triangle(
        pageWidth,
        pageHeight,
        pageWidth - 15,
        pageHeight,
        pageWidth,
        pageHeight - 15,
        "F",
      );
    };

    /**
     * Draws a card container with shadow and border
     */
    const drawCard = (x, y, width, height) => {
      // Shadow
      doc.setFillColor(200, 200, 210);
      doc.roundedRect(
        x + SIZES.cardShadowOffset,
        y + SIZES.cardShadowOffset,
        width,
        height,
        SIZES.cardCornerRadius,
        SIZES.cardCornerRadius,
        "F",
      );

      // Card background
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.cardCornerRadius,
        SIZES.cardCornerRadius,
        "F",
      );

      // Card border
      doc.setDrawColor(...COLORS.cardBorder);
      doc.setLineWidth(0.4);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.cardCornerRadius,
        SIZES.cardCornerRadius,
        "S",
      );
    };

    /**
     * Draws a button-style option
     */
    const drawButton = (x, y, width, height, isCorrect, isWrong) => {
      let bgColor = COLORS.buttonNeutral;
      let borderColor = COLORS.buttonNeutral;
      let textColor = COLORS.textDark;

      if (isCorrect) {
        bgColor = COLORS.buttonCorrect;
        borderColor = COLORS.buttonCorrect;
        textColor = COLORS.textWhite;
      } else if (isWrong) {
        bgColor = COLORS.buttonWrong;
        borderColor = COLORS.buttonWrong;
        textColor = COLORS.textWhite;
      }

      // Button shadow
      doc.setFillColor(180, 180, 190);
      doc.roundedRect(
        x + 0.4,
        y + 0.4,
        width,
        height,
        SIZES.buttonRadius,
        SIZES.buttonRadius,
        "F",
      );

      // Button background
      doc.setFillColor(...bgColor);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.buttonRadius,
        SIZES.buttonRadius,
        "F",
      );

      // Button border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.6);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.buttonRadius,
        SIZES.buttonRadius,
        "S",
      );

      return textColor;
    };

    /**
     * Draws a progress bar
     */
    const drawProgressBar = (x, y, width, height, percentage) => {
      // Background
      doc.setFillColor(...COLORS.progressBarBg);
      doc.roundedRect(x, y, width, height, 1.5, 1.5, "F");

      // Fill
      const fillWidth = (width * percentage) / 100;
      if (fillWidth > 0) {
        doc.setFillColor(...COLORS.progressBarFill);
        doc.roundedRect(x, y, fillWidth, height, 1.5, 1.5, "F");
      }

      // Border
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, width, height, 1.5, 1.5, "S");
    };

    /**
     * Sanitizes text - SAFE ASCII only
     */
    const sanitizeText = (text) => {
      if (!text) return "";
      let cleaned = String(text).trim();
      // Remove ALL non-standard characters to prevent encoding issues
      cleaned = cleaned.replace(/[^\x20-\x7E\n\r\t]/g, "");
      return cleaned.trim();
    };

    const isEssayQuestion = (q) => q.options && q.options.length === 1;

    // ===========================
    // HEADER & FOOTER
    // ===========================

    const addGameHeader = () => {
      drawBackgroundPattern();

      // Gradient-style header (simulated with solid color)
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, pageWidth, SIZES.headerHeight, "F");

      // Decorative border
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(1.5);
      doc.line(0, SIZES.headerHeight - 1, pageWidth, SIZES.headerHeight - 1);

      // Title - SAFE FONT
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.headingFont);
      doc.setFont("helvetica", "bold");
      const headerText = sanitizeText(config.title || "Quiz Quest");
      doc.text(headerText, MARGINS.left, 11);

      // Trophy text instead of emoji for safety
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      const nameWidth = doc.getTextWidth(currentName);
      const xPos = pageWidth - MARGINS.right - nameWidth;
      doc.text(`${currentName}`, xPos, 11);

      currentY = SIZES.headerHeight + 6;
    };

    const addGameFooter = (isLastPage = false) => {
      const footerY = pageHeight - SIZES.footerHeight;

      // Footer background
      doc.setFillColor(240, 242, 245);
      doc.rect(0, footerY - 2, pageWidth, SIZES.footerHeight + 2, "F");

      // Decorative top border
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(0.8);
      doc.line(0, footerY - 2, pageWidth, footerY - 2);

      // Level indicator (left)
      doc.setFontSize(SIZES.footerFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(`Page ${currentLevel}`, MARGINS.left, footerY + 4);

      // Branding (right)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text("Crafted by Belal Amr", pageWidth - MARGINS.right, footerY + 4, {
        align: "right",
      });

      if (!isLastPage) {
        // Progress dots (center)
        const dotY = footerY + 3.5;
        const dotSpacing = 3.5;
        const totalDots = 5;
        const startX = pageWidth / 2 - (totalDots * dotSpacing) / 2;

        for (let i = 0; i < totalDots; i++) {
          if (i < currentLevel) {
            doc.setFillColor(...COLORS.primary);
          } else {
            doc.setFillColor(...COLORS.progressBarBg);
          }
          doc.circle(startX + i * dotSpacing, dotY, 0.7, "F");
        }
      }
    };

    const checkPageBreak = (requiredHeight) => {
      if (
        currentY + requiredHeight >
        pageHeight - MARGINS.bottom - SIZES.footerHeight
      ) {
        addGameFooter();
        doc.addPage();
        currentLevel++;
        addGameHeader();
        return true;
      }
      return false;
    };

    // ===========================
    // SCORE CALCULATION
    // ===========================

    const calculateScore = () => {
      let correct = 0,
        wrong = 0,
        skipped = 0,
        essayCount = 0,
        totalScorable = 0;

      questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        if (isEssayQuestion(q)) {
          essayCount++;
        } else {
          totalScorable++;
          if (userAns === undefined || userAns === null) {
            skipped++;
          } else if (userAns === q.correct) {
            correct++;
          } else {
            wrong++;
          }
        }
      });

      const percentage =
        totalScorable > 0 ? Math.round((correct / totalScorable) * 100) : 0;
      const isPassing = percentage >= 70;

      return {
        correct,
        wrong,
        skipped,
        essayCount,
        totalScorable,
        percentage,
        isPassing,
      };
    };

    const scoreData = calculateScore();

    // ===========================
    // RENDER SCORE PAGE (GAMIFIED)
    // ===========================

    const renderScorePage = () => {
      addGameHeader();

      // Main achievement card
      const cardY = currentY;
      const cardHeight = 85;
      drawCard(MARGINS.left, cardY, contentWidth, cardHeight);

      // "QUEST COMPLETE!" banner
      currentY = cardY + 5;
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(
        MARGINS.left + 12,
        currentY,
        contentWidth - 24,
        12,
        2,
        2,
        "F",
      );
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.titleFont);
      doc.setFont("helvetica", "bold");
      doc.text("QUIZ COMPLETE!", pageWidth / 2, currentY + 9, {
        align: "center",
      });
      currentY += 22;

      // Achievement circle with score
      const circleY = currentY + 13;
      const radius = 18;

      // Outer ring
      doc.setFillColor(...COLORS.secondary);
      doc.circle(pageWidth / 2, circleY, radius + 1.5, "F");

      // Inner circle
      doc.setFillColor(
        ...(scoreData.isPassing ? COLORS.success : COLORS.warning),
      );
      doc.circle(pageWidth / 2, circleY, radius, "F");

      // Score text
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(`${scoreData.percentage}%`, pageWidth / 2, circleY + 2, {
        align: "center",
      });

      currentY = circleY + radius + 10;

      // Motivational message
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.primary);
      const message = scoreData.isPassing ? "LEGENDARY!" : "KEEP GRINDING!";
      doc.text(message, pageWidth / 2, currentY, { align: "center" });
      currentY += 9;

      // Stats row
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        `Score: ${scoreData.correct} / ${scoreData.totalScorable}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );
      currentY += 5;

      doc.setFontSize(SIZES.optionFont);
      doc.setTextColor(...COLORS.textLight);
      doc.text(
        `Correct: ${scoreData.correct}  Wrong: ${scoreData.wrong}  Skipped: ${scoreData.skipped}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );

      currentY = cardY + cardHeight + 10;

      // Progress bar
      const progressY = currentY;
      drawProgressBar(
        MARGINS.left + 18,
        progressY,
        contentWidth - 36,
        SIZES.progressBarHeight,
        scoreData.percentage,
      );
      currentY = progressY + SIZES.progressBarHeight + 3;

      // Progress percentage
      doc.setFontSize(SIZES.labelFont);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${scoreData.percentage}% Complete`, pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 10;

      // Section divider
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1.2);
      doc.line(
        MARGINS.left + 25,
        currentY,
        pageWidth - MARGINS.right - 25,
        currentY,
      );
      currentY += 8;

      // // "Question Review" header
      // doc.setFontSize(SIZES.headingFont);
      // doc.setFont("helvetica", "bold");
      // doc.setTextColor(...COLORS.primary);
      // doc.text("QUEST LOG", MARGINS.left, currentY);
      // currentY += 8;
    };

    renderScorePage();

    // ===========================
    // RENDER QUESTIONS (OPTIMIZED)
    // ===========================

    const renderQuestion = (question, index) => {
      const isEssay = isEssayQuestion(question);
      const userAns = userAnswers[index];
      const questionText = sanitizeText(question.q);

      // Calculate card height needed
      let cardContentHeight = 0;

      // Question text height
      doc.setFontSize(SIZES.questionFont);
      const qLines = doc.splitTextToSize(
        questionText,
        contentWidth - SIZES.cardPadding * 2 - 6,
      );
      const qHeight = qLines.length * 4.5;
      cardContentHeight += qHeight + 10; // Header + text

      // Options height
      if (isEssay) {
        cardContentHeight += 38;
      } else {
        cardContentHeight +=
          question.options.length * (SIZES.buttonHeight + SIZES.optionSpacing) +
          6;
      }

      // Explanation height
      let expLines = [];
      if (question.explanation) {
        const expText = sanitizeText(question.explanation);
        doc.setFontSize(SIZES.optionFont);
        expLines = doc.splitTextToSize(
          expText,
          contentWidth - SIZES.cardPadding * 2 - 6,
        );
        cardContentHeight += expLines.length * 3.8 + 8;
      }

      const totalCardHeight = cardContentHeight + SIZES.cardPadding * 2;

      // Check page break
      checkPageBreak(totalCardHeight + SIZES.cardMargin);

      // Draw quest card
      const cardY = currentY;
      drawCard(MARGINS.left, cardY, contentWidth, totalCardHeight);

      // Card header
      currentY = cardY + SIZES.cardPadding - 2;

      const headerY = currentY;
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding,
        headerY,
        contentWidth - SIZES.cardPadding * 2,
        8,
        2,
        2,
        "F",
      );

      // Quest number
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Question #${index + 1}`,
        MARGINS.left + SIZES.cardPadding + 2.5,
        headerY + 5.5,
      );

      // Status badge
      const { statusText, statusColor } = getQuestionStatus(
        question,
        userAns,
        isEssay,
      );
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.optionFont);
      doc.text(
        statusText,
        pageWidth - MARGINS.right - SIZES.cardPadding - 2.5,
        headerY + 5.5,
        { align: "right" },
      );

      currentY = headerY + 15;

      // Question text
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(qLines, MARGINS.left + SIZES.cardPadding + 3, currentY);
      currentY += qHeight;

      // Render options
      if (isEssay) {
        renderEssayAnswer(question, userAns);
      } else {
        renderMultipleChoiceOptions(question, userAns);
      }

      // Render explanation
      if (expLines.length > 0) {
        renderExplanation(expLines);
      }

      currentY = cardY + totalCardHeight + SIZES.cardMargin;
    };

    const getQuestionStatus = (question, userAns, isEssay) => {
      if (isEssay) {
        return { statusText: "ESSAY", statusColor: COLORS.warning };
      }

      const isSkipped = userAns === undefined || userAns === null;
      if (isSkipped) {
        return { statusText: "SKIPPED", statusColor: COLORS.textLight };
      }

      const isCorrect = userAns === question.correct;
      return isCorrect
        ? { statusText: "CORRECT", statusColor: COLORS.success }
        : { statusText: "WRONG", statusColor: COLORS.error };
    };

    const renderEssayAnswer = (question, userAns) => {
      const userText = sanitizeText(userAns || "Not answered");
      const formalAnswer = sanitizeText(question.options[0]);
      const boxWidth = contentWidth - SIZES.cardPadding * 2 - 6;

      // User answer box
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        15,
        1.5,
        1.5,
        "F",
      );
      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(
        "YOUR ANSWER:",
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 4,
      );
      doc.setFontSize(SIZES.optionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(userText, MARGINS.left + SIZES.cardPadding + 4.5, currentY + 8, {
        maxWidth: boxWidth - 6,
      });
      currentY += 17;

      // Formal answer box
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        15,
        1.5,
        1.5,
        "F",
      );
      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.success);
      doc.text(
        "CORRECT ANSWER:",
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 4,
      );
      doc.setFontSize(SIZES.optionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        formalAnswer,
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 8,
        {
          maxWidth: boxWidth - 6,
        },
      );
      currentY += 18;
    };

    const renderMultipleChoiceOptions = (question, userAns) => {
      const buttonWidth = contentWidth - SIZES.cardPadding * 2 - 6;

      question.options.forEach((opt, optIndex) => {
        const isUserAns = optIndex === userAns;
        const isCorrectAns = optIndex === question.correct;
        const sanitizedOption = sanitizeText(opt);

        const buttonX = MARGINS.left + SIZES.cardPadding + 3;
        const buttonY = currentY;

        // Draw button
        const textColor = drawButton(
          buttonX,
          buttonY,
          buttonWidth,
          SIZES.buttonHeight,
          isCorrectAns,
          isUserAns && !isCorrectAns,
        );

        // Button label
        const prefix = String.fromCharCode(65 + optIndex);
        let marker = "";
        if (isCorrectAns) marker = "> ";
        else if (isUserAns) marker = "X ";

        doc.setFontSize(SIZES.optionFont);
        doc.setFont("helvetica", isCorrectAns ? "bold" : "normal");
        doc.setTextColor(...textColor);

        const displayText = `${marker}${prefix}. ${sanitizedOption}`;

        doc.text(
          displayText,
          buttonX + SIZES.buttonPadding,
          buttonY + SIZES.buttonHeight / 2 + 1.2,
          { maxWidth: buttonWidth - SIZES.buttonPadding * 2 },
        );

        currentY += SIZES.buttonHeight + SIZES.optionSpacing;
      });

      currentY += 3;
    };

    const renderExplanation = (expLines) => {
      const boxWidth = contentWidth - SIZES.cardPadding * 2 - 6;
      const boxHeight = expLines.length * 3.8 + 8;

      // Explanation box
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        boxHeight,
        1.5,
        1.5,
        "F",
      );

      // Border
      doc.setDrawColor(...COLORS.warning);
      doc.setLineWidth(0.4);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        boxHeight,
        1.5,
        1.5,
        "S",
      );

      // Label
      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.warning);
      doc.text(
        "EXPLANATION:",
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 4,
      );

      // Explanation text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        expLines,
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 7.5,
      );

      currentY += boxHeight + 3;
    };

    // Render all questions
    questions.forEach((question, index) => {
      renderQuestion(question, index);
    });

    // ===========================
    // FINAL CTA PAGE
    // ===========================

    const renderCTAPage = () => {
      addGameFooter();
      doc.addPage();
      currentLevel++;
      addGameHeader();

      // Large CTA card
      const cardHeight = 55;
      const cardY = currentY + 18;
      drawCard(MARGINS.left + 8, cardY, contentWidth - 16, cardHeight);

      currentY = cardY + 12;

      // Game icon text
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("End", pageWidth / 2, currentY, { align: "center" });
      currentY += 14;

      // CTA heading
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("READY FOR MORE?", pageWidth / 2, currentY, { align: "center" });
      currentY += 8;

      // CTA subtext
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text(
        "Continue your journey with more challenges!",
        pageWidth / 2,
        currentY,
        {
          align: "center",
        },
      );
      currentY += 10;

      // Link button
      const buttonWidth = contentWidth - 50;
      const buttonX = MARGINS.left + 25;
      const buttonY = currentY;

      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(buttonX, buttonY, buttonWidth, 12, 2.5, 2.5, "F");

      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "bold");
      doc.text("PLAY MORE QUIZZES", pageWidth / 2, buttonY + 7.5, {
        align: "center",
      });

      currentY += 25;

      // URL
      doc.setFontSize(SIZES.optionFont);
      doc.setTextColor(...COLORS.info);
      doc.setFont("helvetica", "bold");
      doc.text("https://divquizzes.vercel.app/", pageWidth / 2, currentY, {
        align: "center",
      });

      addGameFooter(true);
    };

    renderCTAPage();

    // ===========================
    // SAVE PDF
    // ===========================
    const filename = `${config.title}.pdf`;

    doc.save(filename);
    console.log(`Gamified PDF exported: ${filename}`);

    return { success: true, filename };
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Failed to export PDF: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Module export
if (typeof module !== "undefined" && module.exports) {
  module.exports = { exportToPdf };
}

// ==========================================
// NEW: Export to Standalone Quiz HTML
// ==========================================
function exportToQuiz(config, questions) {
  const quizHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title || "Practice Quiz"}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .quiz-body { padding: 30px; }
        .question-card { background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 2px solid #e9ecef; }
        .question-card.answered { border-color: #667eea; }
        .question-num { color: #667eea; font-weight: 700; font-size: 14px; margin-bottom: 15px; }
        .question-text { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #2d3748; line-height: 1.6; }
        .options { display: flex; flex-direction: column; gap: 12px; }
        .option-btn { background: white; border: 2px solid #e2e8f0; border-radius: 10px; padding: 15px 20px; text-align: left; cursor: pointer; transition: all 0.3s ease; font-size: 16px; color: #2d3748; }
        .option-btn:hover { border-color: #667eea; background: #f0f4ff; transform: translateX(5px); }
        .option-btn.selected { background: #667eea; color: white; border-color: #667eea; }
        .option-btn.correct { background: #48bb78; color: white; border-color: #48bb78; }
        .option-btn.wrong { background: #f56565; color: white; border-color: #f56565; }
        .option-btn.disabled { cursor: not-allowed; opacity: 0.6; }
        .essay-input { width: 100%; min-height: 120px; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: inherit; font-size: 15px; resize: vertical; }
        .essay-input:focus { outline: none; border-color: #667eea; }
        .controls { display: flex; gap: 15px; justify-content: center; padding: 20px; background: #f8f9fa; flex-wrap: wrap; }
        .btn { padding: 12px 30px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5a67d8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
        .btn-secondary { background: #e2e8f0; color: #2d3748; }
        .btn-secondary:hover { background: #cbd5e0; }
        .results { padding: 30px; text-align: center; display: none; }
        .results.show { display: block; }
        .score-circle { width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: white; }
        .score-circle.pass { background: linear-gradient(135deg, #48bb78, #38a169); }
        .score-circle.fail { background: linear-gradient(135deg, #f56565, #e53e3e); }
        .explanation { background: #ebf8ff; border-left: 4px solid #4299e1; padding: 15px; margin-top: 15px; border-radius: 8px; font-size: 14px; color: #2c5282; display: none; }
        .explanation.show { display: block; }
        .model-answer { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 15px; margin-top: 15px; border-radius: 8px; font-size: 14px; color: #1b5e20; display: none; }
        .model-answer.show { display: block; }
        .essay-input.disabled { cursor: not-allowed; opacity: 0.8; background: #f1f5f9; }
        @media (max-width: 600px) { .container { border-radius: 0; } .header { padding: 20px; } .quiz-body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${config.title || "Practice Quiz"}</h1>
            <p>Total Questions: ${questions.length} | Practice Mode</p>
        </div>
        <div id="quizBody" class="quiz-body"></div>
        <div class="controls">
            <button class="btn btn-secondary" onclick="resetQuiz()">🔄 Reset Quiz</button>
            <button class="btn btn-primary" onclick="submitQuiz()">✓ Submit Quiz</button>
        </div>
        <div id="results" class="results"></div>
    </div>

    <script>
        const questions = ${JSON.stringify(questions)};
        let userAnswers = new Array(questions.length).fill(null);
        let submitted = false;

        function isEssayQuestion(q) {
            return q.options && q.options.length === 1;
        }

        function renderQuiz() {
            const quizBody = document.getElementById('quizBody');
            let html = '';

            questions.forEach((q, index) => {
                const isEssay = isEssayQuestion(q);
                html += '<div class="question-card" id="q' + index + '">' +
                    '<div class="question-num">Question ' + (index + 1) + '</div>' +
                    '<div class="question-text">' + escapeHTML(q.q) + '</div>';

                if (isEssay) {
                    html += '<textarea ' +
                        'class="essay-input" ' +
                        'id="essay' + index + '" ' +
                        'placeholder="Type your answer here..." ' +
                        'oninput="saveEssayAnswer(' + index + ', this.value)"' +
                        '>' + (userAnswers[index] || '') + '</textarea>';
                    html += '<div class="model-answer" id="modelAns' + index + '">' +
                        '<strong>Correct Answer / Model Answer:</strong><br>' +
                        escapeHTML(q.options[0]) + '</div>';
                } else {
                    html += '<div class="options">';
                    q.options.forEach((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        html += '<button ' +
                            'class="option-btn" ' +
                            'id="btn' + index + '_' + i + '" ' +
                            'onclick="selectAnswer(' + index + ', ' + i + ')"' +
                            '>' +
                            '<strong>' + letter + '.</strong> ' + escapeHTML(opt) +
                            '</button>';
                    });
                    html += '</div>';
                }

                if (q.explanation) {
                    html += '<div class="explanation" id="exp' + index + '">' +
                        '<strong>💡 Explanation:</strong> ' + escapeHTML(q.explanation) +
                        '</div>';
                }

                html += '</div>';
            });

            quizBody.innerHTML = html;
        }

        function escapeHTML(str) {
            if (str === undefined || str === null) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function selectAnswer(qIndex, optIndex) {
            if (submitted) return;
            
            userAnswers[qIndex] = optIndex;
            
            const card = document.getElementById('q' + qIndex);
            card.classList.add('answered');
            
            const buttons = card.querySelectorAll('.option-btn');
            buttons.forEach((btn, i) => {
                btn.classList.remove('selected');
                if (i === optIndex) {
                    btn.classList.add('selected');
                }
            });
        }

        function saveEssayAnswer(qIndex, value) {
            userAnswers[qIndex] = value.trim() || null;
            const card = document.getElementById('q' + qIndex);
            if (value.trim()) {
                card.classList.add('answered');
            } else {
                card.classList.remove('answered');
            }
        }

        function submitQuiz() {
            if (submitted) return;
            
            submitted = true;
            let correct = 0;
            let totalScorable = 0;

            questions.forEach((q, index) => {
                if (isEssayQuestion(q)) {
                    const essayEl = document.getElementById('essay' + index);
                    if (essayEl) {
                        essayEl.readOnly = true;
                        essayEl.classList.add('disabled');
                    }
                    const modelEl = document.getElementById('modelAns' + index);
                    if (modelEl) modelEl.classList.add('show');
                    const exp = document.getElementById('exp' + index);
                    if (exp) exp.classList.add('show');
                    return;
                }
                
                totalScorable++;
                const userAns = userAnswers[index];
                const isCorrect = userAns === q.correct;
                
                if (isCorrect) correct++;

                const card = document.getElementById('q' + index);
                const buttons = card.querySelectorAll('.option-btn');
                
                buttons.forEach((btn, i) => {
                    btn.classList.add('disabled');
                    if (i === q.correct) {
                        btn.classList.add('correct');
                    } else if (i === userAns && !isCorrect) {
                        btn.classList.add('wrong');
                    }
                });

                const exp = document.getElementById('exp' + index);
                if (exp) exp.classList.add('show');
            });

            const percentage = totalScorable > 0 ? Math.round((correct / totalScorable) * 100) : 0;
            const passClass = percentage >= 70 ? 'pass' : 'fail';
            
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<div class="score-circle ' + passClass + '">' +
                percentage + '%' +
                '</div>' +
                '<h2>' + (percentage >= 70 ? 'Great Job!' : 'Keep Practicing!') + '</h2>' +
                '<p style="margin-top: 15px; font-size: 18px; color: #4a5568;">' +
                'Score: ' + correct + ' / ' + totalScorable +
                '</p>' +
                '<p style="margin-top: 10px; color: #718096;">' +
                'Scroll up to review explanations for each question' +
                '</p>';
            resultsDiv.classList.add('show');
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function resetQuiz() {
            submitted = false;
            userAnswers = new Array(questions.length).fill(null);
            document.getElementById('results').classList.remove('show');
            renderQuiz();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        renderQuiz();
    </script>
</body>
</html>`;

  const blob = new Blob([quizHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.title || "practice_quiz"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
