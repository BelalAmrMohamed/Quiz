// Script/index.js
import { categoryTree } from "./examManifest.js";
import { userProfile } from "./userProfile.js";

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
import { confirmationNotification } from "./notifications.js";

const container = document.getElementById("contentArea");
const title = document.getElementById("Subjects-text");
const breadcrumb = document.getElementById("breadcrumb");

// ============================================================================
// USER PERSONALIZATION & GAMIFIED WELCOME SYSTEM
// ============================================================================

const userNameBadge = document.getElementById("user-name");

// Gamified welcome message pool — FIXED
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
      ["./images/HTML_Icon.png", "HTML (.html)", "html"],
      ["./images/PDF_Icon.png", "PDF (.pdf)", "pdf"],
      ["./images/word_icon.png", "Word (.docx)", "docx"],
      ["./images/pptx_icon.png", "PowerPoint (.pptx)", "pptx"],
      ["./images/mardownIcon.png", "Markdown (.md)", "md"],
    ];

// Change username
window.changeUsername = function () {
  const currentName = localStorage.getItem("username") || "User";
  const newName = prompt("أدخل الإسم الجديد", currentName);
  if (!newName || !newName.trim()) return;

  localStorage.setItem("username", newName.trim());
  updateWelcomeMessage();
};

// Pick a random welcome message
function getRandomWelcomeMessage(name) {
  const message =
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  return message(name);
}

// Update welcome badge text
function updateWelcomeMessage() {
  const name = localStorage.getItem("username") || "User";
  const messageTemplate = getRandomWelcomeMessage(name);

  // Replace username with styled span
  const styledMessage = messageTemplate.replace(
    name,
    `<span class="user-name">${name}</span>`,
  );

  userNameBadge.innerHTML = styledMessage;
}

// Initial load
updateWelcomeMessage();

// ============================================================================
// PROFILE MANAGEMENT MODAL
// ============================================================================

window.openProfileSettings = function () {
  const profile = userProfile.getProfile();
  const metadata = extractMetadata(categoryTree);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "profileModal";

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
    <h2>⚙️ الملف الشخصي</h2>
    
    <div class="profile-section">
      <label for="profileUsername">الإسم</label>
      <input 
        type="text" 
        id="profileUsername" 
        class="profile-input"
        value="${escapeHtml(profile.username)}"
        placeholder="Enter your name"
      />
    </div>

    <div class="profile-section">
      <h3>المعلومات الأكاديمية</h3>
      <p class="profile-hint">يساعدنا على عرض المواد الخاصة بك</p>
      
      <div class="profile-grid">
        <div>
          <label for="profileFaculty">الكلية</label>
          <select id="profileFaculty" class="profile-select">
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
          <select id="profileYear" class="profile-select">
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
          <select id="profileTerm" class="profile-select">
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
      <button class="profile-btn secondary" onclick="window.closeProfileModal()">
        إلغاء
      </button>
      <button class="profile-btn primary" onclick="window.saveProfileSettings()">
        💾 حفظ التغييرات
      </button>
    </div>
  `;

  modal.appendChild(modalCard);
  document.body.appendChild(modal);

  // Setup cascading dropdown listeners for Profile Settings
  setupProfileDropdownCascade();

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) window.closeProfileModal();
  });
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
  });

  // When year changes, update term dropdown
  yearSelect.addEventListener("change", () => {
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
  });
}

window.saveProfileSettings = function () {
  const username = document.getElementById("profileUsername")?.value;
  const faculty = document.getElementById("profileFaculty")?.value;
  const year = document.getElementById("profileYear")?.value;
  const term = document.getElementById("profileTerm")?.value;

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
};

window.closeProfileModal = function () {
  const modal = document.getElementById("profileModal");
  if (modal) modal.remove();
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
    skipBtn.onclick = () => closeOnboarding();
    card.appendChild(skipBtn);

    // Progress dots
    const progress = document.createElement("div");
    progress.className = "onboarding-progress";
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

    if (currentStep > 1) {
      const backBtn = document.createElement("button");
      backBtn.className = "onboarding-btn secondary";
      backBtn.textContent = "← السابق";
      backBtn.onclick = () => {
        currentStep--;
        render();
      };
      nav.appendChild(backBtn);
    } else {
      // Spacer
      nav.appendChild(document.createElement("div"));
    }

    if (currentStep < 3) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "onboarding-btn primary";
      nextBtn.textContent = "التالي →";
      nextBtn.disabled =
        (currentStep === 1 && !selectedFaculty) ||
        (currentStep === 2 && !selectedYear);
      nextBtn.onclick = () => {
        currentStep++;
        render();
      };
      nav.appendChild(nextBtn);
    } else {
      const finishBtn = document.createElement("button");
      finishBtn.className = "onboarding-btn finish";
      finishBtn.textContent = "🎉 ابدأ الآن";
      finishBtn.disabled = !selectedTerm;
      finishBtn.onclick = () => finishOnboarding();
      nav.appendChild(finishBtn);
    }

    card.appendChild(nav);
  }

  function renderFacultyStep(container) {
    const header = document.createElement("div");
    header.className = "onboarding-header";
    header.innerHTML = `
      <h2>👋 مرحباً بك في منصة إمتحانات بصمجي</h2>
      <p>دعنا نحسن تجربتك. ما هي كليتك؟</p>
    `;
    container.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "faculty-grid";

    metadata.faculties.forEach((faculty) => {
      const option = document.createElement("button");
      option.className = "faculty-option";
      if (selectedFaculty === faculty) option.classList.add("selected");
      option.innerHTML = `
        <span class="faculty-icon">${getFacultyIcon(faculty)}</span>
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
      <h2>اختر العام الدراسي 📅</h2>
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

    availableYears.forEach((year) => {
      const pill = document.createElement("button");
      pill.className = "year-pill";
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
      <h2>📚 اختر الترم</h2>
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

    availableTerms.forEach((term) => {
      const btn = document.createElement("button");
      btn.className = "term-btn";
      if (selectedTerm === term) btn.classList.add("selected");
      btn.innerHTML = `
        <span class="term-icon">${term === "1" ? "🍂" : "🌸"}</span>
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
  }

  // Initial render
  render();
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ============================================================================
// COURSE SUBSCRIPTION MANAGEMENT
// ============================================================================

window.openCourseManager = function () {
  const profile = userProfile.getProfile();
  const metadata = extractMetadata(categoryTree);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "courseManagerModal";

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card course-manager-modal";

  // Get available years and terms for current profile selection
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
    <h2>📚 إدارة المواد خاصتك</h2>
    <p class="course-manager-hint">حدد الدورات التي تريد رؤيتها</p>

    <div class="course-manager-filters">
      <select id="cmFaculty" class="course-filter-select">
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

      <select id="cmYear" class="course-filter-select">
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

      <select id="cmTerm" class="course-filter-select">
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

    <div id="courseManagerList" class="course-manager-list">
      <!-- Course list will be rendered here -->
    </div>

    <div class="course-manager-actions">
      <button class="profile-btn primary" onclick="window.closeCourseManager()">
        ✅ تم
      </button>
    </div>
  `;

  modal.appendChild(modalCard);
  document.body.appendChild(modal);

  // Setup cascading dropdown listeners for Course Manager
  setupCourseManagerDropdownCascade();

  // Render initial course list
  renderCourseManagerList();

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) window.closeCourseManager();
  });
};

/**
 * Setup cascading dropdown behavior for Course Manager modal
 */
function setupCourseManagerDropdownCascade() {
  const facultySelect = document.getElementById("cmFaculty");
  const yearSelect = document.getElementById("cmYear");
  const termSelect = document.getElementById("cmTerm");

  if (!facultySelect || !yearSelect || !termSelect) return;

  // When faculty changes, update year and term dropdowns
  facultySelect.addEventListener("change", () => {
    const selectedFaculty = facultySelect.value;

    // Update year dropdown
    const availableYears =
      selectedFaculty === "All"
        ? extractMetadata(categoryTree).years
        : getAvailableYears(categoryTree, selectedFaculty);

    const currentYear = yearSelect.value;
    yearSelect.innerHTML =
      '<option value="All">جميع الأعوام</option>' +
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
  });

  // When year changes, update term dropdown
  yearSelect.addEventListener("change", () => {
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

    // Re-render course list after cascade updates
    renderCourseManagerList();
  });

  // When term changes, re-render course list
  termSelect.addEventListener("change", () => {
    renderCourseManagerList();
  });
}

function renderCourseManagerList() {
  const listContainer = document.getElementById("courseManagerList");
  if (!listContainer) return;

  const faculty = document.getElementById("cmFaculty")?.value || "All";
  const year = document.getElementById("cmYear")?.value || "All";
  const term = document.getElementById("cmTerm")?.value || "All";

  const filteredCourses = filterCourses(categoryTree, { faculty, year, term });
  const subscribedIds = userProfile.getSubscribedCourseIds();

  if (filteredCourses.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No courses found with these filters</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filteredCourses
    .map((course) => {
      const isSubscribed = subscribedIds.includes(course.id);
      return `
      <div class="course-manager-item ${isSubscribed ? "subscribed" : ""}">
        <div class="course-manager-info">
          <h4>${escapeHtml(course.name)}</h4>
          <p class="course-manager-meta">
            ${escapeHtml(course.faculty)} | العام ${escapeHtml(
              course.year,
            )} | الترم ${escapeHtml(course.term)}
          </p>
        </div>
        <button 
          class="course-toggle-btn ${isSubscribed ? "active" : ""}"
          onclick="window.toggleCourseSubscription('${escapeHtml(course.id)}')"
        >
          ${isSubscribed ? "✓ Subscribed" : "+ Subscribe"}
        </button>
      </div>
    `;
    })
    .join("");
}

window.toggleCourseSubscription = function (courseId) {
  userProfile.toggleSubscription(courseId);
  renderCourseManagerList();
};

window.closeCourseManager = function () {
  const modal = document.getElementById("courseManagerModal");
  if (modal) modal.remove();

  // Refresh main view
  renderRootCategories();
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

// Initialize - Check for first-time user
if (userProfile.checkFirstVisit()) {
  // First visit: show onboarding wizard
  showOnboardingWizard();
} else {
  // Returning user: render courses directly
  renderRootCategories();
}

function renderRootCategories() {
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

  const fragment = document.createDocumentFragment();

  // 1. Add "إمتحاناتك" Folder Card
  try {
    const userQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );
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
      const card = createCategoryCard(category.name, itemCount, true, category);
      card.onclick = () => renderCategory(category);
      fragment.appendChild(card);
    });
  }

  container.appendChild(fragment);

  // Show empty state if no courses at all
  if (subscribedCourses.length === 0 && getCategoriesLazy().length === 0) {
    container.innerHTML += `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <h3>No Courses Available</h3>
        <p>Check back later for new content!</p>
      </div>
    `;
  }
}

/**
 * Render user-created quizzes VIEW (Folder Content)
 */
function renderUserQuizzesView() {
  // Update Navigation Stack
  navigationStack.push({ name: "إمتحاناتك" });
  updateBreadcrumb();

  // Update Title & Clear Container
  if (title) title.textContent = "إمتحاناتك";
  if (!container) return;

  container.innerHTML = "";
  container.className = "grid-container";

  try {
    const userQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );

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
    createBtn.className = "btn btn-primary"; // Use class if available, or inline styles
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
        <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">�</div>
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
    container.innerHTML = `<p style="color:red">Error loading quizzes.</p>`;
  }
}

/**
 * Create a card for a user-created quiz
 */
function createUserQuizCard(quiz, index) {
  const card = document.createElement("div");
  card.className = "exam-card user-quiz-card";
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
  const title = document.createElement("h3");
  title.textContent = quiz.title;
  title.style.cssText = `
    margin: 0 0 8px 0;
    color: var(--color-text-primary);
    font-size: 1.1rem;
  `;
  card.appendChild(title);

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
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
  `;

  downloadBtn.style.boxShadow = "";

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
  // Store the quiz data temporarily for the quiz page to access
  sessionStorage.setItem("active_user_quiz", JSON.stringify(quiz));

  // Navigate to quiz page with special parameter
  window.location.href = `quiz.html?id=${encodeURIComponent(quiz.id)}&mode=practice&type=user`;
}

/**
 * Delete a user-created quiz
 */
async function deleteUserQuiz(quizId, index) {
  if (
    !await confirmationNotification(
      "Are you sure you want to delete this quiz? This cannot be undone.",
    )
  ) {
    return;
  }

  try {
    const userQuizzes = JSON.parse(
      localStorage.getItem("user_quizzes") || "[]",
    );
    userQuizzes.splice(index, 1);
    localStorage.setItem("user_quizzes", JSON.stringify(userQuizzes));

    // Re-render the folder view
    renderUserQuizzesView();
    
    // Failed to fix the `Back to إمتحاناتك` Bug
    // The bug happens when the user deletes one of his quizzes
    // The `Back to Courses` button at the top becomes `Back to إمتحاناتك`, 
    // when pressed, the console logs this error:
    /*
    Uncaught TypeError: Cannot read properties of undefined (reading 'name')
    at renderCategory (index.js:1230:32)
    at breadcrumb.onclick (index.js:1494:7)
    */
    
  } catch (error) {
    console.error("Error deleting quiz:", error);
    alert("Error deleting quiz. Please try again.");
  }
}

function renderCategory(category) {
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
      <div class="empty-state">
        <div class="empty-state-icon">🔭</div>
        <h3>No Content Yet</h3>
        <p>This category is empty. Check back later!</p>
      </div>
    `;
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

  const icon = isFolder ? "📁" : "📂";
  const itemText = itemCount === 1 ? "إمتحان" : "إمتحانات";

  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.textContent = icon;

  const h3 = document.createElement("h3");
  h3.textContent = name;

  const p = document.createElement("p");

  p.textContent = 
  itemCount === 1 ? `إمتحان واحد` 
  : itemCount === 2 ? `إمتحانان` 
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
    termBadge.textContent = `الترم${courseData.term}`;

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

  return card;
}

function createExamCard(exam) {
  const card = document.createElement("div");
  card.className = "card exam-card";

  const h = document.createElement("h3");
  h.textContent = exam.title || exam.id;

  const btn = document.createElement("button");
  btn.className = "start-btn";
  btn.style.flex = "1";
  btn.style.minWidth = "0";
  btn.textContent = "إبدأ الإختبار";
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
  };

  const showDownloadPopup = () => {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.transform = "translateZ(0)";
    modal.style.willChange = "opacity";
    const modalCard = document.createElement("div");
    modalCard.className = "modal-card";
    modalCard.style.contain = "layout style paint";
    const h2 = document.createElement("h2");
    h2.textContent = exam.title || exam.id;
    const p = document.createElement("p");
    p.textContent = "اختر طريقة التنزيل";
    const grid = document.createElement("div");
    grid.className = "mode-grid";
    
    opts.forEach(([icon, label, format]) => {
      const b = document.createElement("button");
      b.className = "mode-btn";
      b.innerHTML = `<img src="${icon}" alt="Context Icon" class="icon"><strong>${label}</strong>`;
      b.onclick = (ev) => {
        ev.stopPropagation();
        onDownloadOption(format, modal);
      };
      grid.appendChild(b);
    });



    const closeBtn = document.createElement("button");
    closeBtn.className = "close-modal";
    closeBtn.textContent = "إلغاء";
    closeBtn.onclick = () => modal.remove();
    modalCard.appendChild(h2);
    modalCard.appendChild(p);
    modalCard.appendChild(grid);
    modalCard.appendChild(closeBtn);
    modal.appendChild(modalCard);
    requestAnimationFrame(() => {
      document.body.appendChild(modal);
    });
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "start-btn";
  downloadBtn.style.flex = "1";
  downloadBtn.style.minWidth = "0";
  downloadBtn.style.background =
    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
  downloadBtn.style.color = "white";
  downloadBtn.style.boxShadow = "0 4px 14px rgba(220, 38, 38, 0.4)";
  downloadBtn.textContent = "تحميل";
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
  if (navigationStack.length === 0) {
    breadcrumb.style.display = "none";
    return;
  }

  breadcrumb.style.display = "flex";
  const breadcrumbText = breadcrumb.querySelector(".breadcrumb-text");

  if (navigationStack.length === 1) {
    breadcrumbText.textContent = "الرجوع إلى المواد";
    breadcrumb.onclick = renderRootCategories;
  } else {
    const parentName = navigationStack[navigationStack.length - 2].name;
    breadcrumbText.textContent = `الرجوع إلى ${parentName}`;
    breadcrumb.onclick = () => {
      navigationStack.pop();
      const parent = navigationStack[navigationStack.length - 1];
      navigationStack.pop();
      renderCategory(parent);
    };
  }
}

function showModeSelection(examId, examTitle) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";

  const h2 = document.createElement("h2");
  h2.textContent = examTitle;

  const p = document.createElement("p");
  p.textContent = "اختر وضع الإمتحان";

  const modeGrid = document.createElement("div");
  modeGrid.className = "mode-grid";

  const practiceBtn = createModeButton(
    "./images/quiz.png",
    "Practice",
    "يحتوي على مؤقت، ويمكنك رؤية إجابات الأسئلة بعد الحل",
    () => startQuiz(examId, "practice"),
  );

  const timedBtn = createModeButton("https://cdn-icons-png.freepik.com/512/3003/3003126.png", "Timed", "30 ثانية لكل سؤال", () =>
    startQuiz(examId, "timed"),
  );

  const examBtn = createModeButton("https://cdn-icons-png.flaticon.com/512/3640/3640554.png", "Exam", "لا إجابات أثناء الإمتحان", () =>
    startQuiz(examId, "exam"),
  );

  modeGrid.appendChild(practiceBtn);
  modeGrid.appendChild(timedBtn);
  modeGrid.appendChild(examBtn);

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.textContent = "إلغاء";
  closeBtn.onclick = () => modal.remove();

  modalCard.appendChild(h2);
  modalCard.appendChild(p);
  modalCard.appendChild(modeGrid);
  modalCard.appendChild(closeBtn);

  modal.appendChild(modalCard);
  document.body.appendChild(modal);
}

function createModeButton(icon, title, description, onClick) {
  const btn = document.createElement("button");
  btn.className = "mode-btn";
  btn.onclick = onClick;

  let iconElement;
  if (!isURL_orPath(icon)) {
  iconElement = document.createElement("span");
  iconElement.className = "icon";
  iconElement.textContent = icon;
  }
  else{
    iconElement = document.createElement("img");
    iconElement.className = "icon";
    iconElement.src = icon;
    iconElement.alt = "Context icon";
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

// Helper: URL or relative path Check (From Visual Source)
function isURL_orPath(string) {
  // 1. Check if it is a valid Absolute URL (HTTP/HTTPS)
  try {
    const url = new URL(string);
    // Only return true for http/https, excluding ftp, mailto, etc.
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    // 2. If Absolute check failed, check if it is a Relative Path
    try {
      // We use a dummy base to validate that the string is a syntactically valid path
      const base = "http://example.com";
      const url = new URL(string, base);
      
      // Verification logic:
      // A. The origin must match the base (ensures the string didn't switch to a different protocol/domain)
      // B. The string must contain a slash '/' or start with '.' (distinguishes paths from plain words like "hello")
      const isRelative = url.origin === base;
      const isPathLike = string.includes("/") || string.startsWith(".");

      return isRelative && isPathLike;
    } catch (_) {
      return false;
    }
  }
}

function startQuiz(id, mode) {
  window.location.href = `quiz.html?id=${id}&mode=${mode}`;
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
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.querySelector(".install-app");
  if (installBtn) {
    installBtn.style.display = "block";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.querySelector(".install-app");
  if (installBtn) {
    installBtn.style.display = "none";

    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) {
        alert(
          "The app is not installable at this time. Please check your browser support or PWA setup.",
        );
        return;
      }

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        installBtn.style.display = "none";
      } else {
        console.log("User dismissed the install prompt");
      }

      deferredPrompt = null;
    });
  }
});

window.addEventListener("appinstalled", () => {
  console.log("PWA installed successfully");
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

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";
  modalCard.style.contain = "layout style paint";

  const h2 = document.createElement("h2");
  h2.textContent = quiz.title;

  const p = document.createElement("p");
  p.textContent = "اختر طريقة التنزيل";

  const grid = document.createElement("div");
  grid.className = "mode-grid";

  // Config object for export functions (mocking structure of standard exam config)
  const config = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    // path is null for user quizzes
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
    b.innerHTML = `<img src="${icon}" alt="Context Icon" class="icon"><strong>${label}</strong>`;
    b.onclick = (ev) => {
      ev.stopPropagation();
      onDownloadOption(format);
    };
    grid.appendChild(b);
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.textContent = "إلغاء";
  closeBtn.onclick = () => modal.remove();

  modalCard.appendChild(h2);
  modalCard.appendChild(p);
  modalCard.appendChild(grid);
  modalCard.appendChild(closeBtn);
  modal.appendChild(modalCard);

  requestAnimationFrame(() => {
    document.body.appendChild(modal);
  });
}
