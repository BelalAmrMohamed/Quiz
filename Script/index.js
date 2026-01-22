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
  btn.style.flex = "1";
  btn.style.minWidth = "0";
  btn.textContent = "Start";
  btn.onclick = (ev) => {
    ev.stopPropagation();
    showModeSelection(exam.id, exam.title || exam.id);
  };

  const isEssayQ = (q) => q.options && q.options.length === 1;

  const runExport = (format, config, questions) => {
    const blobDownload = (blob, mime, name) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if (format === "md") {
      let hasMCQ = false, hasTF = false, hasEssay = false;
      questions.forEach((q) => {
        if (isEssayQ(q)) hasEssay = true;
        else if (q.options.length === 2) hasTF = true;
        else hasMCQ = true;
      });
      let qt = hasEssay && !hasMCQ && !hasTF ? "Essay/Definitions" : hasEssay ? "Mixed (MCQ, True/False, Essay)" : hasMCQ && hasTF ? "MCQ and True/False" : hasTF ? "True/False only" : "MCQ only";
      let md = `# ${config.title || "Quiz"}\n**Number of questions:** ${questions.length}\n**Questions' type:** ${qt}\n\n---\n\n`;
      questions.forEach((q, i) => {
        md += `### Question ${i + 1}\n${q.q}\n\n`;
        if (isEssayQ(q)) md += `**Formal Answer:**\n\n${q.options[0]}\n\n`;
        else {
          q.options.forEach((opt, j) => { md += `${String.fromCharCode(65 + j)}. ${opt}\n`; });
          md += `\n**Correct Answer:** ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}\n\n`;
        }
        if (q.explanation) md += `**Explanation:**\n${q.explanation}\n\n`;
        md += `---\n\n`;
      });
      blobDownload(new Blob([md], { type: "text/markdown;charset=utf-8" }), "text/markdown", `${config.title || "quiz_export"}.md`);
      return;
    }

    if (format === "html") {
      let hasMCQ = false, hasTF = false, hasEssay = false;
      questions.forEach((q) => {
        if (isEssayQ(q)) hasEssay = true;
        else if (q.options.length === 2) hasTF = true;
        else hasMCQ = true;
      });
      let qt = "Multiple Choice";
      if (hasEssay && !hasMCQ && !hasTF) qt = "Essay/Definitions";
      else if (hasEssay) qt = "Mixed (MCQ, True/False, Essay)";
      const date = new Date().toLocaleDateString();
      let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${config.title || "Quiz Examination"}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;line-height:1.6;color:#e0e0e0;background:#121212}h1{color:#fff;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:30px;text-align:center}.meta{text-align:center;color:#888;margin-bottom:40px;font-style:italic}.question-card{background:#1e1e1e;border-radius:12px;padding:25px;margin-bottom:30px;box-shadow:0 4px 12px rgba(0,0,0,.3);border:1px solid #333}.q-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;font-size:.9rem;color:#aaa}.q-text{font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:20px}.options-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}.option{padding:10px 15px;margin-bottom:8px;border-radius:6px;background:rgba(255,255,255,.05);font-size:.95rem}.correct-answer{background:var(--correct-bg);color:var(--correct-text);border:1px solid #22c55e;font-weight:600;margin-top:15px;padding:12px 15px;border-radius:8px}.explanation{margin-top:15px;padding:15px;background:rgba(59,130,246,.1);border-left:3px solid var(--accent);color:#dbeafe;font-size:.95rem}.essay-box{background:#2a2a2a;padding:15px;border-radius:8px;border-left:3px solid #f59e0b;margin-top:10px}.footer{text-align:center;margin-top:50px;color:var(--text-muted);font-size:.8rem;border-top:1px solid var(--border);padding-top:20px}</style></head><body><h1>${config.title || "Quiz Examination"}</h1><div class="meta">Total Questions: ${questions.length} • Type: ${qt} • Date: ${date}</div>`;
      questions.forEach((q, i) => {
        html += `<div class="question-card"><div class="q-header"><span>Question ${i + 1}</span><span>${isEssayQ(q) ? "Essay" : "MCQ"}</span></div><div class="q-text">${q.q}</div>`;
        if (isEssayQ(q)) html += `<div class="essay-box"><strong style="color:#f59e0b;display:block;margin-bottom:5px">Formal Answer / Key Points:</strong>${q.options[0]}</div>`;
        else {
          html += `<div class="options-list">`;
          q.options.forEach((opt, j) => { html += `<div class="option"><strong>${String.fromCharCode(65 + j)}.</strong> ${opt}</div>`; });
          html += `</div><div class="correct-answer">✓ Correct Answer: ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}</div>`;
        }
        if (q.explanation) html += `<div class="explanation"><strong>💡 Explanation:</strong> ${q.explanation}</div>`;
        html += `</div>`;
      });
      html += `<div class="footer">Generated by Quiz App</div></body></html>`;
      blobDownload(new Blob([html], { type: "text/html;charset=utf-8" }), "text/html", `${config.title || "quiz_export"}.html`);
      return;
    }

    if (format === "quiz") {
      const qJson = JSON.stringify(questions).replace(/<\/script/gi, "<\\/script");
      const quizHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.title || "Practice Quiz"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}
.container{max-width:800px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:30px;text-align:center}
.header h1{font-size:28px;margin-bottom:10px}
.header p{opacity:.9;font-size:14px}
.quiz-body{padding:30px}
.question-card{background:#f8f9fa;border-radius:12px;padding:25px;margin-bottom:25px;border:2px solid #e9ecef}
.question-card.answered{border-color:#667eea}
.question-num{color:#667eea;font-weight:700;font-size:14px;margin-bottom:15px}
.question-text{font-size:18px;font-weight:600;margin-bottom:20px;color:#2d3748;line-height:1.6}
.options{display:flex;flex-direction:column;gap:12px}
.option-btn{background:#fff;border:2px solid #e2e8f0;border-radius:10px;padding:15px 20px;text-align:left;cursor:pointer;transition:all .3s ease;font-size:16px;color:#2d3748}
.option-btn:hover{border-color:#667eea;background:#f0f4ff;transform:translateX(5px)}
.option-btn.selected{background:#667eea;color:#fff;border-color:#667eea}
.option-btn.correct{background:#48bb78;color:#fff;border-color:#48bb78}
.option-btn.wrong{background:#f56565;color:#fff;border-color:#f56565}
.option-btn.disabled{cursor:not-allowed;opacity:.6}
.essay-input{width:100%;min-height:120px;padding:15px;border:2px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:15px;resize:vertical}
.essay-input:focus{outline:0;border-color:#667eea}
.controls{display:flex;gap:15px;justify-content:center;padding:20px;background:#f8f9fa;flex-wrap:wrap}
.btn{padding:12px 30px;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s}
.btn-primary{background:#667eea;color:#fff}
.btn-primary:hover{background:#5a67d8;transform:translateY(-2px);box-shadow:0 4px 12px rgba(102,126,234,.4)}
.btn-secondary{background:#e2e8f0;color:#2d3748}
.btn-secondary:hover{background:#cbd5e0}
.results{padding:30px;text-align:center;display:none}
.results.show{display:block}
.score-circle{width:150px;height:150px;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:#fff}
.score-circle.pass{background:linear-gradient(135deg,#48bb78,#38a169)}
.score-circle.fail{background:linear-gradient(135deg,#f56565,#e53e3e)}
.explanation{background:#ebf8ff;border-left:4px solid #4299e1;padding:15px;margin-top:15px;border-radius:8px;font-size:14px;color:#2c5282;display:none}
.explanation.show{display:block}
@media(max-width:600px){.container{border-radius:0}.header{padding:20px}.quiz-body{padding:20px}}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>${config.title || "Practice Quiz"}</h1>
<p>Total Questions: ${questions.length} | Practice Mode</p>
</div>
<div id="quizBody" class="quiz-body"></div>
<div class="controls">
<button class="btn btn-secondary" onclick="resetQuiz()">🔄 Reset Quiz</button>
<button class="btn btn-primary" onclick="submitQuiz()">✓ Submit Quiz</button>
</div>
<div id="results" class="results"></div>
</div>
<script>
const questions=${qJson};
let userAnswers=new Array(questions.length).fill(null);
let submitted=false;
function isEssayQuestion(q){return q.options&&q.options.length===1}
function escapeHTML(str){if(str==null||str===undefined)return "";var d=document.createElement("div");d.textContent=str;return d.innerHTML}
function renderQuiz(){
var quizBody=document.getElementById("quizBody");
var html="";
for(var i=0;i<questions.length;i++){
var q=questions[i];
var isEssay=isEssayQuestion(q);
html+='<div class="question-card" id="q'+i+'"><div class="question-num">Question '+(i+1)+'</div><div class="question-text">'+escapeHTML(q.q)+'</div>';
if(isEssay){
html+='<textarea class="essay-input" id="essay'+i+'" placeholder="Type your answer here..." oninput="saveEssayAnswer('+i+', this.value)">'+(userAnswers[i]||"")+"</textarea>";
}else{
html+='<div class="options">';
for(var j=0;j<q.options.length;j++){
var letter=String.fromCharCode(65+j);
html+='<button class="option-btn" id="btn'+i+'_'+j+'" onclick="selectAnswer('+i+','+j+')"><strong>'+letter+'.</strong> '+escapeHTML(q.options[j])+"</button>";
}
html+="</div>";
}
if(q.explanation){html+='<div class="explanation" id="exp'+i+'"><strong>💡 Explanation:</strong> '+escapeHTML(q.explanation)+"</div>"}
html+="</div>";
}
quizBody.innerHTML=html;
}
function selectAnswer(qIndex,optIndex){
if(submitted)return;
userAnswers[qIndex]=optIndex;
var card=document.getElementById("q"+qIndex);
card.classList.add("answered");
var btns=card.querySelectorAll(".option-btn");
for(var k=0;k<btns.length;k++){btns[k].classList.remove("selected");if(k===optIndex)btns[k].classList.add("selected")}
}
function saveEssayAnswer(qIndex,value){
userAnswers[qIndex]=value.trim()||null;
var card=document.getElementById("q"+qIndex);
if(value.trim())card.classList.add("answered");else card.classList.remove("answered");
}
function submitQuiz(){
if(submitted)return;
submitted=true;
var correct=0,totalScorable=0;
for(var i=0;i<questions.length;i++){
var q=questions[i];
if(isEssayQuestion(q))continue;
totalScorable++;
var userAns=userAnswers[i];
var isCorrect=userAns===q.correct;
if(isCorrect)correct++;
var card=document.getElementById("q"+i);
var btns=card.querySelectorAll(".option-btn");
for(var k=0;k<btns.length;k++){
btns[k].classList.add("disabled");
if(k===q.correct)btns[k].classList.add("correct");
else if(k===userAns&&!isCorrect)btns[k].classList.add("wrong");
}
var exp=document.getElementById("exp"+i);
if(exp)exp.classList.add("show");
}
var pct=totalScorable>0?Math.round((correct/totalScorable)*100):0;
var resultsDiv=document.getElementById("results");
resultsDiv.innerHTML='<div class="score-circle '+(pct>=70?"pass":"fail")+'">'+pct+'%</div><h2>'+(pct>=70?"Great Job!":"Keep Practicing!")+'</h2><p style="margin-top:15px;font-size:18px;color:#4a5568">Score: '+correct+' / '+totalScorable+'</p><p style="margin-top:10px;color:#718096">Scroll up to review explanations</p>';
resultsDiv.classList.add("show");
resultsDiv.scrollIntoView({behavior:"smooth",block:"center"});
}
function resetQuiz(){
submitted=false;
userAnswers=new Array(questions.length).fill(null);
document.getElementById("results").classList.remove("show");
renderQuiz();
window.scrollTo({top:0,behavior:"smooth"});
}
renderQuiz();
</script>
</body>
</html>`;
      blobDownload(new Blob([quizHtml], { type: "text/html;charset=utf-8" }), "text/html", `${config.title || "practice_quiz"}.html`);
      return;
    }

    if (format === "pdf") {
      if (typeof html2pdf === "undefined") { alert("PDF library is not loaded. Please try again."); return; }
      let hasMCQ = false, hasTF = false, hasEssay = false;
      questions.forEach((q) => { if (isEssayQ(q)) hasEssay = true; else if (q.options.length === 2) hasTF = true; else hasMCQ = true; });
      let qt = "Multiple Choice";
      if (hasEssay && !hasMCQ && !hasTF) qt = "Essay/Definitions";
      else if (hasEssay) qt = "Mixed (MCQ, True/False, Essay)";
      const pdfContainer = document.createElement("div");
      pdfContainer.id = "pdf-export-container";
      pdfContainer.style.background = "#ffffff";
      document.body.appendChild(pdfContainer);
      let contentHTML = `<style>#pdf-export-wrapper{font-family:'Times New Roman',serif;color:#000!important;background:#fff!important;line-height:1.5}#pdf-export-wrapper h1,#pdf-export-wrapper h2,#pdf-export-wrapper p,#pdf-export-wrapper div,#pdf-export-wrapper span{color:#000!important}.pdf-card{border:1px solid #ddd;background:#fafafa!important;padding:15px;margin-bottom:20px;page-break-inside:avoid}.pdf-correct{background:#e8f5e9!important;border-left:4px solid #4caf50;padding:10px;margin-top:10px;color:#000!important}.pdf-essay{background:#fff3e0!important;border-left:4px solid #ff9800;padding:10px;margin-top:10px;color:#000!important}.pdf-explain{background:#e3f2fd!important;border-left:4px solid #2196f3;padding:10px;margin-top:10px;font-style:italic;color:#000!important}</style><div id="pdf-export-wrapper" style="padding:20px"><div style="text-align:center;border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:30px"><h1 style="font-size:24px;margin:0;text-transform:uppercase">${config.title || "Quiz Examination"}</h1><p style="font-size:14px;margin:5px 0"><strong>Total Questions:</strong> ${questions.length} &nbsp;|&nbsp; <strong>Type:</strong> ${qt}</p></div>`;
      questions.forEach((q, i) => {
        contentHTML += `<div class="pdf-card"><div style="font-weight:bold;font-size:14px;margin-bottom:8px">Question ${i + 1}</div><div style="font-size:13px;margin-bottom:12px">${q.q}</div>`;
        if (isEssayQ(q)) contentHTML += `<div class="pdf-essay"><strong>Answer:</strong><br>${q.options[0]}</div>`;
        else {
          contentHTML += `<div style="margin-left:15px">`;
          q.options.forEach((opt, j) => { contentHTML += `<div style="margin-bottom:5px;font-size:12px"><strong>${String.fromCharCode(65 + j)}.</strong> ${opt}</div>`; });
          contentHTML += `</div><div class="pdf-correct"><strong>Correct Answer:</strong> ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}</div>`;
        }
        if (q.explanation) contentHTML += `<div class="pdf-explain"><strong>Explanation:</strong> ${q.explanation}</div>`;
        contentHTML += `</div>`;
      });
      contentHTML += `<div style="margin-top:30px;text-align:center;font-size:10px;border-top:1px solid #ccc;padding-top:10px">Generated on ${new Date().toLocaleDateString()}</div></div>`;
      pdfContainer.innerHTML = contentHTML;
      const opts = { margin: [10, 10, 10, 10], filename: `${config.title || "quiz"}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", scrollY: 0, windowHeight: pdfContainer.scrollHeight }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } };
      setTimeout(() => {
        html2pdf().set(opts).from(pdfContainer).save().then(() => { if (pdfContainer.parentNode) document.body.removeChild(pdfContainer); }).catch((err) => { console.error(err); if (pdfContainer.parentNode) document.body.removeChild(pdfContainer); alert("Failed to generate PDF."); });
      }, 100);
    }
  };

  const loadPdfLib = () => new Promise((resolve, reject) => {
    if (typeof html2pdf !== "undefined") { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("PDF library failed to load"));
    document.head.appendChild(s);
  });

  const onDownloadOption = async (format, modalEl) => {
    modalEl.remove();
    const config = { id: exam.id, title: exam.title || exam.id, path: exam.path };
    let mod;
    try { mod = await import(config.path); } catch (e) { alert("Failed to load exam."); return; }
    const questions = mod.questions;
    if (format === "pdf") { try { await loadPdfLib(); } catch { alert("PDF library could not be loaded."); return; } }
    runExport(format, config, questions);
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
    p.textContent = "Select download format:";
    const grid = document.createElement("div");
    grid.className = "mode-grid";
    const opts = [
      ["💡", "Quiz (.html)", "quiz"],
      ["🌐", "HTML (.html)", "html"],
      ["📄", "PDF (.pdf)", "pdf"],
      ["📝", "Markdown (.md)", "md"],
    ];
    opts.forEach(([icon, label, format]) => {
      const b = document.createElement("button");
      b.className = "mode-btn";
      b.innerHTML = `<span class="icon">${icon}</span><strong>${label}</strong>`;
      b.onclick = (ev) => { ev.stopPropagation(); onDownloadOption(format, modal); };
      grid.appendChild(b);
    });
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-modal";
    closeBtn.textContent = "Cancel";
    closeBtn.onclick = () => modal.remove();
    modalCard.appendChild(h2);
    modalCard.appendChild(p);
    modalCard.appendChild(grid);
    modalCard.appendChild(closeBtn);
    modal.appendChild(modalCard);
    requestAnimationFrame(() => { document.body.appendChild(modal); });
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "start-btn";
  downloadBtn.style.flex = "1";
  downloadBtn.style.minWidth = "0";
  downloadBtn.textContent = "Download";
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