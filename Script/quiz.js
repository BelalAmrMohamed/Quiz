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

  // Update Progress Bar (Solved / Total)
  const solvedCount = Object.keys(userAnswers).length;
  const progressPercent = (solvedCount / questions.length) * 100;
  if (els.progressFill) els.progressFill.style.width = `${progressPercent}%`;
  if (els.progressText)
    els.progressText.textContent = `Progress: ${Math.round(
      progressPercent
    )}% (${solvedCount}/${questions.length})`;

  // Helper to escape any HTML in question/options/explanation
  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  els.questionContainer.innerHTML = `
        <div class="question-card">
            <h2 class="question-text">${escapeHtml(q.q)}</h2>
            <div class="options-grid">
                ${q.options
                  .map((opt, i) => {
                    const isSelected = userAnswers[currentIdx] === i;
                    const isLocked = !!lockedQuestions[currentIdx];

                    return `
                     <div class="option-row ${isSelected ? "selected" : ""} ${
                      isLocked ? "locked" : ""
                    }" ${
                      isLocked ? "" : `onclick=\"window.handleSelect(${i})\"`
                    }>
                        <input type="radio" name="answer" ${
                          isSelected ? "checked" : ""
                        } ${isLocked ? "disabled" : ""} aria-label="Option ${
                      i + 1
                    }">
                        <label>${escapeHtml(opt)}</label>
                    </div>
                `;
                  })
                  .join("")}
            </div>
            <div style="margin-top:10px; color:#666; font-size:0.9em">Question ${
              currentIdx + 1
            } of ${questions.length}</div>
            <div style="margin-top:12px; display:flex; gap:8px; align-items:center">
              <button id="checkBtn" class="nav-btn">Check Answer</button>
              <div id="feedback" class="feedback" style="margin-left:8px"></div>
            </div>
        </div>
    `;

  // attach check handler
  const checkBtn = document.getElementById("checkBtn");
  if (checkBtn) checkBtn.onclick = () => window.checkAnswer();

  // attach per-option handlers and ensure proper tabindex/aria state
  const optionRows = Array.from(
    els.questionContainer.querySelectorAll(".option-row")
  );
  optionRows.forEach((row) => {
    const input = row.querySelector('input[role="radio"]');
    const idx = Number(row.getAttribute("data-index"));
    if (!input) return;

    // Click on row focuses the input and selects it
    row.onclick = (e) => {
      if (lockedQuestions[currentIdx]) return;
      input.focus();
      window.handleSelect(idx);
    };

    // Ensure input reflects locked state
    if (lockedQuestions[currentIdx]) {
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
        els.questionContainer.querySelectorAll('input[role="radio"]')
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
// (keeps logic intact but auto-prompts the user before submitting)
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
    if (userAnswers[i] === q.correct) correctCount++;
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
  if (!questions.length) return;
  const q = questions[currentIdx];
  const sel = userAnswers[currentIdx];
  const feedbackEl = document.getElementById("feedback");
  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  if (sel === undefined) {
    if (feedbackEl) {
      feedbackEl.className = "feedback show wrong";
      feedbackEl.textContent = "Please select an option first.";
    } else alert("Please select an option first.");
    return;
  }

  const isCorrect = sel === q.correct;

  // highlight correct/wrong options visually
  const optionRows = Array.from(document.querySelectorAll(".option-row"));
  optionRows.forEach((el, i) => {
    el.classList.remove("correct", "wrong");
    if (i === q.correct) el.classList.add("correct");
    else if (i === sel && !isCorrect) el.classList.add("wrong");
  });

  // show feedback with escaped text
  if (feedbackEl) {
    feedbackEl.className = `feedback show ${isCorrect ? "correct" : "wrong"}`;
    const correctText = escapeHtml(q.options[q.correct]);
    const explanation = q.explanation
      ? `<div style="margin-top:8px">${escapeHtml(q.explanation)}</div>`
      : "";
    feedbackEl.innerHTML = `${
      isCorrect ? "Correct ✅" : `Wrong ❌ — Correct: ${correctText}`
    }${explanation}`;
  }

  // Lock this question so the user cannot change their answer after seeing feedback
  lockedQuestions[currentIdx] = true;
  // disable option inputs and clicks for current question in the DOM
  optionRows.forEach((el) => {
    const input = el.querySelector("input");
    if (input) input.disabled = true;
    el.classList.add("locked");
    el.onclick = null;
  });
  saveState();

  // If all questions are locked, update finish button text to indicate completion
  const totalLocked = Object.keys(lockedQuestions).length;
  if (els.finishBtn) {
    if (totalLocked === questions.length) {
      els.finishBtn.textContent = "Finish Exam";
    } else {
      els.finishBtn.textContent = "Finish Here";
    }
  }
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
  // Pass function reference, NOT a string (CSP friendly)
  timerInterval = setInterval(updateTimerUI, 1000);
}

function updateTimerUI() {
  timeElapsed++;
  const m = Math.floor(timeElapsed / 60)
    .toString()
    .padStart(2, "0");
  const s = (timeElapsed % 60).toString().padStart(2, "0");
  if (els.timer) els.timer.textContent = `⏱ ${m}:${s}`;
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Start the app
init();
