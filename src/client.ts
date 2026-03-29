import { compare } from "bcryptjs";
import type { ClientInfo, ClientPasswordsMap } from "./types";
import { DEFAULT_COOKIE_NAME } from "./constants";

export async function getClientFromPassword(
  password: string
): Promise<ClientInfo | null> {
  const raw = process.env.CLIENT_PASSWORDS;

  if (!raw) {
    throw new Error("CLIENT_PASSWORDS environment variable is not set");
  }

  let map: ClientPasswordsMap;
  try {
    map = JSON.parse(raw);
  } catch {
    throw new Error("CLIENT_PASSWORDS environment variable is not valid JSON");
  }

  let matched: ClientInfo | null = null;

  // Iterate ALL entries to avoid timing-based client enumeration
  for (const [clientName, entry] of Object.entries(map)) {
    const isMatch = await compare(password, entry.password);
    if (isMatch && !matched) {
      matched = { name: clientName, role: entry.role };
    }
  }

  return matched;
}

export function getCurrentClient(cookieName?: string): ClientInfo | null {
  // Dynamic import to avoid Edge Runtime issues when not called
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cookies } = require("next/headers") as typeof import("next/headers");
  const cookieStore = cookies();
  const name = cookieName ?? DEFAULT_COOKIE_NAME;
  const value = (cookieStore as any).get(name)?.value as string | undefined;

  if (!value) return null;

  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return null;

  return {
    name: value.slice(0, colonIndex),
    role: value.slice(colonIndex + 1),
  };
}
