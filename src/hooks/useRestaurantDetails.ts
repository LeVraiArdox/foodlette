"use client";

import React from "react";
import type {
  Restaurant,
  RestaurantEnrichment,
  RestaurantImage,
  VenueFeatureBadge,
} from "@/types/restaurant";
import { parseCuisines } from "@/lib/cuisine-catalog";
import {
  getCachedDetails,
  recordApiUsage,
  setCachedDetails,
} from "@/lib/client-cache";

interface UseRestaurantDetailsOptions {
  restaurant: Restaurant | null;
  apiHeaders: Record<string, string>;
  onEnriched?: (fsqId: string, enrichment: RestaurantEnrichment) => void;
}

/**
 * Lazily fetches Foursquare Place Details (Photos, Tips, Hours, Rating) +
 * Panoramax open street-level imagery fallback for the inspected/winning restaurant,
 * backed by a 24-hour localStorage cache.
 */
export function useRestaurantDetails({
  restaurant,
  apiHeaders,
  onEnriched,
}: UseRestaurantDetailsOptions) {
  const [enrichment, setEnrichment] =
    React.useState<RestaurantEnrichment | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [activeImgIdx, setActiveImgIdx] = React.useState(0);
  const [failedUrls, setFailedUrls] = React.useState<Set<string>>(new Set());

  const onEnrichedRef = React.useRef(onEnriched);
  onEnrichedRef.current = onEnriched;

  React.useEffect(() => {
    if (!restaurant) {
      setEnrichment(null);
      setActiveImgIdx(0);
      setFailedUrls(new Set());
      return;
    }

    setActiveImgIdx(0);
    setFailedUrls(new Set());

    const localCached = getCachedDetails(restaurant.fsqId);
    if (localCached) {
      recordApiUsage(true);
      setEnrichment(localCached);
      setLoadingDetails(false);
      onEnrichedRef.current?.(restaurant.fsqId, localCached);
      return;
    }

    const controller = new AbortController();
    setLoadingDetails(true);
    setEnrichment(null);

    fetch(
      `/api/restaurant-details?fsqId=${encodeURIComponent(
        restaurant.fsqId
      )}&lat=${restaurant.lat}&lon=${restaurant.lon}&name=${encodeURIComponent(
        restaurant.name
      )}`,
      {
        headers: apiHeaders,
        signal: controller.signal,
      }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RestaurantEnrichment | null) => {
        if (!controller.signal.aborted && data) {
          recordApiUsage(Boolean(data.cached), 1);
          setEnrichment(data);
          setCachedDetails(restaurant.fsqId, data);
          onEnrichedRef.current?.(restaurant.fsqId, data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      });

    return () => controller.abort();
  }, [restaurant?.fsqId, apiHeaders]); // eslint-disable-line react-hooks/exhaustive-deps

  const galleryImages: RestaurantImage[] = React.useMemo(() => {
    if (!restaurant) return [];
    const legacyAmenity =
      restaurant.amenityCategory === "cafe"
        ? "cafe"
        : restaurant.amenityCategory === "quick"
        ? "fast_food"
        : "restaurant";
    const { meta } = parseCuisines(
      restaurant.cuisines.join(";"),
      legacyAmenity
    );
    const immediateFallbacks: RestaurantImage[] = meta.fallbackImages.map(
      (f) => ({
        url: f.url,
        caption: f.caption,
        source: "Cuisine Preview",
      })
    );

    const sourceList =
      enrichment && enrichment.images.length > 0
        ? [...enrichment.images, ...immediateFallbacks]
        : immediateFallbacks;

    const valid = sourceList.filter((img) => !failedUrls.has(img.url));
    return valid.length > 0 ? valid : immediateFallbacks;
  }, [restaurant, enrichment, failedUrls]);

  const markImageFailed = React.useCallback((url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url));
    setActiveImgIdx(0);
  }, []);

  const featureBadges: VenueFeatureBadge[] = React.useMemo(() => {
    if (!restaurant) return [];
    const badges: VenueFeatureBadge[] = [];
    const f = { ...restaurant.features, ...(enrichment?.features || {}) };
    if (f.dineIn) badges.push({ icon: "restaurant", label: "Dine-In" });
    if (f.takeaway)
      badges.push({ icon: "takeout_dining", label: "Takeout" });
    if (f.delivery)
      badges.push({ icon: "delivery_dining", label: "Delivery" });
    if (f.reservable)
      badges.push({ icon: "event_seat", label: "Reservations" });
    if (f.outdoorSeating)
      badges.push({ icon: "deck", label: "Outdoor Terrace" });
    if (f.vegetarian)
      badges.push({ icon: "eco", label: "Vegetarian Options" });
    if (f.wifi) badges.push({ icon: "wifi", label: "Free Wi-Fi" });
    if (f.wheelchairEntrance)
      badges.push({
        icon: "accessible",
        label: "Wheelchair Accessible",
      });
    if (f.acceptsCards)
      badges.push({
        icon: "credit_card",
        label: "Credit Cards Accepted",
      });
    return badges;
  }, [restaurant, enrichment]);

  return {
    enrichment,
    loadingDetails,
    galleryImages,
    activeImgIdx,
    setActiveImgIdx,
    markImageFailed,
    featureBadges,
  };
}
