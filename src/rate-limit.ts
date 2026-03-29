interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(windowMs: number, max: number) {
  const store = new Map<string, RateLimitEntry>();

  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }

  return {
    check(ip: string): boolean {
      cleanup();
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
      }

      entry.count++;
      return entry.count > max;
    },
  };
}
