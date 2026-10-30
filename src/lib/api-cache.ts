import fs from "node:fs";
import path from "node:path";

/**
 * Persistent Server Cache + In-Flight Request Deduplicator for BAN Geocoding & Foursquare Places API.
 *
 * Persists cached responses across Next.js route hot-reloads and server restarts
 * inside `.cache/foodlette-places-cache.json`, while deduplicating simultaneous
 * identical requests (e.g., React StrictMode double-mounts in development).
 */

interface CacheEntry<T = unknown> {
  expiresAt: number;
  value: T;
}

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "foodlette-places-cache.json");
const MAX_CACHE_ENTRIES = 600;

export const TTL_NEARBY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TTL_DETAILS_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TTL_GEOCODE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Persist across Next.js dev HMR module reloads using globalThis
const globalStore = globalThis as unknown as {
  __foodletteMemoryCache?: Map<string, CacheEntry>;
  __foodletteInflightMap?: Map<string, Promise<unknown>>;
  __foodletteDiskLoaded?: boolean;
  __foodletteFlushTimer?: ReturnType<typeof setTimeout> | null;
};

if (!globalStore.__foodletteMemoryCache) {
  globalStore.__foodletteMemoryCache = new Map<string, CacheEntry>();
}
if (!globalStore.__foodletteInflightMap) {
  globalStore.__foodletteInflightMap = new Map<string, Promise<unknown>>();
}

const memoryCache = globalStore.__foodletteMemoryCache;
const inflightMap = globalStore.__foodletteInflightMap;

function ensureDiskLoaded() {
  if (globalStore.__foodletteDiskLoaded) return;
  globalStore.__foodletteDiskLoaded = true;
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    const now = Date.now();
    for (const [k, entry] of Object.entries(parsed)) {
      if (entry && typeof entry.expiresAt === "number" && entry.expiresAt > now) {
        memoryCache.set(k, entry);
      }
    }
  } catch {
    // Ignore corrupt or missing cache file
  }
}

function scheduleDiskFlush() {
  if (globalStore.__foodletteFlushTimer) return;
  globalStore.__foodletteFlushTimer = setTimeout(() => {
    globalStore.__foodletteFlushTimer = null;
    try {
      const now = Date.now();
      for (const [k, entry] of memoryCache.entries()) {
        if (entry.expiresAt <= now) {
          memoryCache.delete(k);
        }
      }
      while (memoryCache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = memoryCache.keys().next().value;
        if (!oldestKey) break;
        memoryCache.delete(oldestKey);
      }

      fs.mkdirSync(CACHE_DIR, { recursive: true });
      const serializable: Record<string, CacheEntry> = {};
      for (const [k, entry] of memoryCache.entries()) {
        serializable[k] = entry;
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(serializable), "utf8");
    } catch {
      // Ignore filesystem write errors in restricted environments
    }
  }, 500);
}

export function getServerCache<T>(key: string): T | null {
  ensureDiskLoaded();
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setServerCache<T>(key: string, value: T, ttlMs: number): void {
  ensureDiskLoaded();
  memoryCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
  scheduleDiskFlush();
}

/**
 * Coalesces simultaneous requests with the same `key` into a single upstream
 * execution so React StrictMode or rapid double-clicks never fire duplicate API calls.
 */
export async function withInflightDedup<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = inflightMap.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = fetcher().finally(() => {
    inflightMap.delete(key);
  });
  inflightMap.set(key, promise);
  return promise;
}

/**
 * Snaps latitude/longitude onto a ~220m grid (`step = 0.002` degrees) so slight
 * GPS jitter across reloads hits the exact same cache key.
 */
export function snapCoordinateGrid(coord: number, step = 0.002): string {
  return (Math.round(coord / step) * step).toFixed(3);
}
