// Script/index.js
import { examList, categoryTree } from "./examManifest.js";

const container = document.getElementById("contentArea");
const title = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");

let navigationStack = [];

// Initialize
renderRootCategories();

function renderRootCategories() {
  navigationStack = [];
  updateBreadcrumb();

  if (!title || !container) return;

  title.textContent = "Select a Topic";
  container.innerHTML = "";
  container.className = "grid-container";

  // Get root categories (those with no parent)
  const rootCategories = Object.values(categoryTree || {})
    .filter((cat) => !cat.parent)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (rootCategories.length === 0) {
    // Fallback to old behavior if categoryTree not available
    const categories = [
      ...new Set(examList.map((e) => e.category || "General")),
    ];
    categories.forEach((cat) => {
      const card = createCategoryCard(
        cat,
        examList.filter((e) => e.category === cat).length
      );
      card.onclick = () => renderExams(cat);
      container.appendChild(card);
    });
    return;
  }

  rootCategories.forEach((category) => {
    const itemCount = category.subcategories.length + category.exams.length;
    const card = createCategoryCard(category.name, itemCount, true);
    card.onclick = () => renderCategory(category);
    container.appendChild(card);
  });
}

function renderCategory(category) {
  navigationStack.push(category);
  updateBreadcrumb();

  title.textContent = category.name;
  container.innerHTML = "";
  container.className = "grid-container";

  // Render subcategories
  category.subcategories.forEach((subCatKey) => {
    const subCat = categoryTree[subCatKey];
    if (subCat) {
      const itemCount = subCat.subcategories.length + subCat.exams.length;
      const card = createCategoryCard(subCat.name, itemCount, true);
      card.onclick = () => renderCategory(subCat);
      container.appendChild(card);
    }
  });

  // Render exams
  category.exams.forEach((exam) => {
    const card = createExamCard(exam);
    container.appendChild(card);
  });

  // Show empty state if no content
  if (category.subcategories.length === 0 && category.exams.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No Content Yet</h3>
        <p>This category is empty. Check back later!</p>
      </div>
    `;
  }
}

function renderExams(categoryName) {
  // Fallback for old single-level categories
  title.textContent = `${categoryName} Exams`;
  breadcrumb.style.display = "block";
  breadcrumb.onclick = renderRootCategories;

  container.innerHTML = "";
  container.className = "grid-container";

  const exams = examList.filter((e) => e.category === categoryName);

  exams.forEach((exam) => {
    const card = createExamCard(exam);
    container.appendChild(card);
  });
}

function createCategoryCard(name, itemCount, isFolder = false) {
  const card = document.createElement("div");
  card.className = "card category-card";

  const icon = isFolder ? "📁" : "📂";
  const itemText = itemCount === 1 ? "item" : "items";

  card.innerHTML = `
    <div class="icon">${icon}</div>
    <h3>${name}</h3>
    <p>${itemCount} ${itemText}</p>
  `;

  return card;
}

function createExamCard(exam) {
  const card = document.createElement("div");
  card.className = "card exam-card";

  const h = document.createElement("h3");
  h.textContent = exam.title || exam.id;

  const btn = document.createElement("button");
  btn.className = "start-btn";
  btn.textContent = "Start";
  btn.onclick = (ev) => {
    ev.stopPropagation();
    showModeSelection(exam.id, exam.title || exam.id);
  };

  card.appendChild(h);
  card.appendChild(btn);

  return card;
}

function updateBreadcrumb() {
  if (navigationStack.length === 0) {
    breadcrumb.style.display = "none";
    return;
  }

  breadcrumb.style.display = "flex";

  if (navigationStack.length === 1) {
    breadcrumb.querySelector(".breadcrumb-text").textContent =
      "Back to Categories";
    breadcrumb.onclick = renderRootCategories;
  } else {
    const parentName = navigationStack[navigationStack.length - 2].name;
    breadcrumb.querySelector(
      ".breadcrumb-text"
    ).textContent = `Back to ${parentName}`;
    breadcrumb.onclick = () => {
      navigationStack.pop();
      const parent = navigationStack[navigationStack.length - 1];
      navigationStack.pop(); // Remove it so renderCategory can re-add
      renderCategory(parent);
    };
  }
}

function showModeSelection(examId, examTitle) {
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

window.startQuiz = (id, mode) => {
  window.location.href = `quiz.html?id=${id}&mode=${mode}`;
};
