// Script/index.js - Performance Optimized
import { examList, categoryTree } from "./examManifest.js";

const container = document.getElementById("contentArea");
const title = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");

let navigationStack = [];

// === OPTIMIZATION: Lazy-load category tree ===
let categoriesCache = null;

function getCategoriesLazy() {
  if (categoriesCache) return categoriesCache;

  // Process category tree only once and cache it
  categoriesCache = Object.values(categoryTree || {})
    .filter((cat) => !cat.parent)
    .sort((a, b) => a.name.localeCompare(b.name));

  return categoriesCache;
}

// === Initialize ===
renderRootCategories();

function renderRootCategories() {
  navigationStack = [];
  updateBreadcrumb();

  if (!title || !container) return;

  title.textContent = "Select a Topic";
  container.innerHTML = "";
  container.className = "grid-container";

  // Use lazy-loaded categories
  const rootCategories = getCategoriesLazy();

  if (rootCategories.length === 0) {
    // Fallback to old behavior if categoryTree not available
    const categories = [
      ...new Set(examList.map((e) => e.category || "General")),
    ];

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    categories.forEach((cat) => {
      const count = examList.filter((e) => e.category === cat).length;
      const card = createCategoryCard(cat, count);
      card.onclick = () => renderExams(cat);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
    return;
  }

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  rootCategories.forEach((category) => {
    const itemCount = category.subcategories.length + category.exams.length;
    const card = createCategoryCard(category.name, itemCount, true);
    card.onclick = () => renderCategory(category);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function renderCategory(category) {
  navigationStack.push(category);
  updateBreadcrumb();

  title.textContent = category.name;
  container.innerHTML = "";
  container.className = "grid-container";

  // Use DocumentFragment for better DOM performance
  const fragment = document.createDocumentFragment();

  // Render subcategories
  category.subcategories.forEach((subCatKey) => {
    const subCat = categoryTree[subCatKey];
    if (subCat) {
      const itemCount = subCat.subcategories.length + subCat.exams.length;
      const card = createCategoryCard(subCat.name, itemCount, true);
      card.onclick = () => renderCategory(subCat);
      fragment.appendChild(card);
    }
  });

  // Render exams
  category.exams.forEach((exam) => {
    const card = createExamCard(exam);
    fragment.appendChild(card);
  });

  // Single DOM update
  container.appendChild(fragment);

  // Show empty state if no content
  if (category.subcategories.length === 0 && category.exams.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔭</div>
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

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  exams.forEach((exam) => {
    const card = createExamCard(exam);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

// === OPTIMIZED: Create category card with proper element creation ===
function createCategoryCard(name, itemCount, isFolder = false) {
  const card = document.createElement("div");
  card.className = "card category-card";

  const icon = isFolder ? "📁" : "📂";
  const itemText = itemCount === 1 ? "item" : "items";

  // Use createElement for better performance than innerHTML in loops
  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.textContent = icon;

  const h3 = document.createElement("h3");
  h3.textContent = name;

  const p = document.createElement("p");
  p.textContent = `${itemCount} ${itemText}`;

  card.appendChild(iconDiv);
  card.appendChild(h3);
  card.appendChild(p);

  return card;
}

// === OPTIMIZED: Create exam card with proper element creation ===
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

  const breadcrumbText = breadcrumb.querySelector(".breadcrumb-text");

  if (navigationStack.length === 1) {
    breadcrumbText.textContent = "Back to Categories";
    breadcrumb.onclick = renderRootCategories;
  } else {
    const parentName = navigationStack[navigationStack.length - 2].name;
    breadcrumbText.textContent = `Back to ${parentName}`;
    breadcrumb.onclick = () => {
      navigationStack.pop();
      const parent = navigationStack[navigationStack.length - 1];
      navigationStack.pop();
      renderCategory(parent);
    };
  }
}

// === OPTIMIZED: Mode selection modal with event delegation ===
function showModeSelection(examId, examTitle) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  // Create modal structure
  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";

  const h2 = document.createElement("h2");
  h2.textContent = examTitle;

  const p = document.createElement("p");
  p.textContent = "Select a study mode:";

  const modeGrid = document.createElement("div");
  modeGrid.className = "mode-grid";

  // Practice mode
  const practiceBtn = createModeButton(
    "🛡️",
    "Practice",
    "Has a timer, and you can check answers",
    () => startQuiz(examId, "practice")
  );

  // Timed mode
  const timedBtn = createModeButton("⏱️", "Timed", "30s per question", () =>
    startQuiz(examId, "timed")
  );

  // Exam mode
  const examBtn = createModeButton("📝", "Exam", "No checking answers!", () =>
    startQuiz(examId, "exam")
  );

  modeGrid.appendChild(practiceBtn);
  modeGrid.appendChild(timedBtn);
  modeGrid.appendChild(examBtn);

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.textContent = "Cancel";
  closeBtn.onclick = () => modal.remove();

  modalCard.appendChild(h2);
  modalCard.appendChild(p);
  modalCard.appendChild(modeGrid);
  modalCard.appendChild(closeBtn);

  modal.appendChild(modalCard);
  document.body.appendChild(modal);
}

// === Helper: Create mode button ===
function createModeButton(icon, title, description, onClick) {
  const btn = document.createElement("button");
  btn.className = "mode-btn";
  btn.onclick = onClick;

  const iconSpan = document.createElement("span");
  iconSpan.className = "icon";
  iconSpan.textContent = icon;

  const strong = document.createElement("strong");
  strong.textContent = title;

  const small = document.createElement("small");
  small.textContent = description;

  btn.appendChild(iconSpan);
  btn.appendChild(strong);
  btn.appendChild(small);

  return btn;
}

// === Helper: Start quiz ===
function startQuiz(id, mode) {
  window.location.href = `quiz.html?id=${id}&mode=${mode}`;
}

// Make startQuiz available globally (for backwards compatibility if needed)
window.startQuiz = startQuiz;
