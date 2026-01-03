// import { examList } from "./examManifest.js";

// // --- State Management ---
// let questions = [];
// let metaData = {};
// let currentIdx = 0;
// let userAnswers = {};
// let lockedQuestions = {};
// let timeElapsed = 0;
// let timerInterval = null;
// let examId = null;

// // --- DOM Elements ---
// const els = {
//   title: document.getElementById("quizTitle"),
//   progressFill: document.getElementById("progressFill"),
//   progressText: document.getElementById("progressText"),
//   questionContainer: document.getElementById("questionContainer"),
//   timer: document.getElementById("timer"),
//   prevBtn: document.getElementById("prevBtn"),
//   nextBtn: document.getElementById("nextBtn"),
//   finishBtn: document.getElementById("finishBtn"),
// };

// // --- Helper: HTML Escaping ---
// // This prevents tags like <br> from being rendered as HTML elements
// const escapeHtml = (unsafe) => {
//   if (unsafe === null || unsafe === undefined) return "";
//   return String(unsafe)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// };

// // --- Initialization ---
// async function init() {
//   const params = new URLSearchParams(window.location.search);
//   examId = params.get("id");
//   const config = examList.find((e) => e.id === examId);

//   if (!config) {
//     alert("Exam not found!");
//     window.location.href = "index.html";
//     return;
//   }

//   try {
//     const module = await import(config.path);
//     questions = module.questions;

//     // Handle metadata
//     if (module.meta && (module.meta.title || module.meta.category)) {
//       metaData = module.meta;
//     } else {
//       const parts = config.path.replace(/\\/g, "/").split("/");
//       const filename = parts[parts.length - 1] || "";
//       const name = filename.replace(/\.js$/i, "").replace(/[_-]+/g, " ");
//       const title = name.replace(/\b\w/g, (c) => c.toUpperCase());
//       metaData = { title, category: parts[parts.length - 2] || "" };
//     }

//     if (els.title) els.title.textContent = metaData.title || "Quiz";

//     // Restore Session
//     const saved = localStorage.getItem(`quiz_state_${examId}`);
//     if (saved) {
//       const state = JSON.parse(saved);
//       if (confirm("Resume your previous session?")) {
//         currentIdx = state.currentIdx || 0;
//         userAnswers = state.userAnswers || {};
//         lockedQuestions = state.lockedQuestions || {};
//         timeElapsed = state.timeElapsed || 0;
//       } else {
//         localStorage.removeItem(`quiz_state_${examId}`);
//       }
//     }

//     renderQuestion();
//     startTimer();

//     // Global Handlers
//     window.handleSelect = window.handleSelect || ((i) => {});
//     window.prevQuestion = window.prevQuestion || (() => window.nav(-1));
//     window.nextQuestion = window.nextQuestion || (() => window.nav(1));
//     window.finishEarly = window.finishEarly || (() => window.finish());
//     window.checkAnswer = window.checkAnswer || (() => {});

//     document.addEventListener("keydown", (e) => {
//       if (e.key === "Enter") {
//         e.preventDefault();
//         try {
//           window.nextQuestion();
//         } catch (err) {}
//       }
//     });
//   } catch (err) {
//     console.error("Initialization Error:", err);
//     if (els.questionContainer) {
//       els.questionContainer.innerHTML = `<p style="color:red">Failed to load quiz data.</p>`;
//     }
//   }
// }

// // --- Core Logic ---
// function renderQuestion() {
//   if (!questions.length) return;
//   const q = questions[currentIdx];

//   // Determine correct index safely (using ?? handles index 0 correctly)
//   const correctIdx = q.correct ?? q.answer;

//   // Update Progress
//   const solvedCount = Object.keys(lockedQuestions).length;
//   const progressPercent = (solvedCount / questions.length) * 100;
//   if (els.progressFill) els.progressFill.style.width = `${progressPercent}%`;
//   if (els.progressText)
//     els.progressText.textContent = `Progress: ${Math.round(
//       progressPercent
//     )}% (${solvedCount}/${questions.length})`;

//   const isLocked = !!lockedQuestions[currentIdx];
//   const userSelected = userAnswers[currentIdx];

//   // Feedback Logic
//   let feedbackClass = "feedback";
//   let feedbackText = "";
//   // Get explanation and ESCAPE it so tags show as text
//   const explanationText =
//     q.explanation || q.desc || q.info || "No explanation provided.";

//   if (isLocked) {
//     const isCorrect = userSelected === correctIdx;
//     feedbackClass += isCorrect ? " correct show" : " wrong show";

//     // Escape the "Correct Answer" text specifically
//     const correctLabel = q.options[correctIdx]
//       ? escapeHtml(q.options[correctIdx])
//       : "Unknown";

//     const statusMsg = isCorrect
//       ? "Correct ✅"
//       : `Wrong ❌ — Correct: ${correctLabel}`;

//     feedbackText = `${statusMsg}<div style="margin-top:8px">${escapeHtml(
//       explanationText
//     )}</div>`;
//   }

//   // Render content using escapeHtml on all dynamic strings
//   els.questionContainer.innerHTML = `
//         <div class="question-card">
//             <div class="question-header">
//                 <div class="question-number">Question ${currentIdx + 1} of ${
//     questions.length
//   }</div>
//                 <h2 class="question-text">${escapeHtml(q.q)}</h2>
//             </div>

//             <div class="options-grid">
//                 ${q.options
//                   .map((opt, i) => {
//                     const isSelected = userSelected === i;
//                     let optionClass = "option-row";
//                     if (isSelected) optionClass += " selected";
//                     if (isLocked) {
//                       optionClass += " locked";
//                       if (i === correctIdx) optionClass += " correct";
//                       if (isSelected && i !== correctIdx)
//                         optionClass += " wrong";
//                     }

//                     // Note: We run escapeHtml(opt) here to fix the display bug
//                     return `
//                     <div class="${optionClass}" ${
//                       isLocked ? "" : `onclick="window.handleSelect(${i})"`
//                     }>
//                         <input type="radio" name="answer" ${
//                           isSelected ? "checked" : ""
//                         }
//                                ${
//                                  isLocked ? "disabled" : ""
//                                } aria-label="Option ${i + 1}">
//                         <span class="option-label">${escapeHtml(opt)}</span>
//                     </div>`;
//                   })
//                   .join("")}
//             </div>

//             <button class="check-answer-btn ${isLocked ? "hidden" : ""}"
//                     id="checkBtn" onclick="window.checkAnswer()"
//                     ${userSelected === undefined ? "disabled" : ""}>
//                 Check Answer
//             </button>

//             <div class="${feedbackClass}">
//                 ${feedbackText}
//             </div>
//         </div>
//     `;

//   // Post-render accessibility adjustments
//   const optionRows = Array.from(
//     els.questionContainer.querySelectorAll(".option-row")
//   );
//   optionRows.forEach((row, idx) => {
//     const input = row.querySelector('input[type="radio"]');
//     if (!input) return;
//     if (isLocked) {
//       input.disabled = true;
//       input.setAttribute("aria-disabled", "true");
//     }
//     input.addEventListener("focus", () => {
//       const radios = Array.from(
//         els.questionContainer.querySelectorAll('input[type="radio"]')
//       );
//       radios.forEach((r) =>
//         r.setAttribute("tabindex", r === input ? "0" : "-1")
//       );
//     });
//   });

//   updateNav();
// }

// // --- Event Handlers ---
// window.handleSelect = (index) => {
//   if (lockedQuestions[currentIdx]) return;
//   userAnswers[currentIdx] = index;
//   saveState();
//   renderQuestion();
//   maybeAutoSubmit();
// };

// const maybeAutoSubmit = () => {
//   const answered = Object.keys(userAnswers).length;
//   if (answered === questions.length && questions.length > 0) {
//     setTimeout(() => {
//       try {
//         if (confirm("You have answered all questions. Submit now?")) {
//           window.finishEarly(true);
//         }
//       } catch (e) {}
//     }, 300);
//   }
// };

// window.nav = (dir) => {
//   const newIdx = currentIdx + dir;
//   if (newIdx < 0 || newIdx >= questions.length) return;
//   currentIdx = newIdx;
//   saveState();
//   renderQuestion();
// };

// window.prevQuestion = () => window.nav(-1);
// window.nextQuestion = () => window.nav(1);
// window.finish = () => window.finishEarly();

// window.finishEarly = (skipConfirm) => {
//   if (!skipConfirm && !confirm("Are you sure you want to submit?")) return;
//   stopTimer();

//   let correctCount = 0;
//   questions.forEach((q, i) => {
//     const correctIdx = q.correct ?? q.answer;
//     if (userAnswers[i] === correctIdx) correctCount++;
//   });

//   const finalResult = {
//     examId,
//     score: correctCount,
//     total: questions.length,
//     userAnswers,
//     timeElapsed,
//   };

//   localStorage.setItem("last_quiz_result", JSON.stringify(finalResult));
//   localStorage.removeItem(`quiz_state_${examId}`);
//   window.location.href = "summary.html";
// };

// window.checkAnswer = () => {
//   if (userAnswers[currentIdx] === undefined) return;
//   lockedQuestions[currentIdx] = true;
//   saveState();
//   renderQuestion();
//   updateNav();
// };

// // --- Utilities ---
// function updateNav() {
//   if (els.prevBtn) els.prevBtn.disabled = currentIdx === 0;
//   if (els.nextBtn) els.nextBtn.style.display = "inline-block";
//   if (els.finishBtn) {
//     els.finishBtn.style.display = "inline-block";
//     const totalLocked = Object.keys(lockedQuestions).length;
//     els.finishBtn.textContent =
//       totalLocked === questions.length && questions.length > 0
//         ? "Finish Exam"
//         : "Finish Here";
//   }
// }

// function saveState() {
//   const state = { currentIdx, userAnswers, timeElapsed, lockedQuestions };
//   localStorage.setItem(`quiz_state_${examId}`, JSON.stringify(state));
// }

// function startTimer() {
//   if (timerInterval) clearInterval(timerInterval);
//   timerInterval = setInterval(() => {
//     timeElapsed++;
//     const mins = Math.floor(timeElapsed / 60)
//       .toString()
//       .padStart(2, "0");
//     const secs = (timeElapsed % 60).toString().padStart(2, "0");
//     if (els.timer) els.timer.textContent = `⏱ ${mins}:${secs}`;
//     saveState();
//   }, 1000);
// }

// function stopTimer() {
//   clearInterval(timerInterval);
// }

// init();

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
    const module = await import(config.path);
    questions = module.questions;

    // Handle metadata
    if (module.meta && (module.meta.title || module.meta.category)) {
      metaData = module.meta;
    } else {
      const parts = config.path.replace(/\\/g, "/").split("/");
      const filename = parts[parts.length - 1] || "";
      const name = filename.replace(/\.js$/i, "").replace(/[_-]+/g, " ");
      const title = name.replace(/\b\w/g, (c) => c.toUpperCase());
      metaData = { title, category: parts[parts.length - 2] || "" };
    }

    if (els.title) els.title.textContent = metaData.title || "Quiz";

    // Restore Session
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

    // Global Handlers
    window.handleSelect = window.handleSelect || ((i) => {});
    window.prevQuestion = window.prevQuestion || (() => window.nav(-1));
    window.nextQuestion = window.nextQuestion || (() => window.nav(1));
    window.finishEarly = window.finishEarly || (() => window.finish());
    window.checkAnswer = window.checkAnswer || (() => {});

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
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

// --- Core Logic ---
function renderQuestion() {
  if (!questions.length) return;
  const q = questions[currentIdx];

  const correctIdx = q.correct ?? q.answer;

  // --- FIX START: Update Progress based on userAnswers (selections) instead of lockedQuestions ---
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  if (els.progressFill) els.progressFill.style.width = `${progressPercent}%`;
  if (els.progressText)
    els.progressText.textContent = `Progress: ${Math.round(
      progressPercent
    )}% (${answeredCount}/${questions.length})`;
  // --- FIX END ---

  const isLocked = !!lockedQuestions[currentIdx];
  const userSelected = userAnswers[currentIdx];

  // Feedback Logic
  let feedbackClass = "feedback";
  let feedbackText = "";
  const explanationText =
    q.explanation || q.desc || q.info || "No explanation provided.";

  if (isLocked) {
    const isCorrect = userSelected === correctIdx;
    feedbackClass += isCorrect ? " correct show" : " wrong show";

    const correctLabel = q.options[correctIdx]
      ? escapeHtml(q.options[correctIdx])
      : "Unknown";

    const statusMsg = isCorrect
      ? "Correct ✅"
      : `Wrong ❌ — Correct: ${correctLabel}`;

    feedbackText = `${statusMsg}<div style="margin-top:8px">${escapeHtml(
      explanationText
    )}</div>`;
  }

  // Render content
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
                      if (i === correctIdx) optionClass += " correct";
                      if (isSelected && i !== correctIdx)
                        optionClass += " wrong";
                    }

                    return `
                    <div class="${optionClass}" ${
                      isLocked ? "" : `onclick="window.handleSelect(${i})"`
                    }>
                        <input type="radio" name="answer" ${
                          isSelected ? "checked" : ""
                        } 
                               ${
                                 isLocked ? "disabled" : ""
                               } aria-label="Option ${i + 1}">
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

  // Post-render accessibility
  const optionRows = Array.from(
    els.questionContainer.querySelectorAll(".option-row")
  );
  optionRows.forEach((row, idx) => {
    const input = row.querySelector('input[type="radio"]');
    if (!input) return;
    if (isLocked) {
      input.disabled = true;
      input.setAttribute("aria-disabled", "true");
    }
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

// --- Event Handlers ---
window.handleSelect = (index) => {
  if (lockedQuestions[currentIdx]) return;
  userAnswers[currentIdx] = index;
  saveState();
  renderQuestion();
  maybeAutoSubmit();
};

const maybeAutoSubmit = () => {
  const answered = Object.keys(userAnswers).length;
  if (answered === questions.length && questions.length > 0) {
    setTimeout(() => {
      try {
        if (confirm("You have answered all questions. Submit now?")) {
          window.finishEarly(true);
        }
      } catch (e) {}
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
  if (!skipConfirm && !confirm("Are you sure you want to submit?")) return;
  stopTimer();

  let correctCount = 0;
  questions.forEach((q, i) => {
    const correctIdx = q.correct ?? q.answer;
    if (userAnswers[i] === correctIdx) correctCount++;
  });

  const finalResult = {
    examId,
    score: correctCount,
    total: questions.length,
    userAnswers,
    timeElapsed,
  };

  localStorage.setItem("last_quiz_result", JSON.stringify(finalResult));
  localStorage.removeItem(`quiz_state_${examId}`);
  window.location.href = "summary.html";
};

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
    saveState();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

init();
