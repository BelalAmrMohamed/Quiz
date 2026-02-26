// =============================================================================
// api/upload-quiz.js
// Authenticated endpoint to upload a quiz JSON to Supabase.
//
// POST /api/upload-quiz
// Headers: Authorization: Bearer <token>
// Body: { category, subject, subfolder?, quiz: {...} }
// Response 201: { success: true, id, path }
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { requireAdmin, applyCors } from "./_middleware.js";
import { validateQuizPayload, validatePath } from "./_validateQuiz.js";

// Supabase client is instantiated once at module level (reused across warm invocations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // ← service role, NEVER expose to client
);

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  // ── 1. Authenticate ────────────────────────────────────────────────────────
  try {
    requireAdmin(req);
  } catch (e) {
    if (e.message === "TOKEN_EXPIRED") {
      return res
        .status(401)
        .json({ error: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا." });
    }
    return res.status(401).json({ error: "غير مصرح" });
  }

  // ── 2. Extract & validate body ────────────────────────────────────────────
  const { category, subject, subfolder, quiz } = req.body || {};

  try {
    validatePath(category, subject, subfolder);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  let cleanQuiz;
  try {
    cleanQuiz = validateQuizPayload(quiz);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  // ── 3. Build path and filename ────────────────────────────────────────────
  const pathParts = [category.trim(), subject.trim()];
  if (subfolder?.trim()) pathParts.push(subfolder.trim());
  const fullPath = pathParts.join("/");

  // Safe filename: keep Arabic, Latin, digits, hyphens/underscores
  const safeTitle = cleanQuiz.title.replace(/[^\u0600-\u06FF\w\s\-]/gu, "").trim().replace(/\s+/g, "_");
  const filename = `${safeTitle || "quiz"}.json`;

  // ── 4. Check for duplicate (same path + filename) ─────────────────────────
  const { data: existing } = await supabase
    .from("quizzes")
    .select("id")
    .eq("path", fullPath)
    .eq("filename", filename)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({
      error: `يوجد اختبار بنفس الاسم في هذا المسار: ${fullPath}/${filename}`,
    });
  }

  // ── 5. Insert into Supabase ───────────────────────────────────────────────
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      path: fullPath,
      category: category.trim(),
      subject: subject.trim(),
      subfolder: subfolder?.trim() || null,
      title: cleanQuiz.title,
      filename,
      data: cleanQuiz,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[upload-quiz] Supabase insert error:", error);
    return res.status(500).json({ error: "فشل رفع الاختبار. حاول مجددًا." });
  }

  return res.status(201).json({ success: true, id: data.id, path: fullPath });
}
