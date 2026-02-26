// =============================================================================
// api/list-paths.js
// Returns existing categories, subjects, and subfolders from the database.
// Used by the admin upload modal to populate smart dropdowns.
//
// GET /api/list-paths
// Headers: Authorization: Bearer <token>
// Response 200: { paths: { [category]: { [subject]: string[] } } }
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { requireAdmin, applyCors } from "./_middleware.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  try {
    requireAdmin(req);
  } catch (e) {
    return res.status(401).json({ error: "غير مصرح" });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("category, subject, subfolder")
    .order("category", { ascending: true });

  if (error) {
    console.error("[list-paths] Supabase error:", error);
    return res.status(500).json({ error: "فشل تحميل المسارات" });
  }

  // Build a nested map: { category -> { subject -> Set<subfolder> } }
  const map = {};
  for (const row of data) {
    const cat = row.category;
    const sub = row.subject;
    const folder = row.subfolder;

    if (!map[cat]) map[cat] = {};
    if (!map[cat][sub]) map[cat][sub] = new Set();
    if (folder) map[cat][sub].add(folder);
  }

  // Serialize Sets to sorted arrays for JSON
  const paths = {};
  for (const [cat, subjects] of Object.entries(map)) {
    paths[cat] = {};
    for (const [sub, folders] of Object.entries(subjects)) {
      paths[cat][sub] = [...folders].sort((a, b) => a.localeCompare(b));
    }
  }

  return res.status(200).json({ paths });
}
