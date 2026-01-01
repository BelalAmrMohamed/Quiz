// Website/Script/quiz.js
import { examList } from "./examManifest.js";

// --- State Management ---
let questions = [];
let metaData = {};
let currentIdx = 0;
let userAnswers = {};
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

  // Generate Question HTML (escape any user-provided HTML tags)
  els.questionContainer.innerHTML = `
        <div class="question-card">
            <h2 class="question-text">${escapeHtml(q.q)}</h2>
            <div class="options-grid">
                ${q.options
                  .map(
                    (opt, i) => `
                    <div class="option-row ${
                      userAnswers[currentIdx] === i ? "selected" : ""
                    }" 
                         onclick="window.handleSelect(${i})">
                        <input type="radio" name="answer" ${
                          userAnswers[currentIdx] === i ? "checked" : ""
                        } aria-label="Option ${i + 1}">
                        <label>${escapeHtml(opt)}</label>
                    </div>
                `
                  )
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

  updateNav();
}

// --- Event Handlers (Attached to window for HTML access) ---
// Exposed handlers for inline HTML (keeps module CSP-safe)
window.handleSelect = (index) => {
  userAnswers[currentIdx] = index;
  saveState();
  renderQuestion();
  // auto-submit when all questions answered
  const answered = Object.keys(userAnswers).length;
  if (answered === questions.length) {
    // give a short delay to show selection
    setTimeout(() => {
      try {
        window.finishEarly();
      } catch (e) {
        console.error("Auto-finish failed:", e);
      }
    }, 700);
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

window.finishEarly = () => {
  if (!confirm("Are you sure you want to submit your answers?")) return;
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
};

// --- Utilities ---
function updateNav() {
  if (els.prevBtn) els.prevBtn.disabled = currentIdx === 0;

  if (currentIdx === questions.length - 1) {
    if (els.nextBtn) els.nextBtn.style.display = "none";
    if (els.finishBtn) els.finishBtn.style.display = "inline-block";
  } else {
    if (els.nextBtn) els.nextBtn.style.display = "inline-block";
    if (els.finishBtn) els.finishBtn.style.display = "none";
  }
}

function saveState() {
  const state = { currentIdx, userAnswers, timeElapsed };
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
