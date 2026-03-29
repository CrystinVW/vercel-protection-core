# @vercel-protection/core

A reusable authentication layer for Vercel deployments. Protects your apps with server-side password validation and middleware — no paid Vercel protection features needed.

- **Per-client routing** — each password maps to a client identity and role
- **White-label ready** — use `getCurrentClient()` to customize branding per client
- **Edge-safe middleware** — redirects unauthenticated users to your login page
- **Rate limiting** — built-in brute force protection on login
- **Bcrypt passwords** — passwords are hashed, never stored in plain text

## Installation

```bash
npm install github:CrystinVW/vercel-protection-core
```

## Setup (4 files)

### 1. Middleware — `middleware.ts` (project root)

```ts
import { protectMiddleware } from "@vercel-protection/core/middleware";

export default protectMiddleware({ loginPath: "/login" });

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/login).*)"],
};
```

### 2. Login API — `app/api/login/route.ts`

```ts
import { handleLogin } from "@vercel-protection/core";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return handleLogin(req);
}
```

### 3. Logout API — `app/api/logout/route.ts`

```ts
import { handleLogout } from "@vercel-protection/core";

export function POST() {
  return handleLogout();
}
```

### 4. Environment variable

Add `CLIENT_PASSWORDS` to your Vercel project (Settings → Environment Variables):

```
{"acme":{"password":"$2a$10$your_bcrypt_hash_here","role":"admin"}}
```

Generate a bcrypt hash:

```bash
node -e "require('bcryptjs').hash('your-password', 10).then(h => console.log(h))"
```

> **Local development:** Create a `.env.local` file. Escape `$` as `\$` in bcrypt hashes (dotenv quirk). On Vercel, no escaping is needed.

## Usage in your app

### Read the current client (server components)

```ts
import { getCurrentClient } from "@vercel-protection/core";

export default function Page() {
  const client = getCurrentClient();
  // client = { name: "acme", role: "admin" } or null
  return <h1>Welcome, {client?.name}</h1>;
}
```

### Login page example (client component)

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Sign in</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

## API Reference

| Export | Description |
|---|---|
| `protectMiddleware(options?)` | Returns a Next.js middleware function. Import from `@vercel-protection/core/middleware` to keep it Edge-safe. |
| `handleLogin(req, options?)` | Validates password via bcrypt, sets auth cookie, returns JSON response. Includes rate limiting. |
| `handleLogout(options?)` | Clears the auth cookie. |
| `getClientFromPassword(password)` | Async. Returns `{ name, role }` or `null`. |
| `getCurrentClient(cookieName?)` | Reads the auth cookie server-side. Returns `{ name, role }` or `null`. |

### Options

**protectMiddleware**
- `loginPath` — redirect path (default: `"/login"`)
- `cookieName` — cookie name (default: `"auth"`)
- `publicPaths` — array of paths that skip auth (default: `[]`)

**handleLogin**
- `cookieName` — cookie name (default: `"auth"`)
- `cookieMaxAge` — seconds (default: 7 days)
- `rateLimitWindowMs` — rate limit window (default: 15 minutes)
- `rateLimitMax` — max attempts per window (default: 5)

## Multiple clients, one app

The `CLIENT_PASSWORDS` env var supports multiple clients:

```
{"acme":{"password":"$2a$10$hash1","role":"admin"},"globex":{"password":"$2a$10$hash2","role":"viewer"}}
```

Each password maps to a different client. Use `getCurrentClient()` to render different branding, features, or content per client.

## Requirements

- Next.js 14+
- App Router

## License

MIT
