import { signIn } from "./adminAuth.js";

const form = document.getElementById("signinForm");
const input = document.getElementById("adminIdInput");
const submitBtn = document.getElementById("submitBtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const errorMsg = document.getElementById("errorMsg");
const toggleBtn = document.getElementById("toggleBtn");
const eyeIcon = document.getElementById("eyeIcon");
const eyeOffIcon = document.getElementById("eyeOffIcon");

// ── Show/hide password toggle ────────────────────────────────────────────
toggleBtn.addEventListener("click", () => {
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  eyeIcon.style.display = showing ? "" : "none";
  eyeOffIcon.style.display = showing ? "none" : "";
  input.focus();
});

// ── Form submit ──────────────────────────────────────────────────────────
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
    // Redirect to main page — the token is now in memory
    window.location.href = "index.html";
  } catch (err) {
    showError(err.message || "فشل تسجيل الدخول. تحقق من الرمز وحاول مجددًا.");
    input.select();
  } finally {
    setLoading(false);
  }
});

function setLoading(on) {
  submitBtn.disabled = on;
  spinner.style.display = on ? "block" : "none";
  btnText.textContent = on ? "جارٍ التحقق..." : "تسجيل الدخول";
}

function showError(msg) {
  errorMsg.textContent = "⚠️ " + msg;
  errorMsg.style.display = "flex";
  // Re-trigger animation
  errorMsg.style.animation = "none";
  requestAnimationFrame(() => {
    errorMsg.style.animation = "";
  });
}

function clearError() {
  errorMsg.textContent = "";
  errorMsg.style.display = "none";
}
