import { VercelRequest, VercelResponse } from '@vercel/node';
import { H as HandleLoginOptions } from './types-BVe8T7II.mjs';
export { C as ClientEntry, a as ClientInfo, b as ClientPasswordsMap } from './types-BVe8T7II.mjs';
export { g as getClientFromPassword } from './client-BzX_8UCR.mjs';

declare function createLoginHandler(options?: HandleLoginOptions): (req: VercelRequest, res: VercelResponse) => Promise<VercelResponse>;

declare function createLogoutHandler(options?: {
    cookieName?: string;
}): (req: VercelRequest, res: VercelResponse) => VercelResponse;

export { HandleLoginOptions, createLoginHandler, createLogoutHandler };
