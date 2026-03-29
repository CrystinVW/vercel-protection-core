export { protectMiddleware } from "./middleware";
export { handleLogin } from "./login";
export { handleLogout } from "./logout";
export { getClientFromPassword, getCurrentClient } from "./client";
export type {
  ClientInfo,
  ClientEntry,
  ClientPasswordsMap,
  ProtectMiddlewareOptions,
  HandleLoginOptions,
} from "./types";
