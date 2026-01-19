// Website/Script/summary.js
import { examList } from "./examManifest.js";

const currentName = localStorage.getItem("username");

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
  const exportMdBtn = document.getElementById("exportMdBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const exportHtmlBtn = document.getElementById("exportHtmlBtn");

  backBtn && (backBtn.onclick = goHome);
  exportMdBtn &&
    (exportMdBtn.onclick = () => exportToMarkdown(config, questions));
  exportPdfBtn && (exportPdfBtn.onclick = () => exportToPdf(config, questions));
  exportHtmlBtn &&
    (exportHtmlBtn.onclick = () => exportToHtml(config, questions));

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
      continue;
    }

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
    essayCount,
  );

  // Review
  renderReview(container, questions, result.userAnswers);

  // NEW: Badge notifications
  const userName = localStorage.getItem("username") || "User";
  const newBadges = result.gamification ? result.gamification.newBadges : [];
  newBadges.forEach((badge, index) => {
    setTimeout(() => {
      showNotification(badge, userName);
    }, index * 500);
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
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);
  const timeout = setTimeout(() => {
    removeNotification(notification);
  }, 5000);
  notification.querySelector(".close-btn").addEventListener("click", () => {
    clearTimeout(timeout);
    removeNotification(notification);
  });
}

function removeNotification(notif) {
  notif.classList.add("hide");
  setTimeout(() => {
    notif.remove();
  }, 300);
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
            
            <div class="points-pill">
              <span>💎 +${points} Points</span>
            </div>

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
    if (essayCount > 0) {
      statsDisplay.textContent += `    Essays: ${essayCount}`;
    }
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
// ==========================================
// 1. Export to Markdown
// ==========================================
function exportToMarkdown(config, questions) {
  let hasMCQ = false;
  let hasTrueFalse = false;
  let hasEssay = false;

  questions.forEach((q) => {
    if (isEssayQuestion(q)) {
      hasEssay = true;
    } else if (q.options.length === 2) {
      hasTrueFalse = true;
    } else {
      hasMCQ = true;
    }
  });

  let questionType = "";
  if (hasEssay && !hasMCQ && !hasTrueFalse) {
    questionType = "Essay/Definitions";
  } else if (hasEssay) {
    questionType = "Mixed (MCQ, True/False, Essay)";
  } else if (hasMCQ && hasTrueFalse) {
    questionType = "MCQ and True/False";
  } else if (hasTrueFalse) {
    questionType = "True/False only";
  } else {
    questionType = "MCQ only";
  }

  let markdown = `# ${config.title || "Quiz"}\n`;
  markdown += `**Number of questions:** ${questions.length}\n`;
  markdown += `**Questions' type:** ${questionType}\n\n`;
  markdown += `---\n\n`;

  questions.forEach((q, index) => {
    markdown += `### Question ${index + 1}\n`;
    markdown += `${q.q}\n\n`;

    if (isEssayQuestion(q)) {
      markdown += `**Formal Answer:**\n\n${q.options[0]}\n\n`;
    } else {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        markdown += `${letter}. ${opt}\n`;
      });
      markdown += `\n`;
      const correctLetter = String.fromCharCode(65 + q.correct);
      markdown += `**Correct Answer:** ${correctLetter}. ${
        q.options[q.correct]
      }\n\n`;
    }

    if (q.explanation) {
      markdown += `**Explanation:**\n${q.explanation}\n\n`;
    }

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
// 2. Export to HTML
// ==========================================
function exportToHtml(config, questions) {
  // Determine question types
  let hasMCQ = false;
  let hasTrueFalse = false;
  let hasEssay = false;

  questions.forEach((q) => {
    if (isEssayQuestion(q)) {
      hasEssay = true;
    } else if (q.options.length === 2) {
      hasTrueFalse = true;
    } else {
      hasMCQ = true;
    }
  });

  let questionType = "Multiple Choice";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";

  const date = new Date().toLocaleDateString();

  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title || "Quiz Examination"}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #e0e0e0;
            background: #121212;
        }
        h1 {
            color: #ffffff;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .meta {
            text-align: center;
            color: #888;
            margin-bottom: 40px;
            font-style: italic;
        }
        .question-card {
            background: #1e1e1e;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid #333;
        }
        .q-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            font-size: 0.9rem;
            color: #aaa;
        }
        .q-text {
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 20px;
        }
        .options-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        }
        .option {
            padding: 10px 15px;
            margin-bottom: 8px;
            border-radius: 6px;
            background: rgba(255,255,255,0.05);
            font-size: 0.95rem;
        }
        .correct-answer {
            background: var(--correct-bg);
            color: var(--correct-text);
            border: 1px solid #22c55e;
            font-weight: 600;
            margin-top: 15px;
            padding: 12px 15px;
            border-radius: 8px;
        }
        .explanation {
            margin-top: 15px;
            padding: 15px;
            background: rgba(59, 130, 246, 0.1);
            border-left: 3px solid var(--accent);
            color: #dbeafe;
            font-size: 0.95rem;
        }
        .essay-box {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #f59e0b;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            color: var(--text-muted);
            font-size: 0.8rem;
            border-top: 1px solid var(--border);
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <h1>${config.title || "Quiz Examination"}</h1>
    <div class="meta">
        Total Questions: ${
          questions.length
        } • Type: ${questionType} • Date: ${date}
    </div>
`;

  questions.forEach((q, index) => {
    htmlContent += `
    <div class="question-card">
        <div class="q-header">
            <span>Question ${index + 1}</span>
            <span>${isEssayQuestion(q) ? "Essay" : "MCQ"}</span>
        </div>
        <div class="q-text">${q.q}</div>`;

    if (isEssayQuestion(q)) {
      htmlContent += `
        <div class="essay-box">
            <strong style="color: #f59e0b; display:block; margin-bottom:5px;">Formal Answer / Key Points:</strong>
            ${q.options[0]}
        </div>`;
    } else {
      // Options List
      htmlContent += `<div class="options-list">`;
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        htmlContent += `<div class="option"><strong>${letter}.</strong> ${opt}</div>`;
      });
      htmlContent += `</div>`;

      // Correct Answer Block
      const correctLetter = String.fromCharCode(65 + q.correct);
      htmlContent += `
        <div class="correct-answer">
            ✓ Correct Answer: ${correctLetter}. ${q.options[q.correct]}
        </div>`;
    }

    if (q.explanation) {
      htmlContent += `
        <div class="explanation">
            <strong>💡 Explanation:</strong> ${q.explanation}
        </div>`;
    }

    htmlContent += `</div>`; // Close card
  });

  htmlContent += `
    <div class="footer">Generated by Quiz App</div>
</body>
</html>`;

  // Create Blob and Download
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
// 3. Export to PDF (Fixed Scroll Issue)
// ==========================================
function exportToPdf(config, questions) {
  // Check if html2pdf is loaded
  if (typeof html2pdf === "undefined") {
    alert("PDF library is not loaded. Please refresh the page and try again.");
    return;
  }

  // Show loading state
  const btn = document.getElementById("exportPdfBtn");
  const originalText = btn ? btn.textContent : "Export PDF";
  if (btn) {
    btn.textContent = "⏳ Generating PDF...";
    btn.disabled = true;
  }

  // Determine question types
  let hasMCQ = false;
  let hasTrueFalse = false;
  let hasEssay = false;

  questions.forEach((q) => {
    if (isEssayQuestion(q)) {
      hasEssay = true;
    } else if (q.options.length === 2) {
      hasTrueFalse = true;
    } else {
      hasMCQ = true;
    }
  });

  let questionType = "Multiple Choice";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";

  // Create visible but off-screen container
  const pdfContainer = document.createElement("div");
  pdfContainer.id = "pdf-export-container";
  // Ensure the container itself is white so html2pdf sees white
  pdfContainer.style.background = "#ffffff";
  document.body.appendChild(pdfContainer);

  // Build content HTML with FORCED LIGHT MODE CSS
  let contentHTML = `
    <style>
        #pdf-export-wrapper {
            font-family: 'Times New Roman', serif;
            color: #000000 !important; 
            background: #ffffff !important;
            line-height: 1.5;
        }
        #pdf-export-wrapper h1, 
        #pdf-export-wrapper h2, 
        #pdf-export-wrapper p, 
        #pdf-export-wrapper div,
        #pdf-export-wrapper span {
            color: #000000 !important;
        }
        .pdf-card {
            border: 1px solid #ddd;
            background-color: #fafafa !important;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .pdf-correct {
            background-color: #e8f5e9 !important;
            border-left: 4px solid #4caf50;
            padding: 10px;
            margin-top: 10px;
            color: #000 !important;
        }
        .pdf-essay {
            background-color: #fff3e0 !important;
            border-left: 4px solid #ff9800;
            padding: 10px;
            margin-top: 10px;
            color: #000 !important;
        }
        .pdf-explain {
            background-color: #e3f2fd !important;
            border-left: 4px solid #2196f3;
            padding: 10px;
            margin-top: 10px;
            font-style: italic;
            color: #000 !important;
        }
    </style>

    <div id="pdf-export-wrapper" style="padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin: 0; text-transform: uppercase;">${
          config.title || "Quiz Examination"
        }</h1>
        <p style="font-size: 14px; margin: 5px 0;">
          <strong>Total Questions:</strong> ${questions.length} &nbsp;|&nbsp;
          <strong>Type:</strong> ${questionType}
        </p>
      </div>
  `;

  // Add each question
  questions.forEach((q, index) => {
    contentHTML += `
      <div class="pdf-card">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">
          Question ${index + 1}
        </div>
        <div style="font-size: 13px; margin-bottom: 12px;">
          ${q.q}
        </div>
    `;

    if (isEssayQuestion(q)) {
      contentHTML += `
        <div class="pdf-essay">
          <strong>Answer:</strong><br>
          ${q.options[0]}
        </div>
      `;
    } else {
      // Options
      contentHTML += `<div style="margin-left: 15px;">`;
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        contentHTML += `
          <div style="margin-bottom: 5px; font-size: 12px;">
            <strong>${letter}.</strong> ${opt}
          </div>
        `;
      });
      contentHTML += `</div>`;

      // Correct Answer
      const correctLetter = String.fromCharCode(65 + q.correct);
      contentHTML += `
        <div class="pdf-correct">
          <strong>Correct Answer:</strong> ${correctLetter}. ${
            q.options[q.correct]
          }
        </div>
      `;
    }

    if (q.explanation) {
      contentHTML += `
        <div class="pdf-explain">
          <strong>Explanation:</strong> ${q.explanation}
        </div>
      `;
    }

    contentHTML += `</div>`; // End card
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
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      // THESE TWO LINES BELOW FIX THE SCROLL BUG
      scrollY: 0,
      windowHeight: pdfContainer.scrollHeight,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  setTimeout(() => {
    html2pdf()
      .set(options)
      .from(pdfContainer)
      .save()
      .then(() => {
        if (pdfContainer.parentNode) document.body.removeChild(pdfContainer);
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
        if (pdfContainer.parentNode) document.body.removeChild(pdfContainer);
        if (btn) {
          btn.textContent = "Error";
          btn.disabled = false;
        }
        alert("Failed to generate PDF.");
      });
  }, 100);
}
