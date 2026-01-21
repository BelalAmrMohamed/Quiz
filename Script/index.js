// Script/index.js - Performance Optimized with Filtering & Subscriptions
import { examList, categoryTree } from "./examManifest.js";
import { userProfile } from "./userProfile.js";
import { 
  extractMetadata, 
  filterCourses, 
  getSubscribedCourses,
  getAllRootCourses,
  courseMatchesFilters,
  getCourseItemCount,
  getAvailableYears,
  getAvailableTerms
} from "./filterUtils.js";

const container = document.getElementById("contentArea");
const title = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");

// ============================================================================
// USER PERSONALIZATION & GAMIFIED WELCOME SYSTEM
// ============================================================================

const userNameBadge = document.getElementById("user-name");

// Gamified welcome message pool
const welcomeMessages = [
  (name) => `🏆 Welcome back, Champion ${name}!`,
  (name) => `🚀 Back already, ${name}? Let's continue the grind!`,
  (name) => `🎮 Ready to play again, ${name}? Your next challenge awaits.`,
  (name) => `🔔 New challenge unlocked, ${name}!`,
  (name) => `✨ Your journey continues, ${name}…`,
  (name) => `🔥 Streak active! Jump back in, ${name}!`,
  (name) => `🧠 Knowledge power-up ready, ${name}!`,
  (name) => `⚡ XP boost incoming! Welcome back, ${name}!`,
  (name) => `📈 Progress detected. Keep going, ${name}!`,
  (name) => `👑 The legend returns… Welcome back, ${name}!`,
];

// Pick a random welcome message
function getRandomWelcomeMessage(name) {
  const message =
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  return message(name);
}

// Update welcome badge text
function updateWelcomeMessage() {
  const profile = userProfile.getProfile();
  const name = profile.username;
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

window.openProfileSettings = function() {
  const profile = userProfile.getProfile();
  const metadata = extractMetadata(categoryTree);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'profileModal';

  const modalCard = document.createElement('div');
  modalCard.className = 'modal-card profile-modal';

  // Get available years and terms for current selection
  const availableYears = profile.faculty === 'All' 
    ? metadata.years 
    : getAvailableYears(categoryTree, profile.faculty);
  
  const availableTerms = getAvailableTerms(categoryTree, profile.faculty, profile.year);

  modalCard.innerHTML = `
    <h2>⚙️ Profile Settings</h2>
    
    <div class="profile-section">
      <label for="profileUsername">Display Name</label>
      <input 
        type="text" 
        id="profileUsername" 
        class="profile-input"
        value="${escapeHtml(profile.username)}"
        placeholder="Enter your name"
      />
    </div>

    <div class="profile-section">
      <h3>Academic Information</h3>
      <p class="profile-hint">This helps us show you relevant courses</p>
      
      <div class="profile-grid">
        <div>
          <label for="profileFaculty">Faculty</label>
          <select id="profileFaculty" class="profile-select">
            <option value="All">All Faculties</option>
            ${metadata.faculties.map(f => 
              `<option value="${escapeHtml(f)}" ${f === profile.faculty ? 'selected' : ''}>${escapeHtml(f)}</option>`
            ).join('')}
          </select>
        </div>

        <div>
          <label for="profileYear">Year</label>
          <select id="profileYear" class="profile-select">
            <option value="All">All Years</option>
            ${availableYears.map(y => 
              `<option value="${escapeHtml(y)}" ${y === profile.year ? 'selected' : ''}>Year ${escapeHtml(y)}</option>`
            ).join('')}
          </select>
        </div>

        <div>
          <label for="profileTerm">Term</label>
          <select id="profileTerm" class="profile-select">
            <option value="All">All Terms</option>
            ${availableTerms.map(t => 
              `<option value="${escapeHtml(t)}" ${t === profile.term ? 'selected' : ''}>Term ${escapeHtml(t)}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="profile-actions">
      <button class="profile-btn primary" onclick="window.saveProfileSettings()">
        💾 Save Changes
      </button>
      <button class="profile-btn secondary" onclick="window.closeProfileModal()">
        Cancel
      </button>
    </div>
  `;

  modal.appendChild(modalCard);
  document.body.appendChild(modal);

  // Setup cascading dropdown listeners for Profile Settings
  setupProfileDropdownCascade();

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeProfileModal();
  });
};

/**
 * Setup cascading dropdown behavior for Profile Settings modal
 */
function setupProfileDropdownCascade() {
  const facultySelect = document.getElementById('profileFaculty');
  const yearSelect = document.getElementById('profileYear');
  const termSelect = document.getElementById('profileTerm');

  if (!facultySelect || !yearSelect || !termSelect) return;

  // When faculty changes, update year and term dropdowns
  facultySelect.addEventListener('change', () => {
    const selectedFaculty = facultySelect.value;
    
    // Update year dropdown
    const availableYears = selectedFaculty === 'All' 
      ? extractMetadata(categoryTree).years 
      : getAvailableYears(categoryTree, selectedFaculty);
    
    const currentYear = yearSelect.value;
    yearSelect.innerHTML = '<option value="All">All Years</option>' + 
      availableYears.map(y => 
        `<option value="${escapeHtml(y)}">Year ${escapeHtml(y)}</option>`
      ).join('');
    
    // Restore selection if still valid, otherwise reset to "All"
    if (availableYears.includes(currentYear)) {
      yearSelect.value = currentYear;
    } else {
      yearSelect.value = 'All';
    }
    
    // Trigger year change to update terms
    yearSelect.dispatchEvent(new Event('change'));
  });

  // When year changes, update term dropdown
  yearSelect.addEventListener('change', () => {
    const selectedFaculty = facultySelect.value;
    const selectedYear = yearSelect.value;
    
    // Update term dropdown
    const availableTerms = getAvailableTerms(categoryTree, selectedFaculty, selectedYear);
    
    const currentTerm = termSelect.value;
    termSelect.innerHTML = '<option value="All">All Terms</option>' + 
      availableTerms.map(t => 
        `<option value="${escapeHtml(t)}">Term ${escapeHtml(t)}</option>`
      ).join('');
    
    // Restore selection if still valid, otherwise reset to "All"
    if (availableTerms.includes(currentTerm)) {
      termSelect.value = currentTerm;
    } else {
      termSelect.value = 'All';
    }
  });
}

window.saveProfileSettings = function() {
  const username = document.getElementById('profileUsername')?.value;
  const faculty = document.getElementById('profileFaculty')?.value;
  const year = document.getElementById('profileYear')?.value;
  const term = document.getElementById('profileTerm')?.value;

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

window.closeProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.remove();
};

// ============================================================================
// COURSE SUBSCRIPTION MANAGEMENT
// ============================================================================

window.openCourseManager = function() {
  const profile = userProfile.getProfile();
  const metadata = extractMetadata(categoryTree);
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'courseManagerModal';

  const modalCard = document.createElement('div');
  modalCard.className = 'modal-card course-manager-modal';

  // Get available years and terms for current profile selection
  const availableYears = profile.faculty === 'All' 
    ? metadata.years 
    : getAvailableYears(categoryTree, profile.faculty);
  
  const availableTerms = getAvailableTerms(categoryTree, profile.faculty, profile.year);

  modalCard.innerHTML = `
    <h2>📚 Manage Your Courses</h2>
    <p class="course-manager-hint">Select courses you want to see on your dashboard</p>

    <div class="course-manager-filters">
      <select id="cmFaculty" class="course-filter-select">
        <option value="All">All Faculties</option>
        ${metadata.faculties.map(f => 
          `<option value="${escapeHtml(f)}" ${f === profile.faculty ? 'selected' : ''}>${escapeHtml(f)}</option>`
        ).join('')}
      </select>

      <select id="cmYear" class="course-filter-select">
        <option value="All">All Years</option>
        ${availableYears.map(y => 
          `<option value="${escapeHtml(y)}" ${y === profile.year ? 'selected' : ''}>Year ${escapeHtml(y)}</option>`
        ).join('')}
      </select>

      <select id="cmTerm" class="course-filter-select">
        <option value="All">All Terms</option>
        ${availableTerms.map(t => 
          `<option value="${escapeHtml(t)}" ${t === profile.term ? 'selected' : ''}>Term ${escapeHtml(t)}</option>`
        ).join('')}
      </select>
    </div>

    <div id="courseManagerList" class="course-manager-list">
      <!-- Course list will be rendered here -->
    </div>

    <div class="course-manager-actions">
      <button class="profile-btn primary" onclick="window.closeCourseManager()">
        ✅ Done
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
  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeCourseManager();
  });
};

/**
 * Setup cascading dropdown behavior for Course Manager modal
 */
function setupCourseManagerDropdownCascade() {
  const facultySelect = document.getElementById('cmFaculty');
  const yearSelect = document.getElementById('cmYear');
  const termSelect = document.getElementById('cmTerm');

  if (!facultySelect || !yearSelect || !termSelect) return;

  // When faculty changes, update year and term dropdowns
  facultySelect.addEventListener('change', () => {
    const selectedFaculty = facultySelect.value;
    
    // Update year dropdown
    const availableYears = selectedFaculty === 'All' 
      ? extractMetadata(categoryTree).years 
      : getAvailableYears(categoryTree, selectedFaculty);
    
    const currentYear = yearSelect.value;
    yearSelect.innerHTML = '<option value="All">All Years</option>' + 
      availableYears.map(y => 
        `<option value="${escapeHtml(y)}">Year ${escapeHtml(y)}</option>`
      ).join('');
    
    // Restore selection if still valid, otherwise reset to "All"
    if (availableYears.includes(currentYear)) {
      yearSelect.value = currentYear;
    } else {
      yearSelect.value = 'All';
    }
    
    // Trigger year change to update terms
    yearSelect.dispatchEvent(new Event('change'));
  });

  // When year changes, update term dropdown
  yearSelect.addEventListener('change', () => {
    const selectedFaculty = facultySelect.value;
    const selectedYear = yearSelect.value;
    
    // Update term dropdown
    const availableTerms = getAvailableTerms(categoryTree, selectedFaculty, selectedYear);
    
    const currentTerm = termSelect.value;
    termSelect.innerHTML = '<option value="All">All Terms</option>' + 
      availableTerms.map(t => 
        `<option value="${escapeHtml(t)}">Term ${escapeHtml(t)}</option>`
      ).join('');
    
    // Restore selection if still valid, otherwise reset to "All"
    if (availableTerms.includes(currentTerm)) {
      termSelect.value = currentTerm;
    } else {
      termSelect.value = 'All';
    }
    
    // Re-render course list after cascade updates
    renderCourseManagerList();
  });

  // When term changes, re-render course list
  termSelect.addEventListener('change', () => {
    renderCourseManagerList();
  });
}

function renderCourseManagerList() {
  const listContainer = document.getElementById('courseManagerList');
  if (!listContainer) return;

  const faculty = document.getElementById('cmFaculty')?.value || 'All';
  const year = document.getElementById('cmYear')?.value || 'All';
  const term = document.getElementById('cmTerm')?.value || 'All';

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

  listContainer.innerHTML = filteredCourses.map(course => {
    const isSubscribed = subscribedIds.includes(course.id);
    return `
      <div class="course-manager-item ${isSubscribed ? 'subscribed' : ''}">
        <div class="course-manager-info">
          <h4>${escapeHtml(course.name)}</h4>
          <p class="course-manager-meta">
            ${escapeHtml(course.faculty)} • Year ${escapeHtml(course.year)} • Term ${escapeHtml(course.term)}
          </p>
        </div>
        <button 
          class="course-toggle-btn ${isSubscribed ? 'active' : ''}"
          onclick="window.toggleCourseSubscription('${escapeHtml(course.id)}')"
        >
          ${isSubscribed ? '✓ Subscribed' : '+ Subscribe'}
        </button>
      </div>
    `;
  }).join('');
}

window.toggleCourseSubscription = function(courseId) {
  userProfile.toggleSubscription(courseId);
  renderCourseManagerList();
};

window.closeCourseManager = function() {
  const modal = document.getElementById('courseManagerModal');
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

// Initialize
renderRootCategories();

function renderRootCategories() {
  navigationStack = [];
  updateBreadcrumb();

  if (!title || !container) return;

  const subscribedIds = userProfile.getSubscribedCourseIds();
  
  // Get subscribed courses
  const subscribedCourses = getSubscribedCourses(categoryTree, subscribedIds);

  // Title based on subscription status
  if (subscribedCourses.length > 0) {
    title.textContent = "My Courses";
  } else {
    title.textContent = "All Courses";
  }

  container.innerHTML = "";
  container.className = "grid-container";

  const fragment = document.createDocumentFragment();

  // // Action buttons at top
  // const actionBar = document.createElement('div');
  // actionBar.className = 'dashboard-actions';
  // actionBar.innerHTML = `
  //   <button class="dashboard-action-btn" onclick="window.openProfileSettings()">
  //     ⚙️ Profile Settings
  //   </button>
  //   <button class="dashboard-action-btn" onclick="window.openCourseManager()">
  //     📚 Manage Courses
  //   </button>
  // `;
  // fragment.appendChild(actionBar);

  // Show subscribed courses if any
  if (subscribedCourses.length > 0) {
    subscribedCourses.forEach(course => {
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

function createCategoryCard(name, itemCount, isFolder = false, courseData = null) {
  const card = document.createElement("div");
  card.className = "card category-card";

  const icon = isFolder ? "📁" : "📂";
  const itemText = itemCount === 1 ? "item" : "items";

  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.textContent = icon;

  const h3 = document.createElement("h3");
  h3.textContent = name;

  const p = document.createElement("p");
  p.textContent = `${itemCount} ${itemText}`;

  // Add course metadata if available
  if (courseData && courseData.faculty && courseData.year && courseData.term) {
    const metaDiv = document.createElement("div");
    metaDiv.className = "course-meta";
    metaDiv.textContent = `${courseData.faculty} • Y${courseData.year} • T${courseData.term}`;
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
    breadcrumbText.textContent = "Back to Courses";
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

function showModeSelection(examId, examTitle) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const modalCard = document.createElement("div");
  modalCard.className = "modal-card";

  const h2 = document.createElement("h2");
  h2.textContent = examTitle;

  const p = document.createElement("p");
  p.textContent = "Select a study mode:";

  const modeGrid = document.createElement("div");
  modeGrid.className = "mode-grid";

  const practiceBtn = createModeButton(
    "🛡️",
    "Practice",
    "Has a timer, and you can check answers",
    () => startQuiz(examId, "practice"),
  );

  const timedBtn = createModeButton("⏱️", "Timed", "30s per question", () =>
    startQuiz(examId, "timed"),
  );

  const examBtn = createModeButton("📝", "Exam", "No checking answers!", () =>
    startQuiz(examId, "exam"),
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