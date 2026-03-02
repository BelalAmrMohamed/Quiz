// =============================================================================
// api/quiz-manifest.js
// Public endpoint — returns all DB-hosted quizzes shaped like the new
// quiz-manifest.json (subjects array).
//
// GET /api/quiz-manifest
// No auth required — metadata only, no quiz content.
//
// 200: { subjects: Subject[] }
//
// Response is CDN-cached for 60 s (stale-while-revalidate 5 min).
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { applyCors } from "./_middleware.js";
import { generateQuizId } from "../scripts/lib/quizId.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  // ── 1. Fetch all quiz metadata rows ───────────────────────────────────────
  const { data, error } = await supabase
    .from("quizzes")
    .select("path, filename, title, category, subject, subfolder, data")
    .order("category", { ascending: true });

  if (error) {
    console.error("[quiz-manifest] Supabase error:", error.message);
    return res.status(500).json({ error: "فشل تحميل الاختبارات" });
  }

  // ── 2. Build subjects array ────────────────────────────────────────────────
  //
  // DB path column = "College/Year/Term/Subject[/Subfolder]"
  // We build a flat subjects array (one entry per Course), each with a quizzes
  // array containing all quizzes for that course (including subfolders).

  const subjectsMap = new Map(); // key = "College/Year/Term/Subject"

  for (const row of data) {
    const parts = row.path.split("/");
    const [college, year, term, subject] = parts;

    // Course-level key
    const courseKey = `${college}/${year}/${term}/${subject}`;

    // Relative path from public/data/ — used for ID generation
    const courseRelDir = `quizzes/${courseKey}`;

    if (!subjectsMap.has(courseKey)) {
      subjectsMap.set(courseKey, {
        id: generateQuizId(courseRelDir),
        name: subject,
        faculty: college,
        year: parseInt(year, 10),
        term: parseInt(term, 10),
        quizzes: [],
      });
    }

    const subjectEntry = subjectsMap.get(courseKey);

    // Canonical path for ID generation: quizzes/College/Year/Term/Subject[/Subfolder]/filename
    const examRelPath = `quizzes/${row.path}/${row.filename}`;

    // Fetch path for clients — points to quiz-data API endpoint
    const examFetchPath = `/api/quiz-data?path=${encodeURIComponent(examRelPath)}`;

    // Pull metadata from the stored data column (new schema)
    const quizMeta = row.data?.meta || {};
    const quizStats = row.data?.stats || {};

    const quizEntry = {
      id: quizMeta.id || generateQuizId(examRelPath),
      title: quizMeta.title || row.title,
      path: examFetchPath,
      questionCount: quizStats.questionCount ?? 0,
      questionTypes: quizStats.questionTypes ?? [],
      dbSource: "db", // tells index.js to show the "قاعدة البيانات" badge
    };

    // Optional fields — only include if present
    if (quizMeta.description) quizEntry.description = quizMeta.description;
    if (quizMeta.author) quizEntry.author = quizMeta.author;
    if (quizMeta.source) quizEntry.source = quizMeta.source;

    subjectEntry.quizzes.push(quizEntry);
  }

  const subjects = Array.from(subjectsMap.values());

  // ── 3. Cache headers ───────────────────────────────────────────────────────
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300",
  );

  return res.status(200).json({ subjects });
}
