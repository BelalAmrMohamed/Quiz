// public/src/scripts/quizManifest.js
// =============================================================================
// Loads and merges the local static manifest with the live DB manifest.
//
// Sources
// ───────
// 1. LOCAL  /data/quiz-manifest.json  — built by generate-quiz-manifest.js,
//    bundled with the site at deploy time.  Fast, always available offline.
//
// 2. DB     /api/quiz-manifest        — Vercel function that queries Supabase
//    and returns newly-uploaded quizzes in the same shape as the local file.
//    May be unavailable (network error, Supabase down, etc.).
//
// Merge rules
// ───────────
// • Both fetches run in parallel (Promise.allSettled) — neither blocks the
//   other and the page renders even if one source fails completely.
// • LOCAL wins on ID collision: if the same quiz exists in both (e.g. an admin
//   uploaded a quiz that was later baked into the static manifest), the local
//   copy is kept and the DB copy is silently dropped.
// • Category tree nodes follow the same rule: local keys are authoritative;
//   DB-only keys are inserted as-is.  Subcategory lists and exam arrays are
//   union-merged with local items first.
//
// Caching
// ───────
// The merged result is cached in memory for the lifetime of the page.
// Call invalidateManifestCache() (e.g. after an admin upload) to force
// the next getManifest() call to re-fetch.
// =============================================================================

const LOCAL_MANIFEST_URL = new URL(
  "../../data/quiz-manifest.json",
  import.meta.url,
).href;

const DB_MANIFEST_URL = "/api/quiz-manifest";

let cached = null;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the merged manifest.  Result is cached after the first call.
 *
 * @returns {Promise<{ examList: Exam[], categoryTree: CategoryTree }>}
 */
export async function getManifest() {
  if (cached) return cached;
  cached = await fetchAndMerge();
  return cached;
}

/**
 * Clears the in-memory cache so the next getManifest() re-fetches both sources.
 * Call this after a successful admin quiz upload so the new quiz appears
 * immediately without requiring a full page reload.
 */
export function invalidateManifestCache() {
  cached = null;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function fetchAndMerge() {
  const [localResult, dbResult] = await Promise.allSettled([
    fetchJson(LOCAL_MANIFEST_URL),
    fetchJson(DB_MANIFEST_URL),
  ]);

  // Always start from the local manifest — it's the authoritative baseline.
  // If the local fetch fails we still try to show DB-only quizzes.
  const local =
    localResult.status === "fulfilled"
      ? localResult.value
      : { examList: [], categoryTree: {} };

  const db =
    dbResult.status === "fulfilled"
      ? dbResult.value
      : { examList: [], categoryTree: {} };

  if (dbResult.status === "rejected") {
    console.warn(
      "[quizManifest] DB manifest unavailable — showing local quizzes only.",
      dbResult.reason,
    );
  }

  return {
    examList: mergeExamList(local.examList ?? [], db.examList ?? []),
    categoryTree: mergeCategoryTree(
      local.categoryTree ?? {},
      db.categoryTree ?? {},
    ),
  };
}

/**
 * Merges two examList arrays.
 * Local exams are kept as-is; DB exams with duplicate IDs are dropped.
 *
 * @param {Exam[]} local
 * @param {Exam[]} db
 * @returns {Exam[]}
 */
function mergeExamList(local, db) {
  const seen = new Set(local.map((e) => e.id));
  const merged = [...local];

  for (const exam of db) {
    if (!seen.has(exam.id)) {
      seen.add(exam.id);
      merged.push(exam);
    }
  }

  return merged;
}

/**
 * Merges two categoryTree objects.
 *
 * For keys that exist in both: local data is kept; the DB node's exams and
 * subcategories are union-merged in (local entries first, no duplicates).
 * For keys only in DB: the DB node is inserted verbatim.
 *
 * @param {CategoryTree} local
 * @param {CategoryTree} db
 * @returns {CategoryTree}
 */
function mergeCategoryTree(local, db) {
  // Deep-clone local so we never mutate the original fetch result
  const merged = JSON.parse(JSON.stringify(local));

  for (const [key, dbNode] of Object.entries(db)) {
    if (!merged[key]) {
      // Brand-new category that only exists in DB — add it wholesale
      merged[key] = dbNode;
      continue;
    }

    const localNode = merged[key];

    // Merge exam arrays — skip any whose ID is already present
    const seenExamIds = new Set(localNode.exams.map((e) => e.id));
    for (const exam of dbNode.exams ?? []) {
      if (!seenExamIds.has(exam.id)) {
        seenExamIds.add(exam.id);
        localNode.exams.push(exam);
      }
    }

    // Merge subcategory key lists
    const seenSubs = new Set(localNode.subcategories);
    for (const subKey of dbNode.subcategories ?? []) {
      if (!seenSubs.has(subKey)) {
        seenSubs.add(subKey);
        localNode.subcategories.push(subKey);
      }
    }
  }

  return merged;
}

/**
 * Thin fetch wrapper that throws on non-OK responses.
 *
 * @param {string} url
 * @returns {Promise<object>}
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status} ${url}`);
  return res.json();
}
