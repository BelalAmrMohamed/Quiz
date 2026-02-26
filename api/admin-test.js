// =============================================================================
// api/admin-test.js
// Diagnostic endpoint — verifies JWT validity AND Supabase connectivity.
// Safe to call from the browser console or DevTools Network tab.
//
// GET /api/admin-test
// Headers: Authorization: Bearer <token>
//
// Success 200: {
//   auth: true,
//   tokenExpiresAt: "<ISO date>",
//   supabase: { connected: true, rowCount: <number> }
// }
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { requireAdmin, applyCors } from "./_middleware.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── 1. Verify JWT ──────────────────────────────────────────────────────────
  let payload;
  try {
    payload = requireAdmin(req);
  } catch (err) {
    const expired = err.message === "TOKEN_EXPIRED";
    return res.status(401).json({
      auth: false,
      reason: expired ? "TOKEN_EXPIRED" : "UNAUTHORIZED",
      message: expired
        ? "انتهت صلاحية الجلسة — أعد تسجيل الدخول"
        : "JWT غير صالح أو مفقود",
    });
  }

  // ── 2. Test Supabase connection ─────────────────────────────────────────────
  let supabaseResult = { connected: false, error: null, rowCount: null };
  try {
    const { count, error } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true });

    if (error) {
      supabaseResult = {
        connected: false,
        error: error.message,
        rowCount: null,
      };
    } else {
      supabaseResult = { connected: true, error: null, rowCount: count };
    }
  } catch (e) {
    supabaseResult = { connected: false, error: e.message, rowCount: null };
  }

  return res.status(200).json({
    auth: true,
    tokenExpiresAt: new Date(payload.exp * 1000).toISOString(),
    supabase: supabaseResult,
  });
}
