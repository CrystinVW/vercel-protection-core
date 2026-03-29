import { H as HandleLoginOptions, C as ClientInfo } from './middleware-BsncD9nL.js';
export { a as ClientEntry, b as ClientPasswordsMap, P as ProtectMiddlewareOptions, p as protectMiddleware } from './middleware-BsncD9nL.js';
import { NextRequest, NextResponse } from 'next/server';

declare function handleLogin(req: NextRequest, options?: HandleLoginOptions): Promise<NextResponse>;

declare function handleLogout(options?: {
    cookieName?: string;
}): NextResponse;

declare function getClientFromPassword(password: string): Promise<ClientInfo | null>;
declare function getCurrentClient(cookieName?: string): ClientInfo | null;

export { ClientInfo, HandleLoginOptions, getClientFromPassword, getCurrentClient, handleLogin, handleLogout };
