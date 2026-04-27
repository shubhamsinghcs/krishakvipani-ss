import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  if (!SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token) {
  if (!SECRET || !token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (_error) {
    return null;
  }
}

export function getBearerToken(request) {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

export function getAuthUserId(request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded.sub !== "string") return null;
  return decoded.sub;
}

export function getAuthUserCookie(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded.sub !== "string") return null;
  return decoded.sub;
}
