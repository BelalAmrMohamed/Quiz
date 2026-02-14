// src/scripts/create-quiz.js - Enhanced Quiz Creator with Advanced Features

import {
  showNotification,
  confirmationNotification,
} from "../components/notifications.js";

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

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadDraftFromLocalStorage();
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
                <span class="drag-handle" title="اسحب لإعادة الترتيب">⋮⋮</span>
                سؤال ${questionNumber}
            </span>
            <div class="question-actions">
                <button class="btn-icon btn-collapse" onclick="toggleQuestionCollapse(${question.id})" title="طي/توسيع السؤال">
                    ↕️
                </button>
                <button class="btn-icon btn-duplicate" onclick="duplicateQuestion(${question.id})" title="نسخ السؤال">
                    📋
                </button>
                <button class="btn-icon btn-delete" onclick="removeQuestion(${question.id})" title="حذف السؤال">
                    🗑️
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
            >${escapeHtml(question.q)}</textarea>
        </div>
        
        <div class="form-group">
            <label>الإختيارات (إختيار واحد = سؤال مقالي)</label>
            <div id="options-container-${question.id}" class="options-list">
                ${renderOptions(question)}
            </div>
            <button class="add-option-btn" onclick="addOption(${question.id})">
                ➕ إضافة خيار
            </button>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleCollapsible(${question.id}, 'image')">
                <h4>🖼️ صورة (اختيارية)</h4>
                <span class="collapsible-toggle" id="toggle-image-${question.id}">▼</span>
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
                <h4>💡 الشرح (اختياري)</h4>
                <span class="collapsible-toggle" id="toggle-explanation-${question.id}">▼</span>
            </div>
            <div class="collapsible-content" id="content-explanation-${question.id}">
                <div class="form-group">
                    <label>شرح الإجابة الصحيحة</label>
                    <textarea 
                        id="question-explanation-${question.id}" 
                        rows="3" 
                        placeholder="قدم تفسيرًا للإجابة الصحيحة..."
                    >${escapeHtml(question.explanation || "")}</textarea>
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
}

window.toggleQuestionCollapse = function (questionId) {
  const card = document.getElementById(`question-${questionId}`);
  if (card) {
    card.classList.toggle("collapsed");
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
    '<div class="image-loading">⏳ جاري تحميل الصورة...</div>';

  const img = new Image();
  img.onload = function () {
    previewContainer.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="معاينة الصورة" class="image-preview">`;
  };
  img.onerror = function () {
    previewContainer.innerHTML =
      '<div class="image-error">❌ فشل تحميل الصورة. تحقق من الرابط.</div>';
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
            <input 
                type="text" 
                class="option-input" 
                value="${escapeHtml(option)}"
                placeholder="إختيار ${index + 1}"
                oninput="updateOption(${question.id}, ${index}, this.value)"
                required
                aria-label="نص الخيار ${index + 1}"
            />
            ${
              question.options.length > 1
                ? `
                <button class="option-delete" onclick="removeOption(${question.id}, ${index})" title="حذف الخيار" aria-label="حذف الخيار ${index + 1}">
                    ✕
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
    errors.push("❌ عنوان الاختبار مطلوب");
  }

  if (quizData.questions.length === 0) {
    errors.push("❌ يجب إضافة سؤال واحد على الأقل");
  }

  quizData.questions.forEach((q, index) => {
    const questionNum = index + 1;

    if (!q.q || q.q.trim() === "") {
      errors.push(`❌ السؤال ${questionNum}: نص السؤال مطلوب`);
    }

    if (q.options.length > 1) {
      const emptyOptions = q.options.filter((opt) => !opt || opt.trim() === "");
      if (emptyOptions.length > 0) {
        errors.push(
          `❌ السؤال ${questionNum}: جميع الخيارات يجب أن تحتوي على نص`,
        );
      }

      if (q.correct === undefined || q.correct === null) {
        errors.push(`❌ السؤال ${questionNum}: يجب تحديد الإجابة الصحيحة`);
      }
    }

    if (q.image && q.image.trim()) {
      try {
        new URL(q.image);
      } catch {
        errors.push(`❌ السؤال ${questionNum}: رابط الصورة غير صحيح`);
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

  showLoading("جاري تصدير الاختبار...");

  setTimeout(() => {
    try {
      const exportQuestions = quizData.questions.map((q) => {
        const question = {
          q: q.q,
          options: q.options,
          correct: q.correct,
        };

        if (q.image && q.image.trim()) {
          question.image = q.image;
        }

        if (q.explanation && q.explanation.trim()) {
          question.explanation = q.explanation;
        }

        return question;
      });

      const payload = { questions: exportQuestions };
      const fileContent = JSON.stringify(payload, null, 2);

      const blob = new Blob([fileContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quizData.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hideLoading();
      showNotification("تم التصدير!", "تم تحميل ملف الاختبار بنجاح", "success");
    } catch (error) {
      hideLoading();
      showNotification("خطأ", "حدث خطأ أثناء التصدير", "error");
      console.error("Export error:", error);
    }
  }, 500);
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
    const quizId = saveToUserQuizzes(quizData);
    hideLoading();

    if (quizId) {
      showNotification(
        "تم الحفظ!",
        'يمكنك العثور عليه في "إمتحاناتك"',
        "success",
      );
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
      const question = { q: q.q };

      if (q.image && q.image.trim()) question.image = q.image;

      question.options = q.options;
      question.correct = q.correct;

      if (q.explanation && q.explanation.trim())
        question.explanation = q.explanation;

      return question;
    });

    const fileHeader = `// Automated mail - ${quizData.title}.js`;

    let jsonString = JSON.stringify(exportQuestions, null, 2);

    const validKeys = ["q", "image", "options", "correct", "explanation"];
    const keyRegex = new RegExp(`"(${validKeys.join("|")})":`, "g");

    const jsObjectString = jsonString.replace(keyRegex, "$1:");

    const fileContent = `${fileHeader}\n\nexport const questions = ${jsObjectString};`;

    const encodedBody = encodeURIComponent(fileContent);
    const mailtoLink = `mailto:${emailAddress}?subject=New Quiz Submission - ${quizData.title}&body=${encodedBody}`;

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
    if (q.image && q.image.trim()) question.image = q.image;
    if (q.explanation && q.explanation.trim())
      question.explanation = q.explanation;
    return question;
  });

  const fileHeader = `// ${quizData.title}.js`;

  let jsonString = JSON.stringify(exportQuestions, null, 2);

  const validKeys = ["q", "image", "options", "correct", "explanation"];
  const keyRegex = new RegExp(`"(${validKeys.join("|")})":`, "g");

  const jsObjectString = jsonString.replace(keyRegex, "$1:");

  const fileContent = `${fileHeader}\n\nexport const questions = ${jsObjectString};`;

  const message = `*New Quiz Submission*

// *Title:* ${quizData.title}
// *Description:* ${quizData.description || "N/A"}
// *Questions:* ${quizData.questions.length}
// *Created:* ${new Date().toLocaleString()}

${fileContent}`;

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
        ${q.explanation ? `<div class="preview-explanation">💡 ${escapeHtml(q.explanation)}</div>` : ""}
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
};

window.processImport = function () {
  const textarea = document.getElementById("importTextarea");
  const content = textarea.value.trim();

  if (!content) {
    showNotification("خطأ", "الرجاء إدخال محتوى للاستيراد", "error");
    return;
  }

  try {
    showLoading("جاري الاستيراد...");

    let importedQuestions;

    // Try JSON first (e.g. { "questions": [...] } or just [...])
    const trimmed = content.trim();
    if (trimmed.startsWith("{")) {
      const data = JSON.parse(content);
      importedQuestions = data.questions != null ? data.questions : data;
    } else if (trimmed.startsWith("[")) {
      importedQuestions = JSON.parse(content);
    } else {
      // Legacy: JS format export const questions = [...]
      const match = content.match(
        /export\s+const\s+questions\s*=\s*(\[[\s\S]*\])/,
      );
      if (!match)
        throw new Error("تنسيق غير صحيح (JSON أو export const questions)");
      try {
        importedQuestions = eval(`(${match[1]})`);
      } catch (e) {
        throw new Error("تنسيق غير صحيح");
      }
    }

    if (!Array.isArray(importedQuestions)) {
      throw new Error("البيانات المستوردة ليست مصفوفة");
    }

    // Add imported questions
    importedQuestions.forEach((q) => {
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
    showNotification(
      "تم الاستيراد!",
      `تم استيراد ${importedQuestions.length} سؤال`,
      "success",
    );
  } catch (error) {
    hideLoading();
    console.error("Import error:", error);
    showNotification("خطأ في الاستيراد", error.message, "error");
  }
};

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
