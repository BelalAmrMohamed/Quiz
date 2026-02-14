// src/scripts/quizManifest.js - Loads quiz-manifest.json (cached)
const MANIFEST_URL = new URL("../../data/quiz-manifest.json", import.meta.url).href;
let cached = null;

/**
 * @returns {Promise<{ examList: Array<{id,title,path,category}>, categoryTree: Object }>}
 */
export async function getManifest() {
  if (cached) return cached;
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
  cached = await res.json();
  return cached;
}
