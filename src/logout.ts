import { NextResponse } from "next/server";
import { DEFAULT_COOKIE_NAME } from "./constants";

export function handleLogout(options?: { cookieName?: string }): NextResponse {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;

  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: cookieName,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return res;
}
