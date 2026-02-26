// =============================================================================
// public/src/scripts/adminUpload.js
// Admin quiz upload workflow.
//
// Key fix from v1:
//   getToken() now reads from sessionStorage (via adminAuth.js), so the JWT
//   persists across the sign-in → index page navigation.
//   Every fetch() call includes:  Authorization: Bearer <token>
// =============================================================================

import { getToken, isAdminAuthenticated, signOut } from "./adminAuth.js";
import { showNotification } from "../components/notifications.js";

// ─── Inject styles once ───────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById("admin-upload-styles")) return;
  const style = document.createElement("style");
  style.id = "admin-upload-styles";
  style.textContent = `
    .admin-upload-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px);
      display: flex; justify-content: center; align-items: center;
      z-index: 2000; padding: 20px;
      animation: admFadeIn 0.2s ease;
    }
    @keyframes admFadeIn  { from { opacity:0 }          to { opacity:1 }                   }
    @keyframes admSlideUp { from { transform:translateY(28px); opacity:0 } to { transform:translateY(0); opacity:1 } }

    .admin-upload-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 18px;
      width: 100%; max-width: 520px; max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
      animation: admSlideUp 0.3s ease;
      scrollbar-width: thin;
    }
    .admin-upload-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 14px;
      border-bottom: 1px solid var(--color-border);
      position: sticky; top: 0;
      background: var(--color-surface); z-index: 1;
      border-radius: 18px 18px 0 0;
    }
    .admin-upload-header h2 {
      margin: 0; font-size: 1.1rem; font-weight: 700;
      color: var(--color-text-primary);
      display: flex; align-items: center; gap: 8px;
    }
    .admin-upload-close {
      width: 32px; height: 32px; border-radius: 50%;
      border: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      color: var(--color-text); font-size: 1.1rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .2s, background .2s;
    }
    .admin-upload-close:hover { transform: rotate(90deg); background: var(--color-error-light); color: var(--color-error); }

    /* Step indicators */
    .adm-steps {
      display: flex; align-items: center; justify-content: center;
      padding: 14px 24px 0;
    }
    .adm-step { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
    .adm-step-circle {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 700;
      background: var(--color-border); color: var(--color-text-tertiary);
      transition: all .25s ease; border: 2px solid transparent;
    }
    .adm-step.active .adm-step-circle { background: var(--color-primary); color: #fff; border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }
    .adm-step.done   .adm-step-circle { background: #22c55e; color: #fff; }
    .adm-step-label  { font-size: 0.68rem; font-weight: 600; color: var(--color-text-tertiary); }
    .adm-step.active .adm-step-label { color: var(--color-primary); }
    .adm-step-line   { flex: 1; height: 2px; background: var(--color-border); align-self: center; margin-bottom: 18px; transition: background .25s; }
    .adm-step-line.done { background: #22c55e; }

    /* Body */
    .admin-upload-body { padding: 18px 24px 24px; }

    /* Fields */
    .adm-field { margin-bottom: 14px; }
    .adm-field label { display: block; font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 5px; }
    .adm-field select,
    .adm-field input[type="text"] {
      width: 100%; padding: 10px 13px;
      border: 1.5px solid var(--color-border); border-radius: 10px;
      font-size: 0.93rem; background: var(--color-background);
      color: var(--color-text-primary); font-family: inherit;
      transition: border-color .2s; box-sizing: border-box;
    }
    .adm-field select:focus,
    .adm-field input[type="text"]:focus { border-color: var(--color-primary); outline: none; box-shadow: 0 0 0 3px var(--color-primary-light); }

    /* Preview */
    .adm-preview-box { background: var(--color-background-secondary); border: 1.5px solid var(--color-border); border-radius: 12px; padding: 14px; margin-bottom: 14px; }
    .adm-preview-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border); font-size: 0.88rem; }
    .adm-preview-row:last-child { border-bottom: none; }
    .adm-preview-label { color: var(--color-text-secondary); font-weight: 600; }
    .adm-preview-value { color: var(--color-text-primary); font-weight: 700; text-align: left; direction: ltr; max-width: 55%; word-break: break-all; }
    .adm-path-badge { background: var(--color-primary-light); color: var(--color-primary); padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; direction: ltr; word-break: break-all; display: block; margin-bottom: 14px; text-align: center; }

    /* Buttons */
    .adm-btn-row { display: flex; gap: 10px; margin-top: 18px; }
    .adm-btn { flex: 1; padding: 11px 16px; border: none; border-radius: 10px; font-size: 0.93rem; font-weight: 700; cursor: pointer; transition: transform .2s, box-shadow .2s; font-family: inherit; }
    .adm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .adm-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .adm-btn-primary { background: var(--gradient-accent); color: #fff; }
    .adm-btn-ghost { background: var(--color-background-secondary); border: 1.5px solid var(--color-border); color: var(--color-text); }

    /* Upload button on card */
    .upload-to-db-btn {
      padding: 7px 12px;
      background: linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);
      color: #fff; border: none; border-radius: 6px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
      transition: transform .2s, box-shadow .2s;
      display: flex; align-items: center; gap: 5px;
      white-space: nowrap;
    }
    .upload-to-db-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124,58,237,.35); }
    .upload-to-db-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* Spinner */
    .adm-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: admSpin .7s linear infinite; margin-left: 6px; }
    @keyframes admSpin { to { transform: rotate(360deg); } }

    /* Success */
    .adm-success { text-align: center; padding: 20px 0 8px; }
    .adm-success-icon { font-size: 3.2rem; margin-bottom: 10px; }
    .adm-success h3 { font-size: 1.15rem; color: var(--color-text-primary); margin: 0 0 6px; }
    .adm-success p  { color: var(--color-text-secondary); font-size: 0.88rem; margin: 4px 0; }
    .adm-success code { background: var(--color-background-secondary); padding: 2px 7px; border-radius: 4px; font-size: 0.8rem; }
  `;
  document.head.appendChild(style);
}

// ─── State ────────────────────────────────────────────────────────────────────
let _paths = null; // cached from /api/list-paths
let _quiz = null; // quiz being uploaded
let _overlay = null; // modal root element

// ─── API calls (token ALWAYS attached) ───────────────────────────────────────

/**
 * Returns the Authorization header object.
 * Throws if the user is not authenticated.
 */
function authHeaders() {
  const token = getToken();
  if (!token) {
    // Token missing — force a sign-out and tell the user
    signOut();
    throw new Error("انتهت الجلسة. يرجى تسجيل الدخول مجددًا.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function fetchPaths() {
  if (_paths) return _paths;
  const res = await fetch("/api/list-paths", { headers: authHeaders() });
  let body = {};
  try {
    body = await res.json();
  } catch (_) {}
  if (!res.ok) throw new Error(body.error || "فشل تحميل المسارات");
  _paths = body.paths;
  return _paths;
}

async function postUpload({ category, subject, subfolder }) {
  const res = await fetch("/api/upload-quiz", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      category,
      subject,
      subfolder: subfolder || undefined,
      quiz: _quiz,
    }),
  });
  let body = {};
  try {
    body = await res.json();
  } catch (_) {}
  if (!res.ok) throw new Error(body.error || "فشل الرفع");
  return body;
}

// ─── Modal helpers ─────────────────────────────────────────────────────────────
function makeOverlay() {
  const el = document.createElement("div");
  el.className = "admin-upload-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.addEventListener("click", (e) => {
    if (e.target === el) closeModal();
  });
  return el;
}

function stepsHTML(current) {
  const labels = ["المسار", "مراجعة", "تأكيد"];
  return `<div class="adm-steps">${labels
    .map((l, i) => {
      const n = i + 1,
        cls = n < current ? "done" : n === current ? "active" : "";
      return `${i > 0 ? `<div class="adm-step-line ${n <= current ? "done" : ""}"></div>` : ""}
      <div class="adm-step ${cls}">
        <div class="adm-step-circle">${n < current ? "✓" : n}</div>
        <span class="adm-step-label">${l}</span>
      </div>`;
    })
    .join("")}</div>`;
}

function header(title) {
  return `<div class="admin-upload-header">
    <h2>☁️ ${title}</h2>
    <button class="admin-upload-close" onclick="window.__closeAdminUpload()">✕</button>
  </div>`;
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
async function renderStep1() {
  _overlay.innerHTML = `<div class="admin-upload-card">
    ${header("رفع إلى قاعدة البيانات")}
    ${stepsHTML(1)}
    <div class="admin-upload-body">
      <p style="font-size:.88rem;color:var(--color-text-secondary);text-align:center;margin:0 0 18px;">
        اختر المسار الذي سيُحفظ فيه الاختبار
      </p>
      <div id="adm-paths-loading" style="text-align:center;padding:30px;color:var(--color-text-secondary);">⏳ جارٍ التحميل...</div>
      <div id="adm-paths-form"  style="display:none;"></div>
      <div id="adm-paths-error" style="display:none;color:var(--color-error);text-align:center;padding:16px;"></div>
      <div id="adm-step1-btns" style="display:none;" class="adm-btn-row">
        <button class="adm-btn adm-btn-ghost" onclick="window.__closeAdminUpload()">إلغاء</button>
        <button class="adm-btn adm-btn-primary" id="adm-next1">التالي ←</button>
      </div>
    </div>
  </div>`;

  window.__closeAdminUpload = closeModal;

  try {
    const paths = await fetchPaths();
    buildPathForm(paths);
  } catch (err) {
    document.getElementById("adm-paths-loading").style.display = "none";
    const el = document.getElementById("adm-paths-error");
    el.textContent = err.message || "تعذّر تحميل المسارات";
    el.style.display = "block";
    document.getElementById("adm-step1-btns").style.display = "flex";
  }
}

function buildPathForm(paths) {
  document.getElementById("adm-paths-loading").style.display = "none";
  const form = document.getElementById("adm-paths-form");
  form.style.display = "block";
  document.getElementById("adm-step1-btns").style.display = "flex";

  form.innerHTML = `
    <div class="adm-field">
      <label for="adm-cat">القسم / الكلية *</label>
      <select id="adm-cat"><option value="">— اختر أو أنشئ جديداً —</option></select>
    </div>
    <div class="adm-field" id="adm-new-cat-wrap" style="display:none;">
      <label for="adm-new-cat">اسم القسم الجديد</label>
      <input type="text" id="adm-new-cat" placeholder="مثال: Computer Science" maxlength="100" />
    </div>
    <div class="adm-field">
      <label for="adm-sub">المادة *</label>
      <select id="adm-sub"><option value="">— اختر أو أنشئ جديداً —</option></select>
    </div>
    <div class="adm-field" id="adm-new-sub-wrap" style="display:none;">
      <label for="adm-new-sub">اسم المادة الجديدة</label>
      <input type="text" id="adm-new-sub" placeholder="مثال: Artificial Intelligence" maxlength="100" />
    </div>
    <div class="adm-field">
      <label for="adm-folder">مجلد فرعي (اختياري)</label>
      <input type="text" id="adm-folder" placeholder="مثال: أسئلة الدكتورة" maxlength="100" />
    </div>`;

  const catSel = document.getElementById("adm-cat");
  const subSel = document.getElementById("adm-sub");

  // Populate categories
  Object.keys(paths)
    .sort((a, b) => a.localeCompare(b, "ar"))
    .forEach((c) => {
      catSel.appendChild(
        Object.assign(document.createElement("option"), {
          value: c,
          textContent: c,
        }),
      );
    });
  catSel.appendChild(
    Object.assign(document.createElement("option"), {
      value: "__new__",
      textContent: "➕ إنشاء قسم جديد",
    }),
  );

  catSel.addEventListener("change", () => {
    const v = catSel.value;
    document.getElementById("adm-new-cat-wrap").style.display =
      v === "__new__" ? "block" : "none";
    // Reset subjects
    subSel.innerHTML = '<option value="">— اختر أو أنشئ جديداً —</option>';
    document.getElementById("adm-new-sub-wrap").style.display = "none";
    if (v && v !== "__new__" && paths[v]) {
      Object.keys(paths[v])
        .sort((a, b) => a.localeCompare(b, "ar"))
        .forEach((s) => {
          subSel.appendChild(
            Object.assign(document.createElement("option"), {
              value: s,
              textContent: s,
            }),
          );
        });
    }
    subSel.appendChild(
      Object.assign(document.createElement("option"), {
        value: "__new__",
        textContent: "➕ إنشاء مادة جديدة",
      }),
    );
  });

  subSel.addEventListener("change", () => {
    document.getElementById("adm-new-sub-wrap").style.display =
      subSel.value === "__new__" ? "block" : "none";
  });

  document.getElementById("adm-next1").addEventListener("click", step1Next);
}

function getStep1Values() {
  const catSel = document.getElementById("adm-cat");
  const subSel = document.getElementById("adm-sub");
  const category =
    catSel?.value === "__new__"
      ? document.getElementById("adm-new-cat")?.value.trim()
      : catSel?.value;
  const subject =
    subSel?.value === "__new__"
      ? document.getElementById("adm-new-sub")?.value.trim()
      : subSel?.value;
  const subfolder = document.getElementById("adm-folder")?.value.trim() || "";
  return { category, subject, subfolder };
}

function step1Next() {
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
  const fullPath = [category, subject, subfolder].filter(Boolean).join("/");

  _overlay.innerHTML = `<div class="admin-upload-card">
    ${header("مراجعة الرفع")}
    ${stepsHTML(2)}
    <div class="admin-upload-body">
      <p style="font-size:.88rem;color:var(--color-text-secondary);text-align:center;margin:0 0 14px;">
        تحقق من التفاصيل قبل الرفع
      </p>
      <span class="adm-path-badge">📁 ${fullPath}</span>
      <div class="adm-preview-box">
        <div class="adm-preview-row"><span class="adm-preview-label">العنوان</span><span class="adm-preview-value">${_quiz.title}</span></div>
        <div class="adm-preview-row"><span class="adm-preview-label">عدد الأسئلة</span><span class="adm-preview-value">${_quiz.questions?.length ?? 0} سؤال</span></div>
        <div class="adm-preview-row"><span class="adm-preview-label">القسم</span><span class="adm-preview-value">${category}</span></div>
        <div class="adm-preview-row"><span class="adm-preview-label">المادة</span><span class="adm-preview-value">${subject}</span></div>
        ${subfolder ? `<div class="adm-preview-row"><span class="adm-preview-label">مجلد فرعي</span><span class="adm-preview-value">${subfolder}</span></div>` : ""}
      </div>
      <div class="adm-btn-row">
        <button class="adm-btn adm-btn-ghost" id="adm-back2">← رجوع</button>
        <button class="adm-btn adm-btn-primary" id="adm-confirm2">رفع الاختبار ☁️</button>
      </div>
    </div>
  </div>`;

  window.__closeAdminUpload = closeModal;
  document.getElementById("adm-back2").addEventListener("click", renderStep1);
  document.getElementById("adm-confirm2").addEventListener("click", () => {
    doUpload({ category, subject, subfolder });
  });
}

// ─── Step 3: Upload ───────────────────────────────────────────────────────────
async function doUpload({ category, subject, subfolder }) {
  const btn = document.getElementById("adm-confirm2");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `جارٍ الرفع<span class="adm-spinner"></span>`;
  }

  try {
    await postUpload({ category, subject, subfolder });
    _paths = null; // invalidate cache

    const fullPath = [category, subject, subfolder].filter(Boolean).join("/");
    _overlay.querySelector(".admin-upload-card").innerHTML = `
      <div class="admin-upload-header" style="border-bottom:none;">
        <h2>☁️ رفع إلى قاعدة البيانات</h2>
        <button class="admin-upload-close" onclick="window.__closeAdminUpload()">✕</button>
      </div>
      <div class="admin-upload-body">
        <div class="adm-success">
          <div class="adm-success-icon">✅</div>
          <h3>تم الرفع بنجاح!</h3>
          <p>تم حفظ الاختبار في:</p>
          <span class="adm-path-badge">📁 ${fullPath}</span>
          <p style="margin-top:14px;font-size:.8rem;color:var(--color-text-tertiary);">
            لدمجه في الكود، شغّل:<br/>
            <code>npm run sync:quizzes</code>
          </p>
        </div>
        <div class="adm-btn-row">
          <button class="adm-btn adm-btn-primary" onclick="window.__closeAdminUpload()">إغلاق</button>
        </div>
      </div>`;

    window.__closeAdminUpload = closeModal;
    showNotification("تم رفع الاختبار بنجاح ✅", "success");
  } catch (err) {
    // Check if it's an auth error — if so, sign out and redirect
    if (err.message?.includes("جلسة") || err.message?.includes("صرح")) {
      showNotification(err.message, "error");
      setTimeout(() => {
        signOut();
        window.location.href = "sign-in.html";
      }, 2000);
      return;
    }
    showNotification(err.message || "فشل الرفع", "error");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "رفع الاختبار ☁️";
    }
  }
}

// ─── Modal lifecycle ──────────────────────────────────────────────────────────
function openModal(quiz) {
  if (!isAdminAuthenticated()) {
    showNotification("يجب تسجيل الدخول كمشرف أولاً", "error");
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 1500);
    return;
  }
  injectStyles();
  _quiz = quiz;
  _paths = null; // always refresh

  _overlay = makeOverlay();
  document.body.appendChild(_overlay);
  document.body.style.overflow = "hidden";
  renderStep1();
}

function closeModal() {
  if (_overlay) {
    _overlay.remove();
    _overlay = null;
  }
  document.body.style.overflow = "";
  _quiz = null;
}

// ─── Public exports ───────────────────────────────────────────────────────────

/**
 * Creates the purple "رفع للسحابة" button to append inside a quiz card.
 * @param {object} quiz
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
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
    رفع للسحابة`;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(quiz);
  });
  return btn;
}

export { openModal as openUploadModal };
