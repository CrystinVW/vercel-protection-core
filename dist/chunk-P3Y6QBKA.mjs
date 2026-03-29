import {
  DEFAULT_COOKIE_NAME,
  __require
} from "./chunk-ZV4JSRP7.mjs";

// src/client.ts
import bcrypt from "bcryptjs";
var { compare } = bcrypt;
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

export {
  getClientFromPassword,
  getCurrentClient,
  createRateLimiter
};
