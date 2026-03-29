import {
  DEFAULT_COOKIE_NAME,
  DEFAULT_LOGIN_PATH
} from "./chunk-ZV4JSRP7.mjs";

// src/middleware.ts
import { NextResponse } from "next/server";
function protectMiddleware(options) {
  const loginPath = options?.loginPath ?? DEFAULT_LOGIN_PATH;
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const publicPaths = options?.publicPaths ?? [];
  return function middleware(req) {
    if (process.env.PROTECTION_ENABLED === "false") {
      return NextResponse.next();
    }
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
  protectMiddleware
};
