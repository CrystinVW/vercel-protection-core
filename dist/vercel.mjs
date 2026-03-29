import {
  createRateLimiter,
  getClientFromPassword
} from "./chunk-7IWOMB4A.mjs";
import {
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_COOKIE_NAME,
  DEFAULT_RATE_LIMIT_MAX,
  DEFAULT_RATE_LIMIT_WINDOW_MS
} from "./chunk-ZV4JSRP7.mjs";

// src/vercel/login.ts
var rateLimiter = null;
function getRateLimiter(windowMs, max) {
  if (!rateLimiter) {
    rateLimiter = createRateLimiter(windowMs, max);
  }
  return rateLimiter;
}
function createLoginHandler(options) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookieMaxAge = options?.cookieMaxAge ?? DEFAULT_COOKIE_MAX_AGE;
  const windowMs = options?.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const max = options?.rateLimitMax ?? DEFAULT_RATE_LIMIT_MAX;
  return async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const ip = (typeof req.headers?.["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0]?.trim() : void 0) || req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "unknown";
    const limiter = getRateLimiter(windowMs, max);
    if (limiter.check(ip)) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1e3)));
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    let client;
    try {
      client = await getClientFromPassword(password);
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(500).json({ error: "Server configuration error" });
    }
    if (!client) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const cookieValue = `${client.name}:${client.role}`;
    const secure = process.env.NODE_ENV === "production";
    const cookie = `${cookieName}=${cookieValue}; HttpOnly; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax${secure ? "; Secure" : ""}`;
    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({
      success: true,
      client: { name: client.name, role: client.role }
    });
  };
}

// src/vercel/logout.ts
function createLogoutHandler(options) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  return function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const cookie = `${cookieName}=; HttpOnly; Path=/; Max-Age=0`;
    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ success: true });
  };
}
export {
  createLoginHandler,
  createLogoutHandler,
  getClientFromPassword
};
