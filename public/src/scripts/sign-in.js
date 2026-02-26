// =============================================================================
// public/src/scripts/sign-in.js
// Sign-in page logic.
//
// On load:
//   1. If a token already exists in sessionStorage AND it's not expired,
//      redirect straight to index.html (no need to sign in again).
//   2. Otherwise render the sign-in form normally.
//
// On submit:
//   Call signIn() → store JWT in sessionStorage → redirect to index.html.
// =============================================================================

import { signIn, isAdminAuthenticated, getToken } from "./adminAuth.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const form = document.getElementById("signinForm");
const input = document.getElementById("adminIdInput");
const submitBtn = document.getElementById("submitBtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const errorMsg = document.getElementById("errorMsg");
const toggleBtn = document.getElementById("toggleBtn");
const eyeIcon = document.getElementById("eyeIcon");
const eyeOffIcon = document.getElementById("eyeOffIcon");

// ── Helper: decode JWT expiry without a library ───────────────────────────────
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds; add a 30-second buffer for clock skew
    return Date.now() / 1000 > payload.exp - 30;
  } catch (_) {
    return true; // treat malformed tokens as expired
  }
}

// ── On page load: check for existing valid session ────────────────────────────
(function checkExistingSession() {
  if (!isAdminAuthenticated()) return; // no token at all

  const token = getToken();
  if (token && !isTokenExpired(token)) {
    // Already authenticated and token is still valid — go straight to the app
    redirectToApp();
    return;
  }

  // Token is expired — clear it and let the user sign in again
  import("./adminAuth.js").then(({ signOut }) => signOut());
})();

// ── Show/hide password ────────────────────────────────────────────────────────
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    eyeIcon.style.display = showing ? "" : "none";
    eyeOffIcon.style.display = showing ? "none" : "";
    input.focus();
  });
}

// ── Form submit ───────────────────────────────────────────────────────────────
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminId = input.value.trim();
    if (!adminId) {
      showError("الرجاء إدخال رمز الدخول");
      input.focus();
      return;
    }

    setLoading(true);
    clearError();

    try {
      await signIn(adminId);
      redirectToApp();
    } catch (err) {
      showError(err.message || "فشل تسجيل الدخول. تحقق من الرمز وحاول مجددًا.");
      input.select();
    } finally {
      setLoading(false);
    }
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function redirectToApp() {
  window.location.href = "index.html";
}

function setLoading(on) {
  if (!submitBtn) return;
  submitBtn.disabled = on;
  if (spinner) spinner.style.display = on ? "block" : "none";
  if (btnText) btnText.textContent = on ? "جارٍ التحقق..." : "تسجيل الدخول";
}

function showError(msg) {
  if (!errorMsg) return;
  errorMsg.textContent = "⚠️ " + msg;
  errorMsg.style.display = "flex";
  // Re-trigger shake animation
  errorMsg.style.animation = "none";
  requestAnimationFrame(() => {
    errorMsg.style.animation = "";
  });
}

function clearError() {
  if (!errorMsg) return;
  errorMsg.textContent = "";
  errorMsg.style.display = "none";
}
