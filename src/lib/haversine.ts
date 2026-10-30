import type { HaversineMetrics, Restaurant } from "@/types/restaurant";

/**
 * Pure Haversine Geodesic Distance, Forward Azimuth & Travel Time Calculus.
 *
 * Uses the IUGG WGS-84 mean Earth radius (R = 6,371,008.8 m) to compute exact
 * great-circle geodesic distance, compass bearing, and urban circuity-adjusted
 * walking, cycling, and driving durations with zero external routing API calls.
 */

const EARTH_MEAN_RADIUS_METERS = 6_371_008.8;

/** Standard urban street-network circuity / detour factor (Ballou et al.) */
const URBAN_WALK_BIKE_CIRCUITY = 1.28;
const URBAN_DRIVE_CIRCUITY = 1.32;

/** Average urban travel speeds in meters per minute */
const WALK_SPEED_M_PER_MIN = 80; // ~4.8 km/h
const BIKE_SPEED_M_PER_MIN = 250; // ~15.0 km/h
const DRIVE_SPEED_M_PER_MIN = 400; // ~24.0 km/h (city traffic + lights)

const COMPASS_SECTORS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function calculateHaversineMetrics(
  originLat: number,
  originLon: number,
  targetLat: number,
  targetLon: number
): HaversineMetrics {
  const phi1 = toRadians(originLat);
  const phi2 = toRadians(targetLat);
  const deltaPhi = toRadians(targetLat - originLat);
  const deltaLambda = toRadians(targetLon - originLon);

  const sinHalfPhi = Math.sin(deltaPhi / 2);
  const sinHalfLambda = Math.sin(deltaLambda / 2);

  const a =
    sinHalfPhi * sinHalfPhi +
    Math.cos(phi1) * Math.cos(phi2) * sinHalfLambda * sinHalfLambda;

  const clampedA = Math.min(1, Math.max(0, a));
  const centralAngle =
    2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  const distanceMeters = Math.round(EARTH_MEAN_RADIUS_METERS * centralAngle);
  const estimatedRouteMeters = Math.round(
    distanceMeters * URBAN_WALK_BIKE_CIRCUITY
  );
  const estimatedDriveMeters = distanceMeters * URBAN_DRIVE_CIRCUITY;

  const walkMinutes = Math.max(
    1,
    Math.round(estimatedRouteMeters / WALK_SPEED_M_PER_MIN)
  );
  const bikeMinutes = Math.max(
    1,
    Math.round(estimatedRouteMeters / BIKE_SPEED_M_PER_MIN)
  );
  const driveMinutes = Math.max(
    1,
    Math.round(estimatedDriveMeters / DRIVE_SPEED_M_PER_MIN)
  );

  // Initial forward geodesic azimuth (bearing)
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const bearingDegrees = Math.round((toDegrees(Math.atan2(y, x)) + 360) % 360);
  const sectorIdx = Math.round(bearingDegrees / 45) % 8;
  const compassDirection = COMPASS_SECTORS[sectorIdx];

  return {
    distanceMeters,
    estimatedRouteMeters,
    walkMinutes,
    bikeMinutes,
    driveMinutes,
    bearingDegrees,
    compassDirection,
  };
}

export function recomputeRestaurantsHaversine(
  restaurants: Restaurant[],
  originLat: number,
  originLon: number
): Restaurant[] {
  return restaurants
    .map((r) => ({
      ...r,
      ...calculateHaversineMetrics(originLat, originLon, r.lat, r.lon),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function formatHaversineDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}
