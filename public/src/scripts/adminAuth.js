// =============================================================================
// public/src/scripts/adminAuth.js
// Admin authentication module.
//
// Keeps the JWT in a module-scoped variable (JavaScript memory only).
// The token NEVER touches localStorage, sessionStorage, or cookies.
// It evaporates automatically when the tab is closed or refreshed.
//
// sessionStorage.__admin_hint is set ONLY as a cosmetic UI hint to show
// the upload button — it is NOT trusted for any security decision.
// The real auth check always happens server-side.
// =============================================================================

/** @type {string|null} */
let _adminToken = null;

/**
 * Attempts to sign in with the given Admin ID.
 * On success, stores the JWT in module memory and sets a cosmetic session hint.
 *
 * @param {string} adminId
 * @returns {Promise<void>} Resolves on success, rejects with an Error on failure
 */
export async function signIn(adminId) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "فشل تسجيل الدخول");
  }

  const { token } = await res.json();
  if (!token) throw new Error("استجابة غير صالحة من الخادم");

  _adminToken = token;

  // Cosmetic hint only — survives page refresh within the same tab session
  // but the real token is gone on refresh (user must re-authenticate)
  sessionStorage.setItem("__admin_hint", "1");
}

/**
 * Returns the current in-memory JWT, or null if not authenticated.
 * @returns {string|null}
 */
export function getToken() {
  return _adminToken;
}

/**
 * Returns true if an admin token is currently held in memory.
 * NOTE: This is NOT a security check — always verify on the server.
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  return !!_adminToken;
}

/**
 * Checks the cosmetic session storage hint.
 * Used only to decide whether to show UI elements on page load —
 * the user will still need to re-authenticate if they refreshed.
 * @returns {boolean}
 */
export function hasAdminSessionHint() {
  return sessionStorage.getItem("__admin_hint") === "1";
}

/**
 * Signs the admin out: clears the in-memory token and cosmetic hint.
 */
export function signOut() {
  _adminToken = null;
  sessionStorage.removeItem("__admin_hint");
}
