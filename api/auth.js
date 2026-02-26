// =============================================================================
// api/auth.js
// Admin sign-in endpoint.
// Validates an Admin ID against an environment variable using a timing-safe
// comparison, then issues a short-lived HS256 JWT stored only in JS memory.
//
// POST /api/auth
// Body: { adminId: string }
// Response 200: { token: string }
// Response 401: { error: string }
// =============================================================================

import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "crypto";
import { applyCors } from "./_middleware.js";

export default function handler(req, res) {
  applyCors(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Basic body check
  const { adminId } = req.body || {};
  if (!adminId || typeof adminId !== "string" || adminId.length > 500) {
    // Deliberate delay to slow down automated probing
    setTimeout(() => res.status(400).json({ error: "فشل تسجيل الدخول" }), 300);
    return;
  }

  // Timing-safe comparison — both sides hashed to equal length first
  // This prevents an attacker from using response timing to guess characters
  const provided = createHash("sha256").update(adminId.trim()).digest();
  const expected = createHash("sha256")
    .update(process.env.ADMIN_SECRET || "")
    .digest();

  let authorized = false;
  try {
    authorized = timingSafeEqual(provided, expected);
  } catch (_) {
    authorized = false;
  }

  if (!authorized) {
    // Same delay whether wrong ID or missing env var
    setTimeout(
      () => res.status(401).json({ error: "فشل تسجيل الدخول" }),
      300
    );
    return;
  }

  // Sign a short-lived JWT — role claim only, no personal data
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "4h",
    algorithm: "HS256",
  });

  return res.status(200).json({ token });
}
