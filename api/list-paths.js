// =============================================================================
// api/list-paths.js
// Returns existing categories / subjects / subfolders for the upload modal.
//
// GET /api/list-paths
// Headers: Authorization: Bearer <token>
// 200: { paths: { [category]: { [subject]: string[] } } }
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { requireAdmin, applyCors, handleAuthError } from "./_middleware.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  try {
    requireAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return res.status(401).json({ error: "غير مصرح" });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("category, subject, subfolder")
    .order("category", { ascending: true });

  if (error) {
    console.error("[list-paths] Supabase error:", error.message);
    return res.status(500).json({ error: "فشل تحميل المسارات" });
  }

  // Group into { category -> { subject -> Set<subfolder> } }
  const map = {};
  for (const row of data) {
    if (!map[row.category]) map[row.category] = {};
    if (!map[row.category][row.subject])
      map[row.category][row.subject] = new Set();
    if (row.subfolder) map[row.category][row.subject].add(row.subfolder);
  }

  // Serialize Sets → sorted arrays
  const paths = {};
  for (const [cat, subjects] of Object.entries(map)) {
    paths[cat] = {};
    for (const [sub, folders] of Object.entries(subjects)) {
      paths[cat][sub] = [...folders].sort((a, b) => a.localeCompare(b, "ar"));
    }
  }

  return res.status(200).json({ paths });
}
