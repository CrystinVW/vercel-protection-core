import { NextRequest, NextResponse } from 'next/server';

interface ClientEntry {
    password: string;
    role: string;
}
interface ClientPasswordsMap {
    [clientName: string]: ClientEntry;
}
interface ClientInfo {
    name: string;
    role: string;
}
interface ProtectMiddlewareOptions {
    loginPath?: string;
    cookieName?: string;
    publicPaths?: string[];
}
interface HandleLoginOptions {
    cookieName?: string;
    cookieMaxAge?: number;
    rateLimitWindowMs?: number;
    rateLimitMax?: number;
}

declare function protectMiddleware(options?: ProtectMiddlewareOptions): (req: NextRequest) => NextResponse<unknown>;

export { type ClientInfo as C, type HandleLoginOptions as H, type ProtectMiddlewareOptions as P, type ClientEntry as a, type ClientPasswordsMap as b, protectMiddleware as p };
