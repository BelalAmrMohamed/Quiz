// Script/index.js
import { examList } from "./examManifest.js";

// Ensure these IDs match the HTML exactly
const container = document.getElementById("contentArea");
const title = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");

// Derive categories from manifest entries; fall back to path parsing
const categories = [
  ...new Set(
    examList.map((e) => {
      if (e.category) return e.category;
      const parts = e.path.replace(/\\/g, "/").split("/");
      return parts[parts.length - 2] || "General";
    })
  ),
];

renderCategories();

function renderCategories() {
  if (!title || !container) return; // Safety check

  title.textContent = "Select a Topic"; // 📚
  breadcrumb.style.display = "none";
  container.innerHTML = "";
  container.className = "grid-container";

  categories.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "card category-card";
    card.innerHTML = `
            <div class="icon">📂</div>
            <h3>${cat}</h3>
            <p>${examList.filter((e) => e.category === cat).length} Exams</p>
        `;
    card.onclick = () => renderExams(cat);
    container.appendChild(card);
  });
}

function showModeSelection(examId, examTitle) {
  // Create Modal HTML
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-card">
            <h2>${examTitle}</h2>
            <p>Select a study mode:</p>
            
            <div class="mode-grid">
                <button class="mode-btn" onclick="startQuiz('${examId}', 'practice')">
                    <span class="icon">🛡️</span>
                    <strong>Practice</strong>
                    <small>No timer, retry answers</small>
                </button>
                <button class="mode-btn" onclick="startQuiz('${examId}', 'timed')">
                    <span class="icon">⏱️</span>
                    <strong>Timed</strong>
                    <small>30s per question</small>
                </button>
                <button class="mode-btn" onclick="startQuiz('${examId}', 'exam')">
                    <span class="icon">📝</span>
                    <strong>Exam</strong>
                    <small>Standard conditions</small>
                </button>
            </div>
            <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        </div>
    `;
  document.body.appendChild(modal);
}

// Global launcher
window.startQuiz = (id, mode) => {
  window.location.href = `quiz.html?id=${id}&mode=${mode}`;
};

function renderExams(category) {
  title.textContent = `${category} Exams`; // 📝
  breadcrumb.textContent = "← Back to Categories";
  breadcrumb.style.display = "block";
  breadcrumb.onclick = renderCategories;

  container.innerHTML = "";
  const exams = examList.filter((e) => e.category === category);

  exams.forEach((exam) => {
    const card = document.createElement("div");
    card.className = "card exam-card";
    const h = document.createElement("h3");
    // prefer manifest title, otherwise derive from path
    const titleText =
      exam.title ||
      (() => {
        const parts = exam.path.replace(/\\/g, "/").split("/");
        const filename = parts[parts.length - 1] || "";
        return filename
          .replace(/\.js$/i, "")
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      })();
    h.textContent = titleText;
    const btn = document.createElement("button");
    btn.className = "start-btn";
    btn.textContent = "Start";

    btn.onclick = (ev) => {
      ev.stopPropagation();
      showModeSelection(exam.id, titleText);
    };
    card.appendChild(h);
    card.appendChild(btn);
    container.appendChild(card);
  });
}
