// ============================================================================
// src/scripts/index.js - Enhanced with Security, Performance, and Accessibility
// All original functionality preserved + improvements added
// ============================================================================

import { getManifest } from "./quizManifest.js";
import { userProfile } from "./userProfile.js";
import { SearchManager } from "./search-manager.js";
import { extractTextFromFile, parseImportContent } from "./quiz-processor.js";

let categoryTree = null;
let searchManager = null;

// Download functions
import { exportToQuiz } from "../export/export-to-quiz.js";
import { exportToHtml } from "../export/export-to-html.js";
import { exportToPdf } from "../export/export-to-pdf.js";
import { exportToWord } from "../export/export-to-word.js";
import { exportToPptx } from "../export/export-to-pptx.js";
import { exportToMarkdown } from "../export/export-to-markdown.js";
import { buildQuizText } from "../export/export-to-text.js";
import { createUploadButton } from "./adminUpload.js";
import { isAdminAuthenticated, hasAdminSessionHint } from "./adminAuth.js";

// Helper utilities
import { getSubscribedCourses } from "./filterUtils.js";

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

function formatArabicQuestionCount(count) {
  if (!count || count === 0) return "لا أسئلة";
  if (count === 1) return "سؤال واحد";
  if (count === 2) return "سؤالين";
  if (count >= 3 && count <= 10) return `${count} أسئلة`;
  return `${count} سؤال`;
}

// ============================================================================
// SUBJECT ICON UTILITY — keyword-based emoji assignment
// ============================================================================

const SUBJECT_ICON_MAP = [
  {
    keywords: [
      "math",
      "calculus",
      "algebra",
      "statistics",
      "probability",
      "رياضيات",
      "احصاء",
      "احتمالات",
      "جبر",
      "تفاضل",
      "تكامل",
      "إحصاء",
    ],
    icon: "🎲",
  },
  {
    keywords: ["physics", "فيزياء", "ميكانيكا", "كهرباء"],
    icon: "⚛️",
  },
  {
    keywords: ["chemistry", "كيمياء"],
    icon: "🧪",
  },
  {
    keywords: [
      "programming",
      "code",
      "software",
      "python",
      "java",
      "c++",
      "برمجة",
      "خوارزميات",
      "algorithms",
      "object",
      "oop",
    ],
    icon: "💻",
  },
  {
    keywords: ["database", "sql", "قواعد بيانات", "بيانات"],
    icon: "🗄️",
  },
  {
    keywords: ["network", "شبكات", "networking", "tcp", "ip"],
    icon: "🌐",
  },
  {
    keywords: [
      "artificial intelligence",
      "machine learning",
      "deep learning",
      "ذكاء اصطناعي",
      "تعلم آلي",
      "تعلم عميق",
      "ai",
      "ml",
    ],
    icon: "🤖",
  },
  {
    keywords: ["security", "أمن", "cybersecurity", "cryptography", "تشفير"],
    icon: "🔒",
  },
  {
    keywords: [
      "operating system",
      "os",
      "نظم تشغيل",
      "linux",
      "windows",
      "unix",
    ],
    icon: "⚙️",
  },
  {
    keywords: [
      "digital",
      "circuit",
      "hardware",
      "دوائر",
      "رقمي",
      "إلكترونيات",
      "electronics",
      "logic",
    ],
    icon: "🔌",
  },
  {
    keywords: ["english", "language", "انجليزي", "لغة", "grammar"],
    icon: "🗣️",
  },
  {
    keywords: [
      "data structure",
      "هياكل بيانات",
      "linked list",
      "tree",
      "graph",
    ],
    icon: "🌲",
  },
  {
    keywords: ["web", "html", "css", "javascript", "frontend", "backend"],
    icon: "🕸️",
  },
  {
    keywords: ["mobile", "android", "ios", "flutter", "موبايل"],
    icon: "📱",
  },
  {
    keywords: [
      "computer graphics",
      "رسومات",
      "graphics",
      "image processing",
      "معالجة صور",
    ],
    icon: "🎨",
  },
  {
    keywords: ["computer", "حاسبات", "information", "معلومات"],
    icon: "🖥️",
  },
];

/**
 * Returns an emoji icon based on the subject/course name.
 * @param {string} name - The name of the subject or folder
 * @param {boolean} isSubfolder - True if this is a subfolder inside a course
 * @returns {string} emoji
 */
function getSubjectIcon(name, isSubfolder = false) {
  if (isSubfolder) return "📁"; // Subfolders always get a folder icon

  const lower = (name || "").toLowerCase();
  for (const entry of SUBJECT_ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return "📚"; // Default for root categories with no keyword match
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
  // ── Guard: check for redirect BEFORE any rendering ──────────────────────
  try {
    const hasVisited = localStorage.getItem("first_visit_complete");
    const storedUsername = localStorage.getItem("username");
    const isDefaultName = !storedUsername || storedUsername === "User";

    if (!hasVisited || isDefaultName) {
      if (isDefaultName) localStorage.removeItem("first_visit_complete");
      window.location.href = "onboarding.html";
      return; // Stop — we're redirecting
    }
  } catch (e) {
    console.error("Error checking first-visit state:", e);
  }

  // ── 1. Leave skeleton visible; just mark aria state ───────────────────────
  // The skeleton HTML in index.html is shown while we wait for the manifest.
  // Do NOT clear container.innerHTML here — that would hide the skeleton.
  // The “إمتحاناتك” card is now a static skeleton item in index.html
  // and is replaced properly by renderRootCategories() after the manifest loads.
  if (container) {
    container.setAttribute("aria-busy", "true");
  }

  // ── 2. Fetch manifest asynchronously, then render all categories ─────────
  try {
    const manifest = await getManifest();
    categoryTree = manifest.categoryTree;
    initializeSearchManager();
  } catch (err) {
    console.error("Failed to load quiz manifest:", err);
    categoryTree = {};
  }

  // ── 3. Full render now that manifest is ready ────────────────────────────
  try {
    // ── Obj 4: Hash-based routing ──
    const hash = window.location.hash.slice(1); // strip leading #
    let navigatedViaHash = false;

    if (hash === "my-quizzes") {
      navigatedViaHash = true;
      renderUserQuizzesView();
    } else if (hash.startsWith("category/")) {
      const rawKey = decodeURIComponent(hash.slice("category/".length));
      const cat = categoryTree && categoryTree[rawKey];
      if (cat) {
        navigatedViaHash = true;
        // Reconstruct ancestor chain so breadcrumb "back" works correctly
        // e.g. for subfolder_2, ancestors = [root_cat, subfolder_1]
        const ancestors = findCategoryAncestors(rawKey, categoryTree);
        navigationStack = [...ancestors]; // pre-load ancestors without re-rendering
        renderCategory(cat); // pushes cat, renders content
      }
    }

    if (!navigatedViaHash) {
      renderRootCategories();
    }
  } catch (error) {
    console.error("Error in renderRootCategories:", error);
    renderRootCategories(); // retry once
  }
}
/**
 * Find the chain of ancestor category objects for a given category key.
 * Returns an array ordered from root → direct parent (not including the target itself).
 * Used to reconstruct navigationStack when loading from a deep-link hash.
 *
 * @param {string} targetKey  - The key of the category we navigated to
 * @param {object} tree       - The flat categoryTree object
 * @returns {Array}           - Array of ancestor category objects (may be empty for root categories)
 */
function findCategoryAncestors(targetKey, tree) {
  if (!tree || !targetKey) return [];
  for (const [key, cat] of Object.entries(tree)) {
    if (
      Array.isArray(cat.subcategories) &&
      cat.subcategories.includes(targetKey)
    ) {
      // `cat` is the direct parent — recurse to find grandparents
      const grandAncestors = findCategoryAncestors(key, tree);
      return [...grandAncestors, cat];
    }
  }
  return []; // targetKey is a root-level category
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
          const card = createCategoryCard(
            subCat.name,
            itemCount,
            true,
            null,
            true,
          );
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

    // ── Obj 4: Update URL hash ──
    history.replaceState(null, "", window.location.pathname);

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

    // ── Obj 4: Update URL hash ──
    window.location.hash = "my-quizzes";

    // Update Title & Clear Container
    if (title) title.textContent = "إمتحاناتك";
    if (!container) return;

    container.innerHTML = "";
    container.className = "grid-container user-quizzes-drop-zone";

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

    if (!isAdminAuthenticated()) {
      const adminSignInBtn = document.createElement("a");
      adminSignInBtn.href = "sign-in.html";
      adminSignInBtn.textContent = "🔐 دخول المشرفين";
      adminSignInBtn.className = "btn";
      adminSignInBtn.setAttribute("aria-label", "لوحة دخول المشرفين");
      adminSignInBtn.style.cssText =
        "display: inline-block;       padding: 10px 18px;       background: var(--color-background-secondary);       border: 1.5px solid var(--color-border);       color: var(--color-text-secondary);       text-decoration: none;       border-radius: 8px;       font-weight: 600;       font-size: 0.88rem;       transition: all 0.2s;       margin-left: 10px;";
      adminSignInBtn.onmouseover = () => {
        adminSignInBtn.style.borderColor = "var(--color-primary)";
        adminSignInBtn.style.color = "var(--color-primary)";
      };
      adminSignInBtn.onmouseout = () => {
        adminSignInBtn.style.borderColor = "var(--color-border)";
        adminSignInBtn.style.color = "var(--color-text-secondary)";
      };
      actionsBar.appendChild(adminSignInBtn);
    }

    container.appendChild(actionsBar);

    // Inline create-quiz card (always visible in this view)
    const inlineCreateCard = createInlineCreateQuizCard();
    container.appendChild(inlineCreateCard);

    // Ensure drag-and-drop import is enabled for this section
    setupUserQuizzesDropZone();

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

function setupUserQuizzesDropZone() {
  const dropContainer = document.getElementById("contentArea");
  if (!dropContainer || dropContainer.dataset.userQuizzesDropReady === "1")
    return;

  dropContainer.dataset.userQuizzesDropReady = "1";

  dropContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropContainer.classList.add("user-quizzes-drag-over");
  });

  dropContainer.addEventListener("dragleave", (e) => {
    if (e.target === dropContainer) {
      dropContainer.classList.remove("user-quizzes-drag-over");
    }
  });

  dropContainer.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropContainer.classList.remove("user-quizzes-drag-over");
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    await handleUserQuizzesDrop(files);
  });
}

async function handleUserQuizzesDrop(files) {
  const allowedExts = [".txt", ".docx", ".pdf", ".pptx", ".json"];
  const validFiles = [];
  const invalidNames = [];

  files.forEach((file) => {
    const lower = file.name.toLowerCase();
    if (allowedExts.some((ext) => lower.endsWith(ext))) {
      validFiles.push(file);
    } else {
      invalidNames.push(file.name);
    }
  });

  if (invalidNames.length) {
    showNotification(
      "ملفات غير مدعومة",
      `بعض الملفات تم تجاهلها:\n${invalidNames.join(", ")}`,
      "warning",
    );
  }

  if (!validFiles.length) return;

  const existingQuizzes = JSON.parse(getFromStorage("user_quizzes", "[]"));
  let importedCount = 0;

  for (const file of validFiles) {
    let text;
    try {
      text = await extractTextFromFile(file);
    } catch (err) {
      console.error("Import extract error:", err);
      showNotification(
        "خطأ في القراءة",
        `تعذّر قراءة ${file.name}: ${err.message}`,
        "error",
      );
      continue;
    }

    const defaultTitle = file.name
      .replace(/\.(json|txt|pdf|docx|pptx)$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    let parsed;
    try {
      parsed = parseImportContent(text, defaultTitle);
    } catch (err) {
      console.error("Import parse error:", err);
      showNotification(
        "خطأ في التنسيق",
        `${file.name}: ${err.message}`,
        "error",
      );
      continue;
    }

    if (!parsed.questions || !parsed.questions.length) continue;

    const quizId = `user_quiz_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    existingQuizzes.push(buildUserQuizEntry(quizId, parsed, defaultTitle));
    importedCount++;
  }

  if (importedCount > 0) {
    const quizCountText =
      importedCount === 1
        ? "إمتحان واحد"
        : importedCount === 2
          ? "إمتحانان"
          : importedCount > 2 && importedCount < 11
            ? `${importedCount} إمتحانات`
            : `${importedCount} إمتحان`;

    setInStorage("user_quizzes", JSON.stringify(existingQuizzes));
    showNotification(
      "تم الإنشاء",
      `تم إنشاء ${quizCountText} في "إمتحاناتك"`,
      "success",
    );
    renderRootCategories();
    renderUserQuizzesView();
  }
}

function createInlineCreateQuizCard() {
  const card = document.createElement("div");
  card.className = "exam-card user-create-quiz-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "إنشاء إمتحان جديد من نص");

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.textContent = "➕";
  icon.setAttribute("aria-hidden", "true");

  const titleEl = document.createElement("h3");
  titleEl.textContent = "إنشاء إمتحان جديد";

  const desc = document.createElement("p");
  desc.textContent =
    'الصق أسئلة الإمتحان كنص وسيتم تحويلها تلقائيًا إلى كويز داخل "إمتحاناتك".';

  card.appendChild(icon);
  card.appendChild(titleEl);
  card.appendChild(desc);

  const open = () => openInlineCreateQuizModal();
  card.onclick = open;
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return card;
}

function openInlineCreateQuizModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "inlineCreateQuizTitle");
  overlay.style.cssText = `
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(0, 0, 0, 0.6);
  `;

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";
  modalCard.style.cssText = `
    padding: 28px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    max-width: 550px;
    width: 90%;
    transform: translateY(20px);
    opacity: 0;
    animation: modalPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `;

  if (!document.getElementById("modal-pop-in-style")) {
    const style = document.createElement("style");
    style.id = "modal-pop-in-style";
    style.textContent = `
      @keyframes modalPopIn {
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  modalCard.innerHTML = `
    <h2 id="inlineCreateQuizTitle" style="margin-bottom: 12px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px; color: var(--color-text-primary);">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus" style="color: var(--color-primary);"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>
      إنشاء إمتحان جديد
    </h2>
    <p style="margin-bottom:24px; color: var(--color-text-secondary); font-size: 0.95rem; line-height: 1.5;">الصق أو اكتب أسئلة الإمتحان في الحقل التالي، أو قم باستيراد ملف، وسنحوّلها تلقائيًا إلى كويز داخل "إمتحاناتك".</p>
    <div class="form-group" style="margin-bottom: 18px;">
      <label for="inlineQuizTitle" style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--color-text-primary); font-size: 0.9rem;">عنوان الإمتحان</label>
      <input type="text" id="inlineQuizTitle" placeholder="Arrays in C++" style="width: 100%; padding: 14px 16px; direction: ltr; border: 1.5px solid var(--color-border); border-radius: 12px; background: var(--color-background); color: var(--color-text-primary); font-family: inherit; font-size: 1rem; transition: all 0.2s; outline: none; box-sizing: border-box;" onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 4px var(--color-primary-light)';" onblur="this.style.borderColor='var(--color-border)'; this.style.boxShadow='none';"/>
    </div>
    <div class="form-group" style="margin-bottom: 24px;">
      <label for="inlineQuizContent" style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--color-text-primary); font-size: 0.9rem;">محتوى الإمتحان</label>
      <textarea id="inlineQuizContent" rows="8" style="width: 100%; padding: 16px; direction: ltr; border: 1.5px solid var(--color-border); border-radius: 12px; background: var(--color-background); color: var(--color-text-primary); font-family: inherit; font-size: 0.95rem; line-height: 1.6; transition: all 0.2s; outline: none; resize: vertical; box-sizing: border-box;" onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 4px var(--color-primary-light)';" onblur="this.style.borderColor='var(--color-border)'; this.style.boxShadow='none';">1. Which programming languange is fastest?

A. Python
B. Rust
C. C++
D. C#

Correct: C

Explanation: C++ is the fastest programming language of them.

2. Python is harder than C++.

A. True
B. False

Correct: B

3. Write a C++ code to print \`Hello World!\`.

- \`\`\`cout << "Hello World!" << endl;\`\`\`

Explanation: C++ uses \`cout\` for printing statements.</textarea>
    </div>
    <div class="profile-actions" style="display: flex; gap: 12px; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
      <button type="button" id="inlineQuizImport" style="padding: 12px 18px; border-radius: 12px; border: 1.5px solid var(--color-border); background: var(--color-background-secondary); color: var(--color-text-primary); display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 0.95rem; font-family: inherit;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        استيراد ملف
      </button>
      <div style="flex: 1;"></div>
      <button type="button" id="inlineQuizCancel" style="padding: 12px 20px; border-radius: 12px; border: none; background: transparent; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 0.95rem; font-family: inherit;">إلغاء</button>
      <button type="button" id="inlineQuizCreate" style="padding: 12px 28px; border-radius: 12px; border: none; background: var(--gradient-accent); color: white; cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 0.95rem; font-family: inherit; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">إنشاء  ✨</button>
    </div>
    <input type="file" id="inlineQuizFileInput" accept=".txt,.docx,.pdf,.pptx,.json" style="display: none;" />
  `;

  overlay.appendChild(modalCard);
  document.body.appendChild(overlay);

  const titleInput = modalCard.querySelector("#inlineQuizTitle");
  const contentInput = modalCard.querySelector("#inlineQuizContent");
  const cancelBtn = modalCard.querySelector("#inlineQuizCancel");
  const createBtn = modalCard.querySelector("#inlineQuizCreate");
  const importBtn = modalCard.querySelector("#inlineQuizImport");
  const fileInput = modalCard.querySelector("#inlineQuizFileInput");

  importBtn.onmouseover = () => {
    importBtn.style.borderColor = "var(--color-primary)";
    importBtn.style.color = "var(--color-primary)";
  };
  importBtn.onmouseout = () => {
    importBtn.style.borderColor = "var(--color-border)";
    importBtn.style.color = "var(--color-text-primary)";
  };
  cancelBtn.onmouseover = () => {
    cancelBtn.style.background = "var(--color-background-secondary)";
    cancelBtn.style.color = "var(--color-text-primary)";
  };
  cancelBtn.onmouseout = () => {
    cancelBtn.style.background = "transparent";
    cancelBtn.style.color = "var(--color-text-secondary)";
  };
  createBtn.onmouseover = () => {
    createBtn.style.transform = "translateY(-2px)";
    createBtn.style.boxShadow = "0 6px 20px rgba(220, 38, 38, 0.5)";
  };
  createBtn.onmouseout = () => {
    createBtn.style.transform = "translateY(0)";
    createBtn.style.boxShadow = "0 4px 14px rgba(220, 38, 38, 0.4)";
  };

  const close = () => {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.2s";
    modalCard.style.transform = "translateY(10px)";
    modalCard.style.transition = "transform 0.2s";
    setTimeout(() => overlay.remove(), 200);
  };

  cancelBtn.onclick = close;

  importBtn.onclick = () => fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importBtn.innerHTML =
      '<span class="adm-spinner" style="margin: 0; border-color: var(--color-primary); border-top-color: transparent;"></span> استخراج...';
    importBtn.disabled = true;

    try {
      const text = await extractTextFromFile(file);
      contentInput.value = text;

      const defaultTitle = file.name
        .replace(/\.(json|txt|pdf|docx|pptx)$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      if (!titleInput.value) {
        titleInput.value = defaultTitle;
      }

      showNotification(
        "نجاح",
        "تم استخراج النص، يمكنك تعديله أو إنشاء الكويز الآن.",
        "success",
      );
    } catch (err) {
      console.error("Import extract error:", err);
      showNotification(
        "خطأ في القراءة",
        `تعذّر قراءة ${file.name}: ${err.message}`,
        "error",
      );
    } finally {
      importBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> استيراد ملف';
      importBtn.disabled = false;
      fileInput.value = "";
    }
  };

  createBtn.onclick = async () => {
    const title = (titleInput.value || "").trim();
    const content = (contentInput.value || "").trim();
    if (!content) {
      showNotification("بيانات ناقصة", "الرجاء إدخال المحتوى.", "warning");
      return;
    }

    let parsed;
    try {
      parsed = parseImportContent(content, title || "Quiz");
    } catch (err) {
      showNotification("خطأ في التنسيق", err.message, "error");
      return;
    }

    if (!parsed.questions || !parsed.questions.length) {
      showNotification(
        "لا توجد أسئلة",
        "لم يتم العثور على أسئلة صالحة في المحتوى.",
        "error",
      );
      return;
    }

    const quizzes = JSON.parse(getFromStorage("user_quizzes", "[]"));
    const quizId = `user_quiz_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    quizzes.push(buildUserQuizEntry(quizId, parsed, title || "Untitled Quiz"));

    setInStorage("user_quizzes", JSON.stringify(quizzes));
    close();
    showNotification(
      "تم الإنشاء",
      'تم إنشاء الإمتحان وإضافته إلى "إمتحاناتك"',
      "success",
    );
    renderRootCategories();
    renderUserQuizzesView();
  };

  const escHandler = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
      document.removeEventListener("keydown", escHandler);
    }
  });

  setTimeout(() => {
    titleInput.focus();
  }, 50);
}

// ── User-quiz schema helpers ─────────────────────────────────────────────────
// Quizzes may be stored in the old flat schema OR the new meta+stats schema.
// These helpers normalise reads so every consumer works with both.

/** Read a field from either old or new schema */
function qz(quiz, field) {
  switch (field) {
    case "title":
      return quiz.meta?.title || quiz.title || "";
    case "description":
      return quiz.meta?.description || quiz.description || "";
    case "source":
      return quiz.meta?.source || quiz.source || "";
    case "createdAt":
      return quiz.meta?.createdAt || quiz.createdAt || "";
    case "count":
      return quiz.stats?.questionCount ?? quiz.questions?.length ?? 0;
    default:
      return undefined;
  }
}

/** Normalize essay questions from old 1-option format to new answer field */
function normalizeQuestions(questions) {
  return (questions || []).map((q) => {
    if (Array.isArray(q.options) && q.options.length === 1) {
      const { options, correct, ...rest } = q;
      return { ...rest, answer: options[0] ?? "" };
    }
    return q;
  });
}

/** Build a new-schema quiz entry for localStorage */
function buildUserQuizEntry(id, parsed, titleFallback) {
  const questions = normalizeQuestions(parsed.questions || []);
  const types = new Set();
  questions.forEach((q) => {
    if (!Array.isArray(q.options) || q.options.length === 0) types.add("Essay");
    else if (q.options.length === 2) types.add("True/False");
    else types.add("MCQ");
  });
  return {
    id,
    meta: {
      title: parsed.meta?.title || titleFallback || "Untitled",
      createdAt: new Date().toLocaleString("en-US"),
      ...(parsed.meta?.description
        ? { description: parsed.meta.description }
        : {}),
      ...(parsed.meta?.source ? { source: parsed.meta.source } : {}),
    },
    stats: {
      questionCount: questions.length,
      questionTypes: Array.from(types).sort(),
    },
    questions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a card for a user-created quiz
 */
function createUserQuizCard(quiz, index) {
  const card = document.createElement("div");
  card.className = "exam-card user-quiz-card";
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", `اختبار: ${qz(quiz, "title")}`);
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
    margin-top: 24px;
    position: relative;
    z-index: 1;
  `;
  card.appendChild(badge);

  // Quiz title
  const titleEl = document.createElement("h3");
  titleEl.textContent = qz(quiz, "title");
  titleEl.style.cssText = `
    margin: 0 0 8px 0;
    color: var(--color-text-primary);
    font-size: 1.1rem;
  `;
  card.appendChild(titleEl);

  // Description
  if (qz(quiz, "description")) {
    const desc = document.createElement("p");
    desc.textContent = qz(quiz, "description");
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
  const count = qz(quiz, "count");
  questionsCount.textContent = `📝 ${formatArabicQuestionCount(count)}`;
  questionsCount.style.cssText = `
    color: var(--color-text-secondary);
    font-size: 0.85rem;
  `;

  const createdDate = document.createElement("span");
  const date = new Date(qz(quiz, "createdAt"));

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
  playBtn.setAttribute("aria-label", `بدء اختبار ${qz(quiz, "title")}`);
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
  deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", `حذف اختبار ${qz(quiz, "title")}`);
  deleteBtn.style.cssText = `
    position: absolute;
    top: 14px;
    left: 14px;
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-error-light);
    color: var(--color-error);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
  `;
  deleteBtn.onmouseover = () => {
    deleteBtn.style.background = "var(--color-error)";
    deleteBtn.style.color = "white";
    deleteBtn.style.transform = "scale(1.05)";
  };
  deleteBtn.onmouseout = () => {
    deleteBtn.style.background = "var(--color-error-light)";
    deleteBtn.style.color = "var(--color-error)";
    deleteBtn.style.transform = "scale(1)";
  };
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteUserQuiz(quiz.id, index);
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "تحميل";
  downloadBtn.type = "button";
  downloadBtn.setAttribute("aria-label", `تحميل اختبار ${qz(quiz, "title")}`);
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
  editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>`;
  editBtn.type = "button";
  editBtn.setAttribute("aria-label", `تعديل اختبار ${qz(quiz, "title")}`);
  editBtn.style.cssText = `
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-light);
    color: var(--color-primary);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
  `;
  editBtn.onmouseover = () => {
    editBtn.style.background = "var(--color-primary)";
    editBtn.style.color = "white";
    editBtn.style.transform = "scale(1.05)";
  };
  editBtn.onmouseout = () => {
    editBtn.style.background = "var(--color-primary-light)";
    editBtn.style.color = "var(--color-primary)";
    editBtn.style.transform = "scale(1)";
  };
  editBtn.onclick = (e) => {
    e.stopPropagation();
    window.location.href = `create-quiz.html?edit=${encodeURIComponent(quiz.id)}`;
  };

  actions.appendChild(playBtn);
  actions.appendChild(downloadBtn);

  card.appendChild(deleteBtn);
  card.appendChild(editBtn);

  // ── Admin Upload Button (visible only to authenticated admins) ──────────
  // isAdminAuthenticated() checks the in-memory token — no server call needed here.
  // hasAdminSessionHint() checks sessionStorage as a fallback for UI hint.
  if (isAdminAuthenticated() || hasAdminSessionHint()) {
    const uploadRow = document.createElement("div");
    uploadRow.style.cssText =
      "margin-top: 10px; display: flex; justify-content: flex-end;";
    const uploadBtn = createUploadButton(quiz);
    uploadRow.appendChild(uploadBtn);
    card.appendChild(uploadRow);
  }

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

    // ── Obj 4: Update URL hash with category key ──
    const catKey = Object.keys(categoryTree || {}).find(
      (k) => categoryTree[k] === category,
    );
    if (catKey) window.location.hash = `category/${encodeURIComponent(catKey)}`;

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
        const card = createCategoryCard(
          subCat.name,
          itemCount,
          true,
          null,
          true,
        );
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
  isSubfolder = false, // ← new param: true for subcategories inside a course
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

  const icon = getSubjectIcon(name, isSubfolder);

  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.textContent = icon;
  iconDiv.setAttribute("aria-hidden", "true");

  const h3 = document.createElement("h3");
  h3.textContent = name;

  const p = document.createElement("p");

  p.textContent = `${itemCount > 2 ? itemCount : ""} ${getItemText(itemCount)}`;

  // Wrap text elements — display:contents on desktop (transparent), flex col on mobile
  const textWrap = document.createElement("div");
  textWrap.className = "card-text";
  textWrap.appendChild(h3);

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

    textWrap.appendChild(metaDiv);
  }

  textWrap.appendChild(p);

  card.appendChild(iconDiv);
  card.appendChild(textWrap);

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

  // ── DB source badge ────────────────────────────────────────────────────────
  if (exam.dbSource === "db") {
    card.classList.add("exam-card--db");

    const badge = document.createElement("span");
    badge.className = "db-source-badge";
    badge.setAttribute("aria-label", "متاح من قاعدة البيانات");
    badge.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" class="db-badge-icon">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/>
        <path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6"/>
      </svg>
      قاعدة البيانات
    `;
    card.appendChild(badge);
  }
  // ──────────────────────────────────────────────────────────────────────────

  const h = document.createElement("h3");
  h.innerHTML = `<span class="phone-only-emoji">📖</span> ${exam.title || exam.id}`;

  const questionCountLine = document.createElement("p");
  questionCountLine.className = "exam-question-count";
  questionCountLine.textContent = "";

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

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

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

    const copyBtn = document.createElement("button");
    copyBtn.className = "mode-btn";
    copyBtn.type = "button";
    copyBtn.setAttribute("aria-label", "Copy Quiz Text");
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><strong>نسخ كنص</strong>`;
    let isCopied = false;
    let quizTextBlob = null;
    copyBtn.onclick = (ev) => {
      ev.stopPropagation();
      withDownloadLoading(copyBtn, async () => {
        try {
          if (!isCopied) {
            let questions = [];
            if (exam.path.endsWith(".json")) {
              const res = await fetch(exam.path);
              const data = await res.json();
              questions = data.questions || [];
            } else {
              const res = await fetch(exam.path);
              const data = await res.json().catch(() => ({}));
              questions = data.questions || [];
            }
            const config = {
              title: exam.title || exam.id,
              description: exam.description,
            };
            const text = buildQuizText(config, questions);

            await navigator.clipboard.writeText(text);
            quizTextBlob = new Blob([text], { type: "text/plain" });
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg><strong>تنزيل .txt</strong>`;
            isCopied = true;
            showNotification(
              "تم النسخ",
              "تم نسخ نص الإختبار! انقر مرة أخرى لتحميله كملف .txt",
              "success",
            );
          } else {
            const url = URL.createObjectURL(quizTextBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${(exam.title || exam.id).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            modal.remove();
          }
        } catch (e) {
          console.error(e);
          showNotification("خطأ", "فشل نسخ أو تحميل الإختبار.", "error");
        }
      }).then(() => {
        if (isCopied) {
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg><strong>تنزيل .txt</strong>`;
        }
      });
    };
    grid.appendChild(copyBtn);

    const jsonBtn = document.createElement("button");
    jsonBtn.className = "mode-btn";
    jsonBtn.type = "button";
    jsonBtn.setAttribute("aria-label", `Download JSON (.json)`);
    jsonBtn.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-braces-icon lucide-file-braces"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg><strong>JSON (.json)</strong>`;
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

    // Show source button if source URL is available in the manifest
    if (exam.source && typeof exam.source === "string") {
      const sourceBtn = document.createElement("button");
      sourceBtn.className = "mode-btn";
      sourceBtn.type = "button";
      sourceBtn.setAttribute("aria-label", `Download Source`);
      sourceBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-to-line-icon lucide-arrow-down-to-line"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg><strong>Download Source</strong>`;
      sourceBtn.onclick = (ev) => {
        ev.stopPropagation();
        window.open(exam.source, "_blank");
        modal.remove();
      };
      grid.appendChild(sourceBtn);
    }

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
  downloadBtn.className = "start-btn desktop-download-btn";
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

  const moreBtn = document.createElement("button");
  moreBtn.className = "start-btn mobile-more-btn";
  moreBtn.type = "button";
  moreBtn.style.flex = "0 0 32px";
  moreBtn.style.minWidth = "0";
  moreBtn.style.background = "var(--color-background-secondary)";
  moreBtn.style.color = "var(--color-text-primary)";
  moreBtn.style.border = "1px solid var(--color-border)";
  moreBtn.style.boxShadow = "none";
  moreBtn.innerHTML = `⋮`;
  moreBtn.setAttribute("aria-label", "خيارات إضافية");
  moreBtn.onclick = (ev) => {
    ev.stopPropagation();
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.zIndex = "9999";
    modal.addEventListener("click", () => modal.remove());

    const menu = document.createElement("div");
    menu.style.cssText = `
       background: var(--color-surface);
       border-radius: 20px 20px 0 0;
       position: absolute;
       bottom: 0; left: 0; right: 0;
       padding: 24px;
       box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
       display: flex; flex-direction: column; gap: 12px;
    `;

    const downloadOpt = document.createElement("button");
    downloadOpt.className = "btn btn-primary";
    downloadOpt.textContent = "تحميل ⬇️";
    downloadOpt.style.padding = "14px";
    downloadOpt.style.fontWeight = "bold";
    downloadOpt.onclick = (e) => {
      e.stopPropagation();
      modal.remove();
      showDownloadPopup();
    };

    const shareOpt = document.createElement("button");
    shareOpt.className = "btn";
    shareOpt.textContent = "مشاركة 🔗";
    shareOpt.style.padding = "14px";
    shareOpt.style.background = "var(--color-primary-light)";
    shareOpt.style.color = "var(--color-primary)";
    shareOpt.style.fontWeight = "bold";
    shareOpt.onclick = (e) => {
      e.stopPropagation();
      modal.remove();
      const url =
        window.location.origin +
        window.location.pathname.replace("index.html", "") +
        "quiz.html?id=" +
        exam.id;
      if (navigator.share) {
        navigator
          .share({ title: exam.title || exam.id, url: url })
          .catch(() => {});
      } else {
        navigator.clipboard
          .writeText(url)
          .then(() =>
            showNotification("تم النسخ", "تم نسخ رابط الإمتحان!", "success"),
          );
      }
    };

    const cancelOpt = document.createElement("button");
    cancelOpt.className = "btn";
    cancelOpt.textContent = "إلغاء";
    cancelOpt.style.padding = "14px";
    cancelOpt.style.background = "transparent";
    cancelOpt.style.color = "var(--color-text-secondary)";

    menu.appendChild(downloadOpt);
    menu.appendChild(shareOpt);
    menu.appendChild(cancelOpt);
    modal.appendChild(menu);
    document.body.appendChild(modal);
  };

  const btnWrap = document.createElement("div");
  btnWrap.className = "exam-card-actions-wrap";
  btnWrap.style.display = "flex";
  btnWrap.style.gap = "8px";
  btnWrap.style.flexWrap = "wrap";
  btnWrap.style.marginTop = "20px";
  btnWrap.style.width = "100%";
  btnWrap.appendChild(btn);
  btnWrap.appendChild(downloadBtn);
  btnWrap.appendChild(moreBtn);

  const shareBtn = document.createElement("button");
  shareBtn.className = "share-quiz-link-button desktop-share-btn";
  shareBtn.type = "button";
  shareBtn.setAttribute("aria-label", `مشاركة ${exam.title || exam.id}`);
  shareBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>`;
  shareBtn.onclick = (ev) => {
    ev.stopPropagation();
    const url =
      window.location.origin +
      window.location.pathname.replace("index.html", "") +
      "quiz.html?id=" +
      exam.id;
    navigator.clipboard
      .writeText(url)
      .then(() =>
        showNotification("تم النسخ", "تم نسخ رابط الإمتحان!", "success"),
      );
  };
  card.appendChild(shareBtn);

  card.style.position = "relative";

  // ── Build text wrapper (display:contents on desktop, flex-col on mobile) ──
  const textWrap = document.createElement("div");
  textWrap.className = "card-text";
  textWrap.appendChild(h);

  // Meta wrapper: holds types + count in a flex row on desktop, column on mobile
  const metaWrap = document.createElement("div");
  metaWrap.className = "exam-card-meta";

  // Render question types as a plain subtext line (e.g. "MCQ · Essay")
  if (Array.isArray(exam.questionTypes) && exam.questionTypes.length > 0) {
    const typesLine = document.createElement("p");
    typesLine.className = "exam-question-count exam-types-subtext";
    typesLine.textContent = exam.questionTypes.join(" · ");
    metaWrap.appendChild(typesLine);
  }

  metaWrap.appendChild(questionCountLine);
  textWrap.appendChild(metaWrap);

  // DOM order: [db-badge] [textWrap] [btnWrap]
  // On desktop: textWrap is display:contents (transparent).
  // On mobile: flex row → textWrap fills space.
  card.appendChild(textWrap);
  card.appendChild(btnWrap);

  // Read question count from manifest (no individual file fetch needed)
  if (typeof exam.questionCount === "number" && exam.questionCount > 0) {
    questionCountLine.textContent = formatArabicQuestionCount(
      exam.questionCount,
    );
  }

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
      // Use flex (not block) so the icon stays centered in the collapsed sidebar
      installBtn.style.display = "flex";
    }
  } catch (error) {
    console.error("Error handling beforeinstallprompt:", error);
    showNotification("Error handling beforeinstallprompt", `${error}`, "error");
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
            "warning",
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
        showNotification("Error during PWA installation", `${error}`, "error");
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

// ============================================================================
// show UserQuiz Download Popup
// ============================================================================
function showUserQuizDownloadPopup(quiz) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.style.transform = "translateZ(0)";
  modal.style.willChange = "opacity";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "userQuizDownloadTitle");

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";
  modalCard.style.contain = "layout style paint";

  const h2 = document.createElement("h2");
  h2.id = "userQuizDownloadTitle";
  h2.textContent = qz(quiz, "title");

  const p = document.createElement("p");
  p.textContent = "اختر طريقة التنزيل";

  const grid = document.createElement("div");
  grid.className = "mode-grid";
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", "خيارات التنزيل");

  // Config object for export functions (schema-normalised)
  const config = {
    id: quiz.id,
    title: qz(quiz, "title"),
    description: qz(quiz, "description"),
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

  const copyBtn = document.createElement("button");
  copyBtn.className = "mode-btn";
  copyBtn.type = "button";
  copyBtn.setAttribute("aria-label", "Copy Quiz Text");
  copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><strong>نسخ كنص</strong>`;
  let isCopied = false;
  let quizTextBlob = null;
  copyBtn.onclick = (ev) => {
    ev.stopPropagation();
    withDownloadLoading(copyBtn, async () => {
      try {
        if (!isCopied) {
          let text = `Title: ${qz(quiz, "title") || quiz.id}\n\n`;
          if (qz(quiz, "description"))
            text += `Description: ${qz(quiz, "description")}\n\n`;
          const config = {
            title: qz(quiz, "title") || quiz.id,
            description: qz(quiz, "description"),
          };
          text = buildQuizText(config, questions);

          await navigator.clipboard.writeText(text);
          quizTextBlob = new Blob([text], { type: "text/plain" });
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg><strong>تنزيل .txt</strong>`;
          isCopied = true;
          showNotification(
            "تم النسخ",
            "تم نسخ نص الإختبار! انقر مرة أخرى لتحميله كملف .txt",
            "success",
          );
        } else {
          const url = URL.createObjectURL(quizTextBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${qz(quiz, "title").replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          modal.remove();
        }
      } catch (e) {
        console.error(e);
        showNotification("خطأ", "فشل نسخ أو تحميل الإختبار.", "error");
      }
    }).then(() => {
      if (isCopied) {
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg><strong>تنزيل .txt</strong>`;
      }
    });
  };
  grid.appendChild(copyBtn);

  const jsonBtn = document.createElement("button");
  jsonBtn.className = "mode-btn";
  jsonBtn.type = "button";
  jsonBtn.setAttribute("aria-label", `Download JSON (.json)`);
  jsonBtn.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-braces-icon lucide-file-braces"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg><strong>JSON (.json)</strong>`;
  jsonBtn.onclick = (ev) => {
    ev.stopPropagation();
    withDownloadLoading(jsonBtn, async () => {
      try {
        const title = qz(quiz, "title");
        const description = qz(quiz, "description");
        const exportQuestions = (quiz.questions || []).map((q) => {
          const isEssay =
            (Array.isArray(q.options) && q.options.length === 1) ||
            (!Array.isArray(q.options) && q.answer !== undefined);
          const out = { q: q.q };
          if (isEssay) {
            out.answer = q.answer ?? q.options?.[0] ?? "";
          } else {
            out.options = q.options;
            if (q.correct !== undefined) out.correct = q.correct;
          }
          if (q.image?.trim()) out.image = q.image;
          if (q.explanation?.trim()) out.explanation = q.explanation;
          return out;
        });
        const types = new Set();
        exportQuestions.forEach((q) => {
          if (!Array.isArray(q.options) || q.options.length === 0)
            types.add("Essay");
          else if (q.options.length === 2) types.add("True/False");
          else types.add("MCQ");
        });
        const payload = {
          meta: {
            title,
            ...(description ? { description } : {}),
            createdAt: qz(quiz, "createdAt"),
          },
          stats: {
            questionCount: exportQuestions.length,
            questionTypes: Array.from(types).sort(),
          },
          questions: exportQuestions,
        };
        const fileContent = JSON.stringify(payload, null, 2);
        const blob = new Blob([fileContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}.json`;
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
