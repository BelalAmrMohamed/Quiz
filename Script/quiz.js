// Script/quiz.js - Enhanced with Navigation Grid and Flag System
import { examList } from "./examManifest.js";
import { gameEngine } from "./gameEngine.js";

// --- State Management ---
let questions = [];
let metaData = {};
let currentIdx = 0;
let userAnswers = {};
let lockedQuestions = {};
let timeElapsed = 0;
let timerInterval = null;
let examId = null;
let quizMode = "exam";
let timeRemaining = 0;

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

// --- Helper: HTML Escaping ---
const escapeHtml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// --- Helper: Check if Essay Question ---
const isEssayQuestion = (q) => {
  return q.options && q.options.length === 1;
};

// --- Initialization ---
async function init() {
  const params = new URLSearchParams(window.location.search);
  examId = params.get("id");
  quizMode = params.get("mode") || "exam";
  const startAt = params.get("startAt");

  const config = examList.find((e) => e.id === examId);

  if (!config) {
    alert("Exam not found!");
    window.location.href = "index.html";
    return;
  }

  try {
    const module = await import(config.path);
    questions = module.questions;

    if (module.meta && (module.meta.title || module.meta.category)) {
      metaData = module.meta;
    } else {
      const parts = config.path.replace(/\\/g, "/").split("/");
      const filename = parts[parts.length - 1] || "";
      const name = filename.replace(/\.js$/i, "").replace(/[_-]+/g, " ");
      const title = name.replace(/\b\w/g, (c) => c.toUpperCase());
      metaData = { title, category: parts[parts.length - 2] || "" };
    }

    if (els.title) {
      let modeLabel = "";
      if (quizMode === "practice") modeLabel = " (Practice)";
      if (quizMode === "timed") modeLabel = " (Timed)";
      els.title.textContent = (metaData.title || "Quiz") + modeLabel;
    }

    if (quizMode === "timed") {
      timeRemaining = questions.length * 30;
    }

    if (startAt !== null) {
      currentIdx = parseInt(startAt);
    } else {
      const saved = localStorage.getItem(`quiz_state_${examId}`);
      if (saved && quizMode === "practice") {
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
    }

    renderNavigationGrid();
    renderQuestion();
    startTimer();

    // Global Handlers
    window.handleSelect = (i) => handleSelect(i);
    window.handleEssayInput = () => handleEssayInput();
    window.prevQuestion = () => nav(-1);
    window.nextQuestion = () => nav(1);
    window.finishEarly = () => finish();
    window.checkAnswer = () => checkAnswer();
    window.toggleBookmark = () => {
      gameEngine.toggleBookmark(examId, currentIdx);
      renderQuestion();
      renderNavigationGrid();
    };
    window.toggleFlag = () => {
      gameEngine.toggleFlag(examId, currentIdx);
      renderQuestion();
      renderNavigationGrid();
      updateFlagCount();
    };
    window.jumpToQuestion = (idx) => {
      currentIdx = idx;
      saveState();
      renderQuestion();
      renderNavigationGrid();

      // Scroll to question
      const questionCard = document.querySelector(".question-card");
      if (questionCard) {
        questionCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === "TEXTAREA") return;
        e.preventDefault();
        try {
          window.nextQuestion();
        } catch (err) {}
      }
    });
  } catch (err) {
    console.error("Initialization Error:", err);
    if (els.questionContainer) {
      els.questionContainer.innerHTML = `<p style="color:red">Failed to load quiz data.</p>`;
    }
  }
}

// --- NEW: Navigation Grid ---
function renderNavigationGrid() {
  let navGrid = document.getElementById("navGrid");

  if (!navGrid) {
    navGrid = document.createElement("div");
    navGrid.id = "navGrid";
    navGrid.className = "nav-grid";

    // Insert after header, before question container
    const header = document.querySelector(".header");
    if (header) {
      header.after(navGrid);
    }
  }

  const gridHTML = questions
    .map((q, idx) => {
      const isAnswered = userAnswers[idx] !== undefined;
      const isLocked = lockedQuestions[idx];
      const isBookmarked = gameEngine.isBookmarked(examId, idx);
      const isFlagged = gameEngine.isFlagged(examId, idx);
      const isCurrent = idx === currentIdx;

      let statusClass = "unanswered";
      let statusIcon = "";

      if (isCurrent) {
        statusClass = "current";
      } else if (isLocked) {
        const correctIdx = q.correct ?? q.answer;
        const isCorrect = userAnswers[idx] === correctIdx;
        statusClass = isCorrect ? "correct" : "wrong";
        statusIcon = isCorrect ? "✓" : "✗";
      } else if (isAnswered) {
        statusClass = "answered";
        statusIcon = "●";
      }

      const badges = [];
      if (isBookmarked)
        badges.push('<span class="mini-badge bookmark">★</span>');
      if (isFlagged) badges.push('<span class="mini-badge flag">🚩</span>');

      return `
      <button 
        class="nav-grid-item ${statusClass}" 
        onclick="window.jumpToQuestion(${idx})"
        title="Question ${idx + 1}${isBookmarked ? " - Bookmarked" : ""}${
        isFlagged ? " - Flagged" : ""
      }"
      >
        <span class="nav-number">${idx + 1}</span>
        ${statusIcon ? `<span class="nav-status">${statusIcon}</span>` : ""}
        ${
          badges.length > 0
            ? `<div class="nav-badges">${badges.join("")}</div>`
            : ""
        }
      </button>
    `;
    })
    .join("");

  const flagCount = gameEngine.getFlaggedCount(examId);
  const flagInfo =
    flagCount > 0
      ? `<span class="flag-count">🚩 ${flagCount} flagged for review</span>`
      : "";

  navGrid.innerHTML = `
    <div class="nav-grid-header">
      <h3>Question Navigator</h3>
      <div class="nav-grid-legend">
        <span><span class="legend-dot current"></span> Current</span>
        <span><span class="legend-dot answered"></span> Answered</span>
        <span><span class="legend-dot correct"></span> Correct</span>
        <span><span class="legend-dot wrong"></span> Wrong</span>
        ${flagInfo}
      </div>
    </div>
    <div class="nav-grid-items">
      ${gridHTML}
    </div>
  `;
}

// --- NEW: Update Flag Count ---
function updateFlagCount() {
  const flagCount = gameEngine.getFlaggedCount(examId);
  const flagCountEl = document.querySelector(".flag-count");
  if (flagCountEl) {
    if (flagCount > 0) {
      flagCountEl.textContent = `🚩 ${flagCount} flagged for review`;
      flagCountEl.style.display = "inline";
    } else {
      flagCountEl.style.display = "none";
    }
  }
}

// --- Core Logic ---
function renderQuestion() {
  if (!questions.length) return;
  const q = questions[currentIdx];
  const isEssay = isEssayQuestion(q);
  const correctIdx = q.correct ?? q.answer;

  // Update Progress
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  if (els.progressFill) els.progressFill.style.width = `${progressPercent}%`;
  if (els.progressText)
    els.progressText.textContent = `Progress: ${Math.round(
      progressPercent
    )}% (${answeredCount}/${questions.length})`;

  const isLocked = !!lockedQuestions[currentIdx];
  const userSelected = userAnswers[currentIdx];
  const isBookmarked = gameEngine.isBookmarked(examId, currentIdx);
  const isFlagged = gameEngine.isFlagged(examId, currentIdx);

  // Feedback Logic
  let feedbackClass = "feedback";
  let feedbackText = "";
  const explanationText =
    q.explanation || q.desc || q.info || "No explanation provided.";

  if (isLocked) {
    let isCorrect = false;

    if (isEssay) {
      const userAnswer = String(userSelected || "")
        .trim()
        .toLowerCase();
      const correctAnswer = String(q.options[0] || "")
        .trim()
        .toLowerCase();
      isCorrect = userAnswer === correctAnswer;

      feedbackClass += " essay-feedback show";
      const statusMsg = isCorrect
        ? "Your answer matches! ✅"
        : "Your answer differs ⚠️";
      feedbackText = `${statusMsg}<div style="margin-top:8px"><strong>Note:</strong> Essay grading may be inaccurate. Your answer might still be correct in a different way.</div><div style="margin-top:8px">${escapeHtml(
        explanationText
      )}</div>`;
    } else {
      isCorrect = userSelected === correctIdx;
      feedbackClass += isCorrect ? " correct show" : " wrong show";
      const statusMsg = isCorrect ? "Correct ✅" : `Wrong ❌`;
      feedbackText = `${statusMsg}<div style="margin-top:8px">${escapeHtml(
        explanationText
      )}</div>`;
    }
  }

  // Action buttons
  const actionButtons = `
    <div class="question-actions">
      <button class="bookmark-btn ${isBookmarked ? "active" : ""}" 
              onclick="window.toggleBookmark()" 
              title="${isBookmarked ? "Remove Bookmark" : "Bookmark"}">
        ${isBookmarked ? "★" : "☆"}
      </button>
      <button class="flag-btn ${isFlagged ? "active" : ""}" 
              onclick="window.toggleFlag()" 
              title="${isFlagged ? "Remove Flag" : "Flag for Review"}">
        🚩
      </button>
    </div>
  `;

  // Common Header HTML
  const questionHeaderHTML = `
    <div class="question-header">
      <div class="question-number">Question ${currentIdx + 1} of ${
    questions.length
  }</div>
      ${actionButtons}
    </div>
    <h2 class="question-text">${escapeHtml(q.q)}</h2>
  `;

  // Render content
  if (isEssay) {
    els.questionContainer.innerHTML = `
      <div class="question-card">
        ${questionHeaderHTML}

        <div class="essay-container">
          <label for="essayInput" class="essay-label">Your Answer:</label>
          <textarea 
            id="essayInput" 
            class="essay-textarea ${isLocked ? "locked" : ""}" 
            placeholder="Type your answer here..."
            ${isLocked ? "disabled" : ""}
            oninput="window.handleEssayInput()"
          >${escapeHtml(userSelected || "")}</textarea>
          <div class="essay-hint">💡 Tip: Your answer will be compared with the formal answer (case-insensitive)</div>
        </div>

        <button class="check-answer-btn ${isLocked ? "hidden" : ""}"
                id="checkBtn" onclick="window.checkAnswer()"
                ${
                  !userSelected || String(userSelected).trim() === ""
                    ? "disabled"
                    : ""
                }>
          Check Answer
        </button>

        <div class="${feedbackClass}">
          ${feedbackText}
        </div>

        ${
          isLocked
            ? `
          <div class="formal-answer">
            <strong>📝 Formal Answer:</strong>
            <div class="formal-answer-text">${escapeHtml(q.options[0])}</div>
          </div>
        `
            : ""
        }
      </div>
    `;
  } else {
    // MCQ Render
    els.questionContainer.innerHTML = `
      <div class="question-card">
        ${questionHeaderHTML}

        <div class="options-grid">
          ${q.options
            .map((opt, i) => {
              const isSelected = userSelected === i;
              let optionClass = "option-row";
              if (isSelected) optionClass += " selected";
              if (isLocked) {
                optionClass += " locked";
                if (i === correctIdx) optionClass += " correct";
                if (isSelected && i !== correctIdx) optionClass += " wrong";
              }

              return `
              <div class="${optionClass}" ${
                isLocked ? "" : `onclick="window.handleSelect(${i})"`
              }>
                <input type="radio" name="answer" ${
                  isSelected ? "checked" : ""
                } 
                       ${isLocked ? "disabled" : ""} aria-label="Option ${
                i + 1
              }">
                <span class="option-label">${escapeHtml(opt)}</span>
              </div>`;
            })
            .join("")}
        </div>

        <button class="check-answer-btn ${isLocked ? "hidden" : ""}"
                id="checkBtn" onclick="window.checkAnswer()"
                ${userSelected === undefined ? "disabled" : ""}>
          Check Answer
        </button>

        <div class="${feedbackClass}">
          ${feedbackText}
        </div>
      </div>
    `;
  }

  updateNav();
}

// --- Event Handlers ---
function handleSelect(index) {
  if (lockedQuestions[currentIdx]) return;
  userAnswers[currentIdx] = index;
  saveState();
  renderQuestion();
  renderNavigationGrid();
  maybeAutoSubmit();
}

function handleEssayInput() {
  if (lockedQuestions[currentIdx]) return;
  const textarea = document.getElementById("essayInput");
  if (textarea) {
    userAnswers[currentIdx] = textarea.value;
    saveState();
    const checkBtn = document.getElementById("checkBtn");
    if (checkBtn) {
      checkBtn.disabled = !textarea.value.trim();
    }
  }
}

const maybeAutoSubmit = () => {
  const answered = Object.keys(userAnswers).length;
  if (answered === questions.length && questions.length > 0) {
    setTimeout(() => {
      try {
        if (confirm("You have answered all questions. Submit now?")) {
          finish(true);
        }
      } catch (e) {}
    }, 300);
  }
};

function nav(dir) {
  const newIdx = currentIdx + dir;
  if (newIdx < 0 || newIdx >= questions.length) return;
  currentIdx = newIdx;
  saveState();
  renderQuestion();
  renderNavigationGrid();
}

function finish(skipConfirm) {
  if (!skipConfirm && !confirm("Are you sure you want to submit?")) return;
  stopTimer();

  let correctCount = 0;
  let essayQuestions = [];

  questions.forEach((q, i) => {
    if (isEssayQuestion(q)) {
      essayQuestions.push(i);
    } else {
      const correctIdx = q.correct ?? q.answer;
      if (userAnswers[i] === correctIdx) correctCount++;
    }
  });

  const scorableQuestions = questions.length - essayQuestions.length;

  const rawResult = {
    examId,
    score: correctCount,
    total: scorableQuestions,
    totalQuestions: questions.length,
    essayQuestions: essayQuestions,
    userAnswers,
    timeElapsed:
      quizMode === "timed"
        ? questions.length * 30 - timeRemaining
        : timeElapsed,
    mode: quizMode,
  };

  const gamifiedResult = gameEngine.processResult(rawResult);

  const finalOutput = {
    ...rawResult,
    gamification: gamifiedResult,
  };

  localStorage.setItem("last_quiz_result", JSON.stringify(finalOutput));
  localStorage.removeItem(`quiz_state_${examId}`);
  gameEngine.clearFlags(examId);
  window.location.href = "summary.html";
}

function checkAnswer() {
  const q = questions[currentIdx];
  const isEssay = isEssayQuestion(q);

  if (isEssay) {
    const textarea = document.getElementById("essayInput");
    if (!textarea || !textarea.value.trim()) return;
  } else {
    if (userAnswers[currentIdx] === undefined) return;
  }

  lockedQuestions[currentIdx] = true;
  saveState();
  renderQuestion();
  renderNavigationGrid();
  updateNav();
}

// --- Utilities ---
function updateNav() {
  if (els.prevBtn) els.prevBtn.disabled = currentIdx === 0;
  if (els.nextBtn) els.nextBtn.style.display = "inline-block";
  if (els.finishBtn) {
    els.finishBtn.style.display = "inline-block";
    const totalLocked = Object.keys(lockedQuestions).length;
    els.finishBtn.textContent =
      totalLocked === questions.length && questions.length > 0
        ? "Finish Exam"
        : "Finish Here";
  }
}

function saveState() {
  if (quizMode === "timed") return;
  const state = { currentIdx, userAnswers, timeElapsed, lockedQuestions };
  localStorage.setItem(`quiz_state_${examId}`, JSON.stringify(state));
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (quizMode === "timed") {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        alert("Time's up! Submitting quiz...");
        finish(true);
        return;
      }

      const mins = Math.floor(timeRemaining / 60)
        .toString()
        .padStart(2, "0");
      const secs = (timeRemaining % 60).toString().padStart(2, "0");
      if (els.timer) {
        els.timer.textContent = `⏳ ${mins}:${secs}`;
        if (timeRemaining < 30) els.timer.style.color = "var(--color-error)";
      }
    } else {
      timeElapsed++;
      const mins = Math.floor(timeElapsed / 60)
        .toString()
        .padStart(2, "0");
      const secs = (timeElapsed % 60).toString().padStart(2, "0");
      if (els.timer) els.timer.textContent = `⏱ ${mins}:${secs}`;
      saveState();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

init();
