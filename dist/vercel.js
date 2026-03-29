"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/vercel/index.ts
var vercel_exports = {};
__export(vercel_exports, {
  createLoginHandler: () => createLoginHandler,
  createLogoutHandler: () => createLogoutHandler,
  getClientFromPassword: () => getClientFromPassword
});
module.exports = __toCommonJS(vercel_exports);

// src/client.ts
var import_bcryptjs = __toESM(require("bcryptjs"));

// src/constants.ts
var DEFAULT_COOKIE_NAME = "auth";
var DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;
var DEFAULT_RATE_LIMIT_MAX = 5;

// src/client.ts
var { compare } = import_bcryptjs.default;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createLoginHandler,
  createLogoutHandler,
  getClientFromPassword
});
