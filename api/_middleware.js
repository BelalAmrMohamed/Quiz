// =============================================================================
// api/_middleware.js
// Shared JWT verification utility — imported by every protected endpoint
// =============================================================================

import jwt from "jsonwebtoken";

/**
 * Verifies the Authorization: Bearer <token> header on an incoming request.
 * Throws a typed error string that callers can map to HTTP status codes.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {{ role: string, iat: number, exp: number }} decoded JWT payload
 */
export function requireAdmin(req) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = auth.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    // jwt.verify throws TokenExpiredError, JsonWebTokenError, etc.
    if (err.name === "TokenExpiredError") throw new Error("TOKEN_EXPIRED");
    throw new Error("UNAUTHORIZED");
  }

  if (payload.role !== "admin") throw new Error("FORBIDDEN");

  return payload;
}

/**
 * Applies CORS headers to a response.
 * Restricts origin to ALLOWED_ORIGIN env var in production.
 *
 * @param {import('http').ServerResponse} res
 */
export function applyCors(res) {
  const origin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
