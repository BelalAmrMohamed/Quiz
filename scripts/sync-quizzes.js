// =============================================================================
// scripts/sync-quizzes.js
// Pulls un-synced quizzes from Supabase, writes them into public/data/quizzes/,
// marks them as synced in the DB, then regenerates the quiz manifest.
//
// Usage:
//   node scripts/sync-quizzes.js              ← Pull + write + manifest regen
//   node scripts/sync-quizzes.js --dry-run    ← Preview only, no files written
//   node scripts/sync-quizzes.js --delete-synced  ← Also delete synced rows (reclaim space)
//   node scripts/sync-quizzes.js --all        ← Sync ALL rows (including already-synced)
//
// Requires: .env.local or environment variables:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// ── Load .env.local ──────────────────────────────────────────────────────────
// We do this manually to avoid requiring dotenv as a runtime dep
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Validate env ─────────────────────────────────────────────────────────────
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.");
  console.error("    Set them in .env.local or your environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Config ───────────────────────────────────────────────────────────────────
const QUIZZES_DIR = path.resolve(__dirname, "../public/data/quizzes");
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const DELETE_SYNCED = args.includes("--delete-synced");
const SYNC_ALL = args.includes("--all");

// ── Colors for terminal output ────────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold("🔄  Supabase → Codebase Quiz Sync")}`);
  if (DRY_RUN) console.log(c.yellow("   [DRY RUN — no files will be written]\n"));

  // 1. Fetch rows
  let query = supabase
    .from("quizzes")
    .select("id, path, category, subject, subfolder, filename, data")
    .order("created_at", { ascending: true });

  if (!SYNC_ALL) {
    query = query.is("synced_at", null); // only un-synced
  }

  const { data: quizzes, error } = await query;
  if (error) {
    console.error(c.red(`❌  Supabase fetch failed: ${error.message}`));
    process.exit(1);
  }

  if (!quizzes || quizzes.length === 0) {
    console.log(c.green("✅  Nothing to sync. All quizzes are already in the codebase.\n"));
    return;
  }

  console.log(c.cyan(`📦  Found ${quizzes.length} quiz(zes) to sync.\n`));

  // 2. Row count info
  const { count } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true });
  console.log(c.dim(`   Total rows in Supabase: ${count}`));
  console.log(c.dim(`   Quizzes dir: ${QUIZZES_DIR}\n`));

  const syncedIds = [];
  let written = 0;
  let skipped = 0;

  for (const quiz of quizzes) {
    // Build directory path from path field
    // path looks like "Computer Science/2/2/Artificial Intelligence"
    const dirPath = path.join(QUIZZES_DIR, ...quiz.path.split("/"));

    // Safety: ensure the resolved path stays inside QUIZZES_DIR
    const resolved = path.resolve(dirPath);
    if (!resolved.startsWith(path.resolve(QUIZZES_DIR))) {
      console.warn(c.red(`   ⚠️  SKIPPED (path traversal detected): ${quiz.path}`));
      skipped++;
      continue;
    }

    const filePath = path.join(dirPath, quiz.filename);
    const relativePath = path.relative(path.resolve(__dirname, ".."), filePath);

    // Check for existing file
    if (fs.existsSync(filePath) && !SYNC_ALL) {
      console.log(c.yellow(`   ⏭  Already exists: ${relativePath}`));
      syncedIds.push(quiz.id); // mark as synced anyway
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(c.cyan(`   [DRY RUN] Would write: ${relativePath}`));
      written++;
      continue;
    }

    // Create directories recursively
    fs.mkdirSync(dirPath, { recursive: true });

    // Write the quiz JSON
    fs.writeFileSync(
      filePath,
      JSON.stringify(quiz.data, null, 2),
      "utf-8"
    );
    console.log(c.green(`   ✅  Written: ${relativePath}`));
    syncedIds.push(quiz.id);
    written++;
  }

  console.log(`\n   Written: ${c.green(written)}  |  Skipped: ${c.yellow(skipped)}\n`);

  if (DRY_RUN) {
    console.log(c.yellow("   [DRY RUN complete — no changes made]\n"));
    return;
  }

  // 3. Mark synced in Supabase
  if (syncedIds.length > 0) {
    console.log(`🏷️   Marking ${syncedIds.length} row(s) as synced in Supabase...`);
    const { error: updateErr } = await supabase
      .from("quizzes")
      .update({ synced_at: new Date().toISOString() })
      .in("id", syncedIds);

    if (updateErr) {
      console.warn(c.yellow(`   ⚠️  Could not update synced_at: ${updateErr.message}`));
    } else {
      console.log(c.green("   ✅  Marked as synced.\n"));
    }
  }

  // 4. Regenerate manifest
  console.log("🔁  Regenerating quiz manifest...");
  try {
    execSync("node scripts/generate-quiz-manifest.js", { stdio: "inherit" });
    console.log(c.green("   ✅  Manifest regenerated.\n"));
  } catch (err) {
    console.error(c.red(`   ❌  Manifest generation failed: ${err.message}`));
    console.error("       Run manually: node scripts/generate-quiz-manifest.js");
  }

  // 5. Delete synced rows (optional)
  if (DELETE_SYNCED) {
    await deleteSynced();
  } else {
    console.log(c.dim("   💡  Tip: To reclaim Supabase space after committing to Git, run:"));
    console.log(c.dim("       node scripts/sync-quizzes.js --delete-synced\n"));
  }

  console.log(c.bold(c.green("🎉  Sync complete!\n")));
}

async function deleteSynced() {
  console.log("🗑️   Deleting synced rows from Supabase...");
  const { error, count } = await supabase
    .from("quizzes")
    .delete({ count: "exact" })
    .not("synced_at", "is", null);

  if (error) {
    console.error(c.red(`   ❌  Delete failed: ${error.message}`));
  } else {
    console.log(c.green(`   ✅  Deleted ${count ?? "?"} synced row(s). Space reclaimed.\n`));
  }
}

main().catch((err) => {
  console.error(c.red(`\n❌  Unexpected error: ${err.message}`));
  process.exit(1);
});
