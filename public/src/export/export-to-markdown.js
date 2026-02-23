// src/scripts/exportToMarkdown.js
// Downloads the quiz as markdown (.md)
// Deals with the export from both main page and results/summary page
// No libraries used
import { showNotification } from "../components/notifications.js";

const isEssayQuestion = (q) => q.options && q.options.length === 1;

function gradeEssay(userInput, modelAnswer) {
  const normalize = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[.,;:!?()[\]{}"'\/\\]/g, " ")
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

const isLocalPath = (url) => {
  if (!url) return false;
  // Check for relative paths (./, ../, or no protocol)
  if (url.startsWith("./") || url.startsWith("../") || url.startsWith("/")) {
    return true;
  }
  // Check if it lacks a protocol (http://, https://, data:)
  return !/^(https?:|data:)/i.test(url);
};

// Converts \n to markdown line breaks (two trailing spaces + newline).
// Backtick code blocks and inline code pass through as-is since .md renders them natively.
const mdLineBreaks = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/\n/g, "  \n");
};

export function exportToMarkdown(config, questions, userAnswers = []) {
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

  // Determine if we are in "Summary Mode" (user answers provided)
  const isResultsMode =
    userAnswers &&
    (Array.isArray(userAnswers)
      ? userAnswers.length > 0
      : Object.keys(userAnswers).length > 0);

  let markdown = `# ${config.title || "Quiz"}\n- **Number of questions:** ${
    questions.length
  }\n- **Questions' type:** ${questionType}\n\n`;

  // ── Score summary (only in results mode) ──────────────────────────────────
  if (isResultsMode) {
    let mcqTotal = 0,
      mcqCorrect = 0,
      mcqWrong = 0,
      mcqSkipped = 0;
    let essayTotalScore = 0,
      essayMaxScore = 0;
    questions.forEach((q, i) => {
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
    const status = passed ? "✅ Passed" : "❌ Not Passed";

    markdown += `## 📊 Your Results\n\n`;
    markdown += `| Metric | Value |\n|--------|-------|\n`;
    markdown += `| **Overall Score** | ${totalScore} / ${totalPoss} pts (${percent}%) |\n`;
    markdown += `| **Status** | ${status} |\n`;
    markdown += `| **Number of questions** | ${mcqTotal + essayCount} |\n`;
    if (mcqTotal > 0) {
      markdown += `| ✓ MCQ Correct | ${mcqCorrect} / ${mcqTotal} |\n`;
      markdown += `| ✗ MCQ Wrong | ${mcqWrong} |\n`;
      markdown += `| ⚪ Skipped | ${mcqSkipped} |\n`;
    }
    if (essayCount > 0) {
      const totalStars = Math.round((essayTotalScore / essayMaxScore) * 5);
      const summaryStars = "★".repeat(totalStars) + "☆".repeat(5 - totalStars);
      markdown += `| ✏️ Essay Score | ${essayTotalScore} / ${essayMaxScore} pts  ${summaryStars} |\n`;
    }
    markdown += `\n---\n\n`;
  } else {
    markdown += `---\n\n`;
  }

  questions.forEach((q, index) => {
    const userAns = userAnswers[index];
    let imageLink = "";

    if (q.image) {
      imageLink = !isLocalPath(q.image)
        ? `![Question Image](${q.image})\n\n`
        : `> 📷 *Image not available in exported file (local path)*  \n\n`;
    }

    markdown += `## Question ${index + 1}: ${mdLineBreaks(q.q)}\n${imageLink}\n\n`;

    if (isEssayQuestion(q)) {
      if (isResultsMode) {
        const userText = userAns || "";
        const score = gradeEssay(userText, q.options[0]);
        const stars = "★".repeat(score) + "☆".repeat(5 - score);
        const scoreLabel = score >= 3 ? "✅" : score >= 1 ? "⚠️" : "❌";
        markdown += `**Your Answer:**\n\n${mdLineBreaks(userText || "Not answered")}\n\n`;
        markdown += `**Score:** ${scoreLabel} ${score}/5  ${stars}\n\n`;
      }
      markdown += `**Formal Answer:**\n\n${mdLineBreaks(q.options[0])}\n\n`;
    } else {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(48 + i + 1);
        markdown += `${letter}. ${mdLineBreaks(opt)}\n`;
      });
      markdown += `\n`;

      const isSkipped = userAns === undefined || userAns === null;

      // Only append "Your Answer" if we are in summary mode
      if (isResultsMode) {
        const userLetter = isSkipped
          ? "Skipped"
          : String.fromCharCode(48 + userAns + 1);
        const userAnswerText = isSkipped
          ? "Skipped"
          : mdLineBreaks(q.options[userAns]);

        markdown += `**Your Answer:** ${userLetter}${
          isSkipped ? "" : `. ${userAnswerText}`
        }\n\n`;
      }

      const correctLetter = String.fromCharCode(48 + q.correct + 1);
      markdown += `**Correct Answer:** ${correctLetter}. ${mdLineBreaks(
        q.options[q.correct],
      )}\n\n`;
    }

    if (q.explanation)
      markdown += `> **Explanation:**\n${mdLineBreaks(q.explanation)}\n\n`;
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
  showNotification(
    "Markdown file downloaded.",
    "You have it now",
    "./assets/images/mardownIcon.png",
  );
}
