// =============================================================================
// api/quiz-manifest.js
// Public endpoint — returns all DB-hosted quizzes shaped like quiz-manifest.json.
//
// The client fetches this alongside the static local manifest and merges them.
//
// GET /api/quiz-manifest
// No auth required — metadata only, no quiz content.
//
// 200: { examList: Exam[], categoryTree: CategoryTree }
//
// Response is CDN-cached for 60 s (stale-while-revalidate 5 min) to stay
// within Supabase Free Plan connection limits.
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
    .select("path, filename, title, category, subject, subfolder")
    .order("category", { ascending: true });

  if (error) {
    console.error("[quiz-manifest] Supabase error:", error.message);
    return res.status(500).json({ error: "فشل تحميل الاختبارات" });
  }

  // ── 2. Build examList + categoryTree ──────────────────────────────────────
  //
  // DB path column = "College/Year/Term/Subject[/Subfolder]"
  // This mirrors the local folder structure under public/data/quizzes/.
  //
  // We reconstruct the same relative paths that generate-quiz-manifest.js
  // would produce for equivalent files, so IDs are guaranteed to match
  // any local copy of the same quiz.

  const categoryTree = {};
  const examList = [];

  for (const row of data) {
    // Decompose stored path: College / Year / Term / Subject [/ Subfolder]
    const parts = row.path.split("/");
    const [college, year, term, subject] = parts;
    const subfolder = parts[4] || null; // optional

    // ── Course-level category (depth 3 in local structure) ──────────────────
    const categoryKey = subject;
    // Relative dir path from public/data/ — matches what generate-quiz-manifest.js
    // would compute as `relativePath` for the course directory.
    const categoryRelDir = `quizzes/${college}/${year}/${term}/${subject}`;

    if (!categoryTree[categoryKey]) {
      categoryTree[categoryKey] = {
        // ID generated from the directory path — same algorithm as courses in
        // the local manifest (generateUniqueId called with the directory fullPath).
        id: generateQuizId(categoryRelDir),
        name: subject,
        faculty: college,
        year,
        term,
        path: [subject],
        parent: null,
        subcategories: [],
        exams: [],
        source: "db", // marker so the client knows this category came from DB
      };
    }

    // ── Subfolder category (depth 4+) ────────────────────────────────────────
    let examCategoryKey = categoryKey;

    if (subfolder) {
      const subKey = `${subject}/${subfolder}`;

      if (!categoryTree[subKey]) {
        categoryTree[subKey] = {
          name: subfolder,
          path: [subject, subfolder],
          parent: categoryKey,
          subcategories: [],
          exams: [],
          source: "db",
        };
        // Register as subcategory of parent (avoid duplicates)
        if (!categoryTree[categoryKey].subcategories.includes(subKey)) {
          categoryTree[categoryKey].subcategories.push(subKey);
        }
      }

      examCategoryKey = subKey;
    }

    // ── Exam entry ───────────────────────────────────────────────────────────
    // Relative file path from public/data/ — the exact string hashed by
    // generate-quiz-manifest.js when it processes an equivalent local file.
    const examRelPath = `quizzes/${row.path}/${row.filename}`;

    // The `path` field stored here is intentionally an absolute URL path
    // pointing to the quiz-data API endpoint.  It ends in ".json" (since
    // row.filename always ends in ".json") so the `.endsWith(".json")` guards
    // in index.js all pass without any changes to that file.
    const examFetchPath = `/api/quiz-data?path=${encodeURIComponent(examRelPath)}`;

    const exam = {
      id: generateQuizId(examRelPath), // identical to local ID for same file
      title: row.title,
      path: examFetchPath,
      category: examCategoryKey,
      source: "db", // consumed by quizManifest.js merge; transparent to quiz UI
    };

    examList.push(exam);
    // Also attach to the tree node so categoryTree consumers see it inline
    categoryTree[examCategoryKey].exams.push(exam);
  }

  // Match the sort order of generate-quiz-manifest.js
  examList.sort((a, b) => (a.category + a.id).localeCompare(b.category + b.id));

  // ── 3. Cache headers ───────────────────────────────────────────────────────
  // 60 s fresh on the CDN; stale-while-revalidate lets Vercel serve the old
  // response instantly while refreshing in the background.  This keeps
  // Supabase Free Plan query counts low while ensuring data is never more
  // than ~5 minutes stale for any visitor.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300",
  );

  return res.status(200).json({ examList, categoryTree });
}
