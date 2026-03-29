import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ProtectMiddlewareOptions } from "./types";
import { DEFAULT_COOKIE_NAME, DEFAULT_LOGIN_PATH } from "./constants";

export function protectMiddleware(options?: ProtectMiddlewareOptions) {
  const loginPath = options?.loginPath ?? DEFAULT_LOGIN_PATH;
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const publicPaths = options?.publicPaths ?? [];

  return function middleware(req: NextRequest) {
    // Skip protection if disabled via env var
    if (process.env.PROTECTION_ENABLED === "false") {
      return NextResponse.next();
    }

    const { pathname } = req.nextUrl;

    // Allow public paths
    if (pathname.startsWith(loginPath)) return NextResponse.next();
    if (pathname.startsWith("/_next")) return NextResponse.next();
    if (pathname === "/favicon.ico") return NextResponse.next();

    for (const publicPath of publicPaths) {
      if (pathname.startsWith(publicPath)) return NextResponse.next();
    }

    // Check auth cookie
    const authCookie = req.cookies.get(cookieName)?.value;

    if (!authCookie) {
      const loginUrl = new URL(loginPath, req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  };
}
