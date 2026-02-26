// =============================================================================
// api/auth.js
// Admin sign-in endpoint.
//
// POST /api/auth
// Body:         { adminId: string }
// Success 200:  { token: string }
// Failure 401:  { error: string }
// =============================================================================

import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "crypto";
import { applyCors } from "./_middleware.js";

export default function handler(req, res) {
  // Note: applyCors now takes (req, res) to support multi-origin reflection
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { adminId } = req.body || {};

  // Reject obviously bad inputs immediately (before timing-sensitive comparison)
  if (!adminId || typeof adminId !== "string" || adminId.length > 500) {
    return setTimeout(
      () => res.status(400).json({ error: "فشل تسجيل الدخول" }),
      300,
    );
  }

  // Timing-safe comparison — prevents brute-force timing oracles.
  // Both sides are hashed to the same length before comparison.
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
    // Uniform 300ms delay regardless of reason — attacker learns nothing
    return setTimeout(
      () => res.status(401).json({ error: "فشل تسجيل الدخول" }),
      300,
    );
  }

  // Issue a short-lived JWT — role claim only, zero personal data
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "4h",
    algorithm: "HS256",
  });

  return res.status(200).json({ token });
}
