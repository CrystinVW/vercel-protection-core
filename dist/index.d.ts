export { protectMiddleware } from './middleware.js';
import { NextRequest, NextResponse } from 'next/server';
import { H as HandleLoginOptions } from './types-BVe8T7II.js';
export { C as ClientEntry, a as ClientInfo, b as ClientPasswordsMap, P as ProtectMiddlewareOptions } from './types-BVe8T7II.js';
export { g as getClientFromPassword, a as getCurrentClient } from './client-CD1WDK1I.js';

declare function handleLogin(req: NextRequest, options?: HandleLoginOptions): Promise<NextResponse>;

declare function handleLogout(options?: {
    cookieName?: string;
}): NextResponse;

export { HandleLoginOptions, handleLogin, handleLogout };
