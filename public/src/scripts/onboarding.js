import { userProfile } from "./userProfile.js";
import { getManifest } from "./quizManifest.js";
import {
  extractMetadata,
  getAvailableYears,
  getAvailableTerms,
  filterCourses,
} from "./filterUtils.js";

let categoryTree = null;
let currentStep = 0;
const totalSteps = 6;

const state = {
  username: "",
  faculty: null,
  year: null,
  term: null,
  quizStyle: "pagination",
  defaultMode: "practice",
  subscribedCourses: [], // Set of course IDs
};

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

async function init() {
  try {
    const manifest = await getManifest();
    categoryTree = manifest.categoryTree || {};
    setupEventListeners();
    renderStep();
  } catch (e) {
    console.error("Failed to load manifest", e);
    alert("Failed to load application data. Please refresh.");
  }
}

function setupEventListeners() {
  document.getElementById("nextBtn").addEventListener("click", nextStep);
  document.getElementById("prevBtn").addEventListener("click", prevStep);

  // Enter key navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // Prevent default if it's a form submission to avoid reload
      if (e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        nextStep();
      }
    }
  });

  // Filter listeners
  ["courseFacultyFilter", "courseYearFilter", "courseTermFilter"].forEach(
    (id) => {
      document.getElementById(id)?.addEventListener("change", (e) => {
        if (id === "courseYearFilter") updateTermOptionsBasedOnYear();
        renderFilteredCourses();
      });
    },
  );

  // Skip button
  document.getElementById("skipBtn")?.addEventListener("click", skipOnboarding);
}

function updateProgress() {
  const dots = document.querySelectorAll(".progress-step");
  dots.forEach((dot, idx) => {
    if (idx === currentStep) {
      dot.classList.add("active");
      dot.classList.remove("completed");
    } else if (idx < currentStep) {
      dot.classList.add("completed");
      dot.classList.remove("active");
    } else {
      dot.classList.remove("active", "completed");
    }
  });

  // Update buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";

  if (currentStep === totalSteps) {
    nextBtn.textContent = "ابدأ رحلتك 🚀";
  } else {
    nextBtn.textContent = "التالي";
  }
}

function validateStep() {
  switch (currentStep) {
    case 0: // Name
      const nameInput = document.getElementById("nameInput");
      state.username = nameInput.value.trim();
      return state.username.length > 0;
    case 1: // Faculty
      return !!state.faculty;
    case 2: // Year
      return !!state.year;
    case 3: // Term
      return !!state.term;
    case 4: // Preferences
      return true; // Defaults set
    case 5: // Courses
      return true; // Optional
    default:
      return true;
  }
}

async function nextStep() {
  if (!validateStep()) {
    alert("الرجاء إكمال البيانات المطلوبة");
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    renderStep();
  } else {
    // Finish
    await saveAndRedirect();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
  }
}

function renderStep() {
  // Hide all steps
  document
    .querySelectorAll(".step-panel")
    .forEach((el) => el.classList.remove("active"));

  // Show current step
  const currentPanel = document.getElementById(`step-${currentStep}`);
  if (currentPanel) currentPanel.classList.add("active");

  // Dynamic rendering for specific steps
  if (currentStep === 1) renderFacultyStep();
  if (currentStep === 2) renderYearStep();
  if (currentStep === 3) renderTermStep();
  if (currentStep === 5) renderCoursesStep();
  if (currentStep === 6) renderWelcomeStep();

  updateProgress();
}

// --- Renderers ---

function renderFacultyStep() {
  const container = document.getElementById("facultyGrid");
  // Remove early return to allow re-render on selection
  // if (container.children.length > 0) return;

  const metadata = extractMetadata(categoryTree);
  container.innerHTML = metadata.faculties
    .map(
      (f) => `
        <div class="selection-card ${state.faculty === f ? "selected" : ""}" onclick="selectFaculty('${f}')">
            <div class="card-icon">${facultyIcons[f] || facultyIcons.default}</div>
            <div class="card-label">${f}</div>
        </div>
    `,
    )
    .join("");
}

window.selectFaculty = (f) => {
  state.faculty = f;
  state.year = null; // Reset dependants
  state.term = null;
  renderFacultyStep(); // Re-render to show selection
  // Auto advance? Maybe better to let user click next
};

function renderYearStep() {
  const container = document.getElementById("yearGrid");
  container.innerHTML = "";

  const years = getAvailableYears(categoryTree, state.faculty);
  if (years.length === 0) {
    container.innerHTML =
      "<p>لا توجد سنوات دراسية متاحة لهذه الكلية حالياً.</p>";
    return;
  }

  container.innerHTML = years
    .map(
      (y) => `
        <div class="selection-card ${state.year === y ? "selected" : ""}" onclick="selectYear('${y}')">
            <div class="card-icon">📅</div>
            <div class="card-label">العام ${y}</div>
        </div>
    `,
    )
    .join("");
}

window.selectYear = (y) => {
  state.year = y;
  state.term = null;
  renderYearStep();
};

function renderTermStep() {
  const container = document.getElementById("termGrid");
  container.innerHTML = "";

  const terms = getAvailableTerms(categoryTree, state.faculty, state.year);
  if (terms.length === 0) {
    container.innerHTML = "<p>لا توجد فصول دراسية متاحة حالياً.</p>";
    return;
  }

  container.innerHTML = terms
    .map(
      (t) => `
        <div class="selection-card ${state.term === t ? "selected" : ""}" onclick="selectTerm('${t}')">
            <div class="card-icon">${t === "1" ? "🍂" : "🌸"}</div>
            <div class="card-label">الترم ${t}</div>
        </div>
    `,
    )
    .join("");
}

window.selectTerm = (t) => {
  state.term = t;
  renderTermStep();
};

window.updatePreference = (key, value) => {
  state[key] = value;
  document.querySelectorAll(`[name="${key}"]`).forEach((inp) => {
    const card = inp.closest(".selection-card");
    if (inp.value === value) card.classList.add("selected");
    else card.classList.remove("selected");
  });
};

function renderCoursesStep() {
  const container = document.getElementById("coursesList");
  container.innerHTML = "";

  autoSelectMatchingCourses();

  setupCourseFilters();

  renderFilteredCourses();
}

function updateTermOptionsBasedOnYear() {
  // Logic to update term dropdown based on selected year (and faculty)
  // to strictly show available terms.
  const fVal = document.getElementById("courseFacultyFilter").value;
  const yVal = document.getElementById("courseYearFilter").value;
  const tSelect = document.getElementById("courseTermFilter");

  // Reset if Year is 'All' or Faculty is 'All' -> maybe just show standard 1/2?
  // Or keep 'All'.
  // Ideally we query getAvailableTerms(categoryTree, fVal, yVal)

  // If 'All' is selected, we can't easily narrow down terms unless we list ALL terms from ALL years.
  // Let's simplified: If Year is designated, show terms for that year.

  let terms = [];
  if (fVal !== "All" && yVal !== "All") {
    terms = getAvailableTerms(categoryTree, fVal, yVal);
  } else {
    // Fallback or union? Let's just default to standard if uncertain
    terms = ["1", "2"];
  }

  // Preserve current selection if possible
  const currentTerm = tSelect.value;

  tSelect.innerHTML =
    '<option value="All">كل الفصول</option>' +
    terms.map((t) => `<option value="${t}">تيرم ${t}</option>`).join("");

  if (terms.includes(currentTerm)) {
    tSelect.value = currentTerm;
  } else {
    tSelect.value = "All";
  }
}

function setupCourseFilters() {
  const fSelect = document.getElementById("courseFacultyFilter");
  const ySelect = document.getElementById("courseYearFilter");
  const tSelect = document.getElementById("courseTermFilter");

  // Only populate if empty (first run)
  if (fSelect.options.length === 0) {
    const metadata = extractMetadata(categoryTree);

    // Faculty
    fSelect.innerHTML =
      '<option value="All">كل الكليات</option>' +
      metadata.faculties
        .map((f) => `<option value="${f}">${f}</option>`)
        .join("");

    // Year
    ySelect.innerHTML =
      '<option value="All">كل السنوات</option>' +
      metadata.years
        .map((y) => `<option value="${y}">سنة ${y}</option>`)
        .join("");

    // Term - Remove ghost 'Summmer'
    tSelect.innerHTML =
      '<option value="All">كل الفصول</option>' +
      ["1", "2"].map((t) => `<option value="${t}">تيرم ${t}</option>`).join("");

    // Set defaults to user selection
    if (state.faculty) fSelect.value = state.faculty;
    if (state.year) ySelect.value = state.year;
    // Trigger term update if we have enough info?
    // Actually simplicity first: just set value if exists in default list
    if (state.term && ["1", "2"].includes(state.term))
      tSelect.value = state.term;
  }
}

function renderFilteredCourses() {
  const container = document.getElementById("coursesList");

  const fVal = document.getElementById("courseFacultyFilter").value;
  const yVal = document.getElementById("courseYearFilter").value;
  const tVal = document.getElementById("courseTermFilter").value;

  // Create temp profile for filtering
  const filterProfile = {
    faculty: fVal === "All" ? null : fVal,
    year: yVal === "All" ? null : yVal,
    term: tVal === "All" ? null : tVal,
  };

  const courses = filterCourses(categoryTree, filterProfile);

  if (courses.length === 0) {
    container.innerHTML =
      "<p class='no-data-msg'>لا توجد مواد تطابق خيارات البحث.</p>";
    return;
  }

  container.innerHTML = courses
    .map((c) => {
      // Auto-select logic visual check (state is already updated via autoSelectMatchingCourses)
      // We rely on state.subscribedCourses which now contains the auto-selected ones.

      const isSubscribed = state.subscribedCourses.includes(c.id);

      return `
        <div class="course-item">
            <div class="course-info">
                <h4>${c.name}</h4>
                <p>${c.faculty} - Year ${c.year} - Term ${c.term}</p>
            </div>
            <label class="toggle-container">
                <input type="checkbox" onchange="toggleCourse('${c.id}', this.checked)" ${isSubscribed ? "checked" : ""}>
                <span class="toggle-switch"></span>
            </label>
        </div>
    `;
    })
    .join("");
}

const originalRenderCourses = renderCoursesStep; // Store reference if needed (not needed really as we replaced it)

let hasAutoSelected = false;

function autoSelectMatchingCourses() {
  if (hasAutoSelected) return;

  // Find all courses matching state
  const matches = filterCourses(categoryTree, {
    faculty: state.faculty,
    year: state.year,
    term: state.term,
  });

  matches.forEach((c) => {
    if (!state.subscribedCourses.includes(c.id)) {
      state.subscribedCourses.push(c.id);
    }
  });
  hasAutoSelected = true;
}

const _oldRenderStep = renderStep;

window.toggleCourse = (id, checked) => {
  if (checked) {
    if (!state.subscribedCourses.includes(id)) state.subscribedCourses.push(id);
  } else {
    state.subscribedCourses = state.subscribedCourses.filter(
      (cid) => cid !== id,
    );
  }
};

function renderWelcomeStep() {
  const msg = document.getElementById("welcomeMsg");
  msg.textContent = `أهلاً بك يا ${state.username}!`;
}

async function saveAndRedirect() {
  try {
    userProfile.setUsername(state.username);
    userProfile.updateAcademicInfo({
      faculty: state.faculty,
      year: state.year,
      term: state.term,
    });

    userProfile.setQuizStyle(state.quizStyle);
    userProfile.setDefaultQuizMode(state.defaultMode);

    // Save Subscriptions - Use the dedicated method to ensure sync
    // BUT userProfile.setSubscribedCourses might overwrite if persistence is complex.
    // Let's use setSubscribedCourses which replaces the array.
    userProfile.setSubscribedCourses(state.subscribedCourses);

    localStorage.setItem("first_visit_complete", "true");

    window.location.href = "index.html";
  } catch (e) {
    console.error("Error saving", e);
    alert("حدث خطأ أثناء الحفظ");
  }
}

async function skipOnboarding() {
  if (
    confirm(
      "هل أنت متأكد من تخطي الإعداد؟ يمكنك تعديل بياناتك لاحقاً من الإعدادات.",
    )
  ) {
    localStorage.setItem("first_visit_complete", "true");
    window.location.href = "index.html";
  }
}

// Start
init();
