import { NextRequest, NextResponse } from 'next/server';
import { P as ProtectMiddlewareOptions } from './types-BVe8T7II.mjs';

declare function protectMiddleware(options?: ProtectMiddlewareOptions): (req: NextRequest) => NextResponse<unknown>;

export { protectMiddleware };
