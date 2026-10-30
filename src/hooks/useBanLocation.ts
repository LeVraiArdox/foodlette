"use client";

import React from "react";
import type { GeoLocation } from "@/types/restaurant";
import { getSavedLastLocation, saveLastLocation } from "@/lib/client-cache";

/**
 * Target street-level horizontal accuracy (in meters) at which `watchPosition`
 * resolves immediately without waiting for further GPS/Wi-Fi refinement.
 */
const STREET_ACCURACY_TARGET_METERS = 120;

/**
 * Coordinates with horizontal uncertainty > 2,500m indicate the browser fell back
 * internally to coarse IP geolocation rather than real GPS or Wi-Fi positioning.
 */
const COARSE_ACCURACY_THRESHOLD_METERS = 2500;

async function queryBrowserGeoPermission(): Promise<
  PermissionState | "unknown"
> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "unknown";
  }
}

function getBrowserPositionOnce(
  options: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Platform-independent W3C Geolocation refinement using `watchPosition`:
 * Many mobile & desktop browsers emit a coarse cached cell/IP fix first before
 * the Wi-Fi / GPS hardware finishes acquiring a sharp street fix ~1-2s later.
 * Watching briefly until accuracy <= 120m (or keeping the sharpest fix within 2.2s)
 * ensures street-level accuracy across iOS, Android, macOS, Windows, and Linux.
 */
function watchAccurateBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let bestPos: GeolocationPosition | null = null;
    let settled = false;
    let watchId: number | null = null;
    let refineTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (refineTimer !== null) {
        clearTimeout(refineTimer);
        refineTimer = null;
      }
    };

    const finishWithPosition = (pos: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(pos);
    };

    const finishWithError = (err: GeolocationPositionError) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (bestPos) {
        resolve(bestPos);
      } else {
        reject(err);
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
          bestPos = pos;
        }

        // Resolve immediately once we have a street-accurate GPS/Wi-Fi fix
        if (pos.coords.accuracy <= STREET_ACCURACY_TARGET_METERS) {
          finishWithPosition(pos);
          return;
        }

        // Otherwise allow up to 2.2s for hardware GPS/Wi-Fi to sharpen the initial fix
        if (refineTimer === null) {
          refineTimer = setTimeout(() => {
            if (bestPos) finishWithPosition(bestPos);
          }, 2200);
        }
      },
      (err) => {
        finishWithError(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      }
    );
  });
}

async function requestAccurateBrowserPosition(): Promise<GeolocationPosition> {
  try {
    return await watchAccurateBrowserPosition();
  } catch (err) {
    const geoErr = err as GeolocationPositionError;
    // Retry standard mode only on TIMEOUT (code === 3); PERMISSION_DENIED (1) & POSITION_UNAVAILABLE (2) fail fast
    if (geoErr && geoErr.code === 3) {
      return getBrowserPositionOnce({
        enableHighAccuracy: false,
        timeout: 3500,
        maximumAge: 60000,
      });
    }
    throw err;
  }
}

async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
  options?: { approximate?: boolean; accuracyMeters?: number }
): Promise<GeoLocation> {
  const isApprox = Boolean(options?.approximate);
  let label = isApprox ? "Position approximative" : "Position GPS";
  let subtitle = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  let banId: string | undefined;

  try {
    const approxQuery = isApprox ? "&approximate=1" : "";
    const res = await fetch(
      `/api/geocode?lat=${latitude}&lon=${longitude}${approxQuery}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.label) label = data.label;
      if (data.subtitle) subtitle = data.subtitle;
      if (data.banId) banId = data.banId;
    }
  } catch {
    // Keep coordinate subtitle fallback
  }

  return {
    lat: latitude,
    lon: longitude,
    label,
    subtitle,
    banId,
    source: "gps",
    approximate: isApprox,
    accuracyMeters: options?.accuracyMeters,
  };
}

/**
 * 100% platform-independent network geolocation fallback used ONLY when the user
 * has authorized geolocation (`granted` or `err.code !== PERMISSION_DENIED`),
 * but the browser/OS has no active W3C geolocation provider (e.g. open-source
 * browser builds without an OS location daemon).
 */
async function fetchAuthorizedNetworkLocation(): Promise<GeoLocation | null> {
  // 1) Same-origin Next.js backend (`ipinfo.io` postal-code geolocation + BAN commune lookup)
  try {
    const res = await fetch("/api/geocode?locate=1");
    if (res.ok) {
      const data = (await res.json()) as {
        lat?: number;
        lon?: number;
        label?: string;
        subtitle?: string;
        banId?: string;
        approximate?: boolean;
        accuracyMeters?: number;
      };
      if (typeof data.lat === "number" && typeof data.lon === "number") {
        return {
          lat: data.lat,
          lon: data.lon,
          label: data.label || "Position actuelle",
          subtitle:
            data.subtitle || `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`,
          banId: data.banId,
          source: "gps",
          approximate: data.approximate ?? true,
          accuracyMeters: data.accuracyMeters,
        };
      }
    }
  } catch {
    // Try direct browser CORS backup below
  }

  // 2) Direct browser CORS backup (`ipinfo.io` -> `geojs.io`)
  try {
    const res = await fetch("https://ipinfo.io/json");
    if (res.ok) {
      const data = (await res.json()) as { loc?: string };
      if (typeof data.loc === "string") {
        const [latStr, lonStr] = data.loc.split(",");
        const lat = Number(latStr);
        const lon = Number(lonStr);
        if (!isNaN(lat) && !isNaN(lon)) {
          return reverseGeocodeCoordinates(lat, lon, {
            approximate: true,
            accuracyMeters: 1500,
          });
        }
      }
    }
  } catch {
    // Try GeoJS below
  }

  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (res.ok) {
      const data = (await res.json()) as {
        latitude?: string | number;
        longitude?: string | number;
      };
      const lat = Number(data.latitude);
      const lon = Number(data.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        return reverseGeocodeCoordinates(lat, lon, {
          approximate: true,
          accuracyMeters: 10000,
        });
      }
    }
  } catch {
    // All network fallbacks unreachable
  }

  return null;
}

/**
 * Manages active location state, Haversine search radius, saved last-location
 * restoration, and platform-independent W3C Geolocation + BAN reverse-geocoding.
 */
export function useBanLocation(keyStatusChecked: boolean) {
  const [location, setLocation] = React.useState<GeoLocation | null>(null);
  const [gpsLoading, setGpsLoading] = React.useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = React.useState<string | null>(null);
  const [radius, setRadius] = React.useState<number>(1500);
  const inFlightRef = React.useRef(false);

  const applyResolvedGpsLocation = React.useCallback((gpsLoc: GeoLocation) => {
    saveLastLocation(gpsLoc);
    setLocation(gpsLoc);
    setGpsNotice(
      gpsLoc.approximate
        ? "Approximate network location (OS GPS unavailable) — search your street for exact distance"
        : null
    );
    setGpsLoading(false);
    inFlightRef.current = false;
  }, []);

  const requestGpsLocation = React.useCallback(
    async (silentOnDecline = false) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setGpsLoading(true);
      setGpsNotice(null);

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        if (!silentOnDecline) {
          const netLoc = await fetchAuthorizedNetworkLocation();
          if (netLoc) {
            applyResolvedGpsLocation(netLoc);
            return;
          }
          setGpsNotice("Geolocation not supported. Search an address above");
        }
        setGpsLoading(false);
        inFlightRef.current = false;
        return;
      }

      const permBefore = await queryBrowserGeoPermission();

      try {
        const pos = await requestAccurateBrowserPosition();
        const accuracy = pos.coords.accuracy;
        const isCoarseBrowserFix =
          typeof accuracy === "number" &&
          accuracy > COARSE_ACCURACY_THRESHOLD_METERS;

        // If the browser only returned a very coarse >5km centroid, prefer postal-code-level network geolocation
        if (typeof accuracy === "number" && accuracy > 5000) {
          const netLoc = await fetchAuthorizedNetworkLocation();
          if (
            netLoc &&
            (netLoc.accuracyMeters ?? 10000) < accuracy
          ) {
            applyResolvedGpsLocation(netLoc);
            return;
          }
        }

        const gpsLoc = await reverseGeocodeCoordinates(
          pos.coords.latitude,
          pos.coords.longitude,
          {
            approximate: isCoarseBrowserFix,
            accuracyMeters:
              typeof accuracy === "number" ? Math.round(accuracy) : undefined,
          }
        );
        applyResolvedGpsLocation(gpsLoc);
      } catch (unknownErr) {
        const err = unknownErr as GeolocationPositionError | undefined;
        const permAfter = await queryBrowserGeoPermission();
        // err.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        const isSiteAuthorized =
          permBefore === "granted" ||
          permAfter === "granted" ||
          (typeof err?.code === "number" && err.code !== 1);

        if (isSiteAuthorized) {
          const fallbackLoc = await fetchAuthorizedNetworkLocation();
          if (fallbackLoc) {
            applyResolvedGpsLocation(fallbackLoc);
            return;
          }

          setGpsLoading(false);
          inFlightRef.current = false;
          setGpsNotice(
            "Could not determine device position. Search an address above"
          );
          return;
        }

        setGpsLoading(false);
        inFlightRef.current = false;
        setGpsNotice(
          silentOnDecline
            ? "Pick a neighborhood or search an address above"
            : "Location permission declined. Search an address above"
        );
      }
    },
    [applyResolvedGpsLocation]
  );

  // Initial location bootstrap + live browser URL-bar permission listener
  const bootstrappedRef = React.useRef(false);
  React.useEffect(() => {
    if (!keyStatusChecked || bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    let permStatus: PermissionStatus | null = null;
    let onPermChange: (() => void) | null = null;

    const savedLoc = getSavedLastLocation();

    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((perm) => {
          permStatus = perm;
          onPermChange = () => {
            if (perm.state === "granted") {
              requestGpsLocation(true);
            }
          };
          perm.addEventListener?.("change", onPermChange);

          if (savedLoc && savedLoc.source === "search") {
            setLocation(savedLoc);
          } else if (perm.state === "granted") {
            requestGpsLocation(true);
          } else if (savedLoc) {
            setLocation(savedLoc);
          } else {
            setGpsNotice("Click Near Me or search an address above");
          }
        })
        .catch(() => {
          if (savedLoc) {
            setLocation(savedLoc);
          } else {
            setGpsNotice("Click Near Me or search an address above");
          }
        });
    } else if (savedLoc) {
      setLocation(savedLoc);
    } else {
      setGpsNotice("Click Near Me or search an address above");
    }

    return () => {
      if (permStatus && onPermChange) {
        permStatus.removeEventListener?.("change", onPermChange);
      }
    };
  }, [keyStatusChecked, requestGpsLocation]);

  const selectLocation = React.useCallback((loc: GeoLocation) => {
    setGpsNotice(null);
    saveLastLocation(loc);
    setLocation(loc);
  }, []);

  const refreshCurrentLocation = React.useCallback(() => {
    setLocation((prev) => (prev ? { ...prev } : prev));
  }, []);

  return {
    location,
    selectLocation,
    refreshCurrentLocation,
    gpsLoading,
    gpsNotice,
    requestGpsLocation,
    radius,
    setRadius,
  };
}
