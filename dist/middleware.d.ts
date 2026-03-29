import { NextRequest, NextResponse } from 'next/server';
import { P as ProtectMiddlewareOptions } from './types-BVe8T7II.js';

declare function protectMiddleware(options?: ProtectMiddlewareOptions): (req: NextRequest) => NextResponse<unknown>;

export { protectMiddleware };
