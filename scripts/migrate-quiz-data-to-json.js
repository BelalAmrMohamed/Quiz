// scripts/migrate-quiz-data-to-json.js
// Converts all quiz .js files in public/data/quizzes to .json and quiz-manifest.js to quiz-manifest.json.
// Run: node scripts/migrate-quiz-data-to-json.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const QUIZZES_DIR = path.join(REPO_ROOT, "public", "data", "quizzes");
const DATA_DIR = path.join(REPO_ROOT, "public", "data");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walk(res) : res;
    }),
  );
  return Array.prototype.concat(...files);
}

/**
 * Extract the questions array from a quiz .js file (format: export const questions = [ ... ];)
 * Uses bracket matching and eval to handle unquoted object keys in the source.
 */
function extractQuestionsFromJs(content) {
  const exportMatch = content.match(/export\s+const\s+questions\s*=\s*/);
  if (!exportMatch) return null;

  const arrayStartIdx = content.indexOf("[", exportMatch.index);
  if (arrayStartIdx === -1) return null;

  let depth = 1;
  let i = arrayStartIdx + 1;
  while (depth > 0 && i < content.length) {
    const ch = content[i];
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    else if (ch === "]" || ch === ")" || ch === "}") depth--;
    else if ((ch === '"' || ch === "'" || ch === "`") && depth === 1) {
      const quote = ch;
      i++;
      while (i < content.length) {
        if (content[i] === "\\") {
          i += 2;
          continue;
        }
        if (content[i] === quote) break;
        i++;
      }
    }
    i++;
  }

  const arrayStr = content.slice(arrayStartIdx, i);
  try {
    return eval(arrayStr);
  } catch (err) {
    throw new Error(`Failed to parse questions array: ${err.message}`);
  }
}

async function convertQuizJsToJson(jsPath) {
  const content = await fs.readFile(jsPath, "utf8");
  const questions = extractQuestionsFromJs(content);
  if (!questions || !Array.isArray(questions)) {
    throw new Error(`No questions array found in ${jsPath}`);
  }

  const jsonPath = jsPath.replace(/\.js$/i, ".json");
  const payload = { questions };
  await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  return jsonPath;
}

/**
 * Find the extent of a JSON-like value (array or object) starting at startIdx.
 */
function findJsonValueEnd(content, startIdx) {
  const open = content[startIdx];
  const close = open === "[" ? "]" : "}";
  let depth = 1;
  let i = startIdx + 1;
  while (depth > 0 && i < content.length) {
    const ch = content[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) depth--;
    else if (ch === '"') {
      i++;
      while (i < content.length && (content[i] !== '"' || content[i - 1] === "\\")) i++;
    }
    i++;
  }
  return i;
}

/**
 * Parse quiz-manifest.js and return { examList, categoryTree } with paths updated to .json
 */
async function convertManifestToJson() {
  const manifestPath = path.join(DATA_DIR, "quiz-manifest.js");
  const content = await fs.readFile(manifestPath, "utf8");

  const examListLabel = "export const examList = ";
  const treeLabel = "export const categoryTree = ";
  const examListIdx = content.indexOf(examListLabel);
  const treeIdx = content.indexOf(treeLabel);

  if (examListIdx === -1 || treeIdx === -1) {
    throw new Error("Could not find examList or categoryTree in quiz-manifest.js");
  }

  const examListStart = content.indexOf("[", examListIdx);
  const treeStart = content.indexOf("{", treeIdx);
  if (examListStart === -1 || treeStart === -1) {
    throw new Error("Could not find array/object start in quiz-manifest.js");
  }

  const examListEnd = findJsonValueEnd(content, examListStart);
  const treeEnd = findJsonValueEnd(content, treeStart);

  const examListStr = content.slice(examListStart, examListEnd);
  const categoryTreeStr = content.slice(treeStart, treeEnd);

  let examList;
  let categoryTree;
  try {
    examList = JSON.parse(examListStr);
    categoryTree = JSON.parse(categoryTreeStr);
  } catch (e) {
    throw new Error("quiz-manifest.js content is not valid JSON: " + e.message);
  }

  examList.forEach((exam) => {
    if (exam.path && exam.path.endsWith(".js")) {
      exam.path = exam.path.replace(/\.js$/i, ".json");
    }
  });

  const outPath = path.join(DATA_DIR, "quiz-manifest.json");
  const payload = { examList, categoryTree };
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  return outPath;
}

async function main() {
  console.log("📦 Migrating quiz data from JS to JSON...\n");

  const jsFiles = (await walk(QUIZZES_DIR)).filter((f) => f.toLowerCase().endsWith(".js"));
  console.log(`📂 Found ${jsFiles.length} quiz .js files in public/data/quizzes\n`);

  let converted = 0;
  for (const jsPath of jsFiles) {
    try {
      const jsonPath = await convertQuizJsToJson(jsPath);
      console.log(`  ✅ ${path.relative(REPO_ROOT, jsPath)} → ${path.relative(REPO_ROOT, jsonPath)}`);
      converted++;
    } catch (err) {
      console.error(`  ❌ ${path.relative(REPO_ROOT, jsPath)}: ${err.message}`);
    }
  }

  console.log(`\n📄 Converting quiz-manifest.js to quiz-manifest.json...`);
  const manifestOut = await convertManifestToJson();
  console.log(`  ✅ ${path.relative(REPO_ROOT, manifestOut)}\n`);

  console.log(`✅ Migration complete. Converted ${converted} quiz files and the manifest.`);
  console.log("   Update app code to use .json and quiz-manifest.json, then you can remove the .js files if desired.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
