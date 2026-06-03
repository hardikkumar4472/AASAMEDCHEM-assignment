
const store = new Map(); 

/**
 * @param {object} options
 * @param {number} options.limit       Max requests allowed in the window
 * @param {number} options.windowMs    Window duration in milliseconds
 * @param {string} options.key         Unique name for this limiter (e.g. "login")
 */
export function rateLimit({ limit, windowMs, key }) {
  return {
    /**
     * @param {string} ip
     * @returns {{ success: boolean, remaining: number, resetAt: number }}
     */
    check(ip) {
      const storeKey = `${key}::${ip}`;
      const now = Date.now();

      let entry = store.get(storeKey);

      // Expired or first hit — reset
      if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
      }

      entry.count += 1;
      store.set(storeKey, entry);

      // Periodically purge expired entries to prevent memory leak
      if (store.size > 5000) {
        for (const [k, v] of store.entries()) {
          if (now > v.resetAt) store.delete(k);
        }
      }

      return {
        success: entry.count <= limit,
        remaining: Math.max(0, limit - entry.count),
        resetAt: entry.resetAt,
      };
    },
  };
}

export const loginLimiter = rateLimit({
  key: "login",
  limit: 10,
  windowMs: 15 * 60 * 1000, // 10 attempts per 15 minutes
});

export const registerLimiter = rateLimit({
  key: "register",
  limit: 5,
  windowMs: 60 * 60 * 1000, // 5 attempts per hour
});

export const quotationLimiter = rateLimit({
  key: "quotation",
  limit: 20,
  windowMs: 60 * 1000, // 20 submissions per minute
});

export const adminActionLimiter = rateLimit({
  key: "adminAction",
  limit: 60,
  windowMs: 60 * 1000, // 60 actions per minute
});

export function getIP(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
export function rateLimitResponse(resetAt) {
  const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSecs),
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}
