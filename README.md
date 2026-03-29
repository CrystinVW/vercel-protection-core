# @vercel-protection/core

Password-protect any Vercel deployment. No paid Vercel features needed.

Each password maps to a client identity and role, so you can customize branding, content, and access per client — all from a single codebase.

## How It Works

You have a project on GitHub, connected to Vercel. This package adds a password gate in front of it. Visitors see a login page. They enter a password. If it matches, they get in. Each password identifies a specific client.

Works with **Next.js** projects and **Vite/React** projects (see [Vite Setup](#vite--react-projects) below).

---

## Step-by-Step: Protect a Next.js Vercel Project

For each GitHub repo / Vercel project you want to protect, follow these steps in that repo's codebase.

### Prerequisites

- A Next.js 14+ project using the App Router
- The project is deployed (or will be deployed) to Vercel

---

### Step 1 — Install the package

Open your terminal, `cd` into your project, and run:

```bash
npm install github:CrystinVW/vercel-protection-core
```

This adds the package to your `package.json`.

---

### Step 2 — Create the middleware

Create a file called `middleware.ts` in the **root** of your project (next to `package.json`, not inside `app/`).

Paste this exactly:

```ts
import { protectMiddleware } from "@vercel-protection/core/middleware";

export default protectMiddleware({ loginPath: "/login" });

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/login).*)"],
};
```

**What this does:** Every page in your app now requires authentication. It redirects unauthenticated visitors to `/login`. Static files and the login API are excluded so the page can load and accept passwords.

---

### Step 3 — Create the login API route

Create the file `app/api/login/route.ts` (create the folders if they don't exist):

```ts
import { handleLogin } from "@vercel-protection/core";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return handleLogin(req);
}
```

**What this does:** When someone submits a password, this endpoint checks it against your bcrypt hashes. If it matches, it sets a secure cookie with the client's identity.

---

### Step 4 — Create the logout API route

Create the file `app/api/logout/route.ts`:

```ts
import { handleLogout } from "@vercel-protection/core";

export function POST() {
  return handleLogout();
}
```

**What this does:** Clears the auth cookie so the user is logged out.

---

### Step 5 — Create a login page

Create the file `app/login/page.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: 300 }}>
        <h1>Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.75rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.75rem", fontSize: "1rem", background: "#000", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
      </form>
    </div>
  );
}
```

**What this does:** A simple password form. Customize this with your client's branding — logo, colors, company name, etc.

---

### Step 6 — Generate a password hash

Pick a password for your client. Run this in your terminal:

```bash
node -e "require('bcryptjs').hash('the-password-you-want', 10).then(h => console.log(h))"
```

It prints something like `$2a$10$xYz123abc...` — copy that hash.

---

### Step 7 — Add the environment variable on Vercel

1. Go to **vercel.com** → your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `CLIENT_PASSWORDS`
   - **Value:** `{"client-name":{"password":"$2a$10$THE_HASH_YOU_COPIED","role":"admin"}}`
3. Replace `client-name` with whatever you want to call this client (e.g., `acme`, `active-energies`)
4. Replace `THE_HASH_YOU_COPIED` with the bcrypt hash from Step 6
5. Click Save

**No escaping needed on Vercel** — paste the hash exactly as generated.

---

### Step 8 — For local development only

Create a `.env.local` file in your project root:

```
CLIENT_PASSWORDS={"client-name":{"password":"\$2a\$10\$THE_HASH","role":"admin"}}
```

**Important:** In `.env.local` you must escape every `$` as `\$`. This is a dotenv quirk. On Vercel, you don't need to do this.

---

### Step 9 — Deploy

Push your code to GitHub. Vercel will automatically rebuild and deploy. Visit your site — you should be redirected to the login page.

---

### Step 10 — (Optional) Show client info on your pages

In any server component, you can read who's logged in:

```ts
import { getCurrentClient } from "@vercel-protection/core";

export default function Page() {
  const client = getCurrentClient();
  // client = { name: "acme", role: "admin" } or null
  return <h1>Welcome, {client?.name}</h1>;
}
```

Use this to customize branding, show/hide features, or control access per client.

---

### Step 11 — (Optional) Add a logout button

In any client component:

```tsx
"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## Vite / React / Any Non-Next.js Project

If your project uses Vite, Create React App, or any other framework — **you do not need Next.js**. This package has a separate Vercel-native mode that uses Vercel Serverless Functions directly.

> **IMPORTANT: Do NOT use the Next.js files in a Vite project.**
> If you have any of these files, **delete them** — they will cause a 500 MIDDLEWARE_INVOCATION_FAILED error:
> - `middleware.ts` — this is a Next.js concept, Vite doesn't support it
> - `app/` directory with `api/login/route.ts`, `api/logout/route.ts`, or `login/page.tsx`
>
> Instead, follow the steps below which use Vercel Serverless Functions (no Next.js).

### Step 1 — Install the package

```bash
npm install github:CrystinVW/vercel-protection-core
```

---

### Step 2 — Create the login API

Create the file `api/login.ts` in your **project root** (not `src/api/`, just `api/`). Vercel automatically turns files in the `api/` folder into serverless functions:

```ts
import { createLoginHandler } from "@vercel-protection/core/vercel";
export default createLoginHandler();
```

**What this does:** Creates a Vercel Serverless Function at `/api/login` that validates passwords and sets the auth cookie. No Next.js involved.

---

### Step 3 — Create the logout API

Create the file `api/logout.ts` (also in the root `api/` folder):

```ts
import { createLogoutHandler } from "@vercel-protection/core/vercel";
export default createLogoutHandler();
```

---

### Step 4 — Add `vercel.json` to your project root

If you already have a `vercel.json`, merge these settings into it. Otherwise create a new one:

```json
{
  "rewrites": [
    { "source": "/api/login", "destination": "/api/login" },
    { "source": "/api/logout", "destination": "/api/logout" }
  ],
  "redirects": [
    {
      "source": "/((?!api|login\\.html|assets|favicon\\.ico).*)",
      "missing": [{ "type": "cookie", "key": "auth" }],
      "destination": "/login.html",
      "permanent": false
    }
  ]
}
```

**What this does:**
- Routes `/api/login` and `/api/logout` to your serverless functions
- Redirects unauthenticated users (no `auth` cookie) to `/login.html`
- Lets static assets, favicon, and the login page itself load without auth

> **Note:** If you already have `rewrites` or `redirects` in your `vercel.json`, add these entries to the existing arrays — don't replace them.

---

### Step 5 — Create a login page

Create `public/login.html` (or wherever your static files live):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    form { display: flex; flex-direction: column; gap: 1rem; width: 300px; }
    input { padding: 0.75rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 0.75rem; font-size: 1rem; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    .error { color: red; margin: 0; }
  </style>
</head>
<body>
  <form id="login-form">
    <h1>Login</h1>
    <input type="password" id="password" placeholder="Enter password" required />
    <button type="submit">Sign in</button>
    <p class="error" id="error" hidden></p>
  </form>
  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const error = document.getElementById('error');
      error.hidden = true;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: document.getElementById('password').value }),
      });
      const data = await res.json();
      if (!res.ok) { error.textContent = data.error; error.hidden = false; return; }
      window.location.href = '/';
    });
  </script>
</body>
</html>
```

Customize this with your client's branding. It's plain HTML — no framework needed.

---

### Step 6 — Generate a password hash and add the env var

Same as the Next.js setup:

```bash
node -e "require('bcryptjs').hash('the-password-you-want', 10).then(h => console.log(h))"
```

Then on Vercel → Settings → Environment Variables:
- **Name:** `CLIENT_PASSWORDS`
- **Value:** `{"client-name":{"password":"$2a$10$THE_HASH","role":"admin"}}`

---

### Step 7 — Deploy

Push to GitHub. Vercel deploys automatically. Unauthenticated visitors get redirected to your login page.

---

### Summary: Files needed for a Vite project

| File | Purpose |
|---|---|
| `api/login.ts` | Vercel Serverless Function — validates passwords |
| `api/logout.ts` | Vercel Serverless Function — clears cookie |
| `public/login.html` | Login page (plain HTML, customize with client branding) |
| `vercel.json` | Routes API calls + redirects unauthenticated users |

**No Next.js. No middleware.ts. No app/ directory.**

---

## Turning Protection Off

### Next.js projects

Protection is controlled by the `PROTECTION_ENABLED` environment variable. If it's set to `"false"`, the middleware lets everyone through — no password needed.

1. Go to **vercel.com** → your project → **Settings** → **Environment Variables**
2. Add: `PROTECTION_ENABLED` = `false`
3. Redeploy

To turn it back on, change to `true` or delete the variable.

### Vite / non-Next.js projects

Remove or comment out the `redirects` block in your `vercel.json` and redeploy. Without the redirect, visitors go straight to your app.

### Recommended setup

| Environment | `PROTECTION_ENABLED` | Result |
|---|---|---|
| Preview deployments | `true` (or don't set it) | Password required |
| Production (custom domain) | `false` | Public, no password |

Vercel lets you set different env var values per environment (Production vs Preview vs Development). Use this to keep previews protected while production is open.

---

## Multiple Clients, One App

You can have multiple passwords in the same env var. Each maps to a different client:

```
{"acme":{"password":"$2a$10$hash1","role":"admin"},"globex":{"password":"$2a$10$hash2","role":"viewer"}}
```

When a user logs in with Acme's password, `getCurrentClient()` returns `{ name: "acme", role: "admin" }`. Use this to render different logos, dashboards, or features per client.

---

## Built-in Protections

- **Bcrypt hashing** — passwords are never stored in plain text
- **Rate limiting** — after 5 failed attempts in 15 minutes, the login endpoint returns 429 (Too Many Requests)
- **HttpOnly cookies** — the auth cookie can't be read by JavaScript in the browser
- **Edge-safe middleware** — the redirect logic runs at the edge for fast response times

---

## API Reference

### Next.js imports

| Export | Import from | Description |
|---|---|---|
| `protectMiddleware(options?)` | `@vercel-protection/core/middleware` | Middleware factory. Redirects unauthenticated users to login. |
| `handleLogin(req, options?)` | `@vercel-protection/core` | Validates password, sets cookie. |
| `handleLogout(options?)` | `@vercel-protection/core` | Clears the auth cookie. |
| `getCurrentClient(cookieName?)` | `@vercel-protection/core` | Returns `{ name, role }` or `null`. |
| `getClientFromPassword(password)` | `@vercel-protection/core` | Async. Returns `{ name, role }` or `null`. |

### Vercel-native imports (Vite / non-Next.js)

| Export | Import from | Description |
|---|---|---|
| `createLoginHandler(options?)` | `@vercel-protection/core/vercel` | Returns a Vercel Serverless Function handler for login. |
| `createLogoutHandler(options?)` | `@vercel-protection/core/vercel` | Returns a Vercel Serverless Function handler for logout. |
| `getClientFromPassword(password)` | `@vercel-protection/core/vercel` | Async. Returns `{ name, role }` or `null`. |

### Options

**protectMiddleware**
| Option | Default | Description |
|---|---|---|
| `loginPath` | `"/login"` | Where to redirect unauthenticated users |
| `cookieName` | `"auth"` | Name of the auth cookie |
| `publicPaths` | `[]` | Paths that don't require authentication |

**handleLogin**
| Option | Default | Description |
|---|---|---|
| `cookieName` | `"auth"` | Name of the auth cookie |
| `cookieMaxAge` | 7 days | How long the cookie lasts (in seconds) |
| `rateLimitWindowMs` | 15 minutes | Rate limit window |
| `rateLimitMax` | 5 | Max login attempts per window |

## License

MIT
