// Script/exportToMarkdown.js
// Downloads the quiz as markdown (.md)
// Deals with the export from both main page and results/summary page
// No libraries used

const isEssayQuestion = (q) => q.options && q.options.length === 1;
const isLocalPath = (url) => {
  if (!url) return false;
  // Check for relative paths (./, ../, or no protocol)
  if (url.startsWith("./") || url.startsWith("../") || url.startsWith("/")) {
    return true;
  }
  // Check if it lacks a protocol (http://, https://, data:)
  return !/^(https?:|data:)/i.test(url);
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

  let markdown = `# ${config.title || "Quiz"}\n**Number of questions:** ${
    questions.length
  }\n**Questions' type:** ${questionType}\n\n---\n\n`;

  questions.forEach((q, index) => {
    const userAns = userAnswers[index];
    let imageLink = "";

    if (q.image) {
      imageLink = !isLocalPath(q.image)
        ? `![Question Image](${q.image})\n\n`
        : `[![Image Can't be Displayed](https://i.postimg.cc/NMdJJNzY/no-image.jpg)](https://postimg.cc/dkTjD9FS)\n\n`;
    }

    markdown += `## Question ${index + 1}: ${q.q}\n${imageLink}\n\n`;

    if (isEssayQuestion(q)) {
      // Only show user answer section if userAnswers was actually passed
      if (isResultsMode) {
        const userText = userAns || "Not answered";
        markdown += `**Your Answer:**\n\n${userText}\n\n`;
      }
      markdown += `**Formal Answer:**\n\n${q.options[0]}\n\n`;
    } else {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(48 + i + 1);
        markdown += `${letter}. ${opt}\n`;
      });
      markdown += `\n`;

      const isSkipped = userAns === undefined || userAns === null;

      // Only append "Your Answer" if we are in summary mode
      if (isResultsMode) {
        const userLetter = isSkipped
          ? "Skipped"
          : String.fromCharCode(48 + userAns + 1);
        const userAnswerText = isSkipped ? "Skipped" : q.options[userAns];

        markdown += `**Your Answer:** ${userLetter}${
          isSkipped ? "" : `. ${userAnswerText}`
        }\n\n`;
      }

      const correctLetter = String.fromCharCode(48 + q.correct + 1);
      markdown += `**Correct Answer:** ${correctLetter}. ${
        q.options[q.correct]
      }\n\n`;
    }

    if (q.explanation) markdown += `> **Explanation:**\n${q.explanation}\n\n`;
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
