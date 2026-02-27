// =============================================================================
// api/quiz-data.js
// Public endpoint — serves the full quiz JSON for a single DB-hosted quiz.
//
// Called by the client whenever it opens a quiz whose path points here
// (i.e. any exam with source: "db" in the merged manifest).
//
// GET /api/quiz-data?path=quizzes%2FCollege%2F1%2F1%2FSubject%2Ffilename.json
// No auth required — quizzes are public content.
//
// 200: { title, questions, ... }   (the raw quiz JSON object stored in DB)
// 404: quiz not found
// 400: missing or malformed path parameter
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { applyCors } from "./_middleware.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  // ── 1. Parse & validate the `path` query parameter ────────────────────────
  // Expected format (URL-decoded): "quizzes/College/Year/Term/Subject[/Subfolder]/filename.json"
  // This is the same relative path (from public/data/) used to generate the exam ID.

  const rawPath = req.query?.path || "";

  if (!rawPath) {
    return res.status(400).json({ error: "معامل المسار مفقود" });
  }

  // Normalise: forward slashes only, no leading slash, no traversal
  const normalised = rawPath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.\.+/g, ""); // strip any ".." sequences

  // Must start with "quizzes/" and end with ".json"
  if (!normalised.startsWith("quizzes/") || !normalised.endsWith(".json")) {
    return res.status(400).json({ error: "مسار غير صالح" });
  }

  // Strip the leading "quizzes/" prefix — what remains is "College/Year/Term/Subject[/Sub]/file.json"
  const withoutPrefix = normalised.slice("quizzes/".length);

  // Split off the filename (last segment) from the DB `path` column (everything before it)
  const lastSlash = withoutPrefix.lastIndexOf("/");
  if (lastSlash === -1) {
    return res.status(400).json({ error: "مسار غير صالح" });
  }

  const dbPath = withoutPrefix.slice(0, lastSlash); // "College/Year/Term/Subject[/Sub]"
  const filename = withoutPrefix.slice(lastSlash + 1); // "filename.json"

  // ── 2. Fetch the quiz row ──────────────────────────────────────────────────
  const { data, error } = await supabase
    .from("quizzes")
    .select("data") // only the full quiz JSON blob
    .eq("path", dbPath)
    .eq("filename", filename)
    .maybeSingle();

  if (error) {
    console.error("[quiz-data] Supabase error:", error.message);
    return res.status(500).json({ error: "فشل تحميل الاختبار" });
  }

  if (!data) {
    return res.status(404).json({ error: "الاختبار غير موجود" });
  }

  // ── 3. Return the quiz payload ─────────────────────────────────────────────
  // Cache for 5 minutes — quiz content changes rarely; reduces DB read load.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600",
  );
  return res.status(200).json(data.data);
}
