"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  getClientFromPassword: () => getClientFromPassword,
  getCurrentClient: () => getCurrentClient,
  handleLogin: () => handleLogin,
  handleLogout: () => handleLogout,
  protectMiddleware: () => protectMiddleware
});
module.exports = __toCommonJS(src_exports);

// src/middleware.ts
var import_server = require("next/server");

// src/constants.ts
var DEFAULT_COOKIE_NAME = "auth";
var DEFAULT_LOGIN_PATH = "/login";
var DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;
var DEFAULT_RATE_LIMIT_MAX = 5;

// src/middleware.ts
function protectMiddleware(options) {
  const loginPath = options?.loginPath ?? DEFAULT_LOGIN_PATH;
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const publicPaths = options?.publicPaths ?? [];
  return function middleware(req) {
    if (process.env.PROTECTION_ENABLED === "false") {
      return import_server.NextResponse.next();
    }
    const { pathname } = req.nextUrl;
    if (pathname.startsWith(loginPath)) return import_server.NextResponse.next();
    if (pathname.startsWith("/_next")) return import_server.NextResponse.next();
    if (pathname === "/favicon.ico") return import_server.NextResponse.next();
    for (const publicPath of publicPaths) {
      if (pathname.startsWith(publicPath)) return import_server.NextResponse.next();
    }
    const authCookie = req.cookies.get(cookieName)?.value;
    if (!authCookie) {
      const loginUrl = new URL(loginPath, req.url);
      loginUrl.searchParams.set("from", pathname);
      return import_server.NextResponse.redirect(loginUrl);
    }
    return import_server.NextResponse.next();
  };
}

// src/login.ts
var import_server2 = require("next/server");

// src/client.ts
var import_bcryptjs = require("bcryptjs");
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
    const isMatch = await (0, import_bcryptjs.compare)(password, entry.password);
    if (isMatch && !matched) {
      matched = { name: clientName, role: entry.role };
    }
  }
  return matched;
}
function getCurrentClient(cookieName) {
  const { cookies } = require("next/headers");
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
    return import_server2.NextResponse.json(
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
    return import_server2.NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  if (!body.password) {
    return import_server2.NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }
  let client;
  try {
    client = await getClientFromPassword(body.password);
  } catch (err) {
    console.error("Auth error:", err);
    return import_server2.NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }
  if (!client) {
    return import_server2.NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = import_server2.NextResponse.json({
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
var import_server3 = require("next/server");
function handleLogout(options) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const res = import_server3.NextResponse.json({ success: true });
  res.cookies.set({
    name: cookieName,
    value: "",
    maxAge: 0,
    path: "/"
  });
  return res;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getClientFromPassword,
  getCurrentClient,
  handleLogin,
  handleLogout,
  protectMiddleware
});
