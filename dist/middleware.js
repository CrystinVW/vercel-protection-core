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

// src/middleware.ts
var middleware_exports = {};
__export(middleware_exports, {
  protectMiddleware: () => protectMiddleware
});
module.exports = __toCommonJS(middleware_exports);
var import_server = require("next/server");

// src/constants.ts
var DEFAULT_COOKIE_NAME = "auth";
var DEFAULT_LOGIN_PATH = "/login";
var DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  protectMiddleware
});
