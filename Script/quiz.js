// Script/quiz.js
import { examList } from "./examManifest.js";

// --- State Management ---
let questions = [];
let metaData = {};
let currentIdx = 0;
let userAnswers = {};
let lockedQuestions = {};
let timeElapsed = 0;
let timerInterval = null;
let examId = null;

// --- DOM Elements ---
const els = {
  title: document.getElementById("quizTitle"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  questionContainer: document.getElementById("questionContainer"),
  timer: document.getElementById("timer"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  finishBtn: document.getElementById("finishBtn"),
};

// --- Initialization ---
async function init() {
  const params = new URLSearchParams(window.location.search);
  examId = params.get("id");
  const config = examList.find((e) => e.id === examId);

  if (!config) {
    alert("Exam not found!");
    window.location.href = "index.html";
    return;
  }

  try {
    // Dynamic Import (CSP Compliant)
    const module = await import(config.path);
    questions = module.questions;
    // derive title/category from module.meta when provided, otherwise from file path
    if (module.meta && (module.meta.title || module.meta.category)) {
      metaData = module.meta;
    } else {
      // compute from config.path: parent folder name and file name
      const parts = config.path.replace(/\\/g, "/").split("/");
      const filename = parts[parts.length - 1] || ""; // html_basics.js
      const folder = parts[parts.length - 2] || ""; // HTML
      const name = filename.replace(/\.js$/i, "").replace(/[_-]+/g, " ");
      // Title-case each word
      const title = name.replace(/\b\w/g, (c) => c.toUpperCase());
      metaData = { title, category: folder };
    }

    if (els.title) els.title.textContent = metaData.title || "Quiz";

    // Restore Session if exists
    const saved = localStorage.getItem(`quiz_state_${examId}`);
    if (saved) {
      const state = JSON.parse(saved);
      if (confirm("Resume your previous session?")) {
        currentIdx = state.currentIdx || 0;
        userAnswers = state.userAnswers || {};
        lockedQuestions = state.lockedQuestions || {};
        timeElapsed = state.timeElapsed || 0;
      } else {
        localStorage.removeItem(`quiz_state_${examId}`);
      }
    }

    renderQuestion();
    startTimer();
    // make sure nav controls are exposed for inline html handlers
    window.handleSelect = window.handleSelect || ((i) => {});
    window.prevQuestion = window.prevQuestion || (() => window.nav(-1));
    window.nextQuestion = window.nextQuestion || (() => window.nav(1));
    window.finishEarly = window.finishEarly || (() => window.finish());
    window.checkAnswer = window.checkAnswer || (() => {});

    // Keyboard navigation: Enter -> Next
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        try {
          window.nextQuestion();
        } catch (err) {
          console.error("Enter -> Next failed:", err);
        }
      }
    });
  } catch (err) {
    console.error("Initialization Error:", err);
    if (els.questionContainer) {
      els.questionContainer.innerHTML = `<p style="color:red">Failed to load quiz data. Please ensure you are using a local server (Live Server).</p>`;
    }
  }
}

// --- Core Logic ---
function renderQuestion() {
  if (!questions.length) return;
  const q = questions[currentIdx];

  // Update Progress Bar (Solved / Total) - Use lockedQuestions for consistency with second version
  const solvedCount = Object.keys(lockedQuestions).length;
  const progressPercent = (solvedCount / questions.length) * 100;
  if (els.progressFill) els.progressFill.style.width = `${progressPercent}%`;
  if (els.progressText)
    els.progressText.textContent = `Progress: ${Math.round(
      progressPercent
    )}% (${solvedCount}/${questions.length})`;

  const escapeHtml = (str) =>
    String(str).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );

  const isLocked = !!lockedQuestions[currentIdx];
  const userSelected = userAnswers[currentIdx];

  // Feedback Logic (enhanced with first version's details)
  let feedbackClass = "feedback";
  let feedbackText = "";
  // Support multiple explanation fields for flexibility
  const explanationText =
    q.explanation || q.desc || q.info || "No explanation provided.";

  if (isLocked) {
    const isCorrect = userSelected === (q.correct || q.answer); // Support both field names
    feedbackClass += isCorrect ? " correct show" : " wrong show";
    const statusMsg = isCorrect
      ? "Correct ✅"
      : `Wrong ❌ — Correct: ${escapeHtml(q.options[q.correct || q.answer])}`;
    feedbackText = `${statusMsg}<div style="margin-top:8px">${escapeHtml(
      explanationText
    )}</div>`;
  }

  els.questionContainer.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <div class="question-number">Question ${currentIdx + 1} of ${
    questions.length
  }</div>
                <h2 class="question-text">${escapeHtml(q.q)}</h2>
            </div>

            <div class="options-grid">
                ${q.options
                  .map((opt, i) => {
                    const isSelected = userSelected === i;
                    let optionClass = "option-row";
                    if (isSelected) optionClass += " selected";
                    if (isLocked) {
                      optionClass += " locked";
                      if (i === (q.correct || q.answer))
                        optionClass += " correct";
                      if (isSelected && i !== (q.correct || q.answer))
                        optionClass += " wrong";
                    }

                    return `
                    <div class="${optionClass}" ${
                      isLocked ? "" : `onclick="window.handleSelect(${i})"`
                    }>
                        <input type="radio" name="answer" ${
                          isSelected ? "checked" : ""
                        } ${isLocked ? "disabled" : ""} aria-label="Option ${
                      i + 1
                    }">
                        <span class="option-label">${escapeHtml(opt)}</span>
                    </div>`;
                  })
                  .join("")}
            </div>

            <button class="check-answer-btn ${isLocked ? "hidden" : ""}"
                    id="checkBtn"
                    onclick="window.checkAnswer()"
                    ${userSelected === undefined ? "disabled" : ""}>
                Check Answer
            </button>

            <div class="${feedbackClass}">
                ${feedbackText}
            </div>
        </div>
    `;

  // Re-attach any necessary post-render handlers for accessibility (from first version)
  const optionRows = Array.from(
    els.questionContainer.querySelectorAll(".option-row")
  );
  optionRows.forEach((row, idx) => {
    const input = row.querySelector('input[type="radio"]');
    if (!input) return;

    // Ensure input reflects locked state
    if (isLocked) {
      input.disabled = true;
      input.setAttribute("aria-disabled", "true");
      input.setAttribute("tabindex", -1);
    } else {
      input.disabled = false;
      input.removeAttribute("aria-disabled");
    }

    // When the native input receives focus, ensure it has tabindex 0 and others -1
    input.addEventListener("focus", () => {
      const radios = Array.from(
        els.questionContainer.querySelectorAll('input[type="radio"]')
      );
      radios.forEach((r) =>
        r.setAttribute("tabindex", r === input ? "0" : "-1")
      );
    });
  });

  updateNav();
}

// --- Event Handlers (Attached to window for HTML access) ---
// Exposed handlers for inline HTML (keeps module CSP-safe)
window.handleSelect = (index) => {
  if (lockedQuestions[currentIdx]) return; // don't allow changing locked answers
  userAnswers[currentIdx] = index;
  saveState();
  renderQuestion();
  maybeAutoSubmit();
};

// After selecting an answer, if all questions are answered prompt to submit
const maybeAutoSubmit = () => {
  const answered = Object.keys(userAnswers).length;
  if (answered === questions.length && questions.length > 0) {
    setTimeout(() => {
      try {
        if (
          confirm(
            "You have answered all questions. Do you want to submit your answers now?"
          )
        ) {
          // skipConfirm true prevents double confirmation
          window.finishEarly(true);
        }
      } catch (e) {
        console.error("Auto-submit prompt failed:", e);
      }
    }, 300);
  }
};

window.nav = (dir) => {
  const newIdx = currentIdx + dir;
  if (newIdx < 0 || newIdx >= questions.length) return;
  currentIdx = newIdx;
  saveState();
  renderQuestion();
};

window.prevQuestion = () => window.nav(-1);
window.nextQuestion = () => window.nav(1);

window.finish = () => window.finishEarly();

window.finishEarly = (skipConfirm) => {
  // Confirm before finishing unless caller set skipConfirm=true
  if (!skipConfirm) {
    if (!confirm("Are you sure you want to submit your answers?")) return;
  }

  stopTimer();

  let correctCount = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === (q.correct || q.answer)) correctCount++;
  });

  const finalResult = {
    examId,
    score: correctCount,
    total: questions.length,
    userAnswers,
    timeElapsed,
  };

  localStorage.setItem("last_quiz_result", JSON.stringify(finalResult));
  localStorage.removeItem(`quiz_state_${examId}`); // Clear session
  window.location.href = "summary.html";
};

// Check the current question and show feedback (per-question submit)
window.checkAnswer = () => {
  if (userAnswers[currentIdx] === undefined) return;
  lockedQuestions[currentIdx] = true;
  saveState();
  renderQuestion();
  updateNav();
};

// --- Utilities ---
function updateNav() {
  if (els.prevBtn) els.prevBtn.disabled = currentIdx === 0;

  // Keep Next visible for consistent keyboard behavior;
  if (els.nextBtn) els.nextBtn.style.display = "inline-block";

  // Finish button remains visible throughout; change label when all locked
  if (els.finishBtn) {
    els.finishBtn.style.display = "inline-block";
    const totalLocked = Object.keys(lockedQuestions).length;
    if (totalLocked === questions.length && questions.length > 0) {
      els.finishBtn.textContent = "Finish Exam";
    } else {
      els.finishBtn.textContent = "Finish Here";
    }
  }
}

function saveState() {
  const state = { currentIdx, userAnswers, timeElapsed, lockedQuestions };
  localStorage.setItem(`quiz_state_${examId}`, JSON.stringify(state));
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    const mins = Math.floor(timeElapsed / 60)
      .toString()
      .padStart(2, "0");
    const secs = (timeElapsed % 60).toString().padStart(2, "0");
    if (els.timer) els.timer.textContent = `⏱ ${mins}:${secs}`;
    saveState(); // Save periodically like second version
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Start the app
init();
