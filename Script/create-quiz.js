// Script/create-quiz.js - Enhanced Quiz Creator with Integrated Storage

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let quizData = {
  title: "",
  description: "",
  questions: [],
};

let questionIdCounter = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadDraftFromLocalStorage();
  updateEmptyState();

  // Add event listeners for metadata
  document.getElementById("quizTitle").addEventListener("input", (e) => {
    quizData.title = e.target.value;
    autosave();
  });

  document.getElementById("quizDescription").addEventListener("input", (e) => {
    quizData.description = e.target.value;
    autosave();
  });
});

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
  autosave();

  setTimeout(() => {
    const questionCard = document.getElementById(`question-${questionId}`);
    if (questionCard) {
      questionCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
};

window.removeQuestion = function (questionId) {
  if (!confirm("Are you sure you want to delete this question?")) {
    return;
  }

  const index = quizData.questions.findIndex((q) => q.id === questionId);
  if (index !== -1) {
    quizData.questions.splice(index, 1);

    const questionCard = document.getElementById(`question-${questionId}`);
    if (questionCard) {
      questionCard.remove();
    }

    updateEmptyState();
    autosave();
  }
};

function renderQuestion(question) {
  const container = document.getElementById("questionsContainer");
  const questionNumber =
    quizData.questions.findIndex((q) => q.id === question.id) + 1;

  const questionCard = document.createElement("div");
  questionCard.className = "question-card";
  questionCard.id = `question-${question.id}`;

  questionCard.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${questionNumber}</span>
            <div class="question-actions">
                <button class="btn-icon btn-delete" onclick="removeQuestion(${question.id})" title="Delete Question">
                    🗑️
                </button>
            </div>
        </div>
        
        <div class="form-group">
            <label>Question Text *</label>
            <textarea 
                id="question-text-${question.id}" 
                rows="3" 
                placeholder="Enter your question here..."
                required
            >${escapeHtml(question.q)}</textarea>
        </div>
        
        <div class="form-group">
            <label>Answer Options *</label>
            <div id="options-container-${question.id}" class="options-list">
                ${renderOptions(question)}
            </div>
            <button class="add-option-btn" onclick="addOption(${question.id})">
                ➕ Add Option
            </button>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleCollapsible(${question.id}, 'image')">
                <h4>🖼️ Image (Optional)</h4>
                <span class="collapsible-toggle" id="toggle-image-${question.id}">▼</span>
            </div>
            <div class="collapsible-content" id="content-image-${question.id}">
                <div class="form-group">
                    <label>Image URL or Path</label>
                    <input 
                        type="text" 
                        id="question-image-${question.id}" 
                        placeholder="https://example.com/image.jpg or ./path/to/image.jpg"
                        value="${escapeHtml(question.image || "")}"
                    />
                    <small class="text-muted">Supports web URLs (https://) or relative paths (./images/)</small>
                </div>
            </div>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleCollapsible(${question.id}, 'explanation')">
                <h4>💡 Explanation (Optional)</h4>
                <span class="collapsible-toggle" id="toggle-explanation-${question.id}">▼</span>
            </div>
            <div class="collapsible-content" id="content-explanation-${question.id}">
                <div class="form-group">
                    <label>Answer Explanation</label>
                    <textarea 
                        id="question-explanation-${question.id}" 
                        rows="3" 
                        placeholder="Provide an explanation for the correct answer..."
                    >${escapeHtml(question.explanation || "")}</textarea>
                </div>
            </div>
        </div>
    `;

  container.appendChild(questionCard);
  setupQuestionEventListeners(question.id);
}

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
    imageInput.addEventListener("input", (e) => {
      updateQuestionData(questionId, "image", e.target.value);
    });
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

function updateQuestionData(questionId, field, value) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question) {
    question[field] = value;
    autosave();
  }
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
                title="Mark as correct answer"
            />
            <input 
                type="text" 
                class="option-input" 
                value="${escapeHtml(option)}"
                placeholder="Option ${index + 1}"
                oninput="updateOption(${question.id}, ${index}, this.value)"
                required
            />
            ${
              question.options.length > 1
                ? `
                <button class="option-delete" onclick="removeOption(${question.id}, ${index})" title="Delete option">
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
    autosave();
  }
};

window.removeOption = function (questionId, optionIndex) {
  const question = quizData.questions.find((q) => q.id === questionId);
  if (question && question.options.length > 1) {
    question.options.splice(optionIndex, 1);

    if (question.correct >= question.options.length) {
      question.correct = question.options.length - 1;
    } else if (question.correct > optionIndex) {
      question.correct--;
    }

    rerenderOptions(questionId);
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

    const container = document.getElementById(
      `options-container-${questionId}`,
    );
    if (container) {
      container.querySelectorAll(".option-item").forEach((item, index) => {
        if (index === optionIndex) {
          item.classList.add("correct");
        } else {
          item.classList.remove("correct");
        }
      });
    }

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
      content.classList.remove("open");
      toggle.classList.remove("open");
    } else {
      content.classList.add("open");
      toggle.classList.add("open");
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function updateEmptyState() {
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    if (quizData.questions.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }
  }
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function validateQuiz() {
  const errors = [];

  if (!quizData.title.trim()) {
    errors.push("Quiz title is required");
  }

  if (quizData.questions.length === 0) {
    errors.push("At least one question is required");
  }

  quizData.questions.forEach((q, index) => {
    if (!q.q.trim()) {
      errors.push(`Question ${index + 1}: Question text is required`);
    }

    if (q.options.some((opt) => !opt.trim())) {
      errors.push(`Question ${index + 1}: All options must have text`);
    }

    if (q.options.length < 1) {
      errors.push(`Question ${index + 1}: At least one option is required`);
    }
  });

  return errors;
}

// ============================================================================
// PREVIEW FUNCTIONALITY
// ============================================================================

window.previewQuiz = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    alert("Please fix the following errors:\n\n" + errors.join("\n"));
    return;
  }

  const modal = document.getElementById("previewModal");
  const content = document.getElementById("previewContent");

  if (!modal || !content) return;

  let previewHTML = `
        <div class="preview-header">
            <h2>${escapeHtml(quizData.title)}</h2>
            ${quizData.description ? `<p>${escapeHtml(quizData.description)}</p>` : ""}
            <p class="text-muted">Total Questions: ${quizData.questions.length}</p>
        </div>
        <hr style="border: none; border-top: 2px solid var(--color-border); margin: 20px 0;">
    `;

  quizData.questions.forEach((q, index) => {
    previewHTML += `
            <div class="preview-question">
                <h4>Question ${index + 1}: ${escapeHtml(q.q)}</h4>
                
                ${q.image ? `<img src="${escapeHtml(q.image)}" alt="Question image" class="preview-image" onerror="this.style.display='none'">` : ""}
                
                <ul class="preview-options">
                    ${q.options
                      .map(
                        (opt, optIndex) => `
                        <li class="${optIndex === q.correct ? "correct" : ""}">
                            ${optIndex === q.correct ? "✓ " : ""}${escapeHtml(opt)}
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
                
                ${
                  q.explanation
                    ? `
                    <div class="preview-explanation">
                        <strong>💡 Explanation:</strong> ${escapeHtml(q.explanation)}
                    </div>
                `
                    : ""
                }
            </div>
        `;
  });

  content.innerHTML = previewHTML;
  modal.style.display = "flex";
};

window.closePreview = function () {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.style.display = "none";
  }
};

// ============================================================================
// SAVE & EXPORT FUNCTIONALITY
// ============================================================================

let autosaveTimeout;
function autosave() {
  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(() => {
    saveToLocalStorage(true);
  }, 1000);
}

window.saveToLocalStorage = function (silent = false) {
  try {
    // Save draft
    const saveData = {
      ...quizData,
      lastSaved: new Date().toISOString(),
    };

    localStorage.setItem("quiz_creator_draft", JSON.stringify(saveData));

    if (!silent) {
      showNotification("✅ Draft saved successfully!", "success");
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    if (!silent) {
      showNotification("❌ Error saving draft", "error");
    }
  }
};

function loadDraftFromLocalStorage() {
  try {
    const saved = localStorage.getItem("quiz_creator_draft");
    if (saved) {
      const data = JSON.parse(saved);

      if (data.title) {
        quizData.title = data.title;
        document.getElementById("quizTitle").value = data.title;
      }

      if (data.description) {
        quizData.description = data.description;
        document.getElementById("quizDescription").value = data.description;
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
        showNotification("📂 Draft loaded", "info");
      }
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
}

function saveToUserQuizzes(quizToSave) {
  try {
    // Get existing user quizzes
    const existingQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );

    // Generate unique ID
    const quizId = `user_quiz_${Date.now()}`;

    // Create quiz object with metadata
    const newQuiz = {
      id: quizId,
      title: quizToSave.title,
      description: quizToSave.description,
      questions: quizToSave.questions,
      createdAt: new Date().toISOString(),
      author: "User Created",
    };

    // Add to array
    existingQuizzes.push(newQuiz);

    // Save back to localStorage
    localStorage.setItem("user_quizzes", JSON.stringify(existingQuizzes));

    return quizId;
  } catch (error) {
    console.error("Error saving quiz:", error);
    return null;
  }
}

window.exportQuiz = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    alert(
      "Please fix the following errors before exporting:\n\n" +
        errors.join("\n"),
    );
    return;
  }

  // Save to user_quizzes
  const quizId = saveToUserQuizzes(quizData);

  if (!quizId) {
    showNotification("❌ Error saving quiz", "error");
    return;
  }

  // Convert to export format
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

  // Generate file content
  const fileContent = `// ${quizData.title}${quizData.description ? "\n// " + quizData.description : ""}
// Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

export const questions = ${JSON.stringify(exportQuestions, null, 2)};
`;

  // Download file
  const blob = new Blob([fileContent], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(quizData.title)}.js`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("✅ Quiz saved and exported!", "success");
};

// ============================================================================
// SUBMIT TO PLATFORM (Via API)
// ============================================================================

window.submitQuiz = async function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    alert(
      "Please fix the following errors before submitting:\n\n" +
        errors.join("\n"),
    );
    return;
  }

  // Save to user_quizzes first
  const quizId = saveToUserQuizzes(quizData);

  if (!quizId) {
    showNotification("❌ Error saving quiz", "error");
    return;
  }

  try {
    showNotification("📤 Submitting quiz...", "info");

    // Prepare quiz data
    const exportQuestions = quizData.questions.map((q) => {
      const question = { q: q.q, options: q.options, correct: q.correct };
      if (q.image && q.image.trim()) question.image = q.image;
      if (q.explanation && q.explanation.trim())
        question.explanation = q.explanation;
      return question;
    });

    const quizSubmission = {
      title: quizData.title,
      description: quizData.description,
      questions: exportQuestions,
      createdAt: new Date().toISOString(),
    };

    // Submit via API
    const response = await fetch("/api/send-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizSubmission),
    });

    if (!response.ok) {
      throw new Error("Failed to submit quiz");
    }

    const result = await response.json();

    showNotification("✅ Quiz submitted successfully!", "success");

    // Clear draft
    localStorage.removeItem("quiz_creator_draft");

    // Reset form after a delay
    setTimeout(() => {
      if (confirm("Quiz submitted! Would you like to create another quiz?")) {
        location.reload();
      } else {
        window.location.href = "index.html";
      }
    }, 2000);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    showNotification("❌ Error submitting quiz. Please try again.", "error");
  }
};

// ============================================================================
// WHATSAPP INTEGRATION
// ============================================================================

window.sendToWhatsApp = function () {
  const errors = validateQuiz();

  if (errors.length > 0) {
    alert(
      "Please fix the following errors before sending:\n\n" + errors.join("\n"),
    );
    return;
  }

  // Save to user_quizzes
  const quizId = saveToUserQuizzes(quizData);

  if (!quizId) {
    showNotification("❌ Error saving quiz", "error");
    return;
  }

  // Convert to export format
  const exportQuestions = quizData.questions.map((q) => {
    const question = { q: q.q, options: q.options, correct: q.correct };
    if (q.image && q.image.trim()) question.image = q.image;
    if (q.explanation && q.explanation.trim())
      question.explanation = q.explanation;
    return question;
  });

  // Generate file content
  const fileContent = `// ${quizData.title}
// ${quizData.description || ""}

export const questions = ${JSON.stringify(exportQuestions, null, 2)};`;

  // Create WhatsApp message
  const message = `📝 *New Quiz Submission*

*Title:* ${quizData.title}
*Description:* ${quizData.description || "N/A"}
*Questions:* ${quizData.questions.length}
*Created:* ${new Date().toLocaleString()}

--- QUIZ DATA ---
${fileContent}
--- END ---`;

  // WhatsApp URL (international format without +)
  const phoneNumber = "201118482193"; // Your number
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp
  window.open(whatsappUrl, "_blank");

  showNotification("📱 Opening WhatsApp...", "info");
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function sanitizeFilename(filename) {
  return (
    filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50) || "quiz"
  );
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === "success" ? "var(--color-success)" : type === "error" ? "var(--color-error)" : "var(--color-primary)"};
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
