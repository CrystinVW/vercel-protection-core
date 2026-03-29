import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DEFAULT_COOKIE_NAME } from "../constants";

export function createLogoutHandler(options?: { cookieName?: string }) {
  const cookieName = options?.cookieName ?? DEFAULT_COOKIE_NAME;

  return function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const cookie = `${cookieName}=; HttpOnly; Path=/; Max-Age=0`;
    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ success: true });
  };
}
