// Script/quiz.js - Performance Optimized
import { examList } from "./examManifest.js";
import { gameEngine } from "./gameEngine.js";
import  { confirmationNotification } from "./notifications.js";

// === MEMORY CACHE for exam modules ===
const examModuleCache = new Map();
const MAX_CACHE_SIZE = 10; // Keep last 10 exams in memory

// === State Management ===
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

// === Performance: Debounce helpers ===
let renderNavDebounce = null;
let saveStateDebounce = null;

// === DOM Elements (cached references) ===
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
  restartBtn: document.getElementById("restartBtn"),
  exitBtn: document.getElementById("exitBtn"),
  statsBar: document.getElementById("statsBar"),
  statLevel: document.getElementById("statLevel"),
  statPoints: document.getElementById("statPoints"),
  statStreak: document.getElementById("statStreak"),
  viewToggle: document.getElementById("viewToggle"),
  viewIcon: document.getElementById("viewIcon"),
  viewText: document.getElementById("viewText"),
};

// === Global handlers ===
window.finishEarly = () => finish();
window.restartQuiz = () => restart(); // Not implemented
window.exitQuiz = () => exit();
window.prevQuestion = () => nav(-1);
window.nextQuestion = () => nav(1);

// === Helper: HTML Escaping ===
const escapeHtml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// === Helper: Check if Essay Question ===
const isEssayQuestion = (q) => {
  return q.options && q.options.length === 1;
};

// === Helper: Render Question Image ===
const renderQuestionImage = (imageUrl) => {
  if (!imageUrl) return "";
  return `
    <div class="question-image-container">
      <img 
        src="${escapeHtml(imageUrl)}" 
        alt="Question context image" 
        class="question-image"
        onerror="this.parentElement.style.display='none'"
      />
    </div>
  `;
};

// === Gamification Stats ===
function updateGamificationStats() {
  const userData = gameEngine.getUserData();
  const levelInfo = gameEngine.calculateLevel(userData.totalPoints);

  if (els.statLevel) els.statLevel.textContent = `Lv ${levelInfo.level}`;
  if (els.statPoints)
    els.statPoints.textContent = `${userData.totalPoints} pts`;
  if (els.statStreak) {
    const streak = userData.streaks?.currentDaily || 0;
    els.statStreak.textContent = `${streak} day${streak !== 1 ? "s" : ""}`;
  }
}

// === View Toggle ===
function toggleView() {
  viewMode = viewMode === "grid" ? "list" : "grid";
  localStorage.setItem("quiz_view_mode", viewMode);

  if (els.viewIcon && els.viewText) {
    if (viewMode === "grid") {
      els.viewIcon.textContent = "📋";
      els.viewText.textContent = "Switch to List View";
    } else {
      els.viewIcon.textContent = "🪟";
      els.viewText.textContent = "Switch to Grid View";
    }
  }

  renderMenuNavigation();
  updateMenuActionButtons();
}

// === OPTIMIZED: Load exam module with caching ===
async function loadExamModule(config) {
  // Check cache first
  if (examModuleCache.has(config.id)) {
    console.log(`[Quiz] Using cached exam: ${config.id}`);
    return examModuleCache.get(config.id);
  }

  // Load module
  console.log(`[Quiz] Loading exam: ${config.id}`);
  const module = await import(config.path);

  // Cache it
  examModuleCache.set(config.id, module);

  // Limit cache size (LRU-style)
  if (examModuleCache.size > MAX_CACHE_SIZE) {
    const firstKey = examModuleCache.keys().next().value;
    examModuleCache.delete(firstKey);
  }

  return module;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  examId = params.get("id");
  quizMode = params.get("mode") || "exam";
  const quizType = params.get("type"); // Added per instructions
  const startAt = params.get("startAt");

  // Load saved view mode
  const savedView = localStorage.getItem("quiz_view_mode");
  if (savedView) viewMode = savedView;

  // Update view toggle button
  if (els.viewIcon && els.viewText) {
    if (viewMode === "grid") {
      els.viewIcon.textContent = "📋";
      els.viewText.textContent = "Switch to List View";
    } else {
      els.viewIcon.textContent = "🪟";
      els.viewText.textContent = "Switch to Grid View";
    }
  }

  try {
    // -----------------------------------------------------------
    // BRANCHING LOGIC: Check if this is a User Created Quiz or Standard Exam
    // -----------------------------------------------------------

    if (quizType === "user") {
      // === LOGIC FOR USER QUIZ ===
      const userQuizData = sessionStorage.getItem("active_user_quiz");

      if (!userQuizData) {
        alert("Quiz not found!");
        window.location.href = "index.html";
        return;
      }

      const userQuiz = JSON.parse(userQuizData);

      // Map user questions to ensure correct format
      questions = userQuiz.questions.map((q) => ({
        q: q.q,
        options: q.options,
        correct: q.correct,
        image: q.image || undefined,
        explanation: q.explanation || undefined,
      }));

      metaData = {
        title: userQuiz.title,
        category: "Your Quiz",
      };
    } else {
      // === LOGIC FOR STANDARD EXAM (Original Code) ===
      const config = examList.find((e) => e.id === examId);

      if (!config) {
        alert("Exam not found!");
        window.location.href = "index.html";
        return;
      }

      // Use optimized loader with caching
      const module = await loadExamModule(config);
      questions = module.questions;

      const parts = config.path.replace(/\\/g, "/").split("/");
      const filename = parts[parts.length - 1] || "";
      const name = filename.replace(/\.js$/i, "").replace(/[_-]+/g, " ");
      const title = name.replace(/\b\w/g, (c) => c.toUpperCase());
      metaData = { title, category: parts[parts.length - 2] || "" };
    }

    // -----------------------------------------------------------
    // SHARED LOGIC: UI Updates & Game Initialization
    // -----------------------------------------------------------

    // Update Title UI
    if (els.title) {
      let modeLabel = "";
      if (quizMode === "practice") modeLabel = " (Practice)";
      if (quizMode === "timed") modeLabel = " (Timed)";
      els.title.textContent = (metaData.title || "Quiz") + modeLabel;
    }

    // Setup Timer
    if (quizMode === "timed") {
      timeRemaining = questions.length * 30;
    }

    // Setup State Restoration
    if (startAt !== null) {
      currentIdx = parseInt(startAt);
    } else {
      // Note: We use examId here. For user quizzes, ensure examId is unique or handles collision
      const saved = localStorage.getItem(`quiz_state_${examId}`);
      if (saved && quizMode === "practice") {
        const state = JSON.parse(saved);
        if (await confirmationNotification("Resume your previous session?")) {
          currentIdx = state.currentIdx || 0;
          userAnswers = state.userAnswers || {};
          lockedQuestions = state.lockedQuestions || {};
          timeElapsed = state.timeElapsed || 0;
        } else {
          localStorage.removeItem(`quiz_state_${examId}`);
        }
      }
    }

    // Initialize Game Engine
    updateGamificationStats();
    renderMenuNavigation();
    updateMenuActionButtons();
    renderQuestion();
    startTimer();

    // Global handlers
    window.handleSelect = (i) => handleSelect(i);
    window.handleEssayInput = () => handleEssayInput();
    window.checkAnswer = () => checkAnswer();
    window.toggleView = () => toggleView();
    window.toggleBookmark = () => {
      gameEngine.toggleBookmark(examId, currentIdx);
      renderQuestion();
      renderMenuNavigationDebounced();
      updateMenuActionButtons();
    };
    window.toggleFlag = () => {
      gameEngine.toggleFlag(examId, currentIdx);
      renderQuestion();
      renderMenuNavigationDebounced();
      updateMenuActionButtons();
    };
    window.toggleQuestionBookmark = (idx) => {
      gameEngine.toggleBookmark(examId, idx);
      renderMenuNavigationDebounced();
      if (idx === currentIdx) {
        renderQuestion();
        updateMenuActionButtons();
      }
    };
    window.toggleQuestionFlag = (idx) => {
      gameEngine.toggleFlag(examId, idx);
      renderMenuNavigationDebounced();
      if (idx === currentIdx) {
        renderQuestion();
        updateMenuActionButtons();
      }
    };
    window.jumpToQuestion = (idx) => {
      currentIdx = idx;
      saveStateDebounced();
      renderQuestion();
      renderMenuNavigationDebounced();
      updateMenuActionButtons();

      const questionCard = document.querySelector(".question-card");
      if (questionCard) {
        questionCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

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
      els.questionContainer.innerHTML = `<p style="color:red">Failed to load quiz data. ${err.message}</p>`;
    }
  }
}

// === OPTIMIZED: Debounced navigation rendering ===
function renderMenuNavigationDebounced() {
  if (renderNavDebounce) clearTimeout(renderNavDebounce);
  renderNavDebounce = setTimeout(() => {
    renderMenuNavigation();
  }, 100); // Wait 100ms before re-rendering
}

// === OPTIMIZED: Menu Navigation with smart updates ===
function renderMenuNavigation() {
  let navContainer = document.getElementById("menuNavContainer");
  if (!navContainer) return;

  const flagCount = gameEngine.getFlaggedCount(examId);
  const flagInfo =
    flagCount > 0
      ? `<span class="menu-flag-count">🚩 ${flagCount} flagged for review</span>`
      : "";

  if (viewMode === "grid") {
    renderGridView(navContainer, flagInfo);
  } else {
    renderListView(navContainer, flagInfo);
  }
}

// === OPTIMIZED: Grid view with DocumentFragment ===
function renderGridView(navContainer, flagInfo) {
  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();
  const container = document.createElement("div");
  container.className = "menu-nav-items grid-view";

  // Build all items at once
  questions.forEach((q, idx) => {
    const item = createGridItem(q, idx);
    container.appendChild(item);
  });

  fragment.appendChild(container);

  // Single DOM update
  navContainer.innerHTML = `
    <div class="menu-nav-grid">
      <div class="menu-nav-header">Question Navigator</div>
      <div class="menu-nav-legend">
        <span><span class="legend-dot current"></span> Current</span>
        <span><span class="legend-dot answered"></span> Answered</span>
        <span><span class="legend-dot correct"></span> Correct</span>
        <span><span class="legend-dot wrong"></span> Wrong</span>
        ${flagInfo}
        </div>
    </div>
  `;
  navContainer.querySelector(".menu-nav-grid").appendChild(container);
}

// === Helper: Create grid item element ===
function createGridItem(q, idx) {
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

  const button = document.createElement("button");
  button.className = `menu-nav-item grid-item ${statusClass}`;
  button.onclick = () => window.jumpToQuestion(idx);
  button.title = `Question ${idx + 1}${isBookmarked ? " - Bookmarked" : ""}${
    isFlagged ? " - Flagged" : ""
  }`;

  button.innerHTML = `
    <span>${idx + 1}</span>
    ${
      statusIcon
        ? `<span class="menu-nav-status grid-status">${statusIcon}</span>`
        : ""
    }
    ${
      isBookmarked || isFlagged
        ? `
      <div class="menu-nav-badges">
        ${isBookmarked ? '<span class="mini-badge bookmark">★</span>' : ""}
        ${isFlagged ? '<span class="mini-badge flag">🚩</span>' : ""}
      </div>
    `
        : ""
    }
  `;

  return button;
}

// === List view (similar optimization) ===
function renderListView(navContainer, flagInfo) {
  // 1. Clear the container completely
  navContainer.innerHTML = "";

  // 2. Add Header and Legend as flat elements
  const headerDiv = document.createElement("div");
  headerDiv.innerHTML = `
    <div class="menu-nav-header">QUESTION NAVIGATOR</div>
    <div class="menu-nav-legend">
      <span><span class="legend-dot current"></span> Current</span>
      <span><span class="legend-dot answered"></span> Answered</span>
      <span><span class="legend-dot correct"></span> Correct</span>
      <span><span class="legend-dot wrong"></span> Wrong</span>
     ${flagInfo || ""}     
     </div>
   
  `;
  navContainer.appendChild(headerDiv);

  // 3. Create the list container (no height limits)
  const listContainer = document.createElement("div");
  listContainer.className = "menu-nav-items list-view";

  // 4. Append buttons
  questions.forEach((q, idx) => {
    listContainer.appendChild(createListItem(q, idx));
  });

  navContainer.appendChild(listContainer);
}

// === Helper: Create list item element ===
function createListItem(q, idx) {
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

  const div = document.createElement("div");
  div.className = `menu-nav-item list-item ${statusClass}`;

  div.innerHTML = `
    <div class="menu-nav-item-left" onclick="window.jumpToQuestion(${idx})">
      <span class="menu-nav-number">Q${idx + 1}</span>
      ${
        statusIcon
          ? `<span class="menu-nav-status list-status">${statusIcon}</span>`
          : ""
      }
    </div>
    <div class="menu-nav-item-right">
      <span class="menu-nav-icon bookmark-icon ${isBookmarked ? "active" : ""}" 
            onclick="event.stopPropagation(); window.toggleQuestionBookmark(${idx})"
            title="${isBookmarked ? "Remove Bookmark" : "Bookmark"}">
        ${isBookmarked ? "★" : "☆"}
      </span>
      <span class="menu-nav-icon flag-icon ${isFlagged ? "active" : ""}" 
            onclick="event.stopPropagation(); window.toggleQuestionFlag(${idx})"
            title="${isFlagged ? "Remove Flag" : "Flag for Review"}">
        ${isFlagged ? "🚩" : "🏳️"}
      </span>
    </div>
  `;

  return div;
}

// === Menu Action Buttons ===
function updateMenuActionButtons() {
  const bookmarkBtn = document.getElementById("menuBookmarkBtn");
  const flagBtn = document.getElementById("menuFlagBtn");
  const bookmarkIcon = document.getElementById("menuBookmarkIcon");
  const bookmarkText = document.getElementById("menuBookmarkText");
  const flagText = document.getElementById("menuFlagText");
  const flagIcon = document.getElementById("menuFlagIcon");

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

      bookmarkBtn.classList.toggle("bookmarked", isBookmarked);
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
      if (flagIcon) flagIcon.textContent = isFlagged ? "🚩" : "🏳️";
      if (flagText)
        flagText.textContent = isFlagged ? "Remove Flag" : "Flag for Review";

      flagBtn.classList.toggle("flagged", isFlagged);
    }
  }
}

// === Core: Render Question (unchanged logic, optimized DOM) ===
function renderQuestion() {
  if (!questions.length) return;
  const q = questions[currentIdx];
  const isEssay = isEssayQuestion(q);
  const correctIdx = q.correct ?? q.answer;

  // Update Progress (only if changed)
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  if (els.progressFill) els.progressFill.style.width = `${progressPercent}%`;
  if (els.progressText)
    els.progressText.textContent = `${Math.round(
      progressPercent,
    )}% (${answeredCount}/${questions.length})`;

  const isLocked = !!lockedQuestions[currentIdx];
  const userSelected = userAnswers[currentIdx];
  const isBookmarked = gameEngine.isBookmarked(examId, currentIdx);
  const isFlagged = gameEngine.isFlagged(examId, currentIdx);
  const showCheckButton = quizMode !== "exam";

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
      feedbackText = `${statusMsg}<div style="margin-top:8px"><strong>Note:</strong> Essay grading may be inaccurate.</div><div style="margin-top:8px">${escapeHtml(
        explanationText,
      )}</div>`;
    } else {
      isCorrect = userSelected === correctIdx;
      feedbackClass += isCorrect ? " correct show" : " wrong show";
      const statusMsg = isCorrect ? "Correct ✅" : `Wrong ❌`;
      feedbackText = `${statusMsg}<div style="margin-top:8px">${escapeHtml(
        explanationText,
      )}</div>`;
    }
  }

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
        ${isFlagged ? "🚩" : "🏳️"}
      </button>
    </div>
  `;

  const questionHeaderHTML = `
    <div class="question-header">
      <div class="question-number">Question ${currentIdx + 1} of ${
        questions.length
      }</div>
      ${actionButtons}
    </div>
    ${renderQuestionImage(q.image)}
    <h2 class="question-text">${escapeHtml(q.q)}</h2>
  `;

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
        <div class="${feedbackClass}">${feedbackText}</div>
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
        <div class="${feedbackClass}">${feedbackText}</div>
      </div>
    `;
  }

  updateNav();
}

// === Event Handlers ===
function handleSelect(index) {
  if (lockedQuestions[currentIdx]) return;
  userAnswers[currentIdx] = index;
  saveStateDebounced();
  renderQuestion();
  renderMenuNavigationDebounced();
  maybeAutoSubmit();
}

function handleEssayInput() {
  if (lockedQuestions[currentIdx]) return;
  const textarea = document.getElementById("essayInput");
  if (textarea) {
    userAnswers[currentIdx] = textarea.value;
    saveStateDebounced();
    const checkBtn = document.getElementById("checkBtn");
    if (checkBtn) {
      checkBtn.disabled = !textarea.value.trim();
    }
  }
}

const maybeAutoSubmit = () => {
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout);
    autoSubmitTimeout = null;
  }

  const answered = Object.keys(userAnswers).length;
  if (answered === questions.length && questions.length > 0) {
    autoSubmitTimeout = setTimeout(async () => {
      try {
        if (await confirmationNotification("You have answered all questions. Submit now?")) {
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
  saveStateDebounced();
  renderQuestion();
  renderMenuNavigationDebounced();
  updateMenuActionButtons();
}

async function finish(skipconfirmationNotification) {
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout);
    autoSubmitTimeout = null;
  }

  if (!skipconfirmationNotification && !await confirmationNotification("Are you sure you want to submit?")) return;

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
    examTitle: metaData.title, // Pass title for summary
    questions: questions, // Pass questions to avoid reload issues
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

async function restart(skipconfirmationNotification) {
  // 1. confirmationNotification Intent
  if (
    !skipconfirmationNotification &&
    !await confirmationNotification("Are you sure you want to restart? Progress will be lost.")
  )
    return;

  // 2. SAFETY: Kill the pending save timer immediately.
  // This prevents the previous state from overwriting our "clean slate"
  // 300ms after this function runs.
  if (saveStateDebounce) {
    clearTimeout(saveStateDebounce);
    saveStateDebounce = null;
  }

  // 3. Clear Intervals
  if (timerInterval) clearInterval(timerInterval);
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout);
    autoSubmitTimeout = null;
  }

  // 4. Wipe Storage
  localStorage.removeItem(`quiz_state_${examId}`);

  // 5. Reset Memory State
  currentIdx = 0;
  userAnswers = {};
  lockedQuestions = {};
  timeElapsed = 0;

  // 6. Reset Timed Mode Logic
  if (quizMode === "timed") {
    timeRemaining = questions.length * 30;
  }

  // 7. Reset UI
  if (els.timer) {
    els.timer.style.color = "";
    if (quizMode === "timed") {
      const mins = Math.floor(timeRemaining / 60)
        .toString()
        .padStart(2, "0");
      const secs = (timeRemaining % 60).toString().padStart(2, "0");
      els.timer.textContent = `⏳ ${mins}:${secs}`;
    } else {
      els.timer.textContent = `⏱ 00:00`;
    }
  }

  // 8. Re-render
  renderQuestion();
  renderMenuNavigation();
  updateMenuActionButtons();
  startTimer();

  // 9. Scroll to top
  window.scrollTo(0, 0);
}

async function exit(skipconfirmationNotification) {
  if (!skipconfirmationNotification && !await confirmationNotification("Are you sure you want to exit?")) return;

  localStorage.removeItem(`quiz_state_${examId}`);

  window.location.href = "index.html";
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
  saveStateDebounced();
  renderQuestion();
  renderMenuNavigationDebounced();
  updateNav();
}

// === Utilities ===
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
        ? `<span>✅</span> Finish Exam`
        : `<span>✅</span> Complete Quiz`;
  }
}

// === OPTIMIZED: Debounced save state ===
function saveStateDebounced() {
  if (quizMode === "timed") return;

  if (saveStateDebounce) clearTimeout(saveStateDebounce);
  saveStateDebounce = setTimeout(() => {
    const state = { currentIdx, userAnswers, timeElapsed, lockedQuestions };
    localStorage.setItem(`quiz_state_${examId}`, JSON.stringify(state));
  }, 300); // Wait 300ms before saving
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

      // Save less frequently during timer (every 10 seconds)
      if (timeElapsed % 10 === 0) {
        saveStateDebounced();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

init();
