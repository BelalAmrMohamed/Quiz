// scripts/lib/quizId.js
// =============================================================================
// Shared deterministic 8-char Base32 ID generator.
//
// This is the single source of truth for quiz/category ID generation.
// Both generate-quiz-manifest.js (build-time) and api/quiz-manifest.js
// (runtime) import from here — guaranteeing the same ID for the same path
// in both environments, which is the prerequisite for stable shareable links.
//
// Algorithm (mirrors the original inline version in generate-quiz-manifest.js):
//   1. Compute SHA-256 of the relative path string (relative to public/data/).
//   2. For each of the 8 output positions: charset[ hash[i] % 32 ].
//
// ⚠️  Do NOT change this function without re-running generate-quiz-manifest.js
//     and re-uploading all quizzes — IDs will shift and every shared link breaks.
// =============================================================================

import crypto from "crypto";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // 32 chars → indices 0-31
const ID_LENGTH = 8;

/**
 * Generates a deterministic 8-character ID from a path string.
 *
 * The path must be relative to `public/data/` and use forward slashes,
 * exactly as stored in the manifest. Examples:
 *
 *   Quiz file:   "quizzes/College/1/1/Subject/quiz-title.json"
 *   Course dir:  "quizzes/College/1/1/Subject"
 *   Subfolder:   "quizzes/College/1/1/Subject/Subfolder"
 *
 * @param {string} relativePath  Forward-slash path relative to public/data/
 * @returns {string}             8-character uppercase alphanumeric ID
 */
export function generateQuizId(relativePath) {
  const hash = crypto.createHash("sha256").update(relativePath).digest();
  let id = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARSET[hash[i] % CHARSET.length];
  }
  return id;
}
