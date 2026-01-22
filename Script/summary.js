// Website/Script/summary.js
import { examList } from "./examManifest.js";

const currentName = localStorage.getItem("username");
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
  exportMdBtn && (exportMdBtn.onclick = () => exportToMarkdown(config, questions, result.userAnswers));
  exportPdfBtn && (exportPdfBtn.onclick = () => exportToPdf(config, questions, result.userAnswers));
  exportHtmlBtn && (exportHtmlBtn.onclick = () => exportToHtml(config, questions, result.userAnswers));
  exportQuizBtn && (exportQuizBtn.onclick = () => exportToQuiz(config, questions));

  const totalScorable = result.total;
  const totalQuestions = questions.length;
  let correct = 0, skipped = 0, essayCount = 0;

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

  renderHeader(scoreHeader, scoreDisplay, statsDisplay, result, totalScorable, correct, wrong, skipped, essayCount);
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

function renderHeader(scoreHeader, scoreDisplay, statsDisplay, data, total, correct, wrong, skipped, essayCount) {
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
          ${newBadges.map(b => `
            <div class="badge-item">
              <span class="badge-icon">${b.icon}</span>
              <span class="badge-name">${b.title}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (scoreHeader) scoreHeader.innerHTML = `
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
  return String(input).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
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
      const userAnswerLower = String(userAns || "").trim().toLowerCase();
      const correctAnswerLower = String(q.options[0] || "").trim().toLowerCase();
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
  let hasMCQ = false, hasTrueFalse = false, hasEssay = false;
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
      const userLetter = isSkipped ? "Skipped" : String.fromCharCode(65 + userAns);
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
  let hasMCQ = false, hasTrueFalse = false, hasEssay = false;
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
    const isCorrect = !isSkipped && userAns === q.correct && !isEssayQuestion(q);
    
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

      const userClass = isSkipped ? 'skipped' : (isCorrect ? '' : 'wrong');
      const userLetter = isSkipped ? '' : String.fromCharCode(65 + userAns);
      const userAnswer = isSkipped ? 'Skipped' : `${userLetter}. ${q.options[userAns]}`;
      const userIcon = isSkipped ? '⚪' : (isCorrect ? '✅' : '❌');
      
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
function exportToPdf(config, questions, userAnswers) {
  if (typeof html2pdf === "undefined") {
    alert("PDF library is not loaded. Please refresh the page and try again.");
    return;
  }

  const btn = document.getElementById("exportPdfBtn");
  const originalText = btn ? btn.textContent : "Export PDF";
  if (btn) {
    btn.textContent = "⏳ Generating PDF...";
    btn.disabled = true;
  }

  let hasMCQ = false, hasTrueFalse = false, hasEssay = false;
  questions.forEach((q) => {
    if (isEssayQuestion(q)) hasEssay = true;
    else if (q.options.length === 2) hasTrueFalse = true;
    else hasMCQ = true;
  });

  let questionType = "Multiple Choice";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";

  const pdfContainer = document.createElement("div");
  pdfContainer.id = "pdf-export-container";
  pdfContainer.style.background = "#ffffff";
  document.body.appendChild(pdfContainer);

  let contentHTML = `
    <style>
        #pdf-export-wrapper { font-family: 'Times New Roman', serif; color: #000000 !important; background: #ffffff !important; line-height: 1.5; }
        #pdf-export-wrapper h1, #pdf-export-wrapper h2, #pdf-export-wrapper p, #pdf-export-wrapper div, #pdf-export-wrapper span { color: #000000 !important; }
        .pdf-card { border: 1px solid #ddd; background-color: #fafafa !important; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
        .pdf-user-answer { background-color: #e3f2fd !important; border-left: 4px solid #2196f3; padding: 10px; margin-top: 10px; color: #000 !important; }
        .pdf-user-answer.wrong { background-color: #ffebee !important; border-left: 4px solid #f44336; }
        .pdf-user-answer.skipped { background-color: #f5f5f5 !important; border-left: 4px solid #9e9e9e; }
        .pdf-correct { background-color: #e8f5e9 !important; border-left: 4px solid #4caf50; padding: 10px; margin-top: 10px; color: #000 !important; }
        .pdf-essay { background-color: #fff3e0 !important; border-left: 4px solid #ff9800; padding: 10px; margin-top: 10px; color: #000 !important; }
        .pdf-explain { background-color: #e3f2fd !important; border-left: 4px solid #2196f3; padding: 10px; margin-top: 10px; font-style: italic; color: #000 !important; }
    </style>
    <div id="pdf-export-wrapper" style="padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin: 0; text-transform: uppercase;">${config.title || "Quiz Examination"}</h1>
        <p style="font-size: 14px; margin: 5px 0;"><strong>Total Questions:</strong> ${questions.length} &nbsp;|&nbsp; <strong>Type:</strong> ${questionType}</p>
      </div>
  `;

  questions.forEach((q, index) => {
    const userAns = userAnswers[index];
    const isSkipped = userAns === undefined || userAns === null;
    const isCorrect = !isSkipped && userAns === q.correct && !isEssayQuestion(q);
    
    contentHTML += `
      <div class="pdf-card">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">Question ${index + 1}</div>
        <div style="font-size: 13px; margin-bottom: 12px;">${q.q}</div>`;

    if (isEssayQuestion(q)) {
      const userText = userAns || "Not answered";
      contentHTML += `
        <div class="pdf-user-answer"><strong>Your Answer:</strong><br>${userText}</div>
        <div class="pdf-essay"><strong>Formal Answer:</strong><br>${q.options[0]}</div>`;
    } else {
      contentHTML += `<div style="margin-left: 15px;">`;
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        contentHTML += `<div style="margin-bottom: 5px; font-size: 12px;"><strong>${letter}.</strong> ${opt}</div>`;
      });
      contentHTML += `</div>`;

      const userClass = isSkipped ? 'skipped' : (isCorrect ? '' : 'wrong');
      const userLetter = isSkipped ? '' : String.fromCharCode(65 + userAns);
      const userAnswer = isSkipped ? 'Skipped' : `${userLetter}. ${q.options[userAns]}`;
      contentHTML += `<div class="pdf-user-answer ${userClass}"><strong>Your Answer:</strong> ${userAnswer}</div>`;

      const correctLetter = String.fromCharCode(65 + q.correct);
      contentHTML += `<div class="pdf-correct"><strong>Correct Answer:</strong> ${correctLetter}. ${q.options[q.correct]}</div>`;
    }

    if (q.explanation) {
      contentHTML += `<div class="pdf-explain"><strong>Explanation:</strong> ${q.explanation}</div>`;
    }

    contentHTML += `</div>`;
  });

  contentHTML += `
      <div style="margin-top: 30px; text-align: center; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px;">
        Generated on ${new Date().toLocaleDateString()}
      </div>
    </div>
  `;

  pdfContainer.innerHTML = contentHTML;

  const options = {
    margin: [10, 10, 10, 10],
    filename: `${config.title || "quiz"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", scrollY: 0, windowHeight: pdfContainer.scrollHeight },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  setTimeout(() => {
    html2pdf().set(options).from(pdfContainer).save()
      .then(() => {
        if (pdfContainer.parentNode) document.body.removeChild(pdfContainer);
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
        if (pdfContainer.parentNode) document.body.removeChild(pdfContainer);
        if (btn) { btn.textContent = "Error"; btn.disabled = false; }
        alert("Failed to generate PDF.");
      });
  }, 100);
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