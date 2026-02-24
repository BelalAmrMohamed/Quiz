// src/scripts/create-quiz.js - Enhanced Quiz Creator with Advanced Features

import {
  showNotification,
  confirmationNotification,
} from "../components/notifications.js";

import { exportToQuiz } from "../export/export-to-quiz.js";
import { exportToHtml } from "../export/export-to-html.js";
import { exportToPdf } from "../export/export-to-pdf.js";
import { exportToWord } from "../export/export-to-word.js";
import { exportToPptx } from "../export/export-to-pptx.js";
import { exportToMarkdown } from "../export/export-to-markdown.js";

const phoneNumber = "201118482193";
const emailAddress = "belalamrofficial@gmail.com";

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let quizData = {
  title: "",
  description: "",
  questions: [],
};

let questionIdCounter = 0;
let autosaveTimeout = null;
let draggedElement = null;
let bulkModeActive = false;
let selectedQuestions = new Set();
let currentFilter = "all";
let isTemplatesPanelOpen = false;
let editingQuizId = null;

// ============================================================================
// MARKDOWN & INLINE EDITOR SYSTEM
// ============================================================================

function renderMarkdown(str) {
  if (!str) return "";
  const codeBlocks = [];
  // 1. Extract fenced code blocks first
  str = str.replace(/```([\w]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre class="code-block ltr"><code class="lang-${lang || "plain"}">${escaped.trim()}</code></pre>`,
    );
    return `\x00CODE${idx}\x00`;
  });
  // 2. Escape HTML in remaining text
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  // 3. Inline code
  str = str.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  // 4. Bold and italic
  str = str.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  str = str.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  str = str.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  // 5. Newlines → <br>
  str = str.replace(/\n/g, "<br>");
  // 6. Restore code blocks
  return str.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);
}

/**
 * Build the HTML for an inline markdown editor field.
 * Default state: shows rendered markdown (click to edit).
 * Edit state: shows textarea + live preview panel below.
 */
function mdEditorHtml(id, value, placeholder, rows = 2) {
  const safeValue = (value || "").replace(/\\n/g, "\n");
  const rendered = safeValue.trim() ? renderMarkdown(safeValue) : "";
  const escaped = safeValue
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `
    <div class="md-editor-wrap" id="wrap-${id}">
      <div
        class="md-rendered${!rendered ? " md-empty" : ""} ltr"
        id="rendered-${id}"
        onclick="activateMdEditor('${id}')"
        onkeydown="if(event.key==='Enter'||event.key===' ')activateMdEditor('${id}')"
        tabindex="0"
        role="button"
        aria-label="انقر للتعديل: ${placeholder.replace(/"/g, "&quot;")}"
      >${rendered || `<span class="md-placeholder">${placeholder}</span>`}</div>
      <div class="md-edit-panel ltr" id="editpanel-${id}" style="display:none;">
        <textarea
          class="md-source ltr"
          id="${id}"
          rows="${rows}"
          placeholder="${placeholder}"
        >${escaped}</textarea>
        <div class="md-live-preview ltr" id="livepreview-${id}">${rendered ? `<div class="md-live-preview-inner">${rendered}</div>` : ""}</div>
      </div>
    </div>`;
}

/** Switch a markdown editor field into edit mode */
window.activateMdEditor = function (id) {
  const renderedDiv = document.getElementById(`rendered-${id}`);
  const editPanel = document.getElementById(`editpanel-${id}`);
  const source = document.getElementById(id);
  if (!renderedDiv || !editPanel || !source) return;
  renderedDiv.style.display = "none";
  editPanel.style.display = "block";
  // Auto-size textarea
  autoResizeMdSource(source);
  source.focus();
  source.setSelectionRange(source.value.length, source.value.length);
};

function autoResizeMdSource(ta) {
  ta.style.height = "auto";
  ta.style.height = Math.max(ta.scrollHeight, 60) + "px";
}

/** Wire up all md-editor events: live preview, blur→render, auto-resize, ``` shortcut */
function setupMdEditor(id, onChange) {
  const source = document.getElementById(id);
  const renderedDiv = document.getElementById(`rendered-${id}`);
  const editPanel = document.getElementById(`editpanel-${id}`);
  const livePreview = document.getElementById(`livepreview-${id}`);
  if (!source || !renderedDiv || !editPanel) return;

  const refreshLivePreview = () => {
    if (!livePreview) return;
    const val = source.value;
    if (val.trim()) {
      livePreview.innerHTML = `<div class="md-live-preview-inner">${renderMarkdown(val)}</div>`;
      livePreview.style.display = "block";
    } else {
      livePreview.innerHTML = "";
      livePreview.style.display = "none";
    }
  };

  const refreshRenderedDiv = () => {
    const val = source.value;
    if (val.trim()) {
      renderedDiv.innerHTML = renderMarkdown(val);
      renderedDiv.classList.remove("md-empty");
    } else {
      renderedDiv.innerHTML = `<span class="md-placeholder">${source.placeholder}</span>`;
      renderedDiv.classList.add("md-empty");
    }
  };

  // Live preview + auto-resize on every keystroke
  source.addEventListener("input", () => {
    autoResizeMdSource(source);
    refreshLivePreview();
    if (onChange) onChange(source.value);
  });

  // On blur: collapse edit panel, show rendered view
  source.addEventListener("blur", () => {
    // Small delay so clicks inside livePreview don't immediately close
    setTimeout(() => {
      if (document.activeElement === source) return;
      refreshRenderedDiv();
      editPanel.style.display = "none";
      renderedDiv.style.display = "block";
    }, 150);
  });

  // Triple-backtick + Enter → insert code block
  source.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = source.value;
      const pos = source.selectionStart;
      if (pos >= 3 && val.slice(pos - 3, pos) === "```") {
        e.preventDefault();
        const before = val.slice(0, pos);
        const after = val.slice(pos);
        const insertion = "\n\n```";
        source.value = before + insertion + after;
        source.setSelectionRange(pos + 1, pos + 1);
        source.dispatchEvent(new Event("input"));
        return;
      }
    }
    // Tab → insert 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const pos = source.selectionStart;
      source.value =
        source.value.slice(0, pos) + "  " + source.value.slice(pos);
      source.setSelectionRange(pos + 2, pos + 2);
    }
  });

  // Initial live preview
  refreshLivePreview();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  if (editId) {
    editingQuizId = editId;
    loadQuizFromLocalStorage(editId);
  } else {
    loadDraftFromLocalStorage();
  }
  updateEmptyState();
  setupEventListeners();
  setupKeyboardShortcuts();
  updateProgress();
  updateStatistics();
});

function setupEventListeners() {
  // Metadata event listeners
  const titleInput = document.getElementById("quizTitle");
  const descInput = document.getElementById("quizDescription");

  titleInput.addEventListener("input", (e) => {
    quizData.title = e.target.value;
    updateCharCount("titleCharCount", e.target.value.length, 100);
    autosave();
  });

  descInput.addEventListener("input", (e) => {
    quizData.description = e.target.value;
    updateCharCount("descCharCount", e.target.value.length, 500);
    autosave();
  });

  // Search functionality with debounce
  const searchInput = document.getElementById("questionSearch");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
    searchInput.addEventListener("input", (e) => {
      const clearBtn = document.getElementById("clearSearch");
      if (clearBtn) {
        clearBtn.style.display = e.target.value ? "flex" : "none";
      }
    });
  }

  // Scroll detection for FAB
  let lastScrollTop = 0;
  window.addEventListener("scroll", () => {
    const fabContainer = document.getElementById("fabContainer");
    if (!fabContainer || quizData.questions.length < 3) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Show/hide based on scroll position
    if (scrollTop > 300) {
      fabContainer.style.display = "block";
    } else {
      fabContainer.style.display = "none";
    }

    lastScrollTop = scrollTop;
  });
}

// ============================================================================
// CHARACTER COUNT
// ============================================================================

function updateCharCount(elementId, current, max) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = `${current}/${max}`;
    element.classList.remove("warning", "error");
    if (current > max * 0.9) {
      element.classList.add("warning");
    }
    if (current >= max) {
      element.classList.add("error");
    }
  }
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl+N: Add new question
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      addQuestion();
    }

    // Ctrl+S: Save quiz
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveLocally();
    }

    // Ctrl+P: Preview quiz
    if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      previewQuiz();
    }

    // Ctrl+E: Export quiz
    if ((e.ctrlKey || e.metaKey) && e.key === "e") {
      e.preventDefault();
      exportQuiz();
    }

    // ?: Show shortcuts
    if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
      const target = e.target;
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
        e.preventDefault();
        toggleShortcuts();
      }
    }
  });
}

window.toggleShortcuts = function () {
  const panel = document.getElementById("shortcutsPanel");
  if (panel.style.display === "none") {
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
};

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

function updateProgress() {
  const totalQuestions = quizData.questions.length;
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  if (progressText) {
    progressText.textContent = `${totalQuestions} ${totalQuestions === 1 ? "سؤال" : "أسئلة"}`;
  }

  if (progressBar) {
    const progress = Math.min((totalQuestions / 10) * 100, 100);
    progressBar.style.width = `${progress}%`;
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

function updateStatistics() {
  const statsCard = document.getElementById("statsCard");
  if (!statsCard) return;

  const totalQuestions = quizData.questions.length;

  if (totalQuestions === 0) {
    statsCard.style.display = "none";
    return;
  }

  statsCard.style.display = "block";

  const questionsWithImages = quizData.questions.filter(
    (q) => q.image && q.image.trim(),
  ).length;
  const questionsWithExplanations = quizData.questions.filter(
    (q) => q.explanation && q.explanation.trim(),
  ).length;
  const totalOptions = quizData.questions.reduce(
    (sum, q) => sum + q.options.length,
    0,
  );
  const avgOptions = (totalOptions / totalQuestions).toFixed(1);

  document.getElementById("statQuestions").textContent = totalQuestions;
  document.getElementById("statImages").textContent = questionsWithImages;
  document.getElementById("statExplanations").textContent =
    questionsWithExplanations;
  document.getElementById("statAvgOptions").textContent = avgOptions;
}

// ============================================================================
// QUESTION MANAGEMENT
// ============================================================================

window.addQuestion = function () {
  const questionId = ++questionIdCounter;

  const question = {
    id: questionId,
    q: "",
    options: ["", ""],
    correct: 0,
    image: "",
    explanation: "",
  };

  quizData.questions.push(question);
  renderQuestion(question);
  updateEmptyState();
  updateProgress();
  updateStatistics();
  autosave();

  setTimeout(() => {
    const questionCard = document.getElementById(`question-${questionId}`);
    if (questionCard) {
      questionCard.scrollIntoView({ behavior: "smooth", block: "center" });
      // Activate the question text md editor so user can type immediately
      const questionTextId = `question-text-${questionId}`;
      activateMdEditor(questionTextId);
    }
  }, 100);
};

window.removeQuestion = async function (questionId) {
  if (!(await confirmationNotification("هل أنت متأكد من حذف هذا السؤال؟"))) {
    return;
  }

  const index = quizData.questions.findIndex((q) => q.id === questionId);
  if (index !== -1) {
    quizData.questions.splice(index, 1);

    const questionCard = document.getElementById(`question-${questionId}`);
    if (questionCard) {
      questionCard.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        questionCard.remove();
        updateQuestionNumbers();
        updateEmptyState();
        updateProgress();
        updateStatistics();
        showNotification("تم الحذف", "تم حذف السؤال بنجاح", "success");
      }, 300);
    }

    autosave();
  }
};

window.duplicateQuestion = function (questionId) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (!question) return;

  const newId = ++questionIdCounter;
  const duplicatedQuestion = {
    ...question,
    id: newId,
    q: question.q + " (نسخة)",
  };

  const index = quizData.questions.findIndex((q) => q.id === questionId);
  quizData.questions.splice(index + 1, 0, duplicatedQuestion);

  renderQuestion(duplicatedQuestion, index + 1);
  updateQuestionNumbers();
  updateProgress();
  updateStatistics();
  autosave();

  showNotification("تم النسخ", "تم نسخ السؤال بنجاح", "success");

  setTimeout(() => {
    const newCard = document.getElementById(`question-${newId}`);
    if (newCard) {
      newCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
};

function renderQuestion(question, insertAtIndex = null) {
  const container = document.getElementById("questionsContainer");
  const questionNumber =
    quizData.questions.findIndex((q) => q.id === question.id) + 1;

  const questionCard = document.createElement("div");
  questionCard.className = "question-card";
  questionCard.id = `question-${question.id}`;
  questionCard.draggable = true;
  questionCard.dataset.questionId = question.id;

  // Check if question is incomplete
  const isIncomplete =
    !question.q ||
    question.q.trim() === "" ||
    question.options.some((opt) => !opt || opt.trim() === "");
  if (isIncomplete) {
    questionCard.classList.add("incomplete");
  }

  questionCard.innerHTML = `
        <div class="question-header" onclick="handleHeaderClick(event, ${question.id})">
            <span class="question-number" id="qnum-${question.id}">
                ${bulkModeActive ? `<input type="checkbox" class="question-select-checkbox" onchange="handleQuestionSelect(event, ${question.id})" onclick="event.stopPropagation()">` : ""}
                <span class="drag-handle" title="اسحب لإعادة الترتيب" onclick="event.stopPropagation()"><i data-lucide="grip-vertical"></i></span>
                <span class="q-label">سؤال ${questionNumber}</span>
                <span class="q-preview" id="qpreview-${question.id}"></span>
            </span>
            <div class="question-actions" onclick="event.stopPropagation()">
                <button class="btn-icon btn-collapse" onclick="toggleQuestionCollapse(${question.id})" title="طي/توسيع السؤال">
                    <i data-lucide="unfold-vertical"></i>
                </button>
                <button class="btn-icon btn-duplicate" onclick="duplicateQuestion(${question.id})" title="نسخ السؤال">
                    <i data-lucide="copy"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="removeQuestion(${question.id})" title="حذف السؤال">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
        
        <div class="question-body">
            <div class="form-group">
                <label>نصّ السؤال *</label>
                ${mdEditorHtml(`question-text-${question.id}`, question.q, "أدخل سؤالك هنا...", 3)}
            </div>
            
            <div class="form-group">
                <label>الإختيارات (إختيار واحد = سؤال مقالي)</label>
                <div id="options-container-${question.id}" class="options-list">
                    ${renderOptions(question)}
                </div>
                <button class="add-option-btn" onclick="addOption(${question.id})">
                    <i data-lucide="plus"></i> إضافة خيار
                </button>
            </div>
            
            <div class="collapsible-section">
                <div class="collapsible-header" onclick="toggleCollapsible(${question.id}, 'image')">
                    <h4><i data-lucide="image"></i> صورة (اختيارية)</h4>
                    <span class="collapsible-toggle" id="toggle-image-${question.id}"><i data-lucide="chevron-down"></i></span>
                </div>
                <div class="collapsible-content" id="content-image-${question.id}">
                    <div class="form-group">
                        <label>رابط الصورة</label>
                        <input 
                            type="url" class="ltr"
                            id="question-image-${question.id}" 
                            placeholder="https://example.com/image.jpg"
                            value="${escapeHtml(question.image || "")}"
                            aria-describedby="image-help-${question.id}"
                        />
                        <small id="image-help-${question.id}">أدخل رابط الصورة (يجب أن يبدأ بـ http:// أو https://)</small>
                    </div>
                    <div id="image-preview-${question.id}" class="image-preview-container"></div>
                </div>
            </div>
            
            <div class="collapsible-section">
                <div class="collapsible-header" onclick="toggleCollapsible(${question.id}, 'explanation')">
                    <h4><i data-lucide="lightbulb"></i> الشرح (اختياري)</h4>
                    <span class="collapsible-toggle" id="toggle-explanation-${question.id}"><i data-lucide="chevron-down"></i></span>
                </div>
                <div class="collapsible-content" id="content-explanation-${question.id}">
                    <div class="form-group">
                        <label>شرح الإجابة الصحيحة</label>
                        ${mdEditorHtml(`question-explanation-${question.id}`, question.explanation || "", "قدم تفسيرًا للإجابة الصحيحة", 3)}
                    </div>
                </div>
            </div>
        </div>
    `;

  if (insertAtIndex !== null) {
    const existingCards = container.children;
    if (insertAtIndex < existingCards.length) {
      container.insertBefore(questionCard, existingCards[insertAtIndex]);
    } else {
      container.appendChild(questionCard);
    }
  } else {
    container.appendChild(questionCard);
  }

  setupQuestionEventListeners(question.id);
  setupDragAndDrop(questionCard);

  // Load image preview if exists
  if (question.image) {
    updateImagePreview(question.id, question.image);
  }

  // Re-initialize Lucide icons for newly injected HTML
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Click on header area (but not buttons/drag) collapses the card
window.handleHeaderClick = function (e, questionId) {
  // Only collapse if clicking directly on header/label, not child interactive elements
  if (
    e.target.closest(".question-actions") ||
    e.target.closest(".drag-handle") ||
    e.target.closest(".question-select-checkbox") ||
    e.target.tagName === "BUTTON" ||
    e.target.tagName === "INPUT"
  )
    return;
  toggleQuestionCollapse(questionId);
};

window.toggleQuestionCollapse = function (questionId) {
  const card = document.getElementById(`question-${questionId}`);
  if (!card) return;
  card.classList.toggle("collapsed");

  const isCollapsed = card.classList.contains("collapsed");
  const qPreview = document.getElementById(`qpreview-${questionId}`);

  if (isCollapsed && qPreview) {
    // Get question text from state or fallback to textarea
    const question = quizData.questions.find((q) => q.id === questionId);
    const textarea = document.getElementById(`question-text-${questionId}`);
    const rawText =
      (question && question.q) || (textarea && textarea.value) || "";
    const preview = rawText
      .replace(/\n/g, " ")
      .replace(/```[\s\S]*?```/g, "[كود]")
      .replace(/`/g, "")
      .trim();
    qPreview.textContent = preview
      ? ": " + preview.slice(0, 70) + (preview.length > 70 ? "…" : "")
      : "";
  } else if (qPreview) {
    qPreview.textContent = "";
  }
};

function setupQuestionEventListeners(questionId) {
  // Question text: inline md editor
  setupMdEditor(`question-text-${questionId}`, (val) =>
    updateQuestionData(questionId, "q", val),
  );

  // Image input
  const imageInput = document.getElementById(`question-image-${questionId}`);
  if (imageInput) {
    imageInput.addEventListener(
      "input",
      debounce((e) => {
        updateQuestionData(questionId, "image", e.target.value);
        updateImagePreview(questionId, e.target.value);
      }, 500),
    );
  }

  // Explanation: inline md editor
  setupMdEditor(`question-explanation-${questionId}`, (val) =>
    updateQuestionData(questionId, "explanation", val),
  );

  // Option md editors are set up after rerenderOptions via setupOptionMdEditors
  setupOptionMdEditors(questionId);
}

function updateImagePreview(questionId, imageUrl) {
  const previewContainer = document.getElementById(
    `image-preview-${questionId}`,
  );
  if (!previewContainer) return;

  if (!imageUrl || !imageUrl.trim()) {
    previewContainer.innerHTML = "";
    return;
  }

  previewContainer.innerHTML =
    '<div class="image-loading"><i data-lucide="loader-circle" class="spin"></i> جاري تحميل الصورة...</div>';

  const img = new Image();
  img.onload = function () {
    previewContainer.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="معاينة الصورة" class="image-preview">`;
  };
  img.onerror = function () {
    previewContainer.innerHTML =
      '<div class="image-error"><i data-lucide="image-off"></i> فشل تحميل الصورة. تحقق من الرابط.</div>';
    if (typeof lucide !== "undefined") lucide.createIcons();
  };
  img.src = imageUrl;
}

function updateQuestionData(questionId, field, value) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question) {
    question[field] = value;
    if (field === "explanation" || field === "image") {
      updateStatistics();
    }
    autosave();
  }
}

function updateQuestionNumbers() {
  quizData.questions.forEach((question, index) => {
    const qLabel = document
      .getElementById(`question-${question.id}`)
      ?.querySelector(".q-label");
    if (qLabel) {
      qLabel.textContent = `سؤال ${index + 1}`;
    }
  });
}

// ============================================================================
// DRAG AND DROP
// ============================================================================

function setupDragAndDrop(element) {
  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("dragend", handleDragEnd);
  element.addEventListener("dragover", handleDragOver);
  element.addEventListener("drop", handleDrop);
  element.addEventListener("dragenter", handleDragEnter);
  element.addEventListener("dragleave", handleDragLeave);
}

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  document.querySelectorAll(".question-card").forEach((card) => {
    card.classList.remove("drag-over");
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  if (this !== draggedElement) {
    this.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this) {
    const draggedId = parseInt(draggedElement.dataset.questionId);
    const droppedOnId = parseInt(this.dataset.questionId);

    const draggedIndex = quizData.questions.findIndex(
      (q) => q.id === draggedId,
    );
    const droppedIndex = quizData.questions.findIndex(
      (q) => q.id === droppedOnId,
    );

    const [draggedQuestion] = quizData.questions.splice(draggedIndex, 1);
    quizData.questions.splice(droppedIndex, 0, draggedQuestion);

    rerenderAllQuestions();
    autosave();
    showNotification("تم إعادة الترتيب", "تم تغيير ترتيب الأسئلة", "success");
  }

  return false;
}

function rerenderAllQuestions() {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";
  quizData.questions.forEach((question) => {
    renderQuestion(question);
  });
  updateQuestionNumbers();
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ============================================================================
// OPTIONS MANAGEMENT
// ============================================================================

function renderOptions(question) {
  return question.options
    .map((option, index) => {
      const optId = `option-text-${question.id}-${index}`;
      return `
        <div class="option-item ${question.correct === index ? "correct" : ""}" id="option-${question.id}-${index}">
            <input 
                type="radio" 
                name="correct-${question.id}" 
                class="option-radio"
                ${question.correct === index ? "checked" : ""}
                onchange="setCorrectAnswer(${question.id}, ${index})"
                title="تحديد كإجابة صحيحة"
                aria-label="تحديد الخيار ${index + 1} كإجابة صحيحة"
            />
            <div class="option-md-wrap">
                ${mdEditorHtml(optId, option, `إختيار ${index + 1}`, 1)}
            </div>
            ${
              question.options.length > 1
                ? `<button class="option-delete" onclick="removeOption(${question.id}, ${index})" title="حذف الخيار" aria-label="حذف الخيار ${index + 1}"><i data-lucide="x"></i></button>`
                : ""
            }
        </div>
      `;
    })
    .join("");
}

function setupOptionMdEditors(questionId) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (!question) return;
  question.options.forEach((_, index) => {
    const optId = `option-text-${questionId}-${index}`;
    setupMdEditor(optId, (val) => {
      const q = quizData.questions.find((q) => q.id === questionId);
      if (q) {
        q.options[index] = val;
        autosave();
      }
    });
  });
}

window.updateOption = function (questionId, optionIndex, value) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question) {
    question.options[optionIndex] = value;
    autosave();
  }
};

window.setCorrectAnswer = function (questionId, optionIndex) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question) {
    question.correct = optionIndex;
    rerenderOptions(questionId);
    autosave();
  }
};

function rerenderOptions(questionId) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question) {
    const container = document.getElementById(
      `options-container-${questionId}`,
    );
    if (container) {
      container.innerHTML = renderOptions(question);
      setupOptionMdEditors(questionId);
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

window.addOption = function (questionId) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question) {
    question.options.push("");
    rerenderOptions(questionId);
    updateStatistics();
    autosave();
  }
};

window.removeOption = function (questionId, optionIndex) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question && question.options.length > 1) {
    question.options.splice(optionIndex, 1);
    if (question.correct >= question.options.length) {
      question.correct = question.options.length - 1;
    }
    rerenderOptions(questionId);
    updateStatistics();
    autosave();
  }
};

// ============================================================================
// COLLAPSIBLE SECTIONS
// ============================================================================

window.toggleCollapsible = function (questionId, section) {
  const toggle = document.getElementById(`toggle-${section}-${questionId}`);
  const content = document.getElementById(`content-${section}-${questionId}`);

  if (toggle && content) {
    const isOpen = content.classList.contains("open");

    if (isOpen) {
      toggle.classList.remove("open");
      content.classList.remove("open");
    } else {
      toggle.classList.add("open");
      content.classList.add("open");
    }
  }
};

// ============================================================================
// SEARCH AND FILTER - ENHANCED
// ============================================================================

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const questionCards = document.querySelectorAll(".question-card");
  const clearBtn = document.getElementById("clearSearch");

  if (clearBtn) {
    clearBtn.style.display = searchTerm ? "flex" : "none";
  }

  let visibleCount = 0;
  questionCards.forEach((card) => {
    // Read from the md-source textarea (the raw text field)
    const sourceTextarea = card.querySelector(".md-source");
    const questionText = (
      sourceTextarea ? sourceTextarea.value : ""
    ).toLowerCase();
    const matches = questionText.includes(searchTerm);
    card.style.display = matches ? "block" : "none";
    if (matches) visibleCount++;
  });

  if (visibleCount === 0 && searchTerm) {
    showNotification(
      "لا توجد نتائج",
      `لم يتم العثور على أسئلة تحتوي على "${searchTerm}"`,
      "info",
    );
  }
}

window.clearSearch = function () {
  const searchInput = document.getElementById("questionSearch");
  const clearBtn = document.getElementById("clearSearch");

  if (searchInput) {
    searchInput.value = "";
    clearBtn.style.display = "none";

    // Show all questions
    document.querySelectorAll(".question-card").forEach((card) => {
      card.style.display = "block";
    });
  }
};

window.filterQuestions = function () {
  const filter = document.getElementById("questionFilter").value;
  currentFilter = filter;
  const questionCards = document.querySelectorAll(".question-card");

  let visibleCount = 0;
  questionCards.forEach((card) => {
    const questionId = parseInt(card.dataset.questionId);
    const question = quizData.questions.find((q) => q.id === questionId);

    let shouldShow = true;

    switch (filter) {
      case "with-images":
        shouldShow = question.image && question.image.trim() !== "";
        break;
      case "with-explanations":
        shouldShow = question.explanation && question.explanation.trim() !== "";
        break;
      case "mcq":
        shouldShow = question.options.length > 1;
        break;
      case "essay":
        shouldShow = question.options.length === 1;
        break;
      case "incomplete":
        shouldShow =
          !question.q ||
          question.q.trim() === "" ||
          question.options.some((opt) => !opt || opt.trim() === "");
        break;
      default:
        shouldShow = true;
    }

    card.style.display = shouldShow ? "block" : "none";
    if (shouldShow) visibleCount++;
  });

  showNotification("تم التصفية", `عرض ${visibleCount} سؤال`, "info");
};

window.sortQuestions = function (type = "alpha") {
  const container = document.getElementById("questionsContainer");
  const cards = Array.from(container.children);

  cards.sort((a, b) => {
    if (type === "alpha") {
      const textA = (
        a.querySelector(".md-source") ||
        a.querySelector("textarea") || { value: "" }
      ).value.toLowerCase();
      const textB = (
        b.querySelector(".md-source") ||
        b.querySelector("textarea") || { value: "" }
      ).value.toLowerCase();
      return textA.localeCompare(textB, "ar");
    } else if (type === "recent") {
      const idA = parseInt(a.dataset.questionId);
      const idB = parseInt(b.dataset.questionId);
      return idB - idA;
    }
    return 0;
  });

  cards.forEach((card) => container.appendChild(card));

  const sortName = type === "alpha" ? "أبجديًا" : "حسب الأحدث";
  showNotification("تم الترتيب", `تم ترتيب الأسئلة ${sortName}`, "success");
};

window.expandAll = function () {
  document.querySelectorAll(".question-card").forEach((card) => {
    card.classList.remove("collapsed");
  });
  showNotification("تم التوسيع", "تم توسيع جميع الأسئلة", "info");
};

window.collapseAll = function () {
  document.querySelectorAll(".question-card").forEach((card) => {
    card.classList.add("collapsed");
  });
  showNotification("تم الطي", "تم طي جميع الأسئلة", "info");
};

// ============================================================================
// BULK MODE
// ============================================================================

window.toggleBulkMode = function () {
  bulkModeActive = !bulkModeActive;
  const bulkActionsBar = document.getElementById("bulkActionsBar");
  const bulkBtn = document.getElementById("bulkModeBtn");

  if (bulkModeActive) {
    bulkActionsBar.style.display = "flex";
    bulkBtn.style.background = "var(--color-primary)";
    bulkBtn.style.color = "white";

    // Add checkboxes to all questions
    document.querySelectorAll(".question-card").forEach((card) => {
      if (!card.querySelector(".question-select-checkbox")) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "question-select-checkbox";
        checkbox.onclick = (e) => e.stopPropagation();
        checkbox.onchange = (e) =>
          handleQuestionSelect(e, parseInt(card.dataset.questionId));

        const numberSpan = card.querySelector(".question-number");
        numberSpan.insertBefore(checkbox, numberSpan.firstChild);
      }
    });
    if (typeof lucide !== "undefined") lucide.createIcons();
  } else {
    bulkActionsBar.style.display = "none";
    bulkBtn.style.background = "";
    bulkBtn.style.color = "";
    selectedQuestions.clear();

    // Remove checkboxes
    document
      .querySelectorAll(".question-select-checkbox")
      .forEach((cb) => cb.remove());
    document.querySelectorAll(".question-card").forEach((card) => {
      card.classList.remove("selected");
    });
    updateSelectedCount();
  }
};

window.handleQuestionSelect = function (e, questionId) {
  const card = document.getElementById(`question-${questionId}`);

  if (e.target.checked) {
    selectedQuestions.add(questionId);
    card.classList.add("selected");
  } else {
    selectedQuestions.delete(questionId);
    card.classList.remove("selected");
  }

  updateSelectedCount();
};

function updateSelectedCount() {
  const countSpan = document.getElementById("selectedCount");
  if (countSpan) {
    countSpan.textContent = selectedQuestions.size;
  }
}

window.selectAllQuestions = function () {
  document.querySelectorAll(".question-select-checkbox").forEach((cb) => {
    cb.checked = true;
    const card = cb.closest(".question-card");
    if (card) {
      const questionId = parseInt(card.dataset.questionId);
      selectedQuestions.add(questionId);
      card.classList.add("selected");
    }
  });
  updateSelectedCount();
  showNotification(
    "تم التحديد",
    `تم تحديد ${selectedQuestions.size} سؤال`,
    "info",
  );
};

window.deselectAllQuestions = function () {
  document.querySelectorAll(".question-select-checkbox").forEach((cb) => {
    cb.checked = false;
  });
  document.querySelectorAll(".question-card").forEach((card) => {
    card.classList.remove("selected");
  });
  selectedQuestions.clear();
  updateSelectedCount();
};

window.deleteSelectedQuestions = async function () {
  if (selectedQuestions.size === 0) {
    showNotification("تنبيه", "لم يتم تحديد أي أسئلة", "error");
    return;
  }

  if (
    !(await confirmationNotification(
      `هل أنت متأكد من حذف ${selectedQuestions.size} سؤال؟`,
    ))
  ) {
    return;
  }

  const idsToDelete = Array.from(selectedQuestions);

  idsToDelete.forEach((id) => {
    const index = quizData.questions.findIndex((q) => q.id === id);
    if (index !== -1) {
      quizData.questions.splice(index, 1);
    }

    const card = document.getElementById(`question-${id}`);
    if (card) {
      card.remove();
    }
  });

  selectedQuestions.clear();
  updateQuestionNumbers();
  updateEmptyState();
  updateProgress();
  updateStatistics();
  updateSelectedCount();
  autosave();

  showNotification("تم الحذف", `تم حذف ${idsToDelete.length} سؤال`, "success");
};

// ============================================================================
// VALIDATION
// ============================================================================

function validateQuiz() {
  const errors = [];

  if (!quizData.title || quizData.title.trim() === "") {
    errors.push("عنوان الاختبار مطلوب");
  }

  if (quizData.questions.length === 0) {
    errors.push("يجب إضافة سؤال واحد على الأقل");
  }

  quizData.questions.forEach((q, index) => {
    const questionNum = index + 1;

    if (!q.q || q.q.trim() === "") {
      errors.push(`السؤال ${questionNum}: نص السؤال مطلوب`);
    }

    if (q.options.length > 1) {
      const emptyOptions = q.options.filter((opt) => !opt || opt.trim() === "");
      if (emptyOptions.length > 0) {
        errors.push(`السؤال ${questionNum}: جميع الخيارات يجب أن تحتوي على نص`);
      }

      if (q.correct === undefined || q.correct === null) {
        errors.push(`السؤال ${questionNum}: يجب تحديد الإجابة الصحيحة`);
      }
    }

    if (q.image && q.image.trim()) {
      try {
        new URL(q.image);
      } catch {
        errors.push(`السؤال ${questionNum}: رابط الصورة غير صحيح`);
      }
    }
  });

  return errors;
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function updateEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const questionControls = document.getElementById("questionControls");
  const addQuestionBottom = document.getElementById("addQuestionBottom");
  const fabContainer = document.getElementById("fabContainer");
  const questionBadge = document.getElementById("questionBadge");

  if (quizData.questions.length === 0) {
    emptyState.classList.remove("hidden");
    if (questionControls) questionControls.style.display = "none";
    if (addQuestionBottom) addQuestionBottom.style.display = "none";
    if (fabContainer) fabContainer.style.display = "none";
  } else {
    emptyState.classList.add("hidden");
    if (questionControls) questionControls.style.display = "block";
    if (addQuestionBottom) addQuestionBottom.style.display = "flex";
    if (fabContainer && quizData.questions.length >= 3) {
      fabContainer.style.display = "block";
    }
  }

  if (questionBadge) {
    questionBadge.textContent = quizData.questions.length;
  }
}

// ============================================================================
// TEMPLATES SYSTEM
// ============================================================================

window.toggleTemplates = function () {
  const panel = document.getElementById("templatesPanel");
  isTemplatesPanelOpen = !isTemplatesPanelOpen;

  if (isTemplatesPanelOpen) {
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
};

window.addQuestionFromTemplate = function (templateType) {
  const templates = {
    mcq: {
      q: "",
      options: ["", "", "", ""],
      correct: 0,
      image: "",
      explanation: "",
    },
    truefalse: {
      q: "",
      options: ["True", "False"],
      correct: 0,
      image: "",
      explanation: "",
    },
    essay: {
      q: "",
      options: [""],
      correct: 0,
      image: "",
      explanation: "",
    },
  };

  const template = templates[templateType];
  if (!template) return;

  const questionId = ++questionIdCounter;
  const question = {
    id: questionId,
    ...template,
  };

  quizData.questions.push(question);
  renderQuestion(question);
  updateEmptyState();
  updateProgress();
  updateStatistics();
  autosave();

  // Close templates panel after selection
  toggleTemplates();

  setTimeout(() => {
    const questionCard = document.getElementById(`question-${questionId}`);
    if (questionCard) {
      questionCard.scrollIntoView({ behavior: "smooth", block: "center" });
      activateMdEditor(`question-text-${questionId}`);

      // Auto-open image section if image template
      if (templateType === "image") {
        toggleCollapsible(questionId, "image");
      }
    }
  }, 100);

  showNotification(
    "تم الإضافة!",
    `تم إضافة سؤال من قالب ${getTemplateName(templateType)}`,
    "success",
  );
};

function getTemplateName(type) {
  const names = {
    mcq: "اختيار متعدد",
    truefalse: "صح أم خطأ",
    essay: "مقالي",
    image: "مع صورة",
  };
  return names[type] || "افتراضي";
}

// ============================================================================
// AUTOSAVE
// ============================================================================

function autosave() {
  clearTimeout(autosaveTimeout);

  updateAutosaveIndicator("saving");

  autosaveTimeout = setTimeout(() => {
    try {
      const dataToSave = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions,
        lastModified: new Date().toISOString(),
      };

      localStorage.setItem("quiz_draft", JSON.stringify(dataToSave));
      updateAutosaveIndicator("saved");

      setTimeout(() => {
        updateAutosaveIndicator("saved");
      }, 1000);
    } catch (error) {
      console.error("Autosave error:", error);
      updateAutosaveIndicator("error");
    }
  }, 1000);
}

function updateAutosaveIndicator(status) {
  const indicator = document.getElementById("autosaveIndicator");
  if (!indicator) return;

  indicator.classList.remove("saving", "error");

  if (status === "saving") {
    indicator.classList.add("saving");
    indicator.querySelector(".save-text").textContent = "جاري الحفظ...";
  } else if (status === "saved") {
    indicator.querySelector(".save-text").textContent = "محفوظ";
  } else if (status === "error") {
    indicator.classList.add("error");
    indicator.querySelector(".save-text").textContent = "خطأ في الحفظ";
  }
}

function loadDraftFromLocalStorage() {
  try {
    const saved = localStorage.getItem("quiz_draft");
    if (saved) {
      const data = JSON.parse(saved);

      if (data.title) {
        quizData.title = data.title;
        document.getElementById("quizTitle").value = data.title;
        updateCharCount("titleCharCount", data.title.length, 100);
      }

      if (data.description) {
        quizData.description = data.description;
        document.getElementById("quizDescription").value = data.description;
        updateCharCount("descCharCount", data.description.length, 500);
      }

      if (data.questions && data.questions.length > 0) {
        quizData.questions = data.questions;
        questionIdCounter = Math.max(...data.questions.map((q) => q.id));

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        data.questions.forEach((question) => {
          renderQuestion(question);
        });

        updateEmptyState();
        updateProgress();
        updateStatistics();
        showNotification("تم التحميل", "تم تحميل المسودة المحفوظة", "success");
      }
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
}

function loadQuizFromLocalStorage(quizId) {
  try {
    const userQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );
    const quiz = userQuizzes.find((q) => q.id === quizId);

    if (quiz) {
      const headerTitle = document.querySelector(".header h1");
      if (headerTitle) headerTitle.textContent = "تعديل الاختبار";
      document.title = "تعديل الاختبار - منصة بصمجي";

      quizData.title = quiz.title || "";
      document.getElementById("quizTitle").value = quizData.title;
      updateCharCount("titleCharCount", quizData.title.length, 100);

      quizData.description = quiz.description || "";
      document.getElementById("quizDescription").value = quizData.description;
      updateCharCount("descCharCount", quizData.description.length, 500);

      if (quiz.questions && quiz.questions.length > 0) {
        quizData.questions = quiz.questions;
        questionIdCounter = Math.max(...quiz.questions.map((q) => q.id), 0);
      }

      // Always clear and re-render everything
      const container = document.getElementById("questionsContainer");
      if (container) container.innerHTML = "";
      quizData.questions.forEach((question) => {
        renderQuestion(question);
      });

      showNotification("أهلاً بك", "تم تحميل الاختبار للتعديل", "success");
    } else {
      showNotification("خطأ", "لم يتم العثور على الاختبار", "error");
      setTimeout(() => (window.location.href = "index.html"), 1500);
    }
  } catch (error) {
    console.error("Error loading quiz for edit:", error);
    showNotification("خطأ", "حدث خطأ أثناء تحميل الاختبار", "error");
  }
}

// ============================================================================
// SAVE TO USER QUIZZES
// ============================================================================

function saveToUserQuizzes(quizToSave) {
  try {
    const existingQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );

    const quizId = `user_quiz_${Date.now()}`;

    const newQuiz = {
      id: quizId,
      title: quizToSave.title,
      description: quizToSave.description,
      questions: quizToSave.questions,
      createdAt: new Date().toISOString(),
      author: "User Created",
    };

    existingQuizzes.push(newQuiz);

    localStorage.setItem("user_quizzes", JSON.stringify(existingQuizzes));

    return quizId;
  } catch (error) {
    console.error("Error saving quiz:", error);
    return null;
  }
}

function updateInUserQuizzes(quizId, quizToSave) {
  try {
    const existingQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );

    const quizIndex = existingQuizzes.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) return null;

    existingQuizzes[quizIndex] = {
      ...existingQuizzes[quizIndex],
      title: quizToSave.title,
      description: quizToSave.description,
      questions: quizToSave.questions,
      lastEditedAt: new Date().toISOString(),
    };

    localStorage.setItem("user_quizzes", JSON.stringify(existingQuizzes));

    return quizId;
  } catch (error) {
    console.error("Error updating quiz:", error);
    return null;
  }
}

// ============================================================================
// EXPORT QUIZ
// ============================================================================

window.exportQuiz = function () {
  const errors = validateQuiz();
  if (errors.length > 0) {
    showNotification(
      "خطأ في التحقق",
      "الرجاء إصلاح الأخطاء التالية:\n\n" + errors.join("\n"),
      "error",
    );
    return;
  }

  const config = { title: quizData.title, description: quizData.description };
  const exportQuestions = quizData.questions.map((q) => {
    const out = { q: q.q, options: q.options, correct: q.correct };
    if (q.image?.trim()) out.image = q.image;
    if (q.explanation?.trim()) out.explanation = q.explanation;
    return out;
  });

  const doExport = async (format) => {
    showLoading("جاري التصدير...");
    try {
      switch (format) {
        case "quiz":
          await exportToQuiz(config, exportQuestions);
          break;
        case "html":
          await exportToHtml(config, exportQuestions);
          break;
        case "pdf":
          await exportToPdf(config, exportQuestions);
          break;
        case "docx":
          await exportToWord(config, exportQuestions);
          break;
        case "pptx":
          await exportToPptx(config, exportQuestions);
          break;
        case "md":
          exportToMarkdown(config, exportQuestions);
          break;
        case "json": {
          const jsonMeta = { title: quizData.title };
          if (quizData.description?.trim())
            jsonMeta.description = quizData.description;
          const payload = { meta: jsonMeta, questions: exportQuestions };
          const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${quizData.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
        }
      }
      hideLoading();
    } catch (err) {
      hideLoading();
      console.error("Export error:", err);
      showNotification("خطأ", "حدث خطأ أثناء التصدير", "error");
    }
  };

  // Build popup modal
  const modal = document.createElement("div");
  modal.className = "modal-overlay download-modal-overlay";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const downloadOpts = [
    { icon: "🎯", label: "Quiz", sublabel: "(.html)", format: "quiz" },
    { icon: "🌐", label: "HTML", sublabel: "(.html)", format: "html" },
    { icon: "📄", label: "Markdown", sublabel: "(.md)", format: "md" },
    { icon: "📕", label: "PDF", sublabel: "(.pdf)", format: "pdf" },
    { icon: "📊", label: "PowerPoint", sublabel: "(.pptx)", format: "pptx" },
    { icon: "📝", label: "Word", sublabel: "(.docx)", format: "docx" },
    { icon: "{ }", label: "JSON", sublabel: "(.json)", format: "json" },
  ];

  const optionsHtml = downloadOpts
    .map(
      ({ icon, label, sublabel, format }) => `
    <button class="dl-option-btn" data-format="${format}" aria-label="تنزيل كـ ${label}">
      <span class="dl-icon">${icon}</span>
      <span class="dl-label">${label}</span>
      <span class="dl-sublabel">${sublabel}</span>
    </button>
  `,
    )
    .join("");

  modal.innerHTML = `
    <div class="modal-card dl-modal-card">
      <div class="modal-header">
        <h2><i data-lucide="download"></i> تحميل الإمتحان</h2>
        <button class="close-btn dl-close" aria-label="إغلاق"><i data-lucide="x"></i></button>
      </div>
      <p class="dl-subtitle">اختر صيغة التحميل</p>
      <div class="dl-grid">${optionsHtml}</div>
    </div>
  `;

  modal.querySelector(".dl-close").onclick = () => modal.remove();
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  modal.querySelectorAll(".dl-option-btn").forEach((btn) => {
    btn.onclick = () => {
      modal.remove();
      doExport(btn.dataset.format);
    };
  });

  document.body.appendChild(modal);
  if (typeof lucide !== "undefined") lucide.createIcons();
};

// ============================================================================
// SAVE LOCALLY
// ============================================================================

window.saveLocally = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    showNotification(
      "خطأ في التحقق",
      "الرجاء إصلاح الأخطاء التالية:\n\n" + errors.join("\n"),
      "error",
    );
    return;
  }

  showLoading("جاري الحفظ...");

  setTimeout(() => {
    let quizId;
    if (editingQuizId) {
      quizId = updateInUserQuizzes(editingQuizId, quizData);
    } else {
      quizId = saveToUserQuizzes(quizData);
    }
    hideLoading();

    if (quizId) {
      showNotification(
        "تم الحفظ!",
        'يمكنك العثور عليه في "إمتحاناتك"',
        "success",
      );
      if (editingQuizId) {
        setTimeout(() => (window.location.href = "index.html"), 1000);
      }
    } else {
      showNotification("خطأ", "فشل حفظ الاختبار", "error");
    }
  }, 500);
};

// ============================================================================
// EMAIL TO DEVELOPER
// ============================================================================

window.emailQuizToDeveloper = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    showNotification(
      "خطأ في التحقق",
      "الرجاء إصلاح الأخطاء التالية:\n\n" + errors.join("\n"),
      "error",
    );
    return;
  }

  try {
    showNotification(
      "جاري الإرسال...",
      "سيتم فتح تطبيق البريد الإلكتروني",
      "info",
    );

    const exportQuestions = quizData.questions.map((q) => {
      const question = { q: q.q, options: q.options, correct: q.correct };
      if (q.image?.trim()) question.image = q.image;
      if (q.explanation?.trim()) question.explanation = q.explanation;
      return question;
    });

    const meta = { title: quizData.title };
    if (quizData.description?.trim()) meta.description = quizData.description;

    const payload = {
      meta,
      questions: exportQuestions,
    };
    const fileContent = JSON.stringify(payload, null, 2);

    const encodedBody = encodeURIComponent(fileContent);
    const mailtoLink = `mailto:${emailAddress}?subject=New Quiz Submission - ${encodeURIComponent(quizData.title)}&body=${encodedBody}`;

    window.location.href = mailtoLink;
  } catch (error) {
    console.error("Error submitting quiz:", error);
    showNotification("خطأ", "فشل إرسال الاختبار", "error");
  }
};

// ============================================================================
// WHATSAPP INTEGRATION
// ============================================================================

window.sendToWhatsApp = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    showNotification(
      "خطأ في التحقق",
      "الرجاء إصلاح الأخطاء التالية:\n\n" + errors.join("\n"),
      "error",
    );
    return;
  }

  const exportQuestions = quizData.questions.map((q) => {
    const question = { q: q.q, options: q.options, correct: q.correct };
    if (q.image?.trim()) question.image = q.image;
    if (q.explanation?.trim()) question.explanation = q.explanation;
    return question;
  });

  const meta = { title: quizData.title };
  if (quizData.description?.trim()) meta.description = quizData.description;

  const payload = {
    meta,
    questions: exportQuestions,
  };
  const fileContent = JSON.stringify(payload, null, 2);

  const message = `*New Quiz Submission*\n\n*Title:* ${quizData.title}\n*Description:* ${quizData.description || "N/A"}\n*Questions:* ${quizData.questions.length}\n*Created:* ${new Date().toLocaleString()}\n\n${fileContent}`;

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");

  showNotification("جاري فتح واتساب...", "+20 111 848 21 93", "info");
};

// ============================================================================
// PREVIEW
// ============================================================================

window.previewQuiz = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    showNotification(
      "خطأ في التحقق",
      "الرجاء إصلاح الأخطاء التالية:\n\n" + errors.join("\n"),
      "error",
    );
    return;
  }

  const modal = document.getElementById("previewModal");
  const content = document.getElementById("previewContent");

  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="margin: 0 0 10px 0;">${escapeHtml(quizData.title)}</h2>
      ${quizData.description ? `<p style="color: var(--color-text-secondary); margin: 0;">${escapeHtml(quizData.description)}</p>` : ""}
    </div>
  `;

  quizData.questions.forEach((q, index) => {
    html += `
      <div class="preview-question">
        <h4>السؤال ${index + 1}: ${renderMarkdown(q.q)}</h4>
        ${q.image ? `<img src="${escapeHtml(q.image)}" class="preview-image" alt="صورة السؤال" onerror="this.style.display='none'">` : ""}
        <ul class="preview-options">
          ${q.options
            .map(
              (opt, i) =>
                `<li class="${i === q.correct ? "correct" : ""}">${renderMarkdown(opt)}${i === q.correct ? " ✓" : ""}</li>`,
            )
            .join("")}
        </ul>
        ${q.explanation ? `<div class="preview-explanation"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em;margin-left:4px"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> ${renderMarkdown(q.explanation)}</div>` : ""}
      </div>
    `;
  });

  content.innerHTML = html;
  modal.style.display = "flex";
};

window.closePreview = function () {
  const modal = document.getElementById("previewModal");
  modal.style.display = "none";
};

// ============================================================================
// IMPORT QUESTIONS
// ============================================================================

window.importQuestions = function () {
  const modal = document.getElementById("importModal");
  modal.style.display = "flex";
  setupImportDropzone();
};

window.closeImportModal = function () {
  const modal = document.getElementById("importModal");
  modal.style.display = "none";
  document.getElementById("importTextarea").value = "";
  const fileInput = document.getElementById("importFileInput");
  if (fileInput) fileInput.value = "";
  const fileLabel = document.getElementById("importFileLabel");
  if (fileLabel) fileLabel.textContent = "لم يتم اختيار أي ملف";
};

function setupImportDropzone() {
  const dropzone = document.getElementById("importDropzone");
  if (!dropzone || dropzone.dataset.dropReady) return;
  dropzone.dataset.dropReady = "1";

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-active");
  });
  dropzone.addEventListener("dragleave", () =>
    dropzone.classList.remove("drag-active"),
  );
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-active");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = document.getElementById("importFileInput");
      // Can't set files directly, so read them here
      handleDroppedFiles(files);
    }
  });
}

function handleDroppedFiles(files) {
  const label = document.getElementById("importFileLabel");
  if (label) {
    label.textContent = Array.from(files)
      .map((f) => f.name)
      .join(", ");
  }
  // Store for processImport — use a module-level variable
  window._droppedImportFiles = files;
}

window.processImport = async function () {
  const textarea = document.getElementById("importTextarea");
  const fileInput = document.getElementById("importFileInput");
  const content = textarea.value.trim();
  const files =
    window._droppedImportFiles ||
    (fileInput && fileInput.files.length > 0 ? fileInput.files : null);

  if (!content && (!files || files.length === 0)) {
    showNotification(
      "خطأ",
      "الرجاء إدخال محتوى أو اختيار ملف للاستيراد",
      "error",
    );
    return;
  }

  showLoading("جاري الاستيراد...");

  try {
    let allImportedQuestions = [];
    let savedQuizzesCount = 0;

    // Process file uploads
    if (files && files.length > 0) {
      for (const file of files) {
        const text = await file.text();
        // Derive default title from filename
        const defaultTitle = file.name
          .replace(/\.(json|txt)$/i, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const parsed = parseImportContent(text, defaultTitle);
        allImportedQuestions = allImportedQuestions.concat(parsed.questions);

        // If meta found, save as a separate quiz in library
        if (parsed.meta) {
          const existingQuizzes = JSON.parse(
            localStorage.getItem("user_quizzes") || "[]",
          );
          const quizId = `user_quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          existingQuizzes.push({
            id: quizId,
            title: parsed.meta.title || defaultTitle,
            description: parsed.meta.description || "",
            questions: parsed.questions,
            createdAt: new Date().toISOString(),
            author: "Imported",
          });
          localStorage.setItem("user_quizzes", JSON.stringify(existingQuizzes));
          savedQuizzesCount++;
        }

        // Also apply title to current quiz if blank
        if (!quizData.title && parsed.meta) {
          quizData.title = parsed.meta.title || defaultTitle;
          quizData.description = parsed.meta.description || "";
          const titleEl = document.getElementById("quizTitle");
          const descEl = document.getElementById("quizDescription");
          if (titleEl) {
            titleEl.value = quizData.title;
            updateCharCount("titleCharCount", quizData.title.length, 100);
          }
          if (descEl) {
            descEl.value = quizData.description;
            updateCharCount("descCharCount", quizData.description.length, 500);
          }
        }
      }
      // Clear dropped files
      window._droppedImportFiles = null;
    }

    // Process pasted content
    if (content) {
      const parsed = parseImportContent(content);
      allImportedQuestions = allImportedQuestions.concat(parsed.questions);
      if (!quizData.title && parsed.meta) {
        quizData.title = parsed.meta.title || "";
        quizData.description = parsed.meta.description || "";
        const titleEl = document.getElementById("quizTitle");
        const descEl = document.getElementById("quizDescription");
        if (titleEl) {
          titleEl.value = quizData.title;
          updateCharCount("titleCharCount", quizData.title.length, 100);
        }
        if (descEl) {
          descEl.value = quizData.description;
          updateCharCount("descCharCount", quizData.description.length, 500);
        }
      }
    }

    // Add questions to current quiz
    allImportedQuestions.forEach((q) => {
      const questionId = ++questionIdCounter;
      const question = {
        id: questionId,
        q: q.q || "",
        options: q.options || ["", ""],
        correct: q.correct || 0,
        image: q.image || "",
        explanation: q.explanation || "",
      };
      quizData.questions.push(question);
      renderQuestion(question);
    });

    updateEmptyState();
    updateProgress();
    updateStatistics();
    autosave();

    hideLoading();
    closeImportModal();

    const parts = [];
    if (allImportedQuestions.length > 0)
      parts.push(`استيراد ${allImportedQuestions.length} سؤال`);
    if (savedQuizzesCount > 0)
      parts.push(`حفظ ${savedQuizzesCount} اختبار في المكتبة`);
    showNotification("تم الاستيراد!", parts.join(" و") || "اكتمل", "success");
  } catch (error) {
    hideLoading();
    console.error("Import error:", error);
    showNotification("خطأ في الاستيراد", error.message, "error");
  }
};

/** Parse a string as JSON array/object OR numbered text format */
function parseImportContent(content, defaultTitle = "") {
  const trimmed = content.trim();

  // --- JSON ---
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      if (trimmed.startsWith("{")) {
        const data = JSON.parse(trimmed);
        const questions = Array.isArray(data.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : null;
        const meta =
          data.meta ||
          (data.title
            ? { title: data.title, description: data.description || "" }
            : defaultTitle
              ? { title: defaultTitle }
              : null);
        if (!questions) throw new Error("لا توجد أسئلة في البيانات");
        return { questions, meta };
      } else {
        const questions = JSON.parse(trimmed);
        if (!Array.isArray(questions)) throw new Error("ليست مصفوفة");
        const meta = defaultTitle ? { title: defaultTitle } : null;
        return { questions, meta };
      }
    } catch (e) {
      throw new Error("JSON غير صحيح: " + e.message);
    }
  }

  // --- Numbered text format ---
  // 1. Question text
  // A. option / B. option
  // Correct: A
  // Explanation: ...
  const questions = [];
  const blocks = trimmed.split(/(?=^\d+\.)/m);

  for (const block of blocks) {
    const lines = block
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    const firstMatch = lines[0].match(/^\d+\.\s*(.*)/);
    if (!firstMatch) continue;

    let q = firstMatch[1].trim();
    // Collect multi-line question text until first option
    let lineIdx = 1;
    while (
      lineIdx < lines.length &&
      !lines[lineIdx].match(/^[A-Eأ-ي][.)]\s*/)
    ) {
      if (
        lines[lineIdx].match(
          /^(?:Correct|الصحيح|الإجابة|Explanation|الشرح)\s*[:\-]/i,
        )
      )
        break;
      q += "\n" + lines[lineIdx];
      lineIdx++;
    }

    const options = [];
    const optionLetters = [];
    let correct = 0;
    let explanation = "";

    for (let i = lineIdx; i < lines.length; i++) {
      const line = lines[i];
      const optMatch = line.match(/^([A-Eأ-ي])[.)]\s*(.*)/);
      if (optMatch) {
        optionLetters.push(optMatch[1].toUpperCase());
        options.push(optMatch[2].trim());
        continue;
      }

      const correctMatch = line.match(
        /^(?:Correct|الصحيح|الإجابة الصحيحة|Answer)\s*[:\-]\s*(.+)/i,
      );
      if (correctMatch) {
        const letter = correctMatch[1].trim().charAt(0).toUpperCase();
        const idx = optionLetters.indexOf(letter);
        correct = idx >= 0 ? idx : 0;
        continue;
      }

      const expMatch = line.match(
        /^(?:Explanation|الشرح|شرح|Reason)\s*[:\-]\s*(.*)/i,
      );
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }
    }

    if (q)
      questions.push({
        q: q.trim(),
        options: options.length ? options : [""],
        correct,
        explanation,
      });
  }

  if (!questions.length)
    throw new Error("التنسيق غير مدعوم. الرجاء لصق JSON أو نص مرقّم.");
  return { questions, meta: defaultTitle ? { title: defaultTitle } : null };
}

// ============================================================================
// RESET PAGE
// ============================================================================

window.resetPage = async function () {
  if (
    !(await confirmationNotification(
      "هل أنت متأكد من إعادة ضبط الصفحة؟ سيتم حذف جميع البيانات!",
    ))
  ) {
    return;
  }

  localStorage.removeItem("quiz_draft");

  quizData = {
    title: "",
    description: "",
    questions: [],
  };

  questionIdCounter = 0;

  document.getElementById("quizTitle").value = "";
  document.getElementById("quizDescription").value = "";
  document.getElementById("questionsContainer").innerHTML = "";

  updateCharCount("titleCharCount", 0, 100);
  updateCharCount("descCharCount", 0, 500);
  updateEmptyState();
  updateProgress();
  updateStatistics();

  showNotification("تم إعادة الضبط", "تم مسح جميع البيانات", "success");
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showLoading(text = "جاري التحميل...") {
  const overlay = document.getElementById("loadingOverlay");
  const loadingText = document.getElementById("loadingText");
  if (overlay && loadingText) {
    loadingText.textContent = text;
    overlay.style.display = "flex";
  }
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}
