import { NextRequest, NextResponse } from "next/server";
import type { Restaurant } from "@/types/restaurant";
import { parseCuisines } from "@/lib/cuisine-catalog";
import {
  classifyFoursquareCategories,
  fetchFoursquareJson,
  type FoursquareCategoryRaw,
  FSQ_ALLOWED_FOOD_CATEGORY_SET,
  FSQ_MODERN_FOOD_CATEGORIES,
  FSQ_V3_FOOD_CATEGORIES,
  hasServerFoursquareKey,
  resolveFoursquareApiKey,
} from "@/lib/foursquare";
import {
  calculateHaversineMetrics,
  recomputeRestaurantsHaversine,
} from "@/lib/haversine";
import {
  getServerCache,
  setServerCache,
  snapCoordinateGrid,
  TTL_NEARBY_MS,
  withInflightDedup,
} from "@/lib/api-cache";

interface FoursquarePlaceItem {
  fsq_place_id?: string;
  fsq_id?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  geocodes?: {
    main?: {
      latitude?: number;
      longitude?: number;
    };
  };
  categories?: FoursquareCategoryRaw[];
  location?: {
    address?: string;
    formatted_address?: string;
    locality?: string;
    postcode?: string;
    country?: string;
  };
  tel?: string;
  email?: string;
  website?: string;
  social_media?: {
    instagram?: string;
  };
  chains?: { name?: string }[];
  closed_bucket?: string;
  date_closed?: string;
}

interface FoursquareSearchResponse {
  results?: FoursquarePlaceItem[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const radius = Math.min(
    Math.max(parseInt(searchParams.get("radius") || "1500", 10) || 1500, 300),
    15000
  );

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 }
    );
  }

  const { apiKey } = resolveFoursquareApiKey(request);
  if (!apiKey) {
    return NextResponse.json(
      {
        restaurants: [],
        missingApiKey: true,
        hasServerKey: hasServerFoursquareKey(),
        error:
          "Foursquare Places API key required. Add FOURSQUARE_API_KEY in .env / .env.local or paste your key in the top bar.",
      },
      { status: 401 }
    );
  }

  const snappedLat = snapCoordinateGrid(lat);
  const snappedLon = snapCoordinateGrid(lon);
  const cacheKey = `fsq:nearby:v2:${snappedLat}:${snappedLon}:${radius}`;

  const cached = getServerCache<Restaurant[]>(cacheKey);
  if (cached) {
    // Always recompute exact Haversine distance & travel times from caller's exact coordinates
    const recomputed = recomputeRestaurantsHaversine(cached, lat, lon);
    return NextResponse.json({
      restaurants: recomputed,
      totalFound: recomputed.length,
      cached: true,
      hasServerKey: hasServerFoursquareKey(),
    });
  }

  try {
    const outcome = await withInflightDedup(cacheKey, async () => {
      const modernPath = `/places/search?ll=${snappedLat},${snappedLon}&radius=${radius}&fsq_category_ids=${encodeURIComponent(
        FSQ_MODERN_FOOD_CATEGORIES
      )}&limit=50`;
      const legacyV3Path = `/places/search?ll=${snappedLat},${snappedLon}&radius=${radius}&categories=${encodeURIComponent(
        FSQ_V3_FOOD_CATEGORIES
      )}&limit=50`;

      const fsqRes = await fetchFoursquareJson<FoursquareSearchResponse>(
        apiKey,
        modernPath,
        legacyV3Path,
        7500
      );

      if (!fsqRes.ok || !fsqRes.data) {
        return {
          ok: false as const,
          status: fsqRes.status,
          errorMsg:
            fsqRes.errorMsg || "Foursquare Places API request failed.",
        };
      }

      const rawResults = Array.isArray(fsqRes.data.results)
        ? fsqRes.data.results
        : [];

      const seenIds = new Set<string>();
      const restaurants: Restaurant[] = [];

      for (const item of rawResults) {
        const fsqId = (item.fsq_place_id || item.fsq_id || "").trim();
        if (!fsqId || seenIds.has(fsqId)) continue;
        seenIds.add(fsqId);

        // Skip permanently closed venues
        if (
          item.date_closed ||
          (item.closed_bucket &&
            /closed/i.test(item.closed_bucket) &&
            !/likelyopen|veryopen/i.test(item.closed_bucket))
        ) {
          continue;
        }

        const name = item.name?.trim();
        const elLat = item.latitude ?? item.geocodes?.main?.latitude;
        const elLon = item.longitude ?? item.geocodes?.main?.longitude;
        if (!name || typeof elLat !== "number" || typeof elLon !== "number") {
          continue;
        }

        // Enforce the allowed 335 modern Foursquare restaurant category IDs when present
        const modernCatIds = (item.categories || [])
          .map((c) => c.fsq_category_id)
          .filter((id): id is string => Boolean(id));
        if (
          modernCatIds.length > 0 &&
          !modernCatIds.some((id) => FSQ_ALLOWED_FOOD_CATEGORY_SET.has(id))
        ) {
          continue;
        }

        // Compute Distance, Bearing, Walk, Bike & Drive times strictly via Haversine calculus!
        const haversine = calculateHaversineMetrics(lat, lon, elLat, elLon);

        const {
          amenityCategory,
          primaryCategoryName,
          rawCuisineHint,
        } = classifyFoursquareCategories(item.categories || []);

        const legacyAmenityForCatalog =
          amenityCategory === "cafe"
            ? "cafe"
            : amenityCategory === "quick"
            ? "fast_food"
            : "restaurant";

        const { cuisines: parsedCuisines, primaryIcon } = parseCuisines(
          rawCuisineHint,
          legacyAmenityForCatalog
        );

        const cuisines = [
          primaryCategoryName,
          ...parsedCuisines.filter(
            (c) => c.toLowerCase() !== primaryCategoryName.toLowerCase()
          ),
        ].slice(0, 3);

        const loc = item.location || {};
        const addressParts = [
          loc.address,
          [loc.postcode, loc.locality].filter(Boolean).join(" "),
        ].filter(Boolean);

        const formattedAddr =
          loc.formatted_address ||
          addressParts.join(", ") ||
          `${elLat.toFixed(5)}, ${elLon.toFixed(5)}`;

        const chains = (item.chains || [])
          .map((c) => c.name?.trim())
          .filter((n): n is string => Boolean(n));

        restaurants.push({
          id: fsqId,
          fsqId,
          name,
          primaryType: primaryCategoryName,
          amenityCategory,
          amenityLabel: primaryCategoryName,
          cuisines,
          primaryIcon,
          lat: elLat,
          lon: elLon,
          ...haversine,
          address: {
            formatted: formattedAddr,
            street: loc.address,
            postcode: loc.postcode,
            city: loc.locality,
            country: loc.country,
          },
          contact: {
            phone: item.tel,
            email: item.email,
            website: item.website,
            instagram: item.social_media?.instagram,
            foursquareUri: `https://foursquare.com/v/${encodeURIComponent(
              fsqId
            )}`,
            osmUri: `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLon}#map=18/${elLat}/${elLon}`,
          },
          openStatus: {
            isOpen:
              item.closed_bucket && /open/i.test(item.closed_bucket)
                ? true
                : null,
            label:
              item.closed_bucket && /open/i.test(item.closed_bucket)
                ? "Likely open"
                : "Details on select",
          },
          features: {},
          chains: chains.length > 0 ? chains : undefined,
        });
      }

      restaurants.sort((a, b) => a.distanceMeters - b.distanceMeters);

      if (restaurants.length > 0) {
        setServerCache(cacheKey, restaurants, TTL_NEARBY_MS);
      }

      return { ok: true as const, restaurants };
    });

    if (!outcome.ok) {
      const status = outcome.status || 502;
      const isAuthErr = status === 401 || status === 403;
      return NextResponse.json(
        {
          restaurants: [],
          invalidApiKey: isAuthErr,
          hasServerKey: hasServerFoursquareKey(),
          error: outcome.errorMsg,
        },
        { status }
      );
    }

    const recomputed = recomputeRestaurantsHaversine(
      outcome.restaurants,
      lat,
      lon
    );

    return NextResponse.json({
      restaurants: recomputed,
      totalFound: recomputed.length,
      cached: false,
      hasServerKey: hasServerFoursquareKey(),
    });
  } catch (err) {
    console.error("Foursquare Places API error:", err);
    return NextResponse.json(
      {
        restaurants: [],
        hasServerKey: hasServerFoursquareKey(),
        error:
          "Could not reach Foursquare Places API. Check your network or Foursquare API key.",
      },
      { status: 502 }
    );
  }
}
