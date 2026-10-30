"use client";

import React from "react";
import type {
  GeoLocation,
  Restaurant,
  RestaurantEnrichment,
} from "@/types/restaurant";
import {
  getCachedNearby,
  recordApiUsage,
  setCachedNearby,
} from "@/lib/client-cache";

interface UseNearbyRestaurantsOptions {
  location: GeoLocation | null;
  radius: number;
  keyStatusChecked: boolean;
  hasServerKey: boolean;
  clientApiKey: string;
  apiHeaders: Record<string, string>;
  onServerKeyDetected: (hasKey: boolean) => void;
  onApiKeyError: (errorMessage: string) => void;
  onClearApiKeyError: () => void;
  onRestaurantsLoaded: (restaurants: Restaurant[]) => void;
  onRestaurantsFailed: () => void;
}

/**
 * Fetches nearby restaurants via Foursquare Places API + Haversine calculus,
 * backed by a 24-hour browser localStorage cache (with local Haversine superset
 * radius reuse) and popup detail enrichment synchronization.
 */
export function useNearbyRestaurants({
  location,
  radius,
  keyStatusChecked,
  hasServerKey,
  clientApiKey,
  apiHeaders,
  onServerKeyDetected,
  onApiKeyError,
  onClearApiKeyError,
  onRestaurantsLoaded,
  onRestaurantsFailed,
}: UseNearbyRestaurantsOptions) {
  const [allRestaurants, setAllRestaurants] = React.useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] =
    React.useState<boolean>(false);
  const [lastLoadCached, setLastLoadCached] = React.useState<boolean>(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const callbacksRef = React.useRef({
    onServerKeyDetected,
    onApiKeyError,
    onClearApiKeyError,
    onRestaurantsLoaded,
    onRestaurantsFailed,
  });
  callbacksRef.current = {
    onServerKeyDetected,
    onApiKeyError,
    onClearApiKeyError,
    onRestaurantsLoaded,
    onRestaurantsFailed,
  };

  const locationLat = location?.lat;
  const locationLon = location?.lon;

  React.useEffect(() => {
    if (
      locationLat === undefined ||
      locationLon === undefined ||
      !keyStatusChecked
    ) {
      return;
    }
    if (!hasServerKey && !clientApiKey.trim()) {
      setLoadingRestaurants(false);
      return;
    }

    setApiError(null);
    callbacksRef.current.onClearApiKeyError();

    // 1) Check 24-hour browser localStorage cache (recomputing exact Haversine distances locally!)
    const cachedPool = getCachedNearby(locationLat, locationLon, radius);
    if (cachedPool && cachedPool.restaurants.length > 0) {
      recordApiUsage(true);
      setLastLoadCached(true);
      setAllRestaurants(cachedPool.restaurants);
      callbacksRef.current.onRestaurantsLoaded(cachedPool.restaurants);
      setLoadingRestaurants(false);
      return;
    }

    // 2) Single Foursquare Places Search call (backed by 24-hour server disk cache)
    const controller = new AbortController();
    setLoadingRestaurants(true);
    setLastLoadCached(false);

    fetch(
      `/api/restaurants?lat=${locationLat}&lon=${locationLon}&radius=${radius}`,
      {
        headers: apiHeaders,
        signal: controller.signal,
      }
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.hasServerKey !== undefined) {
          callbacksRef.current.onServerKeyDetected(Boolean(data.hasServerKey));
        }
        if (data.missingApiKey || data.invalidApiKey) {
          callbacksRef.current.onApiKeyError(
            data.error || "Invalid Foursquare Places API key."
          );
          throw new Error(data.error || "Foursquare API key error.");
        }
        if (!res.ok && data.error) {
          throw new Error(data.error);
        }
        return data;
      })
      .then(
        (data: {
          restaurants?: Restaurant[];
          cached?: boolean;
          error?: string;
        }) => {
          if (controller.signal.aborted) return;
          const list = data.restaurants || [];
          const wasServerCached = Boolean(data.cached);
          recordApiUsage(wasServerCached, 1);
          setLastLoadCached(wasServerCached);

          setAllRestaurants(list);
          callbacksRef.current.onRestaurantsLoaded(list);

          if (list.length > 0) {
            setCachedNearby(locationLat, locationLon, radius, {
              restaurants: list,
              radius,
            });
          }

          if (data.error && list.length === 0) {
            setApiError(data.error);
          }
        }
      )
      .catch((err) => {
        if (!controller.signal.aborted) {
          setApiError(
            err instanceof Error
              ? err.message
              : "Unable to load nearby restaurants from Foursquare Places API."
          );
          setAllRestaurants([]);
          callbacksRef.current.onRestaurantsFailed();
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingRestaurants(false);
        }
      });

    return () => controller.abort();
  }, [
    location,
    locationLat,
    locationLon,
    radius,
    keyStatusChecked,
    hasServerKey,
    clientApiKey,
    apiHeaders,
  ]);

  // Persist enriched rating/price/openStatus from single-winner popup back into the list & cache
  const handleRestaurantEnriched = React.useCallback(
    (fsqId: string, enrichment: RestaurantEnrichment) => {
      setAllRestaurants((prev) => {
        let changed = false;
        const next = prev.map((r) => {
          if (r.fsqId !== fsqId) return r;
          if (
            r.rating === enrichment.rating &&
            r.priceLabel === enrichment.priceLabel &&
            r.openStatus.isOpen === enrichment.openStatus?.isOpen
          ) {
            return r;
          }
          changed = true;
          return {
            ...r,
            rating: enrichment.rating ?? r.rating,
            userRatingCount: enrichment.userRatingCount ?? r.userRatingCount,
            priceLabel: enrichment.priceLabel ?? r.priceLabel,
            openStatus: enrichment.openStatus ?? r.openStatus,
            weekdayDescriptions:
              enrichment.weekdayDescriptions ?? r.weekdayDescriptions,
            description: enrichment.summary ?? r.description,
            tastes: enrichment.tastes ?? r.tastes,
            features: { ...r.features, ...(enrichment.features || {}) },
            contact: {
              ...r.contact,
              phone: enrichment.phone ?? r.contact.phone,
              email: enrichment.email ?? r.contact.email,
              website: enrichment.website ?? r.contact.website,
              instagram: enrichment.instagram ?? r.contact.instagram,
            },
          };
        });

        if (
          changed &&
          locationLat !== undefined &&
          locationLon !== undefined &&
          next.length > 0
        ) {
          setCachedNearby(locationLat, locationLon, radius, {
            restaurants: next,
            radius,
          });
        }
        return changed ? next : prev;
      });
    },
    [locationLat, locationLon, radius]
  );

  return {
    allRestaurants,
    loadingRestaurants,
    lastLoadCached,
    apiError,
    handleRestaurantEnriched,
  };
}
