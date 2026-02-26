// =============================================================================
// api/_validateQuiz.js
// Validates and sanitizes quiz JSON payloads before they touch the database.
// All validation is whitelist-based (unknown keys are REJECTED, not stripped).
// =============================================================================

const MAX_SIZE_BYTES = 50_000; // 50 KB hard cap per quiz file
const ALLOWED_TOP_KEYS = new Set([
  "title",
  "description",
  "subject",
  "category",
  "questions",
  "metadata",
  "createdAt",
  "updatedAt",
  "version",
  "tags",
]);

const ALLOWED_QUESTION_KEYS = new Set([
  "id",
  "question",
  "text",
  "type",
  "options",
  "choices",
  "answer",
  "correctAnswer",
  "explanation",
  "hint",
  "points",
  "image",
  "difficulty",
  "tags",
]);

// Only allow Arabic letters, Latin letters, digits, spaces, hyphens, slashes, dots
// This blocks directory traversal ( ../ ) and shell injection characters
const SAFE_PATH_REGEX = /^[\u0600-\u06FF\w\s\-\/\.]+$/u;

/**
 * Validates and sanitizes a quiz JSON payload.
 * Returns a clean copy. Throws a typed Error on any violation.
 *
 * @param {unknown} raw - The raw parsed body from the request
 * @returns {object} sanitized quiz object
 */
export function validateQuizPayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("INVALID_PAYLOAD: must be a JSON object");
  }

  // 1. Size check — serialize first to catch deeply nested payloads
  const serialized = JSON.stringify(raw);
  if (Buffer.byteLength(serialized, "utf8") > MAX_SIZE_BYTES) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  // 2. Re-parse from the serialized string — kills prototype pollution and
  //    any non-JSON-serializable values (functions, undefined, Dates, etc.)
  const quiz = JSON.parse(serialized);

  // 3. Top-level key whitelist
  for (const key of Object.keys(quiz)) {
    if (!ALLOWED_TOP_KEYS.has(key)) {
      throw new Error(`INVALID_KEY: "${key}" is not permitted`);
    }
  }

  // 4. Required fields
  if (typeof quiz.title !== "string" || !quiz.title.trim()) {
    throw new Error("MISSING_FIELD: title is required");
  }
  if (quiz.title.trim().length > 200) {
    throw new Error("INVALID_FIELD: title exceeds 200 characters");
  }
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error("MISSING_FIELD: questions array must not be empty");
  }
  if (quiz.questions.length > 500) {
    throw new Error("INVALID_FIELD: too many questions (max 500)");
  }

  // 5. Validate each question
  quiz.questions.forEach((q, i) => {
    if (!q || typeof q !== "object" || Array.isArray(q)) {
      throw new Error(`INVALID_QUESTION[${i}]: must be an object`);
    }
    for (const key of Object.keys(q)) {
      if (!ALLOWED_QUESTION_KEYS.has(key)) {
        throw new Error(`INVALID_QUESTION[${i}]: unknown key "${key}"`);
      }
    }
    const text = q.question || q.text;
    if (!text || typeof text !== "string" || !text.trim()) {
      throw new Error(`INVALID_QUESTION[${i}]: missing question text`);
    }
  });

  // 6. Sanitize the title (trim only — do not transform)
  quiz.title = quiz.title.trim();

  return quiz;
}

/**
 * Validates the path components sent with an upload request.
 * Blocks directory traversal and shell-injection characters.
 *
 * @param {string} category
 * @param {string} subject
 * @param {string|undefined} subfolder
 */
export function validatePath(category, subject, subfolder) {
  if (!category || typeof category !== "string" || !category.trim()) {
    throw new Error("MISSING_PATH: category is required");
  }
  if (!subject || typeof subject !== "string" || !subject.trim()) {
    throw new Error("MISSING_PATH: subject is required");
  }

  const parts = [category, subject, subfolder].filter(Boolean);
  for (const part of parts) {
    if (!SAFE_PATH_REGEX.test(part)) {
      throw new Error(`INVALID_PATH: "${part}" contains disallowed characters`);
    }
    // Block traversal patterns explicitly
    if (part.includes("..") || part.includes("//")) {
      throw new Error(`INVALID_PATH: traversal pattern detected`);
    }
    if (part.trim().length > 100) {
      throw new Error(`INVALID_PATH: segment too long (max 100 chars)`);
    }
  }
}
