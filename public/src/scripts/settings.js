// settings.js - Settings page: name, faculty, year, term, quiz style, default mode
import { getManifest } from "./quizManifest.js";
import { userProfile } from "./userProfile.js";
import {
  extractMetadata,
  getAvailableYears,
  getAvailableTerms,
  filterCourses,
} from "./filterUtils.js";

const CONFIG = {
  MAX_USERNAME_LENGTH: 50,
  AUTOSAVE_DELAY: 800, // ms - delay before auto-saving
};

let categoryTree = null;
let autoSaveTimeout = null;
let isSaving = false;

function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  const dangerousPatterns = /<script|javascript:|onerror=/gi;
  if (dangerousPatterns.test(username)) {
    return { valid: false, message: "اسم غير صالح" };
  }
  return { valid: true, message: "" };
}

function setOptionCardsSelection(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
    const wrap = radio.closest(".option-card");
    if (wrap) {
      if (radio.value === value) {
        wrap.classList.add("selected");
        radio.checked = true;
      } else {
        wrap.classList.remove("selected");
        radio.checked = false;
      }
    }
  });
}

function bindOptionCards(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
    const wrap = radio.closest(".option-card");
    if (!wrap) return;
    wrap.addEventListener("click", () => {
      document
        .querySelectorAll(`.option-cards input[name="${name}"]`)
        .forEach((r) => {
          r.closest(".option-card")?.classList.remove("selected");
        });
      wrap.classList.add("selected");
      radio.checked = true;
    });
  });
}

function setupCascade() {
  const facultySelect = document.getElementById("settingsFaculty");
  const yearSelect = document.getElementById("settingsYear");
  const termSelect = document.getElementById("settingsTerm");

  if (!facultySelect || !yearSelect || !termSelect || !categoryTree) return;

  facultySelect.addEventListener("change", () => {
    const faculty = facultySelect.value;
    const years =
      faculty === "All"
        ? extractMetadata(categoryTree).years
        : getAvailableYears(categoryTree, faculty);
    yearSelect.innerHTML =
      '<option value="All">All Years</option>' +
      years
        .map(
          (y) =>
            `<option value="${escapeHtml(y)}">العام ${escapeHtml(y)}</option>`,
        )
        .join("");
    yearSelect.value = "All";
    const terms = getAvailableTerms(categoryTree, faculty, "All");
    termSelect.innerHTML =
      '<option value="All">All Terms</option>' +
      terms
        .map(
          (t) =>
            `<option value="${escapeHtml(t)}">الترم ${escapeHtml(t)}</option>`,
        )
        .join("");
    termSelect.value = "All";
  });

  yearSelect.addEventListener("change", () => {
    const faculty = facultySelect.value;
    const year = yearSelect.value;
    const terms = getAvailableTerms(categoryTree, faculty, year);
    const current = termSelect.value;
    termSelect.innerHTML =
      '<option value="All">All Terms</option>' +
      terms
        .map(
          (t) =>
            `<option value="${escapeHtml(t)}">الترم ${escapeHtml(t)}</option>`,
        )
        .join("");
    if (terms.includes(current)) termSelect.value = current;
    else termSelect.value = "All";
  });
}

function populateAcademic(faculty, year, term) {
  const metadata = extractMetadata(categoryTree);
  const facultySelect = document.getElementById("settingsFaculty");
  const yearSelect = document.getElementById("settingsYear");
  const termSelect = document.getElementById("settingsTerm");
  if (!facultySelect || !yearSelect || !termSelect) return;

  facultySelect.innerHTML =
    '<option value="All">All Faculties</option>' +
    metadata.faculties
      .map(
        (f) =>
          `<option value="${escapeHtml(f)}" ${f === faculty ? "selected" : ""}>${escapeHtml(f)}</option>`,
      )
      .join("");

  const years =
    faculty === "All"
      ? metadata.years
      : getAvailableYears(categoryTree, faculty);
  yearSelect.innerHTML =
    '<option value="All">All Years</option>' +
    years
      .map(
        (y) =>
          `<option value="${escapeHtml(y)}" ${y === year ? "selected" : ""}>العام ${escapeHtml(y)}</option>`,
      )
      .join("");

  const terms = getAvailableTerms(categoryTree, faculty, year);
  termSelect.innerHTML =
    '<option value="All">All Terms</option>' +
    terms
      .map(
        (t) =>
          `<option value="${escapeHtml(t)}" ${t === term ? "selected" : ""}>الترم ${escapeHtml(t)}</option>`,
      )
      .join("");
}

function showFeedback(message, isError = false) {
  const el = document.getElementById("saveFeedback");
  if (!el) return;
  el.textContent = message;
  el.style.color = isError
    ? "var(--color-error, red)"
    : "var(--color-success, green)";
  if (message) {
    setTimeout(() => {
      el.textContent = "";
    }, 3000);
  }
}

// === AUTO-SAVE FUNCTIONS ===
function scheduleAutoSave() {
  clearTimeout(autoSaveTimeout);
  showSavingIndicator();

  autoSaveTimeout = setTimeout(async () => {
    await saveSettingsAuto();
  }, CONFIG.AUTOSAVE_DELAY);
}

function showSavingIndicator() {
  const feedback = document.getElementById("saveFeedback");
  if (feedback) {
    feedback.textContent = "💾 جاري الحفظ...";
    feedback.style.color = "var(--color-primary, #6366f1)";
    feedback.classList.add("saving");
  }
}

function showSavedIndicator() {
  const feedback = document.getElementById("saveFeedback");
  if (feedback) {
    feedback.textContent = "✓ تم الحفظ تلقائياً";
    feedback.style.color = "var(--color-success, #10b981)";
    feedback.classList.remove("saving");

    setTimeout(() => {
      feedback.textContent = "";
      feedback.classList.remove("saving");
    }, 2000);
  }
}

async function saveSettingsAuto() {
  if (isSaving) return;
  isSaving = true;

  try {
    const username = document.getElementById("settingsName")?.value?.trim();

    // Validate and save username
    if (username) {
      const validation = validateUsername(username);
      if (!validation.valid) {
        showFeedback(validation.message, true);
        isSaving = false;
        return;
      }
      userProfile.setUsername(username);
    }

    // Save academic info
    const faculty = document.getElementById("settingsFaculty")?.value;
    const year = document.getElementById("settingsYear")?.value;
    const term = document.getElementById("settingsTerm")?.value;

    const oldProfile = userProfile.getProfile();
    userProfile.updateAcademicInfo({ faculty, year, term });

    // Handle academic info changes (subscription updates)
    const academicInfoChanged =
      oldProfile.faculty !== faculty ||
      oldProfile.year !== year ||
      oldProfile.term !== term;

    if (academicInfoChanged) {
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
      userProfile.initializeDefaultSubscriptions(categoryTree);
      renderCourseManagerList(); // Re-render now that subscriptions reflect the new profile
    }

    showSavedIndicator();
  } catch (error) {
    console.error("Auto-save failed:", error);
    showFeedback("فشل الحفظ التلقائي", true);
  } finally {
    isSaving = false;
  }
}

function setupAutoSave() {
  // Username auto-save with debounce
  const nameInput = document.getElementById("settingsName");
  if (nameInput) {
    nameInput.addEventListener("input", scheduleAutoSave);
    nameInput.addEventListener("blur", () => {
      // Validate immediately on blur
      const username = nameInput.value?.trim();
      if (username) {
        const validation = validateUsername(username);
        if (!validation.valid) {
          showFeedback(validation.message, true);
        }
      }
    });
  }

  // Academic dropdowns auto-save
  ["settingsFaculty", "settingsYear", "settingsTerm"].forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      select.addEventListener("change", () => {
        scheduleAutoSave();
        // Re-render course list when academic info changes
        renderCourseManagerList();
      });
    }
  });

  // Quiz style auto-save
  document.querySelectorAll('input[name="quizStyle"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      userProfile.setQuizStyle(radio.value);
      showFeedback("✓ تم تحديث نمط العرض", false);
    });
  });

  // Default mode auto-save
  document.querySelectorAll('input[name="defaultMode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      userProfile.setDefaultQuizMode(radio.value);
      showFeedback("✓ تم تحديث الوضع الافتراضي", false);
    });
  });
}

// --- Course Manager Logic ---
function renderCourseManagerList() {
  const listContainer = document.getElementById("courseManagerList");
  if (!listContainer) return;

  const faculty = document.getElementById("settingsFaculty")?.value;
  const year = document.getElementById("settingsYear")?.value;
  const term = document.getElementById("settingsTerm")?.value;

  const tempProfile = {
    faculty: faculty === "All" ? null : faculty,
    // year: year === "All" ? null : year,
    // term: term === "All" ? null : term,
  };

  const allCourses = filterCourses(categoryTree, tempProfile);
  const subscribedIds = userProfile.getSubscribedCourseIds();

  if (allCourses.length === 0) {
    listContainer.innerHTML =
      '<p style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--color-text-secondary);">لا توجد مواد تطابق خيارات العرض الحالية</p>';
    return;
  }

  listContainer.innerHTML = allCourses
    .map((course) => {
      const isSubscribed = subscribedIds.includes(course.id);
      return `
      <div class="course-item">
        <div class="course-info">
          <h4>${escapeHtml(course.name)}</h4>
          <p class="course-details">
            ${escapeHtml(course.faculty)} | ${course.year} | ${course.term}
          </p>
        </div>
        <label class="toggle-container">
            <input type="checkbox" onchange="toggleCourseSubscription('${escapeHtml(course.id)}')" ${isSubscribed ? "checked" : ""}>
            <span class="toggle-switch"></span>
        </label>
      </div>
    `;
    })
    .join("");
}

window.toggleCourseSubscription = function (courseId) {
  try {
    userProfile.toggleSubscription(courseId);
    // No need to re-render entire list, checkbox state is enough
    // But if we want to update UI feedback or something?
    // Let's leave it simple.
  } catch (error) {
    console.error("Error toggling subscription:", error);
  }
};

async function init() {
  try {
    const manifest = await getManifest();
    categoryTree = manifest.categoryTree || {};
  } catch (err) {
    console.error("Failed to load manifest:", err);
    categoryTree = {};
  }

  const profile = userProfile.getProfile();

  const nameInput = document.getElementById("settingsName");
  if (nameInput) nameInput.value = profile.username || "";

  populateAcademic(
    profile.faculty || "All",
    profile.year || "All",
    profile.term || "All",
  );
  setupCascade();

  // Render initial course list
  renderCourseManagerList();

  // Update course list when academic info changes
  ["settingsFaculty", "settingsYear", "settingsTerm"].forEach((id) => {
    document
      .getElementById(id)
      ?.addEventListener("change", renderCourseManagerList);
  });

  setOptionCardsSelection("quizStyle", profile.quizStyle || "pagination");
  setOptionCardsSelection("defaultMode", profile.defaultQuizMode || "practice");
  bindOptionCards("quizStyle");
  bindOptionCards("defaultMode");

  // Setup auto-save instead of form submit
  setupAutoSave();
}

init();
