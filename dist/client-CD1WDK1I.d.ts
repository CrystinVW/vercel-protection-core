import { a as ClientInfo } from './types-BVe8T7II.js';

declare function getClientFromPassword(password: string): Promise<ClientInfo | null>;
declare function getCurrentClient(cookieName?: string): ClientInfo | null;

export { getCurrentClient as a, getClientFromPassword as g };
