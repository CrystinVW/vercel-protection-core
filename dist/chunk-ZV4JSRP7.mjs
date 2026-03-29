var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/constants.ts
var DEFAULT_COOKIE_NAME = "auth";
var DEFAULT_LOGIN_PATH = "/login";
var DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;
var DEFAULT_RATE_LIMIT_MAX = 5;

export {
  __require,
  DEFAULT_COOKIE_NAME,
  DEFAULT_LOGIN_PATH,
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_RATE_LIMIT_MAX
};
