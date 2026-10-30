import type {
  GeoLocation,
  Restaurant,
  RestaurantEnrichment,
} from "@/types/restaurant";
import { recomputeRestaurantsHaversine } from "@/lib/haversine";

/**
 * Browser-side Persistent Quota Saver Cache (`localStorage` + session usage counter).
 *
 * Eliminates Foursquare Places API calls whenever:
 * - A location or radius was already visited in the past 24 hours
 * - The user shrinks the search radius inside an already-cached larger radius pool
 *   (recomputing exact Haversine distance & travel time locally for 0 API calls!)
 * - A restaurant's details popup was already viewed
 */

const PREFIX = "foodlette_v3_cache:";
const LAST_LOCATION_KEY = "foodlette_v5_last_location";
const RECENT_LOCATIONS_KEY = "foodlette_v3_recent_locations";

const TTL_NEARBY_MS = 24 * 60 * 60 * 1000; // 24 hours
const TTL_DETAILS_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredEnvelope<T> {
  expiresAt: number;
  value: T;
}

export interface NearbyCachePayload {
  restaurants: Restaurant[];
  radius: number;
}

export interface QuotaStats {
  upstreamCalls: number;
  cacheHits: number;
}

const sessionStats: QuotaStats = {
  upstreamCalls: 0,
  cacheHits: 0,
};

const listeners = new Set<(stats: QuotaStats) => void>();

function notifyStats() {
  const snapshot = { ...sessionStats };
  for (const fn of listeners) fn(snapshot);
}

export function recordApiUsage(wasCached: boolean, upstreamCount = 1) {
  if (wasCached) {
    sessionStats.cacheHits += 1;
  } else {
    sessionStats.upstreamCalls += upstreamCount;
  }
  notifyStats();
}

export function getQuotaStats(): QuotaStats {
  return { ...sessionStats };
}

export function subscribeQuotaStats(
  listener: (stats: QuotaStats) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function snapClientCoord(coord: number, step = 0.002): string {
  return (Math.round(coord / step) * step).toFixed(3);
}

function readEnvelope<T>(subKey: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + subKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredEnvelope<T>;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(PREFIX + subKey);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function writeEnvelope<T>(subKey: string, value: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  const fullKey = PREFIX + subKey;
  const payload = JSON.stringify({
    expiresAt: Date.now() + ttlMs,
    value,
  } satisfies StoredEnvelope<T>);

  try {
    window.localStorage.setItem(fullKey, payload);
  } catch {
    pruneClientCache(15);
    try {
      window.localStorage.setItem(fullKey, payload);
    } catch {
      // Ignore storage failure
    }
  }
}

function pruneClientCache(removeCount = 15): void {
  if (typeof window === "undefined") return;
  try {
    const entries: { key: string; expiresAt: number }[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        try {
          const parsed = JSON.parse(window.localStorage.getItem(k) || "{}");
          entries.push({ key: k, expiresAt: parsed.expiresAt || 0 });
        } catch {
          entries.push({ key: k, expiresAt: 0 });
        }
      }
    }
    entries.sort((a, b) => a.expiresAt - b.expiresAt);
    for (const item of entries.slice(0, removeCount)) {
      window.localStorage.removeItem(item.key);
    }
  } catch {
    // Ignore
  }
}

export function clearAllFoodletteCache(): void {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) {
      window.localStorage.removeItem(k);
    }
  } catch {
    // Ignore
  }
}

// --- Nearby Restaurants Cache + Smaller-Radius Haversine Superset Reuse ---

export function nearbyKey(lat: number, lon: number, radius: number): string {
  return `nearby:${snapClientCoord(lat)}:${snapClientCoord(lon)}:${radius}`;
}

export function getCachedNearby(
  lat: number,
  lon: number,
  radius: number
): NearbyCachePayload | null {
  const exact = readEnvelope<NearbyCachePayload>(nearbyKey(lat, lon, radius));
  if (exact) {
    return {
      radius,
      restaurants: recomputeRestaurantsHaversine(exact.restaurants, lat, lon),
    };
  }

  // Smart Haversine Superset Reuse: if user shrinks radius (e.g. 3000m -> 1500m -> 600m)
  // at the same snapped location, filter via exact Haversine distance locally for 0 API calls!
  const largerRadii = [5000, 3000, 1500].filter((r) => r > radius);
  for (const bigR of largerRadii) {
    const superset = readEnvelope<NearbyCachePayload>(nearbyKey(lat, lon, bigR));
    if (superset && superset.restaurants.length > 0) {
      const recomputed = recomputeRestaurantsHaversine(
        superset.restaurants,
        lat,
        lon
      );
      const within = recomputed.filter((rest) => rest.distanceMeters <= radius);
      if (within.length >= 4) {
        return {
          restaurants: within,
          radius,
        };
      }
    }
  }

  return null;
}

export function setCachedNearby(
  lat: number,
  lon: number,
  radius: number,
  payload: NearbyCachePayload
): void {
  writeEnvelope(nearbyKey(lat, lon, radius), payload, TTL_NEARBY_MS);
}

// --- Enriched Restaurant Details Cache ---

export function getCachedDetails(fsqId: string): RestaurantEnrichment | null {
  return readEnvelope<RestaurantEnrichment>(`details:${fsqId}`);
}

export function setCachedDetails(
  fsqId: string,
  enrichment: RestaurantEnrichment
): void {
  writeEnvelope(`details:${fsqId}`, enrichment, TTL_DETAILS_MS);
}

// --- Last Active Location & Recent Searched Locations ---

export function getSavedLastLocation(): GeoLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_LOCATION_KEY);
    return raw ? (JSON.parse(raw) as GeoLocation) : null;
  } catch {
    return null;
  }
}

export function saveLastLocation(loc: GeoLocation): void {
  if (typeof window === "undefined") return;
  // Do not persist coarse ISP IP-centroid estimates as sticky last locations
  if (loc.approximate) return;
  try {
    window.localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc));
  } catch {
    // Ignore
  }
}

export function getRecentLocations(): GeoLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_LOCATIONS_KEY);
    return raw ? (JSON.parse(raw) as GeoLocation[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentLocation(loc: GeoLocation): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentLocations();
    const deduped = [
      loc,
      ...current.filter(
        (item) =>
          item.label.toLowerCase() !== loc.label.toLowerCase() &&
          (Math.abs(item.lat - loc.lat) > 0.002 ||
            Math.abs(item.lon - loc.lon) > 0.002)
      ),
    ].slice(0, 6);
    window.localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(deduped));
  } catch {
    // Ignore
  }
}
