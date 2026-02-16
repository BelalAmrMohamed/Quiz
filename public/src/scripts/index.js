// ============================================================================
// src/scripts/index.js - Enhanced with Security, Performance, and Accessibility
// All original functionality preserved + improvements added
// ============================================================================

import { getManifest } from "./quizManifest.js";
import { userProfile } from "./userProfile.js";
import { SearchManager } from "./search-manager.js";

let categoryTree = null;
let searchManager = null;

// Download functions
import { exportToQuiz } from "../export/export-to-quiz.js";
import { exportToHtml } from "../export/export-to-html.js";
import { exportToPdf } from "../export/export-to-pdf.js";
import { exportToWord } from "../export/export-to-word.js";
import { exportToPptx } from "../export/export-to-pptx.js";
import { exportToMarkdown } from "../export/export-to-markdown.js";

// Helper utilities
import {
  extractMetadata,
  filterCourses,
  getSubscribedCourses,
  getCourseItemCount,
  getAvailableYears,
  getAvailableTerms,
} from "./filterUtils.js";

// Notifications
import {
  showNotification,
  confirmationNotification,
} from "../components/notifications.js";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  MAX_USERNAME_LENGTH: 50,
  DEBOUNCE_DELAY: 300,
};

const container = document.getElementById("contentArea");
const title = document.getElementById("Subjects-text");
const breadcrumb = document.getElementById("breadcrumb");

// ============================================================================
// UTILITY FUNCTIONS - Enhanced with Security
// ============================================================================

/**
 * Safe localStorage getter with error handling
 */
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Safe localStorage setter with error handling
 */
function setInStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    if (error.name === "QuotaExceededError") {
      showNotification(
        "تحذير",
        "مساحة التخزين ممتلئة. قد تفقد بعض البيانات.",
        "./assets/images/warning.png",
      );
    }
    return false;
  }
}

/**
 * Validate username input
 */
function validateUsername(username) {
  if (!username || !username.trim()) {
    return { valid: false, message: "الرجاء إدخال اسم صالح" };
  }

  if (username.length > CONFIG.MAX_USERNAME_LENGTH) {
    return {
      valid: false,
      message: `الاسم طويل جداً (الحد الأقصى ${CONFIG.MAX_USERNAME_LENGTH} حرف)`,
    };
  }

  // Check for potentially malicious content
  const dangerousPatterns = /<script|javascript:|onerror=/gi;
  if (dangerousPatterns.test(username)) {
    return { valid: false, message: "اسم غير صالح" };
  }

  return { valid: true, message: "" };
}

// ============================================================================
// USER PERSONALIZATION & GAMIFIED WELCOME SYSTEM
// ============================================================================

const userNameBadge = document.getElementById("user-name");

// Gamified welcome message pool
const welcomeMessages = [
  (name) => `🏆 أهلاً بعودة البطل يا ${name}`,
  (name) => `🚀 لم تطل الغيبة، لنواصل الإنجاز يا ${name}`,
  (name) => `🎮 التحدي يناديك، هل أنت مستعد يا ${name}`,
  (name) => `🔔 تم فتح تحدٍ جديد بانتظارك يا ${name}`,
  (name) => `✨ رحلتك مستمرة يا ${name}`,
  (name) => `🔥 شعلة الحماس لا تنطفئ! عُد للأجواء يا ${name}`,
  (name) => `🧠 جرعة معرفة إضافية جاهزة من أجلك يا ${name}`,
  (name) => `⚡ نقاط خبرة مضاعفة في الطريق! أهلاً بك يا ${name}`,
  (name) => `📈 تقدمك ملحوظ.. استمر في التألق يا ${name}`,
  (name) => `👑 الأسطورة يعود من جديد.. أهلاً بك يا ${name}`,
];

const opts = [
  ["./favicon.png", "Quiz (.html)", "quiz"],
  ["./assets/images/HTML_Icon.png", "HTML (.html)", "html"],
  ["./assets/images/PDF_Icon.png", "PDF (.pdf)", "pdf"],
  ["./assets/images/word_icon.png", "Word (.docx)", "docx"],
  ["./assets/images/pptx_icon.png", "PowerPoint (.pptx)", "pptx"],
  ["./assets/images/mardownIcon.png", "Markdown (.md)", "md"],
];

/**
 * Change username with enhanced validation
 */
window.changeUsername = function () {
  try {
    const currentName = getFromStorage("username", "User");
    const newName = prompt("أدخل الإسم الجديد", currentName);

    if (!newName) return;

    const validation = validateUsername(newName);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const trimmedName = newName.trim();
    if (setInStorage("username", trimmedName)) {
      updateWelcomeMessage();
      showNotification(
        "تم التحديث",
        `تم تغيير الاسم إلى ${trimmedName}`,
        "./favicon.png",
      );
    }
  } catch (error) {
    console.error("Error changing username:", error);
    alert("حدث خطأ أثناء تغيير الاسم. حاول مرة أخرى.");
  }
};

/**
 * Get random welcome message
 */
function getRandomWelcomeMessage(name) {
  const escapedName = escapeHtml(name);
  const message =
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  return message(escapedName);
}

/**
 * Update welcome badge text
 */
function updateWelcomeMessage() {
  try {
    const name = getFromStorage("username", "User");
    const messageTemplate = getRandomWelcomeMessage(name);

    // Replace username with styled span
    const styledMessage = messageTemplate.replace(
      escapeHtml(name),
      `<span class="user-name">${escapeHtml(name)}</span>`,
    );

    if (userNameBadge) {
      userNameBadge.innerHTML = styledMessage;
      userNameBadge.setAttribute("aria-label", `تغيير اسم المستخدم: ${name}`);
    }
  } catch (error) {
    console.error("Error updating welcome message:", error);
  }
}

// Initial load
updateWelcomeMessage();

// Show welcome notification with error handling
try {
  const username = getFromStorage("username", "User");
  showNotification(
    "منصة إمتحانات بصمجي",
    `السلام عليكم يا ${escapeHtml(username)}`,
    "./assets/images/السلام عليكم.png",
  );
} catch (error) {
  console.error("Error showing welcome notification:", error);
}

// ============================================================================
// PROFILE MANAGEMENT MODAL - Enhanced with Accessibility
// ============================================================================

window.openProfileSettings = function () {
  try {
    const profile = userProfile.getProfile();
    const metadata = extractMetadata(categoryTree);

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "profileModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "profileModalTitle");

    const modalCard = document.createElement("div");
    modalCard.className = "modal-card profile-modal";

    // Get available years and terms for current selection
    const availableYears =
      profile.faculty === "All"
        ? metadata.years
        : getAvailableYears(categoryTree, profile.faculty);

    const availableTerms = getAvailableTerms(
      categoryTree,
      profile.faculty,
      profile.year,
    );

    modalCard.innerHTML = `
      <h2 id="profileModalTitle">⚙️ الملف الشخصي</h2>
      
      <div class="profile-section">
        <label for="profileUsername">الإسم</label>
        <input 
          type="text" 
          id="profileUsername" 
          class="profile-input"
          value="${escapeHtml(profile.username)}"
          placeholder="أدخل اسمك"
          maxlength="${CONFIG.MAX_USERNAME_LENGTH}"
          aria-required="true"
        />
      </div>

      <div class="profile-section">
        <h3>المعلومات الأكاديمية</h3>
        <p class="profile-hint">يساعدنا على عرض المواد الخاصة بك</p>
        
        <div class="profile-grid">
          <div>
            <label for="profileFaculty">الكلية</label>
            <select id="profileFaculty" class="profile-select" aria-label="اختر الكلية">
              <option value="All">All Faculties</option>
              ${metadata.faculties
                .map(
                  (f) =>
                    `<option value="${escapeHtml(f)}" ${
                      f === profile.faculty ? "selected" : ""
                    }>${escapeHtml(f)}</option>`,
                )
                .join("")}
            </select>
          </div>

          <div>
            <label for="profileYear">العام</label>
            <select id="profileYear" class="profile-select" aria-label="اختر العام">
              <option value="All">All Years</option>
              ${availableYears
                .map(
                  (y) =>
                    `<option value="${escapeHtml(y)}" ${
                      y === profile.year ? "selected" : ""
                    }>العام ${escapeHtml(y)}</option>`,
                )
                .join("")}
            </select>
          </div>

          <div>
            <label for="profileTerm">الترم</label>
            <select id="profileTerm" class="profile-select" aria-label="اختر الترم">
              <option value="All">All Terms</option>
              ${availableTerms
                .map(
                  (t) =>
                    `<option value="${escapeHtml(t)}" ${
                      t === profile.term ? "selected" : ""
                    }>الترم ${escapeHtml(t)}</option>`,
                )
                .join("")}
            </select>
          </div>
        </div>
      </div>

      <div class="profile-actions">      
        <button class="profile-btn secondary" 
                onclick="window.closeProfileModal()"
                type="button"
                aria-label="إلغاء وإغلاق النافذة">
          إلغاء
        </button>
        <button class="profile-btn primary" 
                onclick="window.saveProfileSettings()"
                type="button"
                aria-label="حفظ التغييرات">
          💾 حفظ التغييرات
        </button>
      </div>
    `;

    modal.appendChild(modalCard);
    document.body.appendChild(modal);

    // Setup cascading dropdown listeners
    setupProfileDropdownCascade();

    // Focus management
    const firstInput = modalCard.querySelector("#profileUsername");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeProfileModal();
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        window.closeProfileModal();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  } catch (error) {
    console.error("Error opening profile settings:", error);
    alert("حدث خطأ أثناء فتح الإعدادات. حاول مرة أخرى.");
  }
};

/**
 * Setup cascading dropdown behavior for Profile Settings modal
 */
function setupProfileDropdownCascade() {
  const facultySelect = document.getElementById("profileFaculty");
  const yearSelect = document.getElementById("profileYear");
  const termSelect = document.getElementById("profileTerm");

  if (!facultySelect || !yearSelect || !termSelect) return;

  // When faculty changes, update year and term dropdowns
  facultySelect.addEventListener("change", () => {
    try {
      const selectedFaculty = facultySelect.value;

      // Update year dropdown
      const availableYears =
        selectedFaculty === "All"
          ? extractMetadata(categoryTree).years
          : getAvailableYears(categoryTree, selectedFaculty);

      const currentYear = yearSelect.value;
      yearSelect.innerHTML =
        '<option value="All">All Years</option>' +
        availableYears
          .map(
            (y) =>
              `<option value="${escapeHtml(y)}">العام ${escapeHtml(y)}</option>`,
          )
          .join("");

      // Restore selection if still valid, otherwise reset to "All"
      if (availableYears.includes(currentYear)) {
        yearSelect.value = currentYear;
      } else {
        yearSelect.value = "All";
      }

      // Trigger year change to update terms
      yearSelect.dispatchEvent(new Event("change"));
    } catch (error) {
      console.error("Error in faculty change handler:", error);
    }
  });

  // When year changes, update term dropdown
  yearSelect.addEventListener("change", () => {
    try {
      const selectedFaculty = facultySelect.value;
      const selectedYear = yearSelect.value;

      // Update term dropdown
      const availableTerms = getAvailableTerms(
        categoryTree,
        selectedFaculty,
        selectedYear,
      );

      const currentTerm = termSelect.value;
      termSelect.innerHTML =
        '<option value="All">All Terms</option>' +
        availableTerms
          .map(
            (t) =>
              `<option value="${escapeHtml(t)}">الترم ${escapeHtml(t)}</option>`,
          )
          .join("");

      // Restore selection if still valid, otherwise reset to "All"
      if (availableTerms.includes(currentTerm)) {
        termSelect.value = currentTerm;
      } else {
        termSelect.value = "All";
      }
    } catch (error) {
      console.error("Error in year change handler:", error);
    }
  });
}

window.saveProfileSettings = function () {
  try {
    const username = document.getElementById("profileUsername")?.value.trim();
    const faculty = document.getElementById("profileFaculty")?.value;
    const year = document.getElementById("profileYear")?.value;
    const term = document.getElementById("profileTerm")?.value;

    // Validate username
    if (username) {
      const validation = validateUsername(username);
      if (!validation.valid) {
        alert(validation.message);
        document.getElementById("profileUsername")?.focus();
        return;
      }
    }

    const oldProfile = userProfile.getProfile();

    // Update profile
    if (username) userProfile.setUsername(username);
    userProfile.updateAcademicInfo({ faculty, year, term });

    // Check if academic info changed
    const academicInfoChanged =
      oldProfile.faculty !== faculty ||
      oldProfile.year !== year ||
      oldProfile.term !== term;

    if (academicInfoChanged) {
      // Unsubscribe from courses that matched the *previous* faculty/year/term
      // so that only manually subscribed courses (other combos) are kept
      if (
        oldProfile.faculty !== "All" &&
        oldProfile.year !== "All" &&
        oldProfile.term !== "All"
      ) {
        const oldMatchingCourses = filterCourses(categoryTree, oldProfile);
        const oldMatchingIds = oldMatchingCourses.map((c) => c.id);
        const subscribedIds = userProfile.getSubscribedCourseIds();
        oldMatchingIds.forEach((courseId) => {
          if (subscribedIds.includes(courseId)) {
            userProfile.unsubscribeFromCourse(courseId);
          }
        });
      }
      // Subscribe to default courses for the new academic info
      userProfile.initializeDefaultSubscriptions(categoryTree);
    }

    // Update UI
    updateWelcomeMessage();
    window.closeProfileModal();

    // Refresh course view
    renderRootCategories();

    showNotification("تم الحفظ", "تم حفظ إعداداتك بنجاح", "./favicon.png");
  } catch (error) {
    console.error("Error saving profile settings:", error);
    alert("حدث خطأ أثناء الحفظ. حاول مرة أخرى.");
  }
};

window.closeProfileModal = function () {
  try {
    const modal = document.getElementById("profileModal");
    if (modal) {
      modal.remove();

      // Return focus to trigger element
      const trigger = document.querySelector(
        '[data-action="openProfileSettings"]',
      );
      if (trigger) {
        trigger.focus();
      }
    }
  } catch (error) {
    console.error("Error closing profile modal:", error);
  }
};

// ============================================================================
// NAVIGATION & RENDERING
// ============================================================================

let navigationStack = [];
let categoriesCache = null;

function getCategoriesLazy() {
  if (categoriesCache) return categoriesCache;

  categoriesCache = Object.values(categoryTree || {})
    .filter((cat) => !cat.parent)
    .sort((a, b) => a.name.localeCompare(b.name));

  return categoriesCache;
}

// Initialize after manifest is loaded (called from DOMContentLoaded)
async function initApp() {
  try {
    const manifest = await getManifest();
    categoryTree = manifest.categoryTree;

    // Initialize search manager after data is loaded
    initializeSearchManager();
  } catch (err) {
    console.error("Failed to load quiz manifest:", err);
    categoryTree = {};
  }

  // Check for first time visit
  try {
    const hasVisited = localStorage.getItem("first_visit_complete");
    if (!hasVisited && userProfile.checkFirstVisit()) {
      // Redirect to onboarding
      window.location.href = "onboarding.html";
      return;
    }

    renderRootCategories();
  } catch (error) {
    console.error("Error initializing:", error);
    renderRootCategories();
  }
}

/**
 * Initialize the search manager with course data
 */
function initializeSearchManager() {
  try {
    // Get all root courses
    const allCourses = Object.entries(categoryTree)
      .filter(([key, category]) => !category.parent)
      .map(([key, category]) => ({ key, ...category }));

    // Create search manager instance
    searchManager = new SearchManager("#searchContainer", handleSearchResults);
    searchManager.init(allCourses);
  } catch (error) {
    console.error("Error initializing search manager:", error);
  }
}

/**
 * Handle search results from SearchManager
 * This function is called whenever search results change
 */
function handleSearchResults(results) {
  try {
    // Clear navigation stack when searching
    if (searchManager && searchManager.isSearchActive()) {
      navigationStack = [];
      updateBreadcrumb();
    }

    // Update title based on search state
    if (title) {
      if (searchManager && searchManager.isSearchActive()) {
        title.textContent = "نتائج البحث";
      } else {
        const subscribedIds = userProfile.getSubscribedCourseIds();
        const subscribedCourses = getSubscribedCourses(
          categoryTree,
          subscribedIds,
        );
        title.textContent =
          subscribedCourses.length > 0 ? "المواد خاصتي" : "جميع المواد";
      }
    }

    // Render search results
    renderSearchResults(results);
  } catch (error) {
    console.error("Error handling search results:", error);
  }
}

/**
 * Render search results in the main container
 */
function renderSearchResults(courses) {
  try {
    if (!container) return;

    container.innerHTML = "";
    container.className = "grid-container";
    container.setAttribute("aria-busy", "false");

    const fragment = document.createDocumentFragment();

    if (courses.length === 0) {
      // Empty state for no results
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.setAttribute("role", "status");
      emptyState.innerHTML = `
        <div class="empty-state-icon" aria-hidden="true">🔍</div>
        <h3>لا توجد نتائج</h3>
        <p>جرّب البحث بكلمات مختلفة أو تعديل الفلاتر</p>
      `;
      container.appendChild(emptyState);
      return;
    }

    // Render course cards
    courses.forEach((course) => {
      const itemCount = getCourseItemCount(course);
      const card = createCategoryCard(course.name, itemCount, true, course);
      card.onclick = () => renderCategory(categoryTree[course.key]);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  } catch (error) {
    console.error("Error rendering search results:", error);
    if (container) {
      container.innerHTML = `
        <div class="error-state" role="alert">
          <p>حدث خطأ أثناء عرض النتائج. يرجى المحاولة مرة أخرى.</p>
        </div>
      `;
    }
  }
}

function renderRootCategories() {
  try {
    navigationStack = [];
    updateBreadcrumb();

    if (!title || !container) return;

    const subscribedIds = userProfile.getSubscribedCourseIds();

    // Get subscribed courses
    const subscribedCourses = getSubscribedCourses(categoryTree, subscribedIds);

    // Title based on subscription status
    if (subscribedCourses.length > 0) {
      title.textContent = "المواد خاصتي";
    } else {
      title.textContent = "جميع المواد";
    }

    container.innerHTML = "";
    container.className = "grid-container";
    container.setAttribute("aria-busy", "false");

    const fragment = document.createDocumentFragment();

    // 1. Add "إمتحاناتك" Folder Card
    try {
      const userQuizzes = JSON.parse(getFromStorage("user_quizzes", "[]"));
      const quizzesCard = createCategoryCard(
        "إمتحاناتك",
        userQuizzes.length,
        true,
      );
      // Custom icon
      const iconDiv = quizzesCard.querySelector(".icon");
      if (iconDiv) iconDiv.textContent = "✏️";

      quizzesCard.onclick = () => renderUserQuizzesView();
      fragment.appendChild(quizzesCard);
    } catch (e) {
      console.error("Error creating User Quizzes card", e);
    }

    // Show subscribed courses if any
    if (subscribedCourses.length > 0) {
      subscribedCourses.forEach((course) => {
        const itemCount = getCourseItemCount(course);
        const card = createCategoryCard(course.name, itemCount, true, course);
        card.onclick = () => renderCategory(categoryTree[course.key]);
        fragment.appendChild(card);
      });
    } else {
      // Show all courses if no subscriptions
      const rootCategories = getCategoriesLazy();
      rootCategories.forEach((category) => {
        const itemCount = getCourseItemCount(category);
        const card = createCategoryCard(
          category.name,
          itemCount,
          true,
          category,
        );
        card.onclick = () => renderCategory(category);
        fragment.appendChild(card);
      });
    }

    container.appendChild(fragment);

    // Show empty state if no courses at all
    if (subscribedCourses.length === 0 && getCategoriesLazy().length === 0) {
      container.innerHTML += `
        <div class="empty-state" role="status">
          <div class="empty-state-icon" aria-hidden="true">📚</div>
          <h3>No Courses Available</h3>
          <p>Check back later for new content!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error rendering root categories:", error);
    if (container) {
      container.innerHTML = `
        <div class="error-state" role="alert">
          <p>حدث خطأ أثناء تحميل المحتوى. يرجى تحديث الصفحة.</p>
          <button onclick="location.reload()" type="button">تحديث</button>
        </div>
      `;
    }
  }
}

/**
 * Render user-created quizzes VIEW (Folder Content)
 */
function renderUserQuizzesView() {
  try {
    // Update Navigation Stack
    navigationStack.push({ name: "إمتحاناتك" });
    updateBreadcrumb();

    // Update Title & Clear Container
    if (title) title.textContent = "إمتحاناتك";
    if (!container) return;

    container.innerHTML = "";
    container.className = "grid-container";

    const userQuizzes = JSON.parse(getFromStorage("user_quizzes", "[]"));

    // 1. Create 'Create New Quiz' Button (Always visible at top)
    const actionsBar = document.createElement("div");
    actionsBar.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;
    `;

    const createBtn = document.createElement("a");
    createBtn.href = "create-quiz.html";
    createBtn.textContent = "➕ إنشاء اختبار جديد";
    createBtn.className = "btn btn-primary";
    createBtn.setAttribute("aria-label", "إنشاء اختبار جديد");
    createBtn.style.cssText = `
        display: inline-block;
        padding: 12px 24px;
        background: var(--gradient-success);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: var(--shadow-md);
        transition: transform 0.2s;
        margin-left: auto;
    `;
    createBtn.onmouseover = () => {
      createBtn.style.transform = "translateY(-2px)";
    };
    createBtn.onmouseout = () => {
      createBtn.style.transform = "translateY(0)";
    };

    actionsBar.appendChild(createBtn);
    container.appendChild(actionsBar);

    // 2. Grid for Quizzes
    if (userQuizzes.length === 0) {
      // Empty state
      const emptyState = document.createElement("div");
      emptyState.setAttribute("role", "status");
      emptyState.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        color: var(--color-text-primary);
      `;
      emptyState.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;" aria-hidden="true">📝</div>
        <h3 style="margin-bottom: 10px;">لم تقم بإنشاء أي اختبارات حتى الآن</h3>
        <p style="color: var(--color-text-secondary);">انقر على الزر الذي في الأعلى للبدء</p>
      `;
      container.appendChild(emptyState);
    } else {
      userQuizzes.forEach((quiz, index) => {
        const quizCard = createUserQuizCard(quiz, index);
        container.appendChild(quizCard);
      });
    }
  } catch (error) {
    console.error("Error rendering user quizzes view:", error);
    if (container) {
      container.innerHTML = `<p style="color:red" role="alert">Error loading quizzes.</p>`;
    }
  }
}

/**
 * Create a card for a user-created quiz
 */
function createUserQuizCard(quiz, index) {
  const card = document.createElement("div");
  card.className = "exam-card user-quiz-card";
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", `اختبار: ${quiz.title}`);
  card.style.cssText = `
    background: var(--color-surface);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid var(--color-border);
    position: relative;
    overflow: hidden;
  `;

  // Gradient accent on top
  const accentBar = document.createElement("div");
  accentBar.setAttribute("aria-hidden", "true");
  accentBar.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-accent);
  `;
  card.appendChild(accentBar);

  // User badge
  const badge = document.createElement("div");
  badge.textContent = "👤 Your Quiz";
  badge.style.cssText = `
    display: inline-block;
    padding: 4px 10px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 12px;
    margin-bottom: 12px;
  `;
  card.appendChild(badge);

  // Quiz title
  const titleEl = document.createElement("h3");
  titleEl.textContent = quiz.title;
  titleEl.style.cssText = `
    margin: 0 0 8px 0;
    color: var(--color-text-primary);
    font-size: 1.1rem;
  `;
  card.appendChild(titleEl);

  // Description
  if (quiz.description) {
    const desc = document.createElement("p");
    desc.textContent = quiz.description;
    desc.style.cssText = `
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    `;
    card.appendChild(desc);
  }

  // Metadata
  const metadata = document.createElement("div");
  metadata.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid var(--color-border);
  `;

  const questionsCount = document.createElement("span");
  questionsCount.textContent = `📝 ${quiz.questions.length} question${quiz.questions.length !== 1 ? "s" : ""}`;
  questionsCount.style.cssText = `
    color: var(--color-text-secondary);
    font-size: 0.85rem;
  `;

  const createdDate = document.createElement("span");
  const date = new Date(quiz.createdAt);
  createdDate.textContent = date.toLocaleDateString();
  createdDate.style.cssText = `
    color: var(--color-text-tertiary);
    font-size: 0.85rem;
  `;

  metadata.appendChild(questionsCount);
  metadata.appendChild(createdDate);
  card.appendChild(metadata);

  // Action buttons
  const actions = document.createElement("div");
  actions.style.cssText = `
    display: flex;
    gap: 8px;
    margin-top: 15px;
  `;

  const playBtn = document.createElement("button");
  playBtn.textContent = "إبدأ الإختبار";
  playBtn.className = "btn btn-primary";
  playBtn.type = "button";
  playBtn.setAttribute("aria-label", `بدء اختبار ${quiz.title}`);
  playBtn.style.cssText = `
    flex: 1;
    padding: 10px 16px;
    background: var(--gradient-accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  `;
  playBtn.onclick = (e) => {
    e.stopPropagation();
    playUserQuiz(quiz);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", `حذف اختبار ${quiz.title}`);
  deleteBtn.style.cssText = `
    padding: 10px 14px;
    background: var(--color-error-light);
    color: var(--color-error);
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
  `;
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteUserQuiz(quiz.id, index);
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "تحميل";
  downloadBtn.type = "button";
  downloadBtn.setAttribute("aria-label", `تحميل اختبار ${quiz.title}`);
  playBtn.className = "btn btn-primary";
  downloadBtn.style.cssText = `
    flex: 1;
    padding: 10px 16px;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  `;

  downloadBtn.title = "Download Quiz";
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    showUserQuizDownloadPopup(quiz);
  };

  actions.appendChild(playBtn);
  actions.appendChild(downloadBtn);
  actions.appendChild(deleteBtn);
  card.appendChild(actions);

  // Hover effects
  card.onmouseenter = () => {
    card.style.transform = "translateY(-4px)";
    card.style.boxShadow = "var(--shadow-lg)";
  };
  card.onmouseleave = () => {
    card.style.transform = "translateY(0)";
    card.style.boxShadow = "var(--shadow-md)";
  };

  return card;
}

/**
 * Play a user-created quiz
 */
function playUserQuiz(quiz) {
  try {
    // Store the quiz data temporarily for the quiz page to access
    sessionStorage.setItem("active_user_quiz", JSON.stringify(quiz));

    // Navigate to quiz page with special parameter
    const mode = userProfile.getDefaultQuizMode();
    window.location.href = `quiz.html?id=${encodeURIComponent(quiz.id)}&mode=${encodeURIComponent(mode)}&type=user`;
  } catch (error) {
    console.error("Error playing user quiz:", error);
    alert("حدث خطأ أثناء بدء الاختبار. حاول مرة أخرى.");
  }
}

/**
 * Delete a user-created quiz
 */
async function deleteUserQuiz(quizId, index) {
  try {
    if (
      !(await confirmationNotification(
        "Are you sure you want to delete this quiz? This cannot be undone.",
      ))
    ) {
      return;
    }

    const userQuizzes = JSON.parse(getFromStorage("user_quizzes", "[]"));
    userQuizzes.splice(index, 1);
    setInStorage("user_quizzes", JSON.stringify(userQuizzes));

    // Re-render the folder view
    renderRootCategories();
    renderUserQuizzesView();

    showNotification("تم الحذف", "تم حذف الاختبار بنجاح", "./favicon.png");
  } catch (error) {
    console.error("Error deleting quiz:", error);
    alert("Error deleting quiz. Please try again.");
  }
}

function renderCategory(category) {
  try {
    navigationStack.push(category);
    updateBreadcrumb();

    title.textContent = category.name;
    container.innerHTML = "";
    container.className = "grid-container";

    const fragment = document.createDocumentFragment();

    // Render subcategories
    category.subcategories.forEach((subCatKey) => {
      const subCat = categoryTree[subCatKey];
      if (subCat) {
        const itemCount = getCourseItemCount(subCat);
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

    container.appendChild(fragment);

    // Show empty state if no content
    if (category.subcategories.length === 0 && category.exams.length === 0) {
      container.innerHTML = `
        <div class="empty-state" role="status">
          <div class="empty-state-icon" aria-hidden="true">🔭</div>
          <h3>No Content Yet</h3>
          <p>This category is empty. Check back later!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error rendering category:", error);
    if (container) {
      container.innerHTML = `
        <div class="error-state" role="alert">
          <p>حدث خطأ أثناء تحميل المحتوى. يرجى تحديث الصفحة.</p>
          <button onclick="renderRootCategories()" type="button">الرجوع للرئيسية</button>
        </div>
      `;
    }
  }
}

function createCategoryCard(
  name,
  itemCount,
  isFolder = false,
  courseData = null,
) {
  const card = document.createElement("div");

  const getItemText = (count) =>
    `${
      count === 0
        ? "لا يوجد إمتحانات"
        : count === 1
          ? "إمتحان واحد"
          : count === 2
            ? "إمتحانان"
            : count <= 10
              ? "إمتحانات"
              : "إمتحان"
    }`;

  card.className = "card category-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute(
    "aria-label",
    `${name}, ${itemCount} ${getItemText(itemCount)}`,
  );

  const icon = isFolder ? "📁" : "📂";

  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.textContent = icon;
  iconDiv.setAttribute("aria-hidden", "true");

  const h3 = document.createElement("h3");
  h3.textContent = name;

  const p = document.createElement("p");

  p.textContent = `${itemCount > 2 ? itemCount : ""} ${getItemText(itemCount)}`;

  // Add course metadata if available
  if (courseData && courseData.faculty && courseData.year && courseData.term) {
    const profile = userProfile.getProfile();
    const metaDiv = document.createElement("div");
    metaDiv.className = "course-meta";

    // Create individual badges
    const facultyBadge = document.createElement("span");
    facultyBadge.className = "course-meta-badge faculty";
    facultyBadge.textContent = courseData.faculty;

    const yearBadge = document.createElement("span");
    yearBadge.className = "course-meta-badge year";
    yearBadge.textContent = `العام ${courseData.year}`;

    const termBadge = document.createElement("span");
    termBadge.className = "course-meta-badge term";
    termBadge.textContent = `الترم ${courseData.term}`;

    // Only show the faculty if the user didn't set their faculty
    if (profile.faculty === "All") metaDiv.appendChild(facultyBadge);

    // Only show the year if the user didn't set their year, or is from a different year that the user
    if (courseData.year != profile.year || profile.year === "All")
      metaDiv.appendChild(yearBadge);

    if (courseData.term != profile.term || profile.term === "All")
      metaDiv.appendChild(termBadge);

    card.appendChild(iconDiv);
    card.appendChild(h3);
    card.appendChild(metaDiv);
    card.appendChild(p);
  } else {
    card.appendChild(iconDiv);
    card.appendChild(h3);
    card.appendChild(p);
  }

  // Keyboard support
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });

  return card;
}

function createExamCard(exam) {
  const card = document.createElement("div");
  card.className = "card exam-card";
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", `اختبار: ${exam.title || exam.id}`);

  const h = document.createElement("h3");
  h.textContent = exam.title || exam.id;

  const btn = document.createElement("button");
  btn.className = "start-btn";
  btn.type = "button";
  btn.style.flex = "1";
  btn.style.minWidth = "0";
  btn.textContent = "إبدأ الإختبار";
  btn.setAttribute("aria-label", `بدء اختبار ${exam.title || exam.id}`);
  btn.onclick = (ev) => {
    ev.stopPropagation();
    const mode = userProfile.getDefaultQuizMode();
    startQuiz(exam.id, mode);
  };

  const onDownloadOption = async (format, modalEl) => {
    modalEl.remove();
    const config = {
      id: exam.id,
      title: exam.title || exam.id,
      path: exam.path,
    };
    // Load exam data (HANDLES .js vs .json issue)
    let questions = [];
    try {
      const path = config.path;
      if (path.endsWith(".json")) {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        questions = data.questions;
      } else if (path.endsWith(".js")) {
        // Try fetching as JSON first if it might be a mislabeled path
        // But if it's really a JS file with export, we use import
        // The issue reported is 404 on .js because the file is .json
        // Let's try to check: if 404 on .js, try replacing with .json
        try {
          mod = await import(config.path);
          questions = mod.questions;
        } catch (jsErr) {
          console.warn(
            "Failed to load as JS, trying JSON substitute...",
            jsErr,
          );
          const jsonPath = config.path.replace(/\.js$/, ".json");
          const res = await fetch(jsonPath);
          if (!res.ok) throw new Error("Failed to load as JSON as well");
          const data = await res.json();
          questions = data.questions;
        }
      } else {
        // Fallback
        mod = await import(config.path);
        questions = mod.questions;
      }
    } catch (e) {
      console.error("Load failed", e);
      alert("Failed to load exam data.");
      return;
    }
    try {
      switch (format) {
        case "quiz":
          await exportToQuiz(config, questions);
          break;
        case "html":
          await exportToHtml(config, questions);
          break;
        case "pdf":
          await exportToPdf(config, questions);
          break;
        case "docx":
          await exportToWord(config, questions);
          break;
        case "pptx":
          await exportToPptx(config, questions);
          break;
        case "md":
          exportToMarkdown(config, questions);
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("حدث خطأ أثناء التحميل. حاول مرة أخرى.");
    }
  };

  const showDownloadPopup = () => {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.transform = "translateZ(0)";
    modal.style.willChange = "opacity";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "downloadModalTitle");

    const modalCard = document.createElement("div");
    modalCard.className = "modal-card";
    modalCard.style.contain = "layout style paint";

    const h2 = document.createElement("h2");
    h2.id = "downloadModalTitle";
    h2.textContent = exam.title || exam.id;

    const p = document.createElement("p");
    p.textContent = "اختر طريقة التنزيل";

    const grid = document.createElement("div");
    grid.className = "mode-grid";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", "خيارات التنزيل");

    opts.forEach(([icon, label, format]) => {
      const b = document.createElement("button");
      b.className = "mode-btn";
      b.type = "button";
      b.setAttribute("aria-label", `تنزيل كـ ${label}`);
      b.innerHTML = `<img src="${icon}" alt="" class="icon" aria-hidden="true"><strong>${label}</strong>`;
      b.onclick = (ev) => {
        ev.stopPropagation();
        onDownloadOption(format, modal);
      };
      grid.appendChild(b);
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-modal";
    closeBtn.type = "button";
    closeBtn.textContent = "إلغاء";
    closeBtn.setAttribute("aria-label", "إغلاق النافذة");
    closeBtn.onclick = () => modal.remove();

    modalCard.appendChild(h2);
    modalCard.appendChild(p);
    modalCard.appendChild(grid);
    modalCard.appendChild(closeBtn);
    modal.appendChild(modalCard);

    requestAnimationFrame(() => {
      document.body.appendChild(modal);
      // Focus first button
      const firstBtn = grid.querySelector("button");
      if (firstBtn) firstBtn.focus();
    });
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "start-btn";
  downloadBtn.type = "button";
  downloadBtn.style.flex = "1";
  downloadBtn.style.minWidth = "0";
  downloadBtn.style.background =
    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
  downloadBtn.style.color = "white";
  downloadBtn.style.boxShadow = "0 4px 14px rgba(220, 38, 38, 0.4)";
  downloadBtn.textContent = "تحميل";
  downloadBtn.setAttribute("aria-label", `تحميل ${exam.title || exam.id}`);
  downloadBtn.onclick = (ev) => {
    ev.stopPropagation();
    showDownloadPopup();
  };

  const btnWrap = document.createElement("div");
  btnWrap.style.display = "flex";
  btnWrap.style.gap = "8px";
  btnWrap.style.flexWrap = "wrap";
  btnWrap.style.marginTop = "20px";
  btnWrap.style.width = "100%";
  btnWrap.appendChild(btn);
  btnWrap.appendChild(downloadBtn);

  card.appendChild(h);
  card.appendChild(btnWrap);

  return card;
}

function updateBreadcrumb() {
  if (!breadcrumb) return;

  if (navigationStack.length === 0) {
    breadcrumb.style.display = "none";
    breadcrumb.setAttribute("aria-hidden", "true");
    return;
  }

  breadcrumb.style.display = "inline-flex";
  breadcrumb.setAttribute("aria-hidden", "false");
  const breadcrumbText = breadcrumb.querySelector(".breadcrumb-text");

  if (navigationStack.length === 1) {
    breadcrumbText.textContent = "الرجوع إلى المواد ←";
    breadcrumb.onclick = renderRootCategories;
    breadcrumb.setAttribute("aria-label", "الرجوع إلى المواد ←");
  } else {
    const parentName = navigationStack[navigationStack.length - 2].name;
    breadcrumbText.textContent = `الرجوع إلى ${parentName} ←`;
    breadcrumb.onclick = () => {
      navigationStack.pop();
      const parent = navigationStack[navigationStack.length - 1];
      navigationStack.pop();
      renderCategory(parent);
    };
    breadcrumb.setAttribute("aria-label", `الرجوع إلى ${parentName}  ←`);
  }
}

// Helper: URL or relative path Check
function isURL_orPath(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    try {
      const base = "http://example.com";
      const url = new URL(string, base);
      const isRelative = url.origin === base;
      const isPathLike = string.includes("/") || string.startsWith(".");
      return isRelative && isPathLike;
    } catch (_) {
      return false;
    }
  }
}

function startQuiz(id, mode) {
  try {
    // Get default mode from user profile if not specified
    const quizMode =
      mode || userProfile.getProfile().defaultQuizMode || "practice";

    // Store in localStorage instead of URL parameters
    localStorage.setItem("quiz_current_mode", quizMode);
    localStorage.setItem("quiz_current_id", id);
    localStorage.setItem("quiz_start_time", Date.now().toString());

    // Navigate with clean URL (no parameters)
    window.location.href = "quiz.html";
  } catch (error) {
    console.error("Error starting quiz:", error);
    alert("حدث خطأ أثناء بدء الاختبار. حاول مرة أخرى.");
  }
}

// Helper function
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Make functions available globally
window.startQuiz = startQuiz;

// ============================================================================
// PWA INSTALLATION
// ============================================================================

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  try {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.querySelector(".install-app");
    if (installBtn) {
      installBtn.style.display = "block";
    }
  } catch (error) {
    console.error("Error handling beforeinstallprompt:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initApp().catch((err) => {
    console.error("Init error:", err);
    if (typeof renderRootCategories === "function") renderRootCategories();
  });

  const installBtn = document.querySelector(".install-app");
  if (installBtn) {
    installBtn.style.display = "none";

    installBtn.addEventListener("click", async () => {
      try {
        if (!deferredPrompt) {
          showNotification(
            "غير متاح",
            "التطبيق غير قابل للتثبيت في الوقت الحالي",
            "./assets/images/warning.png",
          );
          return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
          installBtn.style.display = "none";
          showNotification(
            "تم التثبيت",
            "تم تثبيت التطبيق بنجاح",
            "./favicon.png",
          );
        } else {
          console.log("User dismissed the install prompt");
        }

        deferredPrompt = null;
      } catch (error) {
        console.error("Error during PWA installation:", error);
      }
    });
  }
});

window.addEventListener("appinstalled", () => {
  console.log("PWA installed successfully");
  showNotification(
    "مبروك!",
    "تم تثبيت التطبيق بنجاح على جهازك",
    "./favicon.png",
  );
});

/**
 * Show download popup for user-created quizzes
 * Reuses existing export functions
 */
function showUserQuizDownloadPopup(quiz) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.style.transform = "translateZ(0)";
  modal.style.willChange = "opacity";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "userQuizDownloadTitle");

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";
  modalCard.style.contain = "layout style paint";

  const h2 = document.createElement("h2");
  h2.id = "userQuizDownloadTitle";
  h2.textContent = quiz.title;

  const p = document.createElement("p");
  p.textContent = "اختر طريقة التنزيل";

  const grid = document.createElement("div");
  grid.className = "mode-grid";
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", "خيارات التنزيل");

  // Config object for export functions
  const config = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
  };

  const questions = quiz.questions;

  const onDownloadOption = async (format) => {
    modal.remove();

    try {
      switch (format) {
        case "quiz":
          await exportToQuiz(config, questions);
          break;
        case "html":
          await exportToHtml(config, questions);
          break;
        case "pdf":
          await exportToPdf(config, questions);
          break;
        case "docx":
          await exportToWord(config, questions);
          break;
        case "pptx":
          await exportToPptx(config, questions);
          break;
        case "md":
          exportToMarkdown(config, questions);
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please check console for details.");
    }
  };

  opts.forEach(([icon, label, format]) => {
    const b = document.createElement("button");
    b.className = "mode-btn";
    b.type = "button";
    b.setAttribute("aria-label", `تنزيل كـ ${label}`);
    b.innerHTML = `<img src="${icon}" alt="" class="icon" aria-hidden="true"><strong>${label}</strong>`;
    b.onclick = (ev) => {
      ev.stopPropagation();
      onDownloadOption(format);
    };
    grid.appendChild(b);
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.type = "button";
  closeBtn.textContent = "إلغاء";
  closeBtn.setAttribute("aria-label", "إغلاق النافذة");
  closeBtn.onclick = () => modal.remove();

  modalCard.appendChild(h2);
  modalCard.appendChild(p);
  modalCard.appendChild(grid);
  modalCard.appendChild(closeBtn);
  modal.appendChild(modalCard);

  requestAnimationFrame(() => {
    document.body.appendChild(modal);
    // Focus first button
    const firstBtn = grid.querySelector("button");
    if (firstBtn) firstBtn.focus();
  });
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  // In production, send to error tracking service
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // In production, send to error tracking service
});
