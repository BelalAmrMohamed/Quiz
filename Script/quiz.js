// Script/quiz.js - Enhanced with All Features
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
let viewMode = "grid";
let autoSubmitTimeout = null;

// --- DOM Elements ---
const els = {
  title: document.getElementById("quizTitle"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  questionContainer: document.getElementById("questionContainer"),
  timer: document.getElementById("timer"),
  timerBadge: document.getElementById("timerBadge"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  finishBtn: document.getElementById("finishBtn"),
  statsBar: document.getElementById("statsBar"),
  statLevel: document.getElementById("statLevel"),
  statPoints: document.getElementById("statPoints"),
  statStreak: document.getElementById("statStreak"),
  viewToggle: document.getElementById("viewToggle"),
  viewIcon: document.getElementById("viewIcon"),
  viewText: document.getElementById("viewText"),
};

// === CRITICAL: Define global handlers IMMEDIATELY ===
window.finishEarly = () => {
  console.log("Finish button clicked"); // Debug log
  finish();
};

window.prevQuestion = () => nav(-1);
window.nextQuestion = () => nav(1);

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

// --- Initialize Gamification Stats ---
function updateGamificationStats() {
  const userData = gameEngine.getUserData();
  const levelInfo = gameEngine.calculateLevel(userData.totalPoints);

  if (els.statLevel) {
    els.statLevel.textContent = `Lv ${levelInfo.level}`;
  }
  if (els.statPoints) {
    els.statPoints.textContent = `${userData.totalPoints} pts`;
  }
  if (els.statStreak) {
    const streak = userData.streaks?.currentDaily || 0;
    els.statStreak.textContent = `${streak} day${streak !== 1 ? "s" : ""}`;
  }
}

// --- View Toggle ---
function toggleView() {
  viewMode = viewMode === "grid" ? "list" : "grid";
  localStorage.setItem("quiz_view_mode", viewMode);

  if (els.viewIcon && els.viewText) {
    if (viewMode === "grid") {
      els.viewIcon.textContent = "📋";
      els.viewText.textContent = "Switch to List View";
    } else {
      els.viewIcon.textContent = "▦";
      els.viewText.textContent = "Switch to Grid View";
    }
  }

  renderMenuNavigation();
  updateMenuActionButtons();
}

// --- Initialization ---
async function init() {
  const params = new URLSearchParams(window.location.search);
  examId = params.get("id");
  quizMode = params.get("mode") || "exam";
  const startAt = params.get("startAt");

  // Load saved view mode
  const savedView = localStorage.getItem("quiz_view_mode");
  if (savedView) {
    viewMode = savedView;
  }

  // Update view toggle button
  if (els.viewIcon && els.viewText) {
    if (viewMode === "grid") {
      els.viewIcon.textContent = "📋";
      els.viewText.textContent = "Switch to List View";
    } else {
      els.viewIcon.textContent = "▦";
      els.viewText.textContent = "Switch to Grid View";
    }
  }

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

    // Hide timer in practice mode
    if (quizMode === "practice" && els.timerBadge) {
      els.timerBadge.classList.add("hidden");
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

    // Initialize gamification
    updateGamificationStats();

    renderMenuNavigation();
    updateMenuActionButtons();
    renderQuestion();
    startTimer();

    // Additional Global Handlers
    window.handleSelect = (i) => handleSelect(i);
    window.handleEssayInput = () => handleEssayInput();
    window.checkAnswer = () => checkAnswer();
    window.toggleView = () => toggleView();

    window.toggleBookmark = () => {
      gameEngine.toggleBookmark(examId, currentIdx);
      renderQuestion();
      renderMenuNavigation();
      updateMenuActionButtons();
    };

    window.toggleFlag = () => {
      gameEngine.toggleFlag(examId, currentIdx);
      renderQuestion();
      renderMenuNavigation();
      updateMenuActionButtons();
    };

    window.toggleQuestionBookmark = (idx) => {
      gameEngine.toggleBookmark(examId, idx);
      renderMenuNavigation();
      if (idx === currentIdx) {
        renderQuestion();
        updateMenuActionButtons();
      }
    };

    window.toggleQuestionFlag = (idx) => {
      gameEngine.toggleFlag(examId, idx);
      renderMenuNavigation();
      if (idx === currentIdx) {
        renderQuestion();
        updateMenuActionButtons();
      }
    };

    window.jumpToQuestion = (idx) => {
      currentIdx = idx;
      saveState();
      renderQuestion();
      renderMenuNavigation();
      updateMenuActionButtons();

      // Scroll to question
      const questionCard = document.querySelector(".question-card");
      if (questionCard) {
        questionCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    // View toggle
    if (els.viewToggle) {
      els.viewToggle.addEventListener("click", toggleView);
    }

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

// --- Menu Navigation (Grid or List) ---
function renderMenuNavigation() {
  let navContainer = document.getElementById("menuNavContainer");
  if (!navContainer) return;

  const flagCount = gameEngine.getFlaggedCount(examId);
  const flagInfo =
    flagCount > 0
      ? `<div class="menu-flag-count">🚩 ${flagCount} flagged for review</div>`
      : "";

  if (viewMode === "grid") {
    renderGridView(navContainer, flagInfo);
  } else {
    renderListView(navContainer, flagInfo);
  }
}

function renderGridView(navContainer, flagInfo) {
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
        class="menu-nav-item grid-item ${statusClass}" 
        onclick="window.jumpToQuestion(${idx})"
        title="Question ${idx + 1}${isBookmarked ? " - Bookmarked" : ""}${
        isFlagged ? " - Flagged" : ""
      }"
      >
        <span>${idx + 1}</span>
        ${
          statusIcon
            ? `<span class="menu-nav-status grid-status">${statusIcon}</span>`
            : ""
        }
        ${
          badges.length > 0
            ? `<div class="menu-nav-badges">${badges.join("")}</div>`
            : ""
        }
      </button>
    `;
    })
    .join("");

  navContainer.innerHTML = `
    <div class="menu-nav-grid">
      <div class="menu-nav-header">Question Navigator</div>
      <div class="menu-nav-legend">
        <span><span class="legend-dot current"></span> Current</span>
        <span><span class="legend-dot answered"></span> Answered</span>
        <span><span class="legend-dot correct"></span> Correct</span>
        <span><span class="legend-dot wrong"></span> Wrong</span>
      </div>
      ${flagInfo}
      <div class="menu-nav-items grid-view">
        ${gridHTML}
      </div>
    </div>
  `;
}

function renderListView(navContainer, flagInfo) {
  const listHTML = questions
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

      const bookmarkClass = isBookmarked ? "active" : "";
      const flagClass = isFlagged ? "active" : "";
      const bookmarkIcon = isBookmarked ? "★" : "☆";

      return `
      <div class="menu-nav-item list-item ${statusClass}">
        <div class="menu-nav-item-left" onclick="window.jumpToQuestion(${idx})">
          <span class="menu-nav-number">Q${idx + 1}</span>
          ${
            statusIcon
              ? `<span class="menu-nav-status list-status">${statusIcon}</span>`
              : ""
          }
        </div>
        <div class="menu-nav-item-right">
          <span class="menu-nav-icon bookmark-icon ${bookmarkClass}" 
                onclick="event.stopPropagation(); window.toggleQuestionBookmark(${idx})"
                title="${isBookmarked ? "Remove Bookmark" : "Bookmark"}">
            ${bookmarkIcon}
          </span>
          <span class="menu-nav-icon flag-icon ${flagClass}" 
                onclick="event.stopPropagation(); window.toggleQuestionFlag(${idx})"
                title="${isFlagged ? "Remove Flag" : "Flag for Review"}">
            🚩
          </span>
        </div>
      </div>
    `;
    })
    .join("");

  navContainer.innerHTML = `
    <div class="menu-nav-list">
      <div class="menu-nav-header">Question Navigator</div>
      <div class="menu-nav-legend">
        <span><span class="legend-dot current"></span> Current</span>
        <span><span class="legend-dot answered"></span> Answered</span>
        <span><span class="legend-dot correct"></span> Correct</span>
        <span><span class="legend-dot wrong"></span> Wrong</span>
      </div>
      ${flagInfo}
      <div class="menu-nav-items list-view">
        ${listHTML}
      </div>
    </div>
  `;
}

// --- Update Menu Action Buttons ---
function updateMenuActionButtons() {
  const bookmarkBtn = document.getElementById("menuBookmarkBtn");
  const flagBtn = document.getElementById("menuFlagBtn");
  const bookmarkIcon = document.getElementById("menuBookmarkIcon");
  const bookmarkText = document.getElementById("menuBookmarkText");
  const flagText = document.getElementById("menuFlagText");

  const isListView = viewMode === "list";

  if (bookmarkBtn) {
    if (isListView) {
      bookmarkBtn.classList.add("list-view-disabled");
      bookmarkBtn.disabled = true;
    } else {
      bookmarkBtn.classList.remove("list-view-disabled");
      bookmarkBtn.disabled = false;

      const isBookmarked = gameEngine.isBookmarked(examId, currentIdx);
      if (bookmarkIcon) bookmarkIcon.textContent = isBookmarked ? "★" : "☆";
      if (bookmarkText)
        bookmarkText.textContent = isBookmarked
          ? "Remove Bookmark"
          : "Bookmark Question";

      if (isBookmarked) {
        bookmarkBtn.classList.add("bookmarked");
      } else {
        bookmarkBtn.classList.remove("bookmarked");
      }
    }
  }

  if (flagBtn) {
    if (isListView) {
      flagBtn.classList.add("list-view-disabled");
      flagBtn.disabled = true;
    } else {
      flagBtn.classList.remove("list-view-disabled");
      flagBtn.disabled = false;

      const isFlagged = gameEngine.isFlagged(examId, currentIdx);
      if (flagText)
        flagText.textContent = isFlagged ? "Remove Flag" : "Flag for Review";

      if (isFlagged) {
        flagBtn.classList.add("flagged");
      } else {
        flagBtn.classList.remove("flagged");
      }
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
    els.progressText.textContent = `${Math.round(
      progressPercent
    )}% (${answeredCount}/${questions.length})`;

  const isLocked = !!lockedQuestions[currentIdx];
  const userSelected = userAnswers[currentIdx];
  const isBookmarked = gameEngine.isBookmarked(examId, currentIdx);
  const isFlagged = gameEngine.isFlagged(examId, currentIdx);

  // Check if "Check Answer" button should be shown (not in exam mode)
  const showCheckButton = quizMode !== "exam";

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

        <button class="check-answer-btn ${
          isLocked || !showCheckButton ? "hidden" : ""
        }"
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

        <button class="check-answer-btn ${
          isLocked || !showCheckButton ? "hidden" : ""
        }"
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

  // REMOVED: Auto-lock in exam mode (as requested)

  renderQuestion();
  renderMenuNavigation();
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
  // Clear existing timeout
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout);
    autoSubmitTimeout = null;
  }

  const answered = Object.keys(userAnswers).length;
  if (answered === questions.length && questions.length > 0) {
    // 5-second delay before showing confirmation
    autoSubmitTimeout = setTimeout(() => {
      try {
        if (confirm("You have answered all questions. Submit now?")) {
          finish(true);
        }
      } catch (e) {
        console.error("Auto-submit error:", e);
      }
      autoSubmitTimeout = null;
    }, 5000);
  }
};

function nav(dir) {
  const newIdx = currentIdx + dir;
  if (newIdx < 0 || newIdx >= questions.length) return;
  currentIdx = newIdx;
  saveState();
  renderQuestion();
  renderMenuNavigation();
  updateMenuActionButtons();
}

function finish(skipConfirm) {
  console.log("Finish function called, skipConfirm:", skipConfirm); // Debug log

  // Clear auto-submit timeout
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout);
    autoSubmitTimeout = null;
  }

  if (!skipConfirm && !confirm("Are you sure you want to submit?")) {
    console.log("User cancelled submission");
    return;
  }

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

  console.log("Processing result:", rawResult); // Debug log

  const gamifiedResult = gameEngine.processResult(rawResult);

  const finalOutput = {
    ...rawResult,
    gamification: gamifiedResult,
  };

  console.log("Saving result and redirecting..."); // Debug log
  localStorage.setItem("last_quiz_result", JSON.stringify(finalOutput));
  localStorage.removeItem(`quiz_state_${examId}`);
  gameEngine.clearFlags(examId);

  // Force navigation
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
  renderMenuNavigation();
  updateNav();
}

// --- Utilities ---
function updateNav() {
  if (els.prevBtn) els.prevBtn.disabled = currentIdx === 0;

  if (els.nextBtn) {
    els.nextBtn.style.display =
      currentIdx === questions.length - 1 ? "none" : "inline-block";
  }

  if (els.finishBtn) {
    els.finishBtn.style.display = "flex";
    const totalLocked = Object.keys(lockedQuestions).length;
    els.finishBtn.innerHTML =
      totalLocked === questions.length && questions.length > 0
        ? `<span>🏁</span> Finish Exam`
        : `<span>🏁</span> Complete Quiz`;
  }
}

function saveState() {
  if (quizMode === "timed") return;
  const state = { currentIdx, userAnswers, timeElapsed, lockedQuestions };
  localStorage.setItem(`quiz_state_${examId}`, JSON.stringify(state));
}

function startTimer() {
  if (quizMode === "practice") return;

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
    } else if (quizMode === "exam") {
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
