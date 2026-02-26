// =============================================================================
// public/src/scripts/adminUpload.js
// Admin quiz upload workflow.
//
// - Injects the "Upload to DB" button into user quiz cards
// - Manages the 3-step upload modal (path selection → preview → confirm)
// - All API calls include the Authorization header with the in-memory JWT
// =============================================================================

import { getToken, isAdminAuthenticated } from "./adminAuth.js";
import { showNotification } from "../components/notifications.js";

// ─── Modal Styles (injected once) ────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById("admin-upload-styles")) return;
  const style = document.createElement("style");
  style.id = "admin-upload-styles";
  style.textContent = `
    /* ── Upload modal overlay ── */
    .admin-upload-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      padding: 20px;
      animation: adminFadeIn 0.2s ease;
    }
    @keyframes adminFadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes adminSlideUp { from { transform:translateY(30px); opacity:0 } to { transform:translateY(0); opacity:1 } }

    .admin-upload-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 18px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
      animation: adminSlideUp 0.3s ease;
      scrollbar-width: thin;
    }

    .admin-upload-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 24px 16px;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      background: var(--color-surface);
      z-index: 1;
      border-radius: 18px 18px 0 0;
    }
    .admin-upload-header h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .admin-upload-close {
      width: 34px; height: 34px;
      border-radius: 50%;
      border: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      color: var(--color-text);
      font-size: 1.2rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, background 0.2s;
    }
    .admin-upload-close:hover { transform: rotate(90deg); background: var(--color-error-light); color: var(--color-error); }

    /* Steps indicator */
    .admin-upload-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 16px 24px 0;
    }
    .admin-step {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      flex: 1;
    }
    .admin-step-circle {
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700;
      background: var(--color-border);
      color: var(--color-text-tertiary);
      transition: all 0.25s ease;
      border: 2px solid transparent;
    }
    .admin-step.active .admin-step-circle {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }
    .admin-step.done .admin-step-circle {
      background: var(--color-success, #22c55e);
      color: white;
    }
    .admin-step-label {
      font-size: 0.7rem; font-weight: 600;
      color: var(--color-text-tertiary);
      text-align: center;
    }
    .admin-step.active .admin-step-label { color: var(--color-primary); }
    .admin-step-line {
      flex: 1; height: 2px;
      background: var(--color-border);
      align-self: center;
      margin-bottom: 20px;
      transition: background 0.25s;
    }
    .admin-step-line.done { background: var(--color-success, #22c55e); }

    /* Body */
    .admin-upload-body { padding: 20px 24px 24px; }

    /* Form fields */
    .admin-field { margin-bottom: 16px; }
    .admin-field label {
      display: block;
      font-size: 0.85rem; font-weight: 700;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
    }
    .admin-field select,
    .admin-field input[type="text"] {
      width: 100%; padding: 10px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: 10px;
      font-size: 0.95rem;
      background: var(--color-background);
      color: var(--color-text-primary);
      transition: border-color 0.2s;
      font-family: inherit;
      box-sizing: border-box;
    }
    .admin-field select:focus,
    .admin-field input[type="text"]:focus {
      border-color: var(--color-primary);
      outline: none;
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    /* Preview box */
    .admin-preview-box {
      background: var(--color-background-secondary);
      border: 1.5px solid var(--color-border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .admin-preview-row {
      display: flex; justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid var(--color-border);
      font-size: 0.9rem;
    }
    .admin-preview-row:last-child { border-bottom: none; }
    .admin-preview-label { color: var(--color-text-secondary); font-weight: 600; }
    .admin-preview-value { color: var(--color-text-primary); font-weight: 700; text-align: left; direction: ltr; max-width: 55%; word-break: break-all; }

    /* Path badge */
    .admin-path-badge {
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      direction: ltr;
      word-break: break-all;
      display: block;
      margin-bottom: 16px;
      text-align: center;
    }

    /* Buttons */
    .admin-btn-row {
      display: flex; gap: 10px; margin-top: 20px;
    }
    .admin-btn {
      flex: 1; padding: 12px 16px;
      border: none; border-radius: 10px;
      font-size: 0.95rem; font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    .admin-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .admin-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .admin-btn-primary { background: var(--gradient-accent); color: white; }
    .admin-btn-ghost {
      background: var(--color-background-secondary);
      border: 1.5px solid var(--color-border);
      color: var(--color-text);
    }

    /* Upload button on quiz card */
    .upload-to-db-btn {
      padding: 8px 14px;
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
      white-space: nowrap;
      display: flex; align-items: center; gap: 6px;
    }
    .upload-to-db-btn:hover { transform: translateY(-2px); }
    .upload-to-db-btn svg { width: 15px; height: 15px; }

    /* Loading spinner */
    .admin-spinner {
      display: inline-block;
      width: 18px; height: 18px;
      border: 2.5px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-left: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Success state */
    .admin-success {
      text-align: center;
      padding: 24px 0 8px;
    }
    .admin-success-icon { font-size: 3.5rem; margin-bottom: 12px; }
    .admin-success h3 { font-size: 1.2rem; color: var(--color-text-primary); margin: 0 0 8px; }
    .admin-success p { color: var(--color-text-secondary); font-size: 0.9rem; }
  `;
  document.head.appendChild(style);
}

// ─── State ────────────────────────────────────────────────────────────────────

let existingPaths = null; // cached from API
let currentQuiz = null;   // quiz being uploaded
let overlay = null;        // modal DOM element
let currentStep = 1;

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchExistingPaths() {
  if (existingPaths) return existingPaths;
  const res = await fetch("/api/list-paths", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("فشل تحميل المسارات");
  const { paths } = await res.json();
  existingPaths = paths;
  return existingPaths;
}

async function doUpload({ category, subject, subfolder }) {
  const res = await fetch("/api/upload-quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ category, subject, subfolder: subfolder || undefined, quiz: currentQuiz }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "فشل الرفع");
  return body;
}

// ─── Modal Builder ────────────────────────────────────────────────────────────

function buildOverlay() {
  const el = document.createElement("div");
  el.className = "admin-upload-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "رفع اختبار إلى قاعدة البيانات");
  el.addEventListener("click", (e) => { if (e.target === el) closeModal(); });
  return el;
}

function renderSteps(step) {
  const steps = [
    { label: "المسار" },
    { label: "مراجعة" },
    { label: "تأكيد" },
  ];
  return `
    <div class="admin-upload-steps" role="list">
      ${steps.map((s, i) => {
        const n = i + 1;
        const cls = n < step ? "done" : n === step ? "active" : "";
        const icon = n < step ? "✓" : n;
        return `
          ${i > 0 ? `<div class="admin-step-line ${n <= step ? "done" : ""}"></div>` : ""}
          <div class="admin-step ${cls}" role="listitem">
            <div class="admin-step-circle">${icon}</div>
            <span class="admin-step-label">${s.label}</span>
          </div>`;
      }).join("")}
    </div>`;
}

// ─── Step 1: Path Selection ───────────────────────────────────────────────────

async function renderStep1() {
  currentStep = 1;
  overlay.innerHTML = `
    <div class="admin-upload-card">
      <div class="admin-upload-header">
        <h2>☁️ رفع إلى قاعدة البيانات</h2>
        <button class="admin-upload-close" aria-label="إغلاق" onclick="window.__closeAdminUpload()">✕</button>
      </div>
      ${renderSteps(1)}
      <div class="admin-upload-body">
        <p style="font-size:0.9rem; color:var(--color-text-secondary); margin:0 0 20px; text-align:center;">
          اختر المسار الذي سيُحفظ فيه الاختبار في قاعدة البيانات
        </p>
        <div id="paths-loading" style="text-align:center; padding:30px; color:var(--color-text-secondary);">
          ⏳ جارٍ تحميل المسارات...
        </div>
        <div id="paths-form" style="display:none;">
          <div class="admin-field">
            <label for="upload-category">القسم / الكلية *</label>
            <select id="upload-category">
              <option value="">— اختر أو اكتب جديداً —</option>
            </select>
          </div>
          <div id="new-category-field" class="admin-field" style="display:none;">
            <label for="upload-new-category">اسم القسم الجديد</label>
            <input type="text" id="upload-new-category" placeholder="مثال: Computer Science" maxlength="100" />
          </div>

          <div class="admin-field">
            <label for="upload-subject">المادة *</label>
            <select id="upload-subject">
              <option value="">— اختر أو اكتب جديداً —</option>
            </select>
          </div>
          <div id="new-subject-field" class="admin-field" style="display:none;">
            <label for="upload-new-subject">اسم المادة الجديدة</label>
            <input type="text" id="upload-new-subject" placeholder="مثال: Artificial Intelligence" maxlength="100" />
          </div>

          <div class="admin-field">
            <label for="upload-subfolder">مجلد فرعي (اختياري)</label>
            <input type="text" id="upload-subfolder" placeholder="مثال: أسئلة الدكتورة" maxlength="100" />
          </div>
        </div>
        <div id="paths-error" style="display:none; color:var(--color-error); text-align:center; padding:20px;"></div>
        <div class="admin-btn-row" id="step1-btns" style="display:none;">
          <button class="admin-btn admin-btn-ghost" onclick="window.__closeAdminUpload()">إلغاء</button>
          <button class="admin-btn admin-btn-primary" id="step1-next">التالي ←</button>
        </div>
      </div>
    </div>`;

  window.__closeAdminUpload = closeModal;

  // Load paths
  try {
    const paths = await fetchExistingPaths();
    renderPathForm(paths);
  } catch {
    document.getElementById("paths-loading").style.display = "none";
    const errEl = document.getElementById("paths-error");
    errEl.textContent = "تعذّر تحميل المسارات. تحقق من الاتصال.";
    errEl.style.display = "block";
    document.getElementById("step1-btns").style.display = "flex";
  }
}

function renderPathForm(paths) {
  document.getElementById("paths-loading").style.display = "none";
  document.getElementById("paths-form").style.display = "block";
  document.getElementById("step1-btns").style.display = "flex";

  const catSelect = document.getElementById("upload-category");
  const subSelect = document.getElementById("upload-subject");

  // Populate categories
  Object.keys(paths).sort().forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });
  // Add "create new" option
  const newCatOpt = document.createElement("option");
  newCatOpt.value = "__new__";
  newCatOpt.textContent = "➕ إنشاء قسم جديد";
  catSelect.appendChild(newCatOpt);

  catSelect.addEventListener("change", () => {
    const val = catSelect.value;
    const newCatField = document.getElementById("new-category-field");
    const newSubField = document.getElementById("new-subject-field");
    newCatField.style.display = val === "__new__" ? "block" : "none";

    // Reset subject dropdown
    subSelect.innerHTML = '<option value="">— اختر أو اكتب جديداً —</option>';
    newSubField.style.display = "none";

    if (val && val !== "__new__" && paths[val]) {
      Object.keys(paths[val]).sort().forEach((sub) => {
        const opt = document.createElement("option");
        opt.value = sub;
        opt.textContent = sub;
        subSelect.appendChild(opt);
      });
    }
    // Add "create new subject" option
    const newSubOpt = document.createElement("option");
    newSubOpt.value = "__new__";
    newSubOpt.textContent = "➕ إنشاء مادة جديدة";
    subSelect.appendChild(newSubOpt);
  });

  subSelect.addEventListener("change", () => {
    document.getElementById("new-subject-field").style.display =
      subSelect.value === "__new__" ? "block" : "none";
  });

  document.getElementById("step1-next").addEventListener("click", () => {
    proceedToStep2(paths);
  });
}

function getStep1Values() {
  const catSelect = document.getElementById("upload-category");
  const subSelect = document.getElementById("upload-subject");

  let category = catSelect.value === "__new__"
    ? document.getElementById("upload-new-category").value.trim()
    : catSelect.value;

  let subject = subSelect.value === "__new__"
    ? document.getElementById("upload-new-subject").value.trim()
    : subSelect.value;

  const subfolder = document.getElementById("upload-subfolder").value.trim();

  return { category, subject, subfolder };
}

function proceedToStep2() {
  const { category, subject, subfolder } = getStep1Values();
  if (!category) {
    showNotification("الرجاء اختيار أو إدخال القسم", "error");
    return;
  }
  if (!subject) {
    showNotification("الرجاء اختيار أو إدخال المادة", "error");
    return;
  }
  renderStep2({ category, subject, subfolder });
}

// ─── Step 2: Preview ──────────────────────────────────────────────────────────

function renderStep2({ category, subject, subfolder }) {
  currentStep = 2;
  const pathStr = [category, subject, subfolder].filter(Boolean).join(" / ");
  const fullPath = [category, subject, subfolder].filter(Boolean).join("/");

  overlay.innerHTML = `
    <div class="admin-upload-card">
      <div class="admin-upload-header">
        <h2>☁️ مراجعة الرفع</h2>
        <button class="admin-upload-close" aria-label="إغلاق" onclick="window.__closeAdminUpload()">✕</button>
      </div>
      ${renderSteps(2)}
      <div class="admin-upload-body">
        <p style="font-size:0.9rem; color:var(--color-text-secondary); margin:0 0 16px; text-align:center;">
          تحقق من التفاصيل قبل الرفع
        </p>

        <span class="admin-path-badge">📁 ${fullPath}</span>

        <div class="admin-preview-box">
          <div class="admin-preview-row">
            <span class="admin-preview-label">العنوان</span>
            <span class="admin-preview-value">${currentQuiz.title}</span>
          </div>
          <div class="admin-preview-row">
            <span class="admin-preview-label">عدد الأسئلة</span>
            <span class="admin-preview-value">${currentQuiz.questions?.length ?? 0} سؤال</span>
          </div>
          <div class="admin-preview-row">
            <span class="admin-preview-label">القسم</span>
            <span class="admin-preview-value">${category}</span>
          </div>
          <div class="admin-preview-row">
            <span class="admin-preview-label">المادة</span>
            <span class="admin-preview-value">${subject}</span>
          </div>
          ${subfolder ? `
          <div class="admin-preview-row">
            <span class="admin-preview-label">المجلد الفرعي</span>
            <span class="admin-preview-value">${subfolder}</span>
          </div>` : ""}
        </div>

        <div class="admin-btn-row">
          <button class="admin-btn admin-btn-ghost" id="step2-back">← رجوع</button>
          <button class="admin-btn admin-btn-primary" id="step2-upload">
            رفع الاختبار ☁️
          </button>
        </div>
      </div>
    </div>`;

  window.__closeAdminUpload = closeModal;

  document.getElementById("step2-back").addEventListener("click", renderStep1);
  document.getElementById("step2-upload").addEventListener("click", () => {
    confirmUpload({ category, subject, subfolder });
  });
}

// ─── Step 3: Upload & Result ──────────────────────────────────────────────────

async function confirmUpload({ category, subject, subfolder }) {
  currentStep = 3;
  const btn = document.getElementById("step2-upload");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `جارٍ الرفع<span class="admin-spinner"></span>`;
  }

  try {
    const result = await doUpload({ category, subject, subfolder });

    // Invalidate cached paths so next upload gets fresh data
    existingPaths = null;

    const fullPath = [category, subject, subfolder].filter(Boolean).join("/");
    overlay.querySelector(".admin-upload-card").innerHTML = `
      <div class="admin-upload-header" style="border-bottom:none;">
        <h2>☁️ رفع إلى قاعدة البيانات</h2>
        <button class="admin-upload-close" aria-label="إغلاق" onclick="window.__closeAdminUpload()">✕</button>
      </div>
      <div class="admin-upload-body">
        <div class="admin-success">
          <div class="admin-success-icon">✅</div>
          <h3>تم الرفع بنجاح!</h3>
          <p>تم حفظ الاختبار في:</p>
          <span class="admin-path-badge">📁 ${fullPath}</span>
          <p style="font-size:0.8rem; color:var(--color-text-tertiary); margin-top:16px;">
            يمكنك الآن تشغيل سكريبت المزامنة لدمجه في الكود<br/>
            <code style="background:var(--color-background-secondary);padding:2px 8px;border-radius:4px;">npm run sync:quizzes</code>
          </p>
        </div>
        <div class="admin-btn-row">
          <button class="admin-btn admin-btn-primary" onclick="window.__closeAdminUpload()">إغلاق</button>
        </div>
      </div>`;

    window.__closeAdminUpload = closeModal;
    showNotification("تم رفع الاختبار بنجاح ✅", "success");
  } catch (err) {
    showNotification(err.message || "فشل الرفع", "error");
    // Restore the upload button so they can retry
    const btn2 = document.getElementById("step2-upload");
    if (btn2) {
      btn2.disabled = false;
      btn2.innerHTML = "رفع الاختبار ☁️";
    }
  }
}

// ─── Modal lifecycle ──────────────────────────────────────────────────────────

function openModal(quiz) {
  if (!isAdminAuthenticated()) {
    showNotification("يجب تسجيل الدخول كمشرف أولاً", "error");
    return;
  }
  injectStyles();
  currentQuiz = quiz;
  existingPaths = null; // always refresh on new open

  overlay = buildOverlay();
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  renderStep1();
}

function closeModal() {
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  document.body.style.overflow = "";
  currentQuiz = null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates the "Upload to DB" button for a user quiz card.
 * Returns a <button> element — caller appends it wherever they need.
 *
 * @param {object} quiz - The user quiz object from localStorage
 * @returns {HTMLButtonElement}
 */
export function createUploadButton(quiz) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "upload-to-db-btn";
  btn.setAttribute("aria-label", `رفع "${quiz.title}" إلى قاعدة البيانات`);
  btn.title = "رفع إلى قاعدة البيانات";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 16 12 12 8 16"></polyline>
      <line x1="12" y1="12" x2="12" y2="21"></line>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    </svg>
    رفع للسحابة
  `;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(quiz);
  });
  return btn;
}

/**
 * Re-exports openModal for cases where you already have a quiz object.
 */
export { openModal as openUploadModal };
