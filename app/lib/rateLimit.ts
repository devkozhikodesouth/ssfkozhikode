import { NextRequest } from "next/server";

/* Small in-memory fixed-window limiter, keyed per client IP.
 * State lives in the server process: on serverless it is per instance, so it
 * slows scraping down rather than stopping a determined, distributed attacker. */
type Hit = { count: number; reset: number };
const buckets = new Map<string, Hit>();

export function clientIp(req: NextRequest | Request): string {
  const h = req.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/* Returns seconds to wait when the limit is exceeded, otherwise 0. */
export function rateLimit(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
  }
  const hit = buckets.get(key);
  if (!hit || hit.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return 0;
  }
  hit.count += 1;
  return hit.count > limit ? Math.ceil((hit.reset - now) / 1000) : 0;
}

/* Phone-lookup policy: 12 per minute and 120 per hour, per IP */
export function lookupLimited(req: NextRequest | Request): number {
  const ip = clientIp(req);
  return Math.max(
    rateLimit(`lookup:m:${ip}`, 12, 60_000),
    rateLimit(`lookup:h:${ip}`, 120, 3_600_000)
  );
}
