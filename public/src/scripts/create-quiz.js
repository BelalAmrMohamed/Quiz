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
// MARKDOWN RENDERER
// ============================================================================

function renderMarkdown(str) {
  if (!str) return "";
  const codeBlocks = [];
  // 1. Extract fenced code blocks
  str = str.replace(/```([\s\S]*?)```/g, (_, code) => {
    const idx = codeBlocks.length;
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre class="code-block"><code>${escaped.trim()}</code></pre>`,
    );
    return `\x00CODE${idx}\x00`;
  });
  // 2. Escape HTML
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  // 3. Inline code
  str = str.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  // 4. Bold
  str = str.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // 5. Italic
  str = str.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // 6. Newlines -> <br>
  str = str.replace(/\n/g, "<br>");
  // 7. Restore code blocks
  return str.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);
}

// Attach live markdown preview to a textarea
function attachMarkdownPreview(textarea, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const updatePreview = () => {
    const val = textarea.value;
    if (val.trim()) {
      preview.innerHTML = renderMarkdown(val);
      preview.style.display = "block";
    } else {
      preview.innerHTML = "";
      preview.style.display = "none";
    }
  };

  textarea.addEventListener("input", updatePreview);
  // Initial render
  updatePreview();
}

// Triple-backtick + Enter shortcut: wrap cursor in a code block
function attachBacktickShortcut(textarea) {
  textarea.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const val = textarea.value;
    const pos = textarea.selectionStart;
    // Check if the last 3 chars before cursor are ```
    if (pos >= 3 && val.slice(pos - 3, pos) === "```") {
      e.preventDefault();
      const before = val.slice(0, pos);
      const after = val.slice(pos);
      const insertion = "\n\n```";
      textarea.value = before + insertion + after;
      // Place cursor between the two ``` blocks
      const newPos = pos + 1; // right after the first newline, inside the block
      textarea.setSelectionRange(newPos, newPos);
      textarea.dispatchEvent(new Event("input"));
    }
  });
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
      const textarea = questionCard.querySelector("textarea");
      if (textarea) textarea.focus();
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
        <div class="question-header">
            <span class="question-number">
                ${bulkModeActive ? `<input type="checkbox" class="question-select-checkbox" onchange="handleQuestionSelect(event, ${question.id})">` : ""}
                <span class="drag-handle" title="اسحب لإعادة الترتيب"><i data-lucide="grip-vertical"></i></span>
                سؤال ${questionNumber}
            </span>
            <div class="question-actions">
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
        
        <div class="form-group">
            <label>نصّ السؤال *</label>
            <textarea 
                id="question-text-${question.id}" 
                rows="3" 
                placeholder="أدخل سؤالك هنا..."
                required
                aria-required="true"
            >${escapeHtml(question.q.replace(/\\n/g, "\n"))}</textarea>
            <div class="markdown-preview" id="md-preview-q-${question.id}"></div>
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
                        type="url" 
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
                    <textarea 
                        id="question-explanation-${question.id}" 
                        rows="3" 
                        placeholder="قدم تفسيرًا للإجابة الصحيحة..."
                    >${escapeHtml((question.explanation || "").replace(/\\n/g, "\n"))}</textarea>
                    <div class="markdown-preview" id="md-preview-exp-${question.id}"></div>
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

  // Auto-resize option textareas after render
  setTimeout(() => {
    questionCard.querySelectorAll(".option-textarea").forEach((ta) => {
      autoResizeTextarea(ta);
    });
  }, 0);

  // Load image preview if exists
  if (question.image) {
    updateImagePreview(question.id, question.image);
  }

  // Re-initialize Lucide icons for newly injected HTML
  if (typeof lucide !== "undefined") lucide.createIcons();
}

window.toggleQuestionCollapse = function (questionId) {
  const card = document.getElementById(`question-${questionId}`);
  if (!card) return;

  card.classList.toggle("collapsed");

  const isCollapsed = card.classList.contains("collapsed");
  const numberSpan = card.querySelector(".question-number");

  if (isCollapsed) {
    const question = quizData.questions.find((q) => q.id === questionId);
    const previewText = question && question.q
      ? ": " + question.q.slice(0, 80) + (question.q.length > 80 ? "..." : "")
      : "";
    // Update number span to show preview (preserve drag handle)
    const dragHandle = numberSpan.querySelector(".drag-handle");
    const checkbox = numberSpan.querySelector(".question-select-checkbox");
    const questionIndex = quizData.questions.findIndex((q) => q.id === questionId) + 1;
    numberSpan.innerHTML = "";
    if (checkbox) numberSpan.appendChild(checkbox);
    if (dragHandle) numberSpan.appendChild(dragHandle);
    const textNode = document.createTextNode(`سؤال ${questionIndex}${previewText}`);
    numberSpan.appendChild(textNode);
  } else {
    // Restore normal header (without preview text)
    updateQuestionNumbers();
  }
};

function setupQuestionEventListeners(questionId) {
  const questionTextarea = document.getElementById(
    `question-text-${questionId}`,
  );
  if (questionTextarea) {
    questionTextarea.addEventListener("input", (e) => {
      updateQuestionData(questionId, "q", e.target.value);
    });
    attachMarkdownPreview(questionTextarea, `md-preview-q-${questionId}`);
    attachBacktickShortcut(questionTextarea);
  }

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

  const explanationTextarea = document.getElementById(
    `question-explanation-${questionId}`,
  );
  if (explanationTextarea) {
    explanationTextarea.addEventListener("input", (e) => {
      updateQuestionData(questionId, "explanation", e.target.value);
    });
    attachMarkdownPreview(explanationTextarea, `md-preview-exp-${questionId}`);
    attachBacktickShortcut(explanationTextarea);
  }
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
    const questionCard = document.getElementById(`question-${question.id}`);
    if (questionCard) {
      const numberSpan = questionCard.querySelector(".question-number");
      if (numberSpan) {
        const dragHandle = numberSpan.querySelector(".drag-handle");
        numberSpan.innerHTML = `سؤال ${index + 1}`;
        if (dragHandle) {
          numberSpan.insertBefore(dragHandle, numberSpan.firstChild);
        }
      }
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
    .map(
      (option, index) => `
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
            <textarea 
                class="option-input option-textarea" 
                placeholder="إختيار ${index + 1}"
                oninput="updateOption(${question.id}, ${index}, this.value); autoResizeTextarea(this);"
                required
                rows="1"
                aria-label="نص الخيار ${index + 1}"
            >${escapeHtml(option.replace(/\\n/g, "\n"))}</textarea>
            ${
              question.options.length > 1
                ? `
                <button class="option-delete" onclick="removeOption(${question.id}, ${index})" title="حذف الخيار" aria-label="حذف الخيار ${index + 1}">
                    <i data-lucide="x"></i>
                </button>
            `
                : ""
            }
        </div>
    `,
    )
    .join("");
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
      // Auto-resize all option textareas
      container.querySelectorAll(".option-textarea").forEach((ta) => {
        autoResizeTextarea(ta);
      });
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

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
    const questionText = card.querySelector("textarea").value.toLowerCase();
    const matches = questionText.includes(searchTerm);
    card.style.display = matches ? "block" : "none";
    if (matches) visibleCount++;
  });

  // Show message if no results
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
      const textA = a.querySelector("textarea").value.toLowerCase();
      const textB = b.querySelector("textarea").value.toLowerCase();
      return textA.localeCompare(textB, "ar");
    } else if (type === "recent") {
      const idA = parseInt(a.dataset.questionId);
      const idB = parseInt(b.dataset.questionId);
      return idB - idA; // Most recent first
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
      const textarea = questionCard.querySelector("textarea");
      if (textarea) textarea.focus();

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
      // Normalize actual newlines in textarea values back to \n strings for storage
      const questionsToSave = quizData.questions.map((q) => ({
        ...q,
        q: q.q,  // already stored as-is (with real newlines)
        options: q.options,
        explanation: q.explanation,
      }));

      const dataToSave = {
        title: quizData.title,
        description: quizData.description,
        questions: questionsToSave,
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

  // Build the config and questions arrays for export modules
  const config = {
    title: quizData.title,
    description: quizData.description,
  };

  const exportQuestions = quizData.questions.map((q) => {
    const question = {
      q: q.q,
      options: q.options,
      correct: q.correct,
    };
    if (q.image && q.image.trim()) question.image = q.image;
    if (q.explanation && q.explanation.trim()) question.explanation = q.explanation;
    return question;
  });

  const handleExport = async (format) => {
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
          const payload = { title: quizData.title, description: quizData.description, questions: exportQuestions };
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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
      showNotification("تم التحميل!", "تم تحميل الملف بنجاح", "success");
    } catch (err) {
      hideLoading();
      console.error("Export error:", err);
      showNotification("خطأ", "حدث خطأ أثناء التصدير", "error");
    }
  };

  // Build download popup
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "downloadModalTitle");

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";

  const h2 = document.createElement("h2");
  h2.id = "downloadModalTitle";
  h2.innerHTML = `<i data-lucide="download"></i> تحميل الإمتحان`;

  const p = document.createElement("p");
  p.textContent = "اختر صيغة التحميل";

  const grid = document.createElement("div");
  grid.className = "mode-grid";
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", "خيارات التحميل");

  const downloadOpts = [
    ["./favicon.png", "Quiz (.html)", "quiz"],
    ["./assets/images/HTML_Icon.png", "HTML (.html)", "html"],
    ["./assets/images/mardownIcon.png", "Markdown (.md)", "md"],
    ["./assets/images/PDF_Icon.png", "PDF (.pdf)", "pdf"],
    ["./assets/images/pptx_icon.png", "PowerPoint (.pptx)", "pptx"],
    ["./assets/images/word_icon.png", "Word (.docx)", "docx"],
  ];

  downloadOpts.forEach(([icon, label, format]) => {
    const b = document.createElement("button");
    b.className = "mode-btn";
    b.type = "button";
    b.setAttribute("aria-label", `تنزيل كـ ${label}`);
    // Try icon image, fall back gracefully
    b.innerHTML = `<img src="${icon}" alt="" class="icon" aria-hidden="true" onerror="this.style.display='none'"><strong>${label}</strong>`;
    b.onclick = (ev) => {
      ev.stopPropagation();
      modal.remove();
      handleExport(format);
    };
    grid.appendChild(b);
  });

  // JSON button
  const jsonBtn = document.createElement("button");
  jsonBtn.className = "mode-btn";
  jsonBtn.type = "button";
  jsonBtn.setAttribute("aria-label", "تنزيل JSON (.json)");
  jsonBtn.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg><strong>JSON (.json)</strong>`;
  jsonBtn.onclick = (ev) => {
    ev.stopPropagation();
    modal.remove();
    handleExport("json");
  };
  grid.appendChild(jsonBtn);

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.type = "button";
  closeBtn.textContent = "إلغاء";
  closeBtn.setAttribute("aria-label", "إغلاق النافذة");
  closeBtn.onclick = () => modal.remove();

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  modalCard.appendChild(h2);
  modalCard.appendChild(p);
  modalCard.appendChild(grid);
  modalCard.appendChild(closeBtn);
  modal.appendChild(modalCard);

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

    const payload = {
      title: quizData.title,
      description: quizData.description,
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

  const payload = {
    title: quizData.title,
    description: quizData.description,
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
        <h4>السؤال ${index + 1}: ${escapeHtml(q.q)}</h4>
        ${q.image ? `<img src="${escapeHtml(q.image)}" class="preview-image" alt="صورة السؤال" onerror="this.style.display='none'">` : ""}
        <ul class="preview-options">
          ${q.options
            .map(
              (opt, i) =>
                `<li class="${i === q.correct ? "correct" : ""}">${escapeHtml(opt)}${i === q.correct ? " ✓" : ""}</li>`,
            )
            .join("")}
        </ul>
        ${q.explanation ? `<div class="preview-explanation"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em;margin-left:4px"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> ${escapeHtml(q.explanation)}</div>` : ""}
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

window.processImport = async function () {
  const textarea = document.getElementById("importTextarea");
  const fileInput = document.getElementById("importFileInput");
  const content = textarea.value.trim();
  const files = fileInput ? fileInput.files : null;

  if (!content && (!files || files.length === 0)) {
    showNotification("خطأ", "الرجاء إدخال محتوى أو اختيار ملف للاستيراد", "error");
    return;
  }

  showLoading("جاري الاستيراد...");

  try {
    let allImportedQuestions = [];
    let importedCount = 0;

    // Process file uploads
    if (files && files.length > 0) {
      for (const file of files) {
        const text = await file.text();
        const parsed = parseImportContent(text, file.name.replace(/\.json$/, ""));
        if (parsed.questions) {
          allImportedQuestions = allImportedQuestions.concat(parsed.questions);
          // If has meta, save as separate quiz in user_quizzes
          if (parsed.meta) {
            const existingQuizzes = JSON.parse(localStorage.getItem("user_quizzes") || "[]");
            const quizId = `user_quiz_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            existingQuizzes.push({
              id: quizId,
              title: parsed.meta.title || file.name.replace(/\.json$/, ""),
              description: parsed.meta.description || "",
              questions: parsed.questions,
              createdAt: new Date().toISOString(),
              author: "Imported",
            });
            localStorage.setItem("user_quizzes", JSON.stringify(existingQuizzes));
            importedCount++;
          }
        }
      }
    }

    // Process pasted content
    if (content) {
      const parsed = parseImportContent(content);
      if (parsed.questions) {
        allImportedQuestions = allImportedQuestions.concat(parsed.questions);
        if (parsed.meta && !quizData.title) {
          quizData.title = parsed.meta.title || "";
          quizData.description = parsed.meta.description || "";
          const titleEl = document.getElementById("quizTitle");
          const descEl = document.getElementById("quizDescription");
          if (titleEl) titleEl.value = quizData.title;
          if (descEl) descEl.value = quizData.description;
        }
      }
    }

    // Add all questions to current quiz
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

    const msg = allImportedQuestions.length > 0
      ? `تم استيراد ${allImportedQuestions.length} سؤال` +
        (importedCount > 0 ? ` وحفظ ${importedCount} اختبار في مكتبتك` : "")
      : "تم الاستيراد";
    showNotification("تم الاستيراد!", msg, "success");

  } catch (error) {
    hideLoading();
    console.error("Import error:", error);
    showNotification("خطأ في الاستيراد", error.message, "error");
  }
};

// Parse import content (JSON or numbered text format)
function parseImportContent(content, defaultTitle = "") {
  const trimmed = content.trim();

  // Try JSON first
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      if (trimmed.startsWith("{")) {
        const data = JSON.parse(content);
        const questions = Array.isArray(data.questions) ? data.questions : null;
        const meta = data.meta || (data.title ? { title: data.title, description: data.description || "" } : null);
        if (!questions && !Array.isArray(data)) throw new Error("لا توجد أسئلة");
        return { questions: questions || data, meta };
      } else {
        const questions = JSON.parse(content);
        if (!Array.isArray(questions)) throw new Error("ليست مصفوفة");
        return { questions, meta: defaultTitle ? { title: defaultTitle } : null };
      }
    } catch (e) {
      throw new Error("JSON غير صحيح: " + e.message);
    }
  }

  // Try numbered text format:
  // 1. Question text
  // A. option
  // B. option
  // Correct: A
  // Explanation: ...
  const questions = [];
  const blocks = trimmed.split(/\n(?=\d+\.)/);

  for (const block of blocks) {
    const lines = block.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // First line: "1. Question text"
    const firstLineMatch = lines[0].match(/^\d+\.\s*(.*)/);
    if (!firstLineMatch) continue;

    const q = firstLineMatch[1].trim();
    const options = [];
    const optionLetters = [];
    let correct = 0;
    let explanation = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Option line: A. text or A) text
      const optMatch = line.match(/^([A-Eأ-ي])[.)]\s*(.*)/);
      if (optMatch) {
        optionLetters.push(optMatch[1]);
        options.push(optMatch[2].trim());
        continue;
      }

      // Correct answer line
      const correctMatch = line.match(/^(?:Correct|الصحيح|الإجابة)\s*[:\-]\s*(.+)/i);
      if (correctMatch) {
        const letter = correctMatch[1].trim().charAt(0).toUpperCase();
        const idx = optionLetters.findIndex((l) => l.toUpperCase() === letter);
        correct = idx >= 0 ? idx : 0;
        continue;
      }

      // Explanation line
      const expMatch = line.match(/^(?:Explanation|الشرح|شرح)\s*[:\-]\s*(.*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }
    }

    if (q && options.length > 0) {
      questions.push({ q, options, correct, explanation });
    }
  }

  if (questions.length === 0) {
    throw new Error("التنسيق غير مدعوم. الرجاء لصق JSON أو نص بتنسيق مرقّم.");
  }

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

window.autoResizeTextarea = function (textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
};

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