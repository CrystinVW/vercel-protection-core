import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getClientFromPassword } from "../client";
import { createRateLimiter } from "../rate-limit";
import type { HandleLoginOptions } from "../types";
import {
  DEFAULT_COOKIE_NAME,
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_RATE_LIMIT_MAX,
} from "../constants";

let rateLimiter: ReturnType<typeof createRateLimiter> | null = null;

function getRateLimiter(windowMs: number, max: number) {
  if (!rateLimiter) {
    rateLimiter = createRateLimiter(windowMs, max);
  }
  return rateLimiter;
}

export function createLoginHandler(options?: HandleLoginOptions) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookieMaxAge = options?.cookieMaxAge ?? DEFAULT_COOKIE_MAX_AGE;
  const windowMs = options?.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const max = options?.rateLimitMax ?? DEFAULT_RATE_LIMIT_MAX;

  return async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const ip =
      (typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0]?.trim()
        : undefined) ||
      req.headers["x-real-ip"] ||
      "unknown";

    const limiter = getRateLimiter(windowMs, max);

    if (limiter.check(ip as string)) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
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
      client: { name: client.name, role: client.role },
    });
  };
}
