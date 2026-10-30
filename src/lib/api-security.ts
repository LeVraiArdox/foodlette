import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API security utilities:
 * - Bounded per-IP sliding-window rate limiting (protects Foursquare API credit quota)
 * - Cross-site `Origin` / `Sec-Fetch-Site` hotlink protection
 * - Trusted proxy IP extraction (prevents `X-Forwarded-For` spoofing & URL injection)
 * - Strict geographic & identifier bounds validation
 */

interface RateWindowEntry {
  count: number;
  resetAt: number;
}

const MAX_RATE_ENTRIES = 5000;
const WINDOW_MS = 60 * 1000; // 1 minute window

const globalRateStore = globalThis as unknown as {
  __foodletteRateLimiter?: Map<string, RateWindowEntry>;
};

if (!globalRateStore.__foodletteRateLimiter) {
  globalRateStore.__foodletteRateLimiter = new Map<string, RateWindowEntry>();
}

const rateMap = globalRateStore.__foodletteRateLimiter;

function pruneExpiredRateEntries(now: number) {
  if (rateMap.size < MAX_RATE_ENTRIES) return;
  for (const [key, entry] of rateMap.entries()) {
    if (entry.resetAt <= now) {
      rateMap.delete(key);
    }
  }
  // Hard cap eviction if still full under active flood
  if (rateMap.size >= MAX_RATE_ENTRIES) {
    let removed = 0;
    for (const key of rateMap.keys()) {
      rateMap.delete(key);
      removed += 1;
      if (removed >= 1000) break;
    }
  }
}

function isPrivateOrLoopbackIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("0.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    /^(fc|fd|fe80):/i.test(ip)
  );
}

function isSyntacticallyValidIp(ip: string): boolean {
  if (ip.length < 3 || ip.length > 45) return false;
  // Strict IPv4 or IPv6 hex/colon syntax (blocks path/query characters completely)
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6 = /^[0-9a-fA-F:]{2,45}$/;
  return ipv4.test(ip) || (ip.includes(":") && ipv6.test(ip));
}

/**
 * Extracts a validated public client IP ONLY from trusted platform proxy headers
 * (`cf-connecting-ip`, `x-vercel-forwarded-for`, or when `TRUST_PROXY=true`/`1` is explicitly enabled),
 * preventing arbitrary `X-Forwarded-For` spoofing on direct Node exposures.
 */
export function extractTrustedPublicClientIp(
  request: NextRequest
): string | null {
  const trustProxy =
    process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true";

  const candidateRaw =
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    (trustProxy
      ? request.headers.get("x-real-ip")?.trim() ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      : "") ||
    "";

  if (!candidateRaw) return null;

  const ip = candidateRaw.replace(/^::ffff:/i, "");
  if (!isSyntacticallyValidIp(ip) || isPrivateOrLoopbackIp(ip)) {
    return null;
  }
  return ip;
}

function getRateLimitClientId(request: NextRequest): string {
  const trustedIp = extractTrustedPublicClientIp(request);
  if (trustedIp) return trustedIp;

  // Fallback fingerprint when running directly without trusted proxy headers
  const fallbackIp =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim()
      ?.replace(/^::ffff:/i, "") || "local";
  return isSyntacticallyValidIp(fallbackIp) ? fallbackIp : "local";
}

/**
 * Blocks cross-origin browser requests (`Sec-Fetch-Site: cross-site` or mismatched `Origin`)
 * so external websites cannot hotlink Foodlette's `/api/*` endpoints to drain Foursquare credits,
 * and enforces a per-IP sliding-window rate limit.
 */
export function guardApiRequest(
  request: NextRequest,
  bucket: "geocode" | "restaurants" | "details",
  maxRequestsPerMinute: number
): NextResponse | null {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return NextResponse.json(
      { error: "Cross-site API requests are not permitted." },
      { status: 403 }
    );
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 }
    );
  }

  const now = Date.now();
  pruneExpiredRateEntries(now);

  const clientId = getRateLimitClientId(request);
  const key = `${bucket}:${clientId}`;
  const existing = rateMap.get(key);

  if (!existing || existing.resetAt <= now) {
    rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  existing.count += 1;
  if (existing.count > maxRequestsPerMinute) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait a moment before trying again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(maxRequestsPerMinute),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export function isValidFsqPlaceId(fsqId: string): boolean {
  return /^[a-zA-Z0-9_-]{6,64}$/.test(fsqId);
}
