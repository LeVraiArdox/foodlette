import { NextRequest, NextResponse } from "next/server";
import type { LocationSuggestion } from "@/types/restaurant";
import { hasServerFoursquareKey } from "@/lib/foursquare";
import {
  extractTrustedPublicClientIp,
  guardApiRequest,
  isValidCoordinates,
} from "@/lib/api-security";
import {
  getServerCache,
  setServerCache,
  TTL_GEOCODE_MS,
  withInflightDedup,
} from "@/lib/api-cache";

/**
 * Official French National Address Database (Base Adresse Nationale — BAN):
 * Service page: https://www.data.gouv.fr/dataservices/api-adresse-base-adresse-nationale-ban
 * Official IGN Géoplateforme production endpoint: https://data.geopf.fr/geocodage
 *
 * 100% Free Open Data (Etalab Open Licence 2.0), NO API key required!
 */
const BAN_GEOCODAGE_BASE = "https://data.geopf.fr/geocodage";
const TTL_IP_GEO_MS = 60 * 60 * 1000; // 1 hour cache for IP geolocation fallback

interface BanFeature {
  geometry?: {
    type?: string;
    coordinates?: [number, number]; // [lon, lat]
  };
  properties?: {
    id?: string;
    banId?: string;
    label?: string;
    name?: string;
    postcode?: string;
    city?: string;
    district?: string;
    context?: string;
    type?: string;
    street?: string;
  };
}

interface BanFeatureCollection {
  features?: BanFeature[];
}

interface ReverseBanResult {
  label: string;
  subtitle: string;
  city?: string;
  postcode?: string;
  context?: string;
  banId?: string;
  cached: boolean;
}

interface IpGeoCoordinateResult {
  lat: number;
  lon: number;
  city?: string;
  postal?: string;
  region?: string;
}

async function reverseGeocodeBan(
  latitude: number,
  longitude: number
): Promise<ReverseBanResult | null> {
  const revCacheKey = `ban:rev3:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  const cachedRev = getServerCache<{
    label: string;
    subtitle: string;
    city?: string;
    postcode?: string;
    context?: string;
    banId?: string;
  }>(revCacheKey);
  if (cachedRev) {
    return { ...cachedRev, cached: true };
  }

  try {
    const result = await withInflightDedup(revCacheKey, async () => {
      const res = await fetch(
        `${BAN_GEOCODAGE_BASE}/reverse?lon=${encodeURIComponent(
          longitude.toString()
        )}&lat=${encodeURIComponent(latitude.toString())}&limit=1`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(4500),
        }
      );

      if (!res.ok) return null;
      const data = (await res.json()) as BanFeatureCollection;
      const feat = data.features?.[0];
      const props = feat?.properties;
      if (!props) return null;

      const label =
        props.name ||
        props.district ||
        props.city ||
        props.label ||
        "Position actuelle";
      const subtitleParts = [
        props.postcode && props.city
          ? `${props.postcode} ${props.city}`
          : props.city,
        props.district && props.district !== label ? props.district : undefined,
        props.context,
      ].filter(Boolean);

      const payload = {
        label,
        subtitle:
          subtitleParts.join(" • ") ||
          props.label ||
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: props.city,
        postcode: props.postcode,
        context: props.context,
        banId: props.banId || props.id,
      };
      setServerCache(revCacheKey, payload, TTL_GEOCODE_MS);
      return payload;
    });

    if (result) {
      return { ...result, cached: false };
    }
  } catch {
    // Fallback handled by caller if coordinates are outside BAN coverage
  }
  return null;
}

/**
 * 100% platform-independent HTTPS network geolocation cascade when a browser's
 * W3C `navigator.geolocation` provider is unavailable.
 *
 * Uses `ipinfo.io` first (active probe + RFC 8805 Geofeed / RIPE postal-code accuracy,
 * avoiding generic capital-city ISP centroids), with `ipwho.is` and `get.geojs.io` failovers.
 */
async function resolveNetworkIpCoordinates(
  publicIp: string | null
): Promise<IpGeoCoordinateResult | null> {
  const cacheKey = `ipgeo:v2:${publicIp || "self"}`;
  const cached = getServerCache<IpGeoCoordinateResult>(cacheKey);
  if (cached) return cached;

  return withInflightDedup(cacheKey, async () => {
    // Provider 1: ipinfo.io (postal-code / commune precision via active probe + Geofeed data)
    try {
      const url = publicIp
        ? `https://ipinfo.io/${encodeURIComponent(publicIp)}/json`
        : "https://ipinfo.io/json";
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          bogon?: boolean;
          loc?: string;
          city?: string;
          postal?: string;
          region?: string;
        };
        if (!data.bogon && typeof data.loc === "string") {
          const [latStr, lonStr] = data.loc.split(",");
          const lat = Number(latStr);
          const lon = Number(lonStr);
          if (!isNaN(lat) && !isNaN(lon)) {
            const hit: IpGeoCoordinateResult = {
              lat,
              lon,
              city: data.city,
              postal: data.postal,
              region: data.region,
            };
            setServerCache(cacheKey, hit, TTL_IP_GEO_MS);
            return hit;
          }
        }
      }
    } catch {
      // Fall through to Provider 2
    }

    // Provider 2: ipwho.is
    try {
      const url = publicIp
        ? `https://ipwho.is/${encodeURIComponent(publicIp)}`
        : "https://ipwho.is/";
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          latitude?: number;
          longitude?: number;
          city?: string;
          postal?: string;
          region?: string;
        };
        if (
          data.success !== false &&
          typeof data.latitude === "number" &&
          typeof data.longitude === "number"
        ) {
          const hit: IpGeoCoordinateResult = {
            lat: data.latitude,
            lon: data.longitude,
            city: data.city,
            postal: data.postal,
            region: data.region,
          };
          setServerCache(cacheKey, hit, TTL_IP_GEO_MS);
          return hit;
        }
      }
    } catch {
      // Fall through to Provider 3
    }

    // Provider 3: GeoJS (get.geojs.io)
    try {
      const url = publicIp
        ? `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(publicIp)}.json`
        : "https://get.geojs.io/v1/ip/geo.json";
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          latitude?: string | number;
          longitude?: string | number;
          city?: string;
          region?: string;
        };
        const lat = Number(data.latitude);
        const lon = Number(data.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          const hit: IpGeoCoordinateResult = {
            lat,
            lon,
            city: data.city,
            region: data.region,
          };
          setServerCache(cacheKey, hit, TTL_IP_GEO_MS);
          return hit;
        }
      }
    } catch {
      // All IP providers unreachable
    }

    return null;
  });
}

export async function GET(request: NextRequest) {
  const blocked = guardApiRequest(request, "geocode", 90);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().slice(0, 160);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const statusCheck = searchParams.get("status") === "1";
  const locateFallback =
    searchParams.get("locate") === "1" || searchParams.get("ip") === "1";
  const isApproximateCoord = searchParams.get("approximate") === "1";

  if (statusCheck) {
    return NextResponse.json({
      hasServerKey: hasServerFoursquareKey(),
    });
  }

  // 0) Platform-Independent Network Geolocation Fallback + BAN Commune Lookup
  //    (used when an authorized browser lacks a working W3C geolocation backend)
  if (locateFallback) {
    const clientIp = extractTrustedPublicClientIp(request);
    const ipGeo = await resolveNetworkIpCoordinates(clientIp);
    if (!ipGeo) {
      return NextResponse.json(
        { error: "Could not resolve network location." },
        { status: 502 }
      );
    }

    const banRev = await reverseGeocodeBan(ipGeo.lat, ipGeo.lon);
    const cityName = banRev?.city || ipGeo.city || "Current Area";
    const postcode = banRev?.postcode || ipGeo.postal;
    const fallbackLabel = postcode ? `${cityName} (${postcode})` : cityName;
    const fallbackSubtitle =
      [banRev?.context || ipGeo.region, "Approx. network location"]
        .filter(Boolean)
        .join(" • ") || `${ipGeo.lat.toFixed(4)}, ${ipGeo.lon.toFixed(4)}`;

    return NextResponse.json({
      lat: ipGeo.lat,
      lon: ipGeo.lon,
      label: fallbackLabel,
      subtitle: fallbackSubtitle,
      accuracyMeters: 1500,
      approximate: true,
      method: "ip",
    });
  }

  // 1) Reverse GPS Geocoding via Base Adresse Nationale (BAN) `/reverse`
  if (lat && lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isValidCoordinates(latitude, longitude)) {
      return NextResponse.json(
        { error: "Valid lat (-90..90) and lon (-180..180) are required." },
        { status: 400 }
      );
    }

    const banRev = await reverseGeocodeBan(latitude, longitude);
    if (banRev) {
      if (isApproximateCoord) {
        const cityName = banRev.city || banRev.label;
        const label = banRev.postcode
          ? `${cityName} (${banRev.postcode})`
          : cityName;
        return NextResponse.json({
          label,
          subtitle:
            [banRev.context, "Approx. network location"]
              .filter(Boolean)
              .join(" • ") || banRev.subtitle,
          cached: banRev.cached,
        });
      }
      return NextResponse.json(banRev);
    }

    return NextResponse.json({
      label: isApproximateCoord
        ? "Approximate Position"
        : "Current GPS Position",
      subtitle: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    });
  }

  // 2) Forward Geocoding & Address Autocomplete via Base Adresse Nationale (BAN) `/search`
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const normalized = query.toLowerCase().replace(/\s+/g, " ");
  const cacheKey = `ban:search:${normalized}`;

  const cached = getServerCache<LocationSuggestion[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ suggestions: cached, cached: true });
  }

  try {
    const suggestions = await withInflightDedup(cacheKey, async () => {
      const res = await fetch(
        `${BAN_GEOCODAGE_BASE}/search?q=${encodeURIComponent(query)}&limit=6`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(4500),
        }
      );

      if (!res.ok) {
        throw new Error(`BAN API HTTP ${res.status}`);
      }

      const data = (await res.json()) as BanFeatureCollection;
      const features = Array.isArray(data.features) ? data.features : [];

      const mapped: LocationSuggestion[] = [];
      features.forEach((feat, idx) => {
        const coords = feat.geometry?.coordinates;
        const props = feat.properties;
        if (
          !coords ||
          coords.length < 2 ||
          typeof coords[0] !== "number" ||
          typeof coords[1] !== "number" ||
          !props
        ) {
          return;
        }

        const [featLon, featLat] = coords;
        const banId = props.banId || props.id || `${featLat}-${featLon}`;
        const shortName = props.name || props.city || props.label || query;
        const cityLine =
          props.postcode && props.city
            ? `${props.postcode} ${props.city}`
            : props.city || "";
        const subtitle = [
          cityLine !== shortName ? cityLine : undefined,
          props.district && props.district !== shortName
            ? props.district
            : undefined,
          props.context,
        ]
          .filter(Boolean)
          .join(" • ");

        mapped.push({
          id: `ban-${banId}-${idx}`,
          banId,
          shortName,
          subtitle,
          displayName: props.label || `${shortName}, ${subtitle}`,
          lat: featLat,
          lon: featLon,
          type: props.type || "address",
        });
      });

      setServerCache(cacheKey, mapped, TTL_GEOCODE_MS);
      return mapped;
    });

    return NextResponse.json({ suggestions, cached: false });
  } catch {
    return NextResponse.json(
      {
        suggestions: [],
        error:
          "Could not reach Base Adresse Nationale (data.geopf.fr/geocodage).",
      },
      { status: 502 }
    );
  }
}
