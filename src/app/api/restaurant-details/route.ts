import { NextRequest, NextResponse } from "next/server";
import type {
  RestaurantEnrichment,
  RestaurantImage,
  RestaurantReview,
} from "@/types/restaurant";
import {
  fetchFoursquareJson,
  fetchPanoramaxStreetPhotos,
  formatFoursquarePrice,
  resolveFoursquareApiKey,
} from "@/lib/foursquare";
import {
  getServerCache,
  setServerCache,
  TTL_DETAILS_MS,
  withInflightDedup,
} from "@/lib/api-cache";
import {
  guardApiRequest,
  isValidCoordinates,
  isValidFsqPlaceId,
} from "@/lib/api-security";
import {
  sanitizeExternalHttpUrl,
  sanitizeInstagramHandle,
} from "@/lib/sanitize";

interface FoursquarePhotoItem {
  prefix?: string;
  suffix?: string;
  created_at?: string;
}

interface FoursquareTipItem {
  text?: string;
  created_at?: string;
}

interface FoursquarePlaceDetailsRaw {
  description?: string;
  rating?: number;
  stats?: {
    total_ratings?: number;
  };
  price?: number;
  tel?: string;
  email?: string;
  website?: string;
  social_media?: {
    instagram?: string;
  };
  hours?: {
    display?: string;
    open_now?: boolean;
  };
  tastes?: string[];
  photos?: FoursquarePhotoItem[];
  tips?: FoursquareTipItem[];
  features?: {
    payment?: {
      credit_cards?: { accepts_credit_cards?: boolean };
    };
    food_and_drink?: {
      meals?: {
        breakfast?: boolean;
        brunch?: boolean;
        lunch?: boolean;
        dinner?: boolean;
      };
    };
    services?: {
      delivery?: boolean;
      takeout?: boolean;
      dine_in?: { reservations?: boolean };
    };
    amenities?: {
      outdoor_seating?: boolean;
      wheelchair_accessible?: boolean;
      wifi?: string;
    };
    attributes?: {
      vegetarian_diet?: string;
    };
  };
}

// Track keys whose account plan does not include Foursquare Premium fields
// so we never repeat 403/402 Premium detail requests during the session.
const proOnlyKeyFingerprints = new Set<string>();

export async function GET(request: NextRequest) {
  const blocked = guardApiRequest(request, "details", 45);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const fsqId = searchParams.get("fsqId")?.trim();
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const name = (searchParams.get("name")?.trim() || "Restaurant").slice(0, 120);

  if (!fsqId) {
    return NextResponse.json({ images: [], reviews: [] });
  }

  if (!isValidFsqPlaceId(fsqId)) {
    return NextResponse.json(
      { error: "Invalid venue identifier.", images: [], reviews: [] },
      { status: 400 }
    );
  }

  const { apiKey } = resolveFoursquareApiKey(request);
  if (!apiKey) {
    return NextResponse.json(
      {
        missingApiKey: true,
        images: [],
        reviews: [],
      },
      { status: 401 }
    );
  }

  const cacheKey = `fsq:details:v1:${fsqId}`;
  const cached = getServerCache<RestaurantEnrichment>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const enrichment = await withInflightDedup(cacheKey, async () => {
      const keyFp = apiKey.slice(-8);
      let details: FoursquarePlaceDetailsRaw | null = null;

      if (!proOnlyKeyFingerprints.has(keyFp)) {
        const fields = [
          "description",
          "rating",
          "stats",
          "price",
          "hours",
          "tastes",
          "features",
          "photos",
          "tips",
          "tel",
          "email",
          "website",
          "social_media",
        ].join(",");

        const path = `/places/${encodeURIComponent(fsqId)}?fields=${fields}`;
        const fsqRes = await fetchFoursquareJson<FoursquarePlaceDetailsRaw>(
          apiKey,
          path,
          path,
          6000
        );

        if (fsqRes.ok && fsqRes.data) {
          details = fsqRes.data;
        } else if (fsqRes.status === 402 || fsqRes.status === 403) {
          // Account is on Foursquare Free (Pro-only) tier — remember this so
          // subsequent popups skip Premium requests and use 0 extra Foursquare credits!
          proOnlyKeyFingerprints.add(keyFp);
        }
      }

      const images: RestaurantImage[] = [];

      if (details?.photos && Array.isArray(details.photos)) {
        details.photos.slice(0, 4).forEach((ph, idx) => {
          if (ph.prefix && ph.suffix) {
            const safePhotoUrl = sanitizeExternalHttpUrl(
              `${ph.prefix}900x680${ph.suffix}`,
              { httpsOnly: true }
            );
            if (safePhotoUrl) {
              images.push({
                url: safePhotoUrl,
                caption: `${name} — Foursquare Photo ${idx + 1}`,
                source: "Foursquare Photo",
                attribution: "Foursquare",
              });
            }
          }
        });
      }

      // Open-data Panoramax (IGN / OpenStreetMap France) street-level imagery fallback
      // when Foursquare Free-tier keys don't include Premium photos!
      if (images.length === 0 && isValidCoordinates(lat, lon)) {
        const streetImgs = await fetchPanoramaxStreetPhotos(lat, lon, name);
        images.push(...streetImgs);
      }

      const reviews: RestaurantReview[] = (
        Array.isArray(details?.tips) ? details!.tips : []
      )
        .filter((t) => Boolean(t.text?.trim()))
        .slice(0, 4)
        .map((t, idx) => {
          let relativeTime = "";
          if (t.created_at) {
            const d = new Date(t.created_at);
            if (!isNaN(d.getTime())) {
              relativeTime = d.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "short",
              });
            }
          }
          return {
            authorName: `Foursquare Tip #${idx + 1}`,
            relativeTime,
            text: t.text!.trim(),
          };
        });

      const weekdayDescriptions = details?.hours?.display
        ? details.hours.display
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const openNow = details?.hours?.open_now ?? null;
      const openStatus =
        openNow === true
          ? { isOpen: true, label: "Open now" }
          : openNow === false
          ? { isOpen: false, label: "Closed now" }
          : undefined;

      const feat = details?.features;
      const result: RestaurantEnrichment = {
        images,
        reviews,
        rating: details?.rating,
        userRatingCount: details?.stats?.total_ratings,
        openStatus,
        priceLabel: formatFoursquarePrice(details?.price),
        summary: details?.description,
        weekdayDescriptions,
        tastes: Array.isArray(details?.tastes)
          ? details!.tastes.slice(0, 8)
          : undefined,
        features: feat
          ? {
              delivery: feat.services?.delivery,
              takeaway: feat.services?.takeout,
              reservable: feat.services?.dine_in?.reservations,
              outdoorSeating: feat.amenities?.outdoor_seating,
              wheelchairEntrance: feat.amenities?.wheelchair_accessible,
              wifi: Boolean(
                feat.amenities?.wifi && feat.amenities.wifi !== "no"
              ),
              acceptsCards:
                feat.payment?.credit_cards?.accepts_credit_cards,
              vegetarian: Boolean(feat.attributes?.vegetarian_diet),
            }
          : undefined,
        phone: details?.tel,
        email: details?.email,
        website: sanitizeExternalHttpUrl(details?.website),
        instagram: sanitizeInstagramHandle(details?.social_media?.instagram),
      };

      setServerCache(cacheKey, result, TTL_DETAILS_MS);
      return result;
    });

    return NextResponse.json({ ...enrichment, cached: false });
  } catch {
    return NextResponse.json({ images: [], reviews: [], cached: true });
  }
}
