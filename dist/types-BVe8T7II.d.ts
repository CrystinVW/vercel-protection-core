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

export type { ClientEntry as C, HandleLoginOptions as H, ProtectMiddlewareOptions as P, ClientInfo as a, ClientPasswordsMap as b };
