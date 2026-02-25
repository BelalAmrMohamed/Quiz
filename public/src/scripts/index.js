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
  getAvailableYears,
  getAvailableTerms,
} from "./filterUtils.js";

/**
 * Recursively count only the actual quiz/exam leaves under a category node.
 * Subfolders are never counted as quizzes themselves — we recurse into them.
 *
 * Example:
 *   Course (3 exams) + SubA (4 exams) + SubB (4 exams)  →  11  (not 5)
 *
 * NOTE: `categoryTree` is a module-level variable populated by initApp(),
 * so it is always available by the time any card is rendered.
 */
function getCourseItemCount(category) {
  if (!category) return 0;

  // Direct exams on this node
  let count = Array.isArray(category.exams) ? category.exams.length : 0;

  // Recurse into sub-categories — add their quiz counts, NOT +1 per folder
  if (Array.isArray(category.subcategories)) {
    for (const subKey of category.subcategories) {
      const sub = categoryTree?.[subKey];
      if (sub) count += getCourseItemCount(sub);
    }
  }

  return count;
}

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
  ["./assets/images/mardownIcon.png", "Markdown (.md)", "md"],
  ["./assets/images/PDF_Icon.png", "PDF (.pdf)", "pdf"],
  ["./assets/images/pptx_icon.png", "PowerPoint (.pptx)", "pptx"],
  ["./assets/images/word_icon.png", "Word (.docx)", "docx"],
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
    // Read from the standalone "username" key — this is what userProfile.setUsername()
    // always syncs to, so it is the authoritative source regardless of whether the
    // full quiz_user_profile JSON blob exists yet.
    const storedUsername = localStorage.getItem("username");
    const isDefaultName = !storedUsername || storedUsername === "User";

    // Redirect to onboarding when EITHER:
    //   1. The user has never completed onboarding (!hasVisited), OR
    //   2. They completed onboarding but their username is still the default
    //      — meaning they skipped the name step or something went wrong.
    //
    // IMPORTANT: onboarding.html bounces straight back to index.html when it
    // sees first_visit_complete === "true".  So if we're redirecting because
    // of a default username (case 2), we must clear that flag first — otherwise
    // we get an infinite redirect loop between the two pages.
    if (!hasVisited || isDefaultName) {
      if (isDefaultName) {
        localStorage.removeItem("first_visit_complete");
      }
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

    // Create search manager instance with navigation stack getter
    searchManager = new SearchManager(
      "#searchContainer",
      handleSearchResults,
      () => navigationStack,
    );
    searchManager.init(allCourses, categoryTree);
  } catch (error) {
    console.error("Error initializing search manager:", error);
  }
}

/**
 * Handle search results from SearchManager.
 * Called whenever search results change, or when isReset = true to restore the original view.
 */
function handleSearchResults(results, context, isReset = false) {
  try {
    // When the search bar is closed, restore the full root view without filtering
    if (isReset) {
      if (context === "userQuizzes") {
        renderUserQuizzesView();
      } else {
        renderRootCategories();
      }
      return;
    }

    if (context === "courses") {
      handleCourseSearchResults(results);
    } else if (context === "quizzes") {
      handleQuizSearchResults(results);
    } else if (context === "userQuizzes") {
      handleUserQuizSearchResults(results);
    }
  } catch (error) {
    console.error("Error handling search results:", error);
  }
}

/**
 * Handle course search results (in root view)
 */
function handleCourseSearchResults(results) {
  try {
    if (searchManager && searchManager.isSearchActive()) {
      // Active search — show filtered course results
      navigationStack = [];
      updateBreadcrumb();
      if (title) title.textContent = "نتائج البحث";
      renderCourseSearchResults(results);
    } else {
      // Search query cleared inside the bar (not a full close) — restore root view.
      // NOTE: a full close (× button) triggers isReset = true in handleSearchResults,
      // which calls renderRootCategories() directly. This branch handles the case
      // where the user just backspaces the query while keeping the bar open.
      renderRootCategories();
    }
  } catch (error) {
    console.error("Error handling course search results:", error);
  }
}

/**
 * Handle quiz search results (inside a course)
 */
function handleQuizSearchResults(results) {
  try {
    // Keep navigation stack and title as is
    // Just update the quiz display
    renderQuizSearchResults(results);
  } catch (error) {
    console.error("Error handling quiz search results:", error);
  }
}

/**
 * Handle user quiz search results
 */
function handleUserQuizSearchResults(results) {
  try {
    if (!container) return;

    container.innerHTML = "";

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

    if (!results || results.length === 0) {
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
        <h3 style="margin-bottom: 10px;">لا توجد نتائج بحث</h3>
      `;
      container.appendChild(emptyState);
    } else {
      const allUserQuizzes = JSON.parse(getFromStorage("user_quizzes", "[]"));
      results.forEach((quiz) => {
        const originalIndex = allUserQuizzes.findIndex((q) => q.id === quiz.id);
        const quizCard = createUserQuizCard(
          quiz,
          originalIndex !== -1 ? originalIndex : 0,
        );
        container.appendChild(quizCard);
      });
    }
  } catch (error) {
    console.error("Error handling user quiz search results:", error);
  }
}

/**
 * Render course search results in the main container
 */
function renderCourseSearchResults(courses) {
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

    // Render course cards with subscribe button
    courses.forEach((course) => {
      const itemCount = getCourseItemCount(course);
      const card = createCategoryCard(course.name, itemCount, true, course);

      // Add subscribe button if in search results
      if (searchManager && searchManager.isSearchActive()) {
        addSubscribeButton(card, course);
      }

      card.onclick = () => renderCategory(categoryTree[course.key]);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  } catch (error) {
    console.error("Error rendering course search results:", error);
    if (container) {
      container.innerHTML = `
        <div class="error-state" role="alert">
          <p>حدث خطأ أثناء عرض النتائج. يرجى المحاولة مرة أخرى.</p>
        </div>
      `;
    }
  }
}

/**
 * Render quiz search results
 */
function renderQuizSearchResults(exams) {
  try {
    if (!container) return;

    // Get current category from navigation stack
    const currentCategory = navigationStack[navigationStack.length - 1];
    if (!currentCategory) return;

    container.innerHTML = "";
    container.className = "grid-container";
    container.setAttribute("aria-busy", "false");

    const fragment = document.createDocumentFragment();

    // Render subcategories first (if any)
    if (
      currentCategory.subcategories &&
      currentCategory.subcategories.length > 0
    ) {
      currentCategory.subcategories.forEach((subCatKey) => {
        const subCat = categoryTree[subCatKey];
        if (subCat) {
          const itemCount = getCourseItemCount(subCat);
          const card = createCategoryCard(subCat.name, itemCount, true);
          card.onclick = () => renderCategory(subCat);
          fragment.appendChild(card);
        }
      });
    }

    if (
      exams.length === 0 &&
      (!currentCategory.subcategories ||
        currentCategory.subcategories.length === 0)
    ) {
      // Empty state for no results
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.setAttribute("role", "status");
      emptyState.innerHTML = `
        <div class="empty-state-icon" aria-hidden="true">🔍</div>
        <h3>لا توجد نتائج</h3>
        <p>جرّب البحث بكلمات مختلفة</p>
      `;
      container.appendChild(emptyState);
      return;
    }

    // Render filtered exams
    exams.forEach((exam) => {
      const card = createExamCard(exam);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  } catch (error) {
    console.error("Error rendering quiz search results:", error);
  }
}

/**
 * Add subscribe button to a course card
 */
function addSubscribeButton(card, course) {
  try {
    // Check if already subscribed
    const subscribedIds = userProfile.getSubscribedCourseIds();
    const isSubscribed = subscribedIds.includes(course.id);

    // Create button container
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = `
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
    `;

    // Create subscribe button
    const subscribeBtn = document.createElement("button");
    subscribeBtn.className = "subscribe-btn";
    subscribeBtn.textContent = isSubscribed ? "✓ مشترك" : "+ إضافة";
    subscribeBtn.type = "button";
    subscribeBtn.setAttribute(
      "aria-label",
      isSubscribed ? `مشترك في ${course.name}` : `إضافة ${course.name}`,
    );
    subscribeBtn.style.cssText = `
      width: 100%;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      ${
        isSubscribed
          ? `
          background: var(--color-success-light, #d1fae5);
          color: var(--color-success, #059669);
          cursor: default;
        `
          : `
          background: var(--gradient-accent);
          color: white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        `
      }
    `;

    if (!isSubscribed) {
      subscribeBtn.onclick = (e) => {
        e.stopPropagation();
        subscribeToCourse(course, subscribeBtn);
      };

      subscribeBtn.onmouseenter = () => {
        if (!isSubscribed) {
          subscribeBtn.style.transform = "translateY(-1px)";
          subscribeBtn.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.15)";
        }
      };

      subscribeBtn.onmouseleave = () => {
        if (!isSubscribed) {
          subscribeBtn.style.transform = "translateY(0)";
          subscribeBtn.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
        }
      };
    }

    btnContainer.appendChild(subscribeBtn);
    card.appendChild(btnContainer);
  } catch (error) {
    console.error("Error adding subscribe button:", error);
  }
}

/**
 * Subscribe to a course
 */
function subscribeToCourse(course, button) {
  try {
    userProfile.subscribeToCourse(course.id);

    // Update button appearance
    button.textContent = "✓ مشترك";
    button.style.background = "var(--color-success-light, #d1fae5)";
    button.style.color = "var(--color-success, #059669)";
    button.style.cursor = "default";
    button.style.boxShadow = "none";
    button.setAttribute("aria-label", `مشترك في ${course.name}`);
    button.onclick = null;

    // Show notification
    showNotification(
      "تم الإشتراك",
      `تم إضافة ${course.name} إلى موادك`,
      "./favicon.png",
    );
  } catch (error) {
    console.error("Error subscribing to course:", error);
    alert("حدث خطأ أثناء الإشتراك. حاول مرة أخرى.");
  }
}

function renderRootCategories() {
  try {
    navigationStack = [];
    updateBreadcrumb();

    // Update search context when returning to root
    if (searchManager) {
      searchManager.updateContextVisibility();
    }

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

    // Update search context for user quizzes
    if (searchManager) {
      searchManager.container.style.display = ""; // Reset inline hide
      searchManager.setUserQuizzesContext(userQuizzes);
    }

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
  deleteBtn.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
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

  const editBtn = document.createElement("button");
  editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>`;
  editBtn.type = "button";
  editBtn.setAttribute("aria-label", `تعديل اختبار ${quiz.title}`);
  editBtn.style.cssText = `
    padding: 10px 14px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
  `;
  editBtn.onclick = (e) => {
    e.stopPropagation();
    window.location.href = `create-quiz.html?edit=${encodeURIComponent(quiz.id)}`;
  };

  actions.appendChild(playBtn);
  actions.appendChild(downloadBtn);
  actions.appendChild(editBtn);
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
    window.location.href = `quiz.html?id=${encodeURIComponent(quiz.id)}&type=user`;
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
        "هل أنت متأكد من مسح الإمتحان؟ لا يمكن إسترداده",
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

    // Update search context when entering a category
    if (searchManager) {
      searchManager.updateContextVisibility();
    }

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

    // Show the faculty if the user didn't set their faculty, or if it's a different faculty than the user's
    if (profile.faculty === "All" || courseData.faculty != profile.faculty)
      metaDiv.appendChild(facultyBadge);

    // Only show year and term if the user didn't set them, or they're different than the user's
    if (
      courseData.year != profile.year ||
      profile.year === "All" ||
      courseData.term != profile.term ||
      profile.term === "All"
    ) {
      metaDiv.appendChild(yearBadge);
      metaDiv.appendChild(termBadge);
    }

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
    startQuiz(exam.id);
  };

  const onDownloadOption = async (format) => {
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
      b.innerHTML = `<img src="${icon}" alt="context icon" class="icon" aria-hidden="true"><strong>${label}</strong>`;
      b.onclick = (ev) => {
        ev.stopPropagation();
        withDownloadLoading(b, () => onDownloadOption(format)).then(() =>
          modal.remove(),
        );
      };
      grid.appendChild(b);
    });

    const jsonBtn = document.createElement("button");
    jsonBtn.className = "mode-btn";
    jsonBtn.type = "button";
    jsonBtn.setAttribute("aria-label", `Download JSON (.json)`);
    jsonBtn.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-braces-icon lucide-file-braces"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg><strong>JSON (.json)</strong>`;
    jsonBtn.onclick = (ev) => {
      ev.stopPropagation();
      withDownloadLoading(jsonBtn, async () => {
        try {
          const res = await fetch(exam.path);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${exam.title || exam.id}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("JSON Error:", e);
          alert("فشل تنزيل ملف JSON");
        }
      }).then(() => modal.remove());
    };
    grid.appendChild(jsonBtn);

    fetch(exam.path)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.source) {
          const sourceBtn = document.createElement("button");
          sourceBtn.className = "mode-btn";
          sourceBtn.type = "button";
          sourceBtn.setAttribute("aria-label", `Download Source`);
          sourceBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-to-line-icon lucide-arrow-down-to-line"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg><strong>Download Source</strong>`;
          sourceBtn.onclick = (ev) => {
            ev.stopPropagation();
            window.open(data.source, "_blank");
            modal.remove();
          };
          grid.appendChild(sourceBtn);
        }
      })
      .catch((e) => console.error("Error fetching for source:", e));

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

/**
 * Wrapper for download buttons to show loading state
 */
async function withDownloadLoading(buttonEl, asyncFn) {
  const originalHtml = buttonEl.innerHTML;
  const originalWidth = buttonEl.offsetWidth;

  buttonEl.disabled = true;
  buttonEl.style.width = `${originalWidth > 0 ? originalWidth : buttonEl.getBoundingClientRect().width}px`;
  buttonEl.style.justifyContent = "center";
  buttonEl.innerHTML =
    '<i data-lucide="loader-circle" class="spin"></i> جاري التحميل...';
  if (typeof lucide !== "undefined") lucide.createIcons();

  try {
    await asyncFn();
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
    buttonEl.style.width = "";
    buttonEl.style.justifyContent = "";
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

function startQuiz(id) {
  try {
    localStorage.setItem("quiz_start_time", Date.now().toString());

    // Only the quiz ID travels in the URL → links are shareable
    window.location.href = `quiz.html?id=${encodeURIComponent(id)}`;
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
      withDownloadLoading(b, () => onDownloadOption(format)).then(() =>
        modal.remove(),
      );
    };
    grid.appendChild(b);
  });

  const jsonBtn = document.createElement("button");
  jsonBtn.className = "mode-btn";
  jsonBtn.type = "button";
  jsonBtn.setAttribute("aria-label", `Download JSON (.json)`);
  jsonBtn.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-braces-icon lucide-file-braces"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg><strong>JSON (.json)</strong>`;
  jsonBtn.onclick = (ev) => {
    ev.stopPropagation();
    withDownloadLoading(jsonBtn, async () => {
      try {
        const exportQuestions = quiz.questions.map((q) => {
          const question = { q: q.q, options: q.options, correct: q.correct };
          if (q.image && q.image.trim()) question.image = q.image;
          if (q.explanation && q.explanation.trim())
            question.explanation = q.explanation;
          return question;
        });
        const payload = { questions: exportQuestions };
        const fileContent = JSON.stringify(payload, null, 2);
        const blob = new Blob([fileContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${quiz.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("JSON Error:", e);
        alert("فشل تنزيل ملف JSON");
      }
    }).then(() => modal.remove());
  };
  grid.appendChild(jsonBtn);

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
