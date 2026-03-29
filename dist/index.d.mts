export { protectMiddleware } from './middleware.mjs';
import { NextRequest, NextResponse } from 'next/server';
import { H as HandleLoginOptions } from './types-BVe8T7II.mjs';
export { C as ClientEntry, a as ClientInfo, b as ClientPasswordsMap, P as ProtectMiddlewareOptions } from './types-BVe8T7II.mjs';
export { g as getClientFromPassword, a as getCurrentClient } from './client-BzX_8UCR.mjs';

declare function handleLogin(req: NextRequest, options?: HandleLoginOptions): Promise<NextResponse>;

declare function handleLogout(options?: {
    cookieName?: string;
}): NextResponse;

export { HandleLoginOptions, handleLogin, handleLogout };
