// ============================================================================
// src/scripts/index.js - Enhanced with Security, Performance, and Accessibility
// All original functionality preserved + improvements added
// ============================================================================

import { getManifest } from "./quizManifest.js";
import { userProfile } from "./userProfile.js";

let categoryTree = null;

// Download functions
import { exportToQuiz } from "./exportToQuiz.js";
import { exportToHtml } from "./exportToHtml.js";
import { exportToPdf } from "./exportToPdf.js";
import { exportToWord } from "./exportToWord.js";
import { exportToPptx } from "./exportToPptx.js";
import { exportToMarkdown } from "./exportToMarkdown.js";

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
import { showNotification, confirmationNotification } from "./notifications.js";

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
      // Initialize default subscriptions for new academic info
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
// FIRST-TIME USER EXPERIENCE (ONBOARDING WIZARD)
// ============================================================================

/**
 * Faculty icons mapping for visual selection
 */
const facultyIcons = {
  Medicine: "🩺",
  Pharmacy: "💊",
  Dentistry: "🦷",
  Engineering: "⚙️",
  Science: "🔬",
  Arts: "🎨",
  Law: "⚖️",
  Commerce: "📊",
  "Computer Science": "💻",
  Nursing: "🏥",
  Agriculture: "🌾",
  Veterinary: "🐾",
  Education: "📚",
  default: "📖",
};

/**
 * Get icon for a faculty
 */
function getFacultyIcon(faculty) {
  return facultyIcons[faculty] || facultyIcons.default;
}

/**
 * Show the onboarding wizard for first-time users
 */
function showOnboardingWizard() {
  const metadata = extractMetadata(categoryTree);

  // Wizard state
  let currentStep = 1;
  let selectedFaculty = null;
  let selectedYear = null;
  let selectedTerm = null;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "onboarding-overlay";
  overlay.id = "onboardingWizard";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "onboardingTitle");

  // Create card
  const card = document.createElement("div");
  card.className = "onboarding-card";

  // Render function
  function render() {
    card.innerHTML = "";

    // Skip button
    const skipBtn = document.createElement("button");
    skipBtn.className = "onboarding-skip";
    skipBtn.textContent = "تخطي الآن";
    skipBtn.type = "button";
    skipBtn.setAttribute("aria-label", "تخطي عملية الإعداد");
    skipBtn.onclick = () => closeOnboarding();
    card.appendChild(skipBtn);

    // Progress dots
    const progress = document.createElement("div");
    progress.className = "onboarding-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "1");
    progress.setAttribute("aria-valuemax", "3");
    progress.setAttribute("aria-valuenow", currentStep.toString());

    for (let i = 1; i <= 3; i++) {
      const dot = document.createElement("div");
      dot.className = "progress-dot";
      if (i < currentStep) dot.classList.add("completed");
      if (i === currentStep) dot.classList.add("active");
      progress.appendChild(dot);
    }
    card.appendChild(progress);

    // Step content
    const stepContainer = document.createElement("div");
    stepContainer.className = "onboarding-step";

    if (currentStep === 1) {
      renderFacultyStep(stepContainer);
    } else if (currentStep === 2) {
      renderYearStep(stepContainer);
    } else if (currentStep === 3) {
      renderTermStep(stepContainer);
    }

    card.appendChild(stepContainer);

    // Navigation
    const nav = document.createElement("div");
    nav.className = "onboarding-nav";

    if (currentStep < 3) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "onboarding-btn primary";
      nextBtn.textContent = "→ التالي";
      nextBtn.type = "button";
      nextBtn.disabled =
        (currentStep === 1 && !selectedFaculty) ||
        (currentStep === 2 && !selectedYear);
      nextBtn.setAttribute("aria-label", "الانتقال للخطوة التالية");
      if (nextBtn.disabled) {
        nextBtn.setAttribute("aria-disabled", "true");
      }
      nextBtn.onclick = () => {
        currentStep++;
        render();
      };
      nav.appendChild(nextBtn);
    } else {
      const finishBtn = document.createElement("button");
      finishBtn.className = "onboarding-btn finish";
      finishBtn.textContent = "🎉 ابدأ الآن";
      finishBtn.type = "button";
      finishBtn.disabled = !selectedTerm;
      finishBtn.setAttribute("aria-label", "إنهاء الإعداد والبدء");
      if (finishBtn.disabled) {
        finishBtn.setAttribute("aria-disabled", "true");
      }
      finishBtn.onclick = () => finishOnboarding();
      nav.appendChild(finishBtn);
    }

    if (currentStep > 1) {
      const backBtn = document.createElement("button");
      backBtn.className = "onboarding-btn secondary";
      backBtn.textContent = "السابق ←";
      backBtn.type = "button";
      backBtn.setAttribute("aria-label", "الرجوع للخطوة السابقة");
      backBtn.onclick = () => {
        currentStep--;
        render();
      };
      nav.appendChild(backBtn);
    } else {
      // Spacer
      nav.appendChild(document.createElement("div"));
    }

    card.appendChild(nav);
  }

  function renderFacultyStep(container) {
    const header = document.createElement("div");
    header.className = "onboarding-header";
    header.innerHTML = `
      <h2 id="onboardingTitle">👋 مرحباً بك في منصة إمتحانات بصمجي</h2>
      <p>دعنا نحسن تجربتك. ما هي كليتك؟</p>
    `;
    container.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "faculty-grid";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", "اختر كليتك");

    metadata.faculties.forEach((faculty) => {
      const option = document.createElement("button");
      option.className = "faculty-option";
      option.type = "button";
      option.setAttribute(
        "aria-pressed",
        selectedFaculty === faculty ? "true" : "false",
      );
      if (selectedFaculty === faculty) option.classList.add("selected");
      option.innerHTML = `
        <span class="faculty-icon" aria-hidden="true">${getFacultyIcon(faculty)}</span>
        <span class="faculty-name">${escapeHtml(faculty)}</span>
      `;
      option.onclick = () => {
        selectedFaculty = faculty;
        // Reset year and term when faculty changes
        selectedYear = null;
        selectedTerm = null;
        render();
      };
      grid.appendChild(option);
    });

    container.appendChild(grid);
  }

  function renderYearStep(container) {
    const header = document.createElement("div");
    header.className = "onboarding-header";
    header.innerHTML = `
      <h2 id="onboardingTitle">اختر العام الدراسي 📅</h2>
      <p>في أي سنة دراسية أنت الآن؟</p>
    `;
    container.appendChild(header);

    const availableYears = getAvailableYears(categoryTree, selectedFaculty);

    if (availableYears.length === 0) {
      const noOptions = document.createElement("div");
      noOptions.className = "no-options-message";
      noOptions.textContent = "No years available for this faculty yet.";
      container.appendChild(noOptions);
      return;
    }

    const pills = document.createElement("div");
    pills.className = "year-pills";
    pills.setAttribute("role", "group");
    pills.setAttribute("aria-label", "اختر العام الدراسي");

    availableYears.forEach((year) => {
      const pill = document.createElement("button");
      pill.className = "year-pill";
      pill.type = "button";
      pill.setAttribute(
        "aria-pressed",
        selectedYear === year ? "true" : "false",
      );
      if (selectedYear === year) pill.classList.add("selected");
      pill.textContent = `العام ${year}`;
      pill.onclick = () => {
        selectedYear = year;
        // Reset term when year changes
        selectedTerm = null;
        render();
      };
      pills.appendChild(pill);
    });

    container.appendChild(pills);
  }

  function renderTermStep(container) {
    const header = document.createElement("div");
    header.className = "onboarding-header";
    header.innerHTML = `
      <h2 id="onboardingTitle">📚 اختر الترم</h2>
      <p>في أي فصل دراسي تدرس؟</p>
    `;
    container.appendChild(header);

    const availableTerms = getAvailableTerms(
      categoryTree,
      selectedFaculty,
      selectedYear,
    );

    if (availableTerms.length === 0) {
      const noOptions = document.createElement("div");
      noOptions.className = "no-options-message";
      noOptions.textContent = "No terms available for this selection yet.";
      container.appendChild(noOptions);
      return;
    }

    const toggle = document.createElement("div");
    toggle.className = "term-toggle";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "اختر الترم");

    availableTerms.forEach((term) => {
      const btn = document.createElement("button");
      btn.className = "term-btn";
      btn.type = "button";
      btn.setAttribute(
        "aria-pressed",
        selectedTerm === term ? "true" : "false",
      );
      if (selectedTerm === term) btn.classList.add("selected");
      btn.innerHTML = `
        <span class="term-icon" aria-hidden="true">${term === "1" ? "🍂" : "🌸"}</span>
        <span>الترم ${term}</span>
      `;
      btn.onclick = () => {
        selectedTerm = term;
        render();
      };
      toggle.appendChild(btn);
    });

    container.appendChild(toggle);
  }

  function closeOnboarding() {
    overlay.remove();
    renderRootCategories();
  }

  function finishOnboarding() {
    try {
      // Save the selections
      userProfile.saveInitialSetup(
        {
          faculty: selectedFaculty,
          year: selectedYear,
          term: selectedTerm,
        },
        categoryTree,
      );

      // Update welcome message
      updateWelcomeMessage();

      // Close wizard and render courses
      overlay.remove();
      renderRootCategories();

      showNotification("مرحباً!", "تم إعداد حسابك بنجاح", "./favicon.png");
    } catch (error) {
      console.error("Error finishing onboarding:", error);
      alert("حدث خطأ أثناء حفظ الإعدادات. حاول مرة أخرى.");
    }
  }

  // Initial render
  render();
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Focus first interactive element
  const firstButton = card.querySelector("button");
  if (firstButton) {
    setTimeout(() => firstButton.focus(), 100);
  }
}

// ============================================================================
// COURSE SUBSCRIPTION MANAGEMENT
// ============================================================================

window.openCourseManager = function () {
  try {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "courseManagerModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "courseManagerTitle");

    const modalCard = document.createElement("div");
    modalCard.className = "modal-card course-manager-modal";

    modalCard.innerHTML = `
      <h2 id="courseManagerTitle">📚 إدارة المواد</h2>
      <p class="modal-subtitle">اختر المواد التي تريد متابعتها</p>
      
      <div id="courseManagerList" class="course-list">
        <!-- Content will be rendered by renderCourseManagerList() -->
      </div>
      
      <div class="modal-actions">
        <button class="profile-btn primary" 
                onclick="window.closeCourseManager()"
                type="button"
                aria-label="إغلاق">
          ✓ تم
        </button>
      </div>
    `;

    modal.appendChild(modalCard);
    document.body.appendChild(modal);

    // Render course list
    renderCourseManagerList();

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeCourseManager();
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        window.closeCourseManager();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  } catch (error) {
    console.error("Error opening course manager:", error);
    alert("حدث خطأ أثناء فتح إدارة المواد. حاول مرة أخرى.");
  }
};

function renderCourseManagerList() {
  const listContainer = document.getElementById("courseManagerList");
  if (!listContainer) return;

  const subscribedIds = userProfile.getSubscribedCourseIds();
  const allCourses = filterCourses(categoryTree, userProfile.getProfile());

  listContainer.innerHTML = allCourses
    .map((course) => {
      const isSubscribed = subscribedIds.includes(course.id);
      return `
      <div class="course-item">
        <div class="course-info">
          <h4>${escapeHtml(course.name)}</h4>
          <p class="course-details">
            ${escapeHtml(course.faculty)} | العام ${escapeHtml(
              course.year,
            )} | الترم ${escapeHtml(course.term)}
          </p>
        </div>
        <button 
          class="course-toggle-btn ${isSubscribed ? "active" : ""}"
          onclick="window.toggleCourseSubscription('${escapeHtml(course.id)}')"
          type="button"
          aria-pressed="${isSubscribed ? "true" : "false"}"
          aria-label="${isSubscribed ? "إلغاء الاشتراك في" : "الاشتراك في"} ${escapeHtml(course.name)}"
        >
          ${isSubscribed ? "✓ Subscribed" : "+ Subscribe"}
        </button>
      </div>
    `;
    })
    .join("");
}

window.toggleCourseSubscription = function (courseId) {
  try {
    userProfile.toggleSubscription(courseId);
    renderCourseManagerList();
  } catch (error) {
    console.error("Error toggling subscription:", error);
  }
};

window.closeCourseManager = function () {
  try {
    const modal = document.getElementById("courseManagerModal");
    if (modal) {
      modal.remove();

      // Return focus to trigger
      const trigger = document.querySelector(
        '[data-action="openCourseManager"]',
      );
      if (trigger) {
        trigger.focus();
      }
    }

    // Refresh main view
    renderRootCategories();
  } catch (error) {
    console.error("Error closing course manager:", error);
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
  } catch (err) {
    console.error("Failed to load quiz manifest:", err);
    categoryTree = {};
  }
  try {
    if (userProfile.checkFirstVisit()) {
      showOnboardingWizard();
    } else {
      renderRootCategories();
    }
  } catch (error) {
    console.error("Error initializing:", error);
    renderRootCategories();
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
    window.location.href = `quiz.html?id=${encodeURIComponent(quiz.id)}&mode=practice&type=user`;
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
  card.className = "card category-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute(
    "aria-label",
    `${name}, ${itemCount} ${itemCount === 1 ? "إمتحان" : "إمتحانات"}`,
  );

  const icon = isFolder ? "📁" : "📂";

  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.textContent = icon;
  iconDiv.setAttribute("aria-hidden", "true");

  const h3 = document.createElement("h3");
  h3.textContent = name;

  const p = document.createElement("p");

  p.textContent =
    itemCount === 1
      ? `إمتحان واحد`
      : itemCount === 2
        ? `إمتحانان`
        : `${itemCount} إمتحانات`;

  // Add course metadata if available
  if (courseData && courseData.faculty && courseData.year && courseData.term) {
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

    metaDiv.appendChild(facultyBadge);
    metaDiv.appendChild(yearBadge);
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
    showModeSelection(exam.id, exam.title || exam.id);
  };

  const loadPdfLib = () =>
    new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("PDF library failed to load"));
      document.head.appendChild(s);
    });

  const onDownloadOption = async (format, modalEl) => {
    modalEl.remove();
    const config = {
      id: exam.id,
      title: exam.title || exam.id,
      path: exam.path,
    };
    let mod;
    try {
      mod = await import(config.path);
    } catch (e) {
      alert("Failed to load exam.");
      return;
    }
    const questions = mod.questions;
    if (format === "pdf") {
      try {
        await loadPdfLib();
      } catch {
        alert("PDF library could not be loaded.");
        return;
      }
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

  breadcrumb.style.display = "flex";
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

function showModeSelection(examId, examTitle) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "modeModalTitle");

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";

  const h2 = document.createElement("h2");
  h2.id = "modeModalTitle";
  h2.textContent = examTitle;

  const p = document.createElement("p");
  p.textContent = "اختر وضع الإمتحان";

  const modeGrid = document.createElement("div");
  modeGrid.className = "mode-grid";
  modeGrid.setAttribute("role", "group");
  modeGrid.setAttribute("aria-label", "أوضاع الاختبار");

  const practiceBtn = createModeButton(
    "./assets/images/quiz.png",
    "Practice",
    "يحتوي على مؤقت، ويمكنك رؤية إجابات الأسئلة بعد الحل",
    () => startQuiz(examId, "practice"),
  );

  const timedBtn = createModeButton(
    "https://cdn-icons-png.freepik.com/512/3003/3003126.png",
    "Timed",
    "30 ثانية لكل سؤال",
    () => startQuiz(examId, "timed"),
  );

  const examBtn = createModeButton(
    "https://cdn-icons-png.flaticon.com/512/3640/3640554.png",
    "Exam",
    "لا إجابات أثناء الإمتحان",
    () => startQuiz(examId, "exam"),
  );

  modeGrid.appendChild(practiceBtn);
  modeGrid.appendChild(timedBtn);
  modeGrid.appendChild(examBtn);

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.type = "button";
  closeBtn.textContent = "إلغاء";
  closeBtn.setAttribute("aria-label", "إغلاق النافذة");
  closeBtn.onclick = () => modal.remove();

  modalCard.appendChild(h2);
  modalCard.appendChild(p);
  modalCard.appendChild(modeGrid);
  modalCard.appendChild(closeBtn);

  modal.appendChild(modalCard);
  document.body.appendChild(modal);

  // Focus first button
  const firstBtn = modeGrid.querySelector("button");
  if (firstBtn) {
    setTimeout(() => firstBtn.focus(), 100);
  }

  // Close on Escape
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

function createModeButton(icon, title, description, onClick) {
  const btn = document.createElement("button");
  btn.className = "mode-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", `${title}: ${description}`);
  btn.onclick = onClick;

  let iconElement;
  if (!isURL_orPath(icon)) {
    iconElement = document.createElement("span");
    iconElement.className = "icon";
    iconElement.textContent = icon;
    iconElement.setAttribute("aria-hidden", "true");
  } else {
    iconElement = document.createElement("img");
    iconElement.className = "icon";
    iconElement.src = icon;
    iconElement.alt = "";
    iconElement.setAttribute("aria-hidden", "true");
  }

  const strong = document.createElement("strong");
  strong.textContent = title;

  const small = document.createElement("small");
  small.textContent = description;

  btn.appendChild(iconElement);
  btn.appendChild(strong);
  btn.appendChild(small);

  return btn;
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
    window.location.href = `quiz.html?id=${encodeURIComponent(id)}&mode=${encodeURIComponent(mode)}`;
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

  const loadPdfLib = () =>
    new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("PDF library failed to load"));
      document.head.appendChild(s);
    });

  const onDownloadOption = async (format) => {
    modal.remove();

    if (format === "pdf") {
      try {
        await loadPdfLib();
      } catch {
        alert("PDF library could not be loaded.");
        return;
      }
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
