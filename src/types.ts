export interface ClientEntry {
  password: string;
  role: string;
}

export interface ClientPasswordsMap {
  [clientName: string]: ClientEntry;
}

export interface ClientInfo {
  name: string;
  role: string;
}

export interface ProtectMiddlewareOptions {
  loginPath?: string;
  cookieName?: string;
  publicPaths?: string[];
}

export interface HandleLoginOptions {
  cookieName?: string;
  cookieMaxAge?: number;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
}
