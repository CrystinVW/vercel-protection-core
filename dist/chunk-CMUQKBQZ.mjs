var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/middleware.ts
import { NextResponse } from "next/server";

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
    const { pathname } = req.nextUrl;
    if (pathname.startsWith(loginPath)) return NextResponse.next();
    if (pathname.startsWith("/_next")) return NextResponse.next();
    if (pathname === "/favicon.ico") return NextResponse.next();
    for (const publicPath of publicPaths) {
      if (pathname.startsWith(publicPath)) return NextResponse.next();
    }
    const authCookie = req.cookies.get(cookieName)?.value;
    if (!authCookie) {
      const loginUrl = new URL(loginPath, req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  };
}

export {
  __require,
  DEFAULT_COOKIE_NAME,
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_RATE_LIMIT_MAX,
  protectMiddleware
};
