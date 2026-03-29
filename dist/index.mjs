import {
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_COOKIE_NAME,
  DEFAULT_RATE_LIMIT_MAX,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  __require,
  protectMiddleware
} from "./chunk-S6H3SO7I.mjs";

// src/login.ts
import { NextResponse } from "next/server";

// src/client.ts
import { compare } from "bcryptjs";
async function getClientFromPassword(password) {
  const raw = process.env.CLIENT_PASSWORDS;
  if (!raw) {
    throw new Error("CLIENT_PASSWORDS environment variable is not set");
  }
  let map;
  try {
    map = JSON.parse(raw);
  } catch {
    throw new Error("CLIENT_PASSWORDS environment variable is not valid JSON");
  }
  let matched = null;
  for (const [clientName, entry] of Object.entries(map)) {
    const isMatch = await compare(password, entry.password);
    if (isMatch && !matched) {
      matched = { name: clientName, role: entry.role };
    }
  }
  return matched;
}
function getCurrentClient(cookieName) {
  const { cookies } = __require("next/headers");
  const cookieStore = cookies();
  const name = cookieName ?? DEFAULT_COOKIE_NAME;
  const value = cookieStore.get(name)?.value;
  if (!value) return null;
  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return null;
  return {
    name: value.slice(0, colonIndex),
    role: value.slice(colonIndex + 1)
  };
}

// src/rate-limit.ts
function createRateLimiter(windowMs, max) {
  const store = /* @__PURE__ */ new Map();
  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
  return {
    check(ip) {
      cleanup();
      const now = Date.now();
      const entry = store.get(ip);
      if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
      }
      entry.count++;
      return entry.count > max;
    }
  };
}

// src/login.ts
var rateLimiter = null;
function getRateLimiter(windowMs, max) {
  if (!rateLimiter) {
    rateLimiter = createRateLimiter(windowMs, max);
  }
  return rateLimiter;
}
function getClientIp(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
async function handleLogin(req, options) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const cookieMaxAge = options?.cookieMaxAge ?? DEFAULT_COOKIE_MAX_AGE;
  const windowMs = options?.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const max = options?.rateLimitMax ?? DEFAULT_RATE_LIMIT_MAX;
  const ip = getClientIp(req);
  const limiter = getRateLimiter(windowMs, max);
  if (limiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(windowMs / 1e3)) }
      }
    );
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  if (!body.password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }
  let client;
  try {
    client = await getClientFromPassword(body.password);
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }
  if (!client) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({
    success: true,
    client: { name: client.name, role: client.role }
  });
  res.cookies.set({
    name: cookieName,
    value: `${client.name}:${client.role}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cookieMaxAge
  });
  return res;
}

// src/logout.ts
import { NextResponse as NextResponse2 } from "next/server";
function handleLogout(options) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const res = NextResponse2.json({ success: true });
  res.cookies.set({
    name: cookieName,
    value: "",
    maxAge: 0,
    path: "/"
  });
  return res;
}
export {
  getClientFromPassword,
  getCurrentClient,
  handleLogin,
  handleLogout,
  protectMiddleware
};
