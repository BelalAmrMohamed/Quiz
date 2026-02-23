// src/scripts/exportToHtml.js
// Downloads the quiz as an html page, showing the results of the quiz only (.html)
// Deals with the export from both main page and results/summary page
// No libraries used

import { showNotification } from "../components/notifications.js";

// === Markdown-lite renderer (mirrors quiz.js renderMarkdown) ===
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

  // 3. Inline code (single backticks)
  str = str.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  // 4. Newlines → <br>
  str = str.replace(/\n/g, "<br>");

  // 5. Restore fenced code blocks
  str = str.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

  return str;
}

export async function exportToHtml(config, questions, userAnswers = []) {
  // Convert local images to base64
  const processedQuestions = await convertImagesToBase64(questions);

  let hasMCQ = false,
    hasTrueFalse = false,
    hasEssay = false;
  processedQuestions.forEach((q) => {
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
          .essay-score { padding: 12px 15px; border-radius: 8px; font-size: 0.9rem; margin-top: 10px; border-left: 3px solid; font-weight: 600; }
          .essay-score.correct { background: rgba(16,185,129,0.15); border-color: #10b981; color: #34d399; }
          .essay-score.partial { background: rgba(245,158,11,0.15); border-color: #f59e0b; color: #fcd34d; }
          .essay-score.wrong   { background: rgba(239,68,68,0.15);  border-color: #ef4444; color: #f87171; }
          .question-image { max-width: 100%; height: auto; display: block; margin: 10px auto; border-radius: 8px; border: 1px solid #333; }
          .footer { text-align: center; margin-top: 50px; color: #888; font-size: 0.8rem; border-top: 1px solid #333; padding-top: 20px; }
          .code-block { background: #0d0d0d; border: 1px solid #444; border-radius: 8px; padding: 12px 16px; margin: 10px 0; overflow-x: auto; font-family: "SF Mono", "Fira Code", Consolas, monospace; font-size: 0.88rem; line-height: 1.6; white-space: pre; text-align: left; }
          .code-block code { background: none; padding: 0; color: #e2e8f0; font-size: inherit; }
          .inline-code { font-family: "SF Mono", "Fira Code", Consolas, monospace; font-size: 0.88em; background: rgba(99,102,241,0.15); border: 1px solid #555; border-radius: 4px; padding: 1px 6px; color: #a5b4fc; white-space: nowrap; }
          .score-block { text-align: center; margin: 0 0 40px; padding: 32px 24px; background: #1e1e1e; border-radius: 16px; border: 1px solid #333; }
          .score-circle { width: 130px; height: 130px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; color: #fff; position: relative; letter-spacing: -1px; }
          .score-circle::after { content: ''; position: absolute; inset: -7px; border-radius: 50%; border: 3px solid currentColor; opacity: 0.28; }
          .score-circle.pass { background: linear-gradient(135deg, #34d399, #059669); box-shadow: 0 8px 32px rgba(16,185,129,0.4); color: #fff; }
          .score-circle.fail { background: linear-gradient(135deg, #f87171, #dc2626); box-shadow: 0 8px 32px rgba(239,68,68,0.4); color: #fff; }
          .score-label { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 20px; }
          .score-stats { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
          .stat-pill { padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .stat-correct { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); }
          .stat-wrong   { background: rgba(239,68,68,0.2);  color: #f87171; border: 1px solid rgba(239,68,68,0.4);  }
          .stat-skipped { background: rgba(148,163,184,0.15); color: #94a3b8; border: 1px solid rgba(148,163,184,0.3); }
          .stat-essay   { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
      </style>
  </head>
  <body>
      <h1>${config.title || "Quiz Examination"}</h1>
      <div class="meta">Total Questions: ${
        processedQuestions.length
      } • Type: ${questionType} • Date: ${date}</div>
  `;

  // Determine if we are in "Summary Mode" (user answers provided)
  const isResultsMode =
    userAnswers &&
    (Array.isArray(userAnswers)
      ? userAnswers.length > 0
      : Object.keys(userAnswers).length > 0);

  // ── Score summary block (only in results mode) ──────────────────────────────
  if (isResultsMode) {
    let mcqTotal = 0,
      mcqCorrect = 0,
      mcqWrong = 0,
      mcqSkipped = 0;
    let essayTotalScore = 0,
      essayMaxScore = 0;
    processedQuestions.forEach((q, i) => {
      if (isEssayQuestion(q)) {
        const userText = userAnswers[i] || "";
        essayTotalScore += gradeEssay(userText, q.options[0]);
        essayMaxScore += 5;
      } else {
        mcqTotal++;
        const ans = userAnswers[i];
        if (ans === null || ans === undefined) mcqSkipped++;
        else if (ans === q.correct) mcqCorrect++;
        else mcqWrong++;
      }
    });

    const essayCount = essayMaxScore / 5;
    const totalScore = mcqCorrect + essayTotalScore;
    const totalPoss = mcqTotal + essayMaxScore;
    const percent =
      totalPoss > 0 ? Math.round((totalScore / totalPoss) * 100) : 0;
    const passed = percent >= 70;
    const circleClass = passed ? "pass" : "fail";
    const label = passed ? "🎉 Great Job!" : "📚 Keep Practicing!";

    let statsHtml = `
    <div class="stat-pill stat-skipped"> Number of questions: ${mcqTotal + essayCount}</div>
      <div class="stat-pill stat-correct">✓ Correct: ${mcqCorrect}</div>
      <div class="stat-pill stat-wrong">✗ Wrong: ${mcqWrong}</div>
      <div class="stat-pill stat-skipped">⚪ Skipped: ${mcqSkipped}</div>`;

    let scoreInfo = "";
    if (mcqTotal > 0)
      scoreInfo += `<div class="stat-pill" style="background:rgba(148,163,184,0.1);color:#cbd5e1;border:1px solid rgba(148,163,184,0.2);font-size:13px">MCQ: ${mcqCorrect}/${mcqTotal}${essayCount > 0 ? ` · ✏️ Essays: ${essayTotalScore} / ${essayMaxScore}` : ""}</div>`;
    scoreInfo += `<div class="stat-pill stat-correct" style="font-size:14px">Total score: ${totalScore} / ${totalPoss} pts</div>`;

    htmlContent += `
    <div class="score-block">
      <div class="score-circle ${circleClass}">${percent}%</div>
      <div class="score-label">${label}</div>
      <div class="score-stats">
        ${statsHtml}
      </div>
      <div class="score-stats" style="margin-top:10px">
        ${scoreInfo}
      </div>
    </div>`;
  }

  processedQuestions.forEach((q, index) => {
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
          ${q.image ? `<img src="${q.image}" class="question-image" alt="Question Image" onerror="this.alt='[Image not available]'; this.style.border='2px dashed #666';">` : ""}
          <div class="q-text">${renderMarkdown(q.q)}</div>`;

    if (isEssayQuestion(q)) {
      const userText = userAns || "";
      if (isResultsMode) {
        const score = gradeEssay(userText, q.options[0]);
        const stars = "★".repeat(score) + "☆".repeat(5 - score);
        const scoreClass =
          score >= 3 ? "correct" : score >= 1 ? "partial" : "wrong";
        htmlContent += `
          <div class="essay-box" style="border-left: 3px solid #3b82f6;">
              <strong style="color: #60a5fa; display:block; margin-bottom:5px;">Your Answer:</strong>
              ${renderMarkdown(userText || "Not answered")}
          </div>
          <div class="essay-score ${scoreClass}">
            Score: ${score}/5 &nbsp;<span style="font-size:1.1em;color:#f59e0b">${stars}</span>
          </div>`;
      }

      htmlContent += `<div class="essay-box">
              <strong style="color: #f59e0b; display:block; margin-bottom:5px;">Formal Answer / Key Points:</strong>
              ${renderMarkdown(q.options[0])}
          </div>`;
    } else {
      htmlContent += `<div class="options-list">`;
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        htmlContent += `<div class="option"><strong>${letter}.</strong> ${renderMarkdown(opt)}</div>`;
      });
      htmlContent += `</div>`;

      const userClass = isSkipped ? "skipped" : isCorrect ? "" : "wrong";
      const userLetter = isSkipped ? "" : String.fromCharCode(65 + userAns);
      const userAnswer = isSkipped
        ? "Skipped"
        : `${userLetter}. ${renderMarkdown(q.options[userAns])}`;
      const userIcon = isSkipped ? "⚪" : isCorrect ? "✅" : "❌";

      if (isResultsMode)
        htmlContent += `<div class="user-answer ${userClass}">${userIcon} Your Answer: ${userAnswer}</div>`;

      const correctLetter = String.fromCharCode(65 + q.correct);
      htmlContent += `<div class="correct-answer">✓ Correct Answer: ${correctLetter}. ${renderMarkdown(
        q.options[q.correct],
      )}</div>`;
    }

    if (q.explanation) {
      htmlContent += `<div class="explanation"><strong>💡 Explanation:</strong> ${renderMarkdown(q.explanation)}</div>`;
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
  showNotification(
    "HTML file Downloaded",
    "You have it now",
    "./assets/images/HTML_Icon.png",
  );
}

const isEssayQuestion = (q) => q.options && q.options.length === 1;

function gradeEssay(userInput, modelAnswer) {
  const normalize = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[.,;:!?()\[\]{}\"'\/\\]/g, " ")
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

// Image Helpers
const convertImagesToBase64 = async (questions) => {
  const processedQuestions = [];

  for (const question of questions) {
    const processedQuestion = { ...question };

    if (question.image) {
      // If it's a local path or needs conversion
      if (isLocalPath(question.image)) {
        console.log(`Converting local image to base64: ${question.image}`);
        const base64 = await getDataUrl(question.image);
        if (base64) {
          processedQuestion.image = base64;
        } else {
          console.warn(`Failed to convert ${question.image}, keeping original`);
          // Keep original - will show alt text if broken
        }
      }
      // Remote URLs or already base64 - keep as is
    }

    processedQuestions.push(processedQuestion);
  }

  return processedQuestions;
};

const isLocalPath = (url) => {
  if (!url) return false;
  // Check for relative paths (./, ../, or no protocol)
  if (url.startsWith("./") || url.startsWith("../") || url.startsWith("/")) {
    return true;
  }
  // Check if it lacks a protocol (http://, https://, data:)
  return !/^(https?:|data:)/i.test(url);
};

const getDataUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/jpeg"));
      } catch (e) {
        console.warn("Failed to convert image to data URL", e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("Failed to load image for PDF export", url);
      resolve(null);
    };
    img.src = url;
  });
};
