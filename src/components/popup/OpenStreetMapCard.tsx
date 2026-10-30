"use client";

import React from "react";
import type { GeoLocation, Restaurant } from "@/types/restaurant";
import { formatHaversineDistance } from "@/lib/haversine";
import { escapeHtml, sanitizeMaterialIconName } from "@/lib/sanitize";

interface OpenStreetMapCardProps {
  restaurant: Restaurant;
  originLocation?: GeoLocation | null;
}

/**
 * Interactive OpenStreetMap Cartography Display (Leaflet + official OSM tiles)
 * with custom Material 3 Expressive markers and a geodesic Haversine vector line
 * connecting the user's BAN/GPS origin to the selected restaurant.
 */
export function OpenStreetMapCard({
  restaurant,
  originLocation,
}: OpenStreetMapCardProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<import("leaflet").Map | null>(null);
  const [viewMode, setViewMode] = React.useState<"venue" | "haversine">(
    originLocation ? "haversine" : "venue"
  );

  const hasDistinctOrigin = Boolean(
    originLocation &&
      (Math.abs(originLocation.lat - restaurant.lat) > 0.0001 ||
        Math.abs(originLocation.lon - restaurant.lon) > 0.0001)
  );

  React.useEffect(() => {
    setViewMode(hasDistinctOrigin ? "haversine" : "venue");
  }, [restaurant.id, hasDistinctOrigin]);

  React.useEffect(() => {
    let cancelled = false;

    async function mountMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      // Clean up any existing map instance before re-initializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [restaurant.lat, restaurant.lon],
        zoom: 17,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Official OpenStreetMap Standard Tile Layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Custom M3 Expressive Restaurant Marker (`divIcon` avoids bundler PNG issues)
      const safeIconName = sanitizeMaterialIconName(
        restaurant.primaryIcon,
        "restaurant"
      );
      const venueIcon = L.divIcon({
        className: "foodlette-osm-marker",
        html: `<div style="
          width: 40px;
          height: 40px;
          border-radius: 16px 16px 16px 4px;
          transform: rotate(-45deg);
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: 3px solid var(--md-sys-color-surface-container-lowest);
          box-shadow: 0 6px 16px rgba(0,0,0,0.32);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span class="material-symbols-rounded filled" style="transform: rotate(45deg); font-size: 20px;">
            ${safeIconName}
          </span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 38],
        popupAnchor: [0, -36],
      });

      const venueMarker = L.marker([restaurant.lat, restaurant.lon], {
        icon: venueIcon,
      }).addTo(map);

      venueMarker.bindPopup(
        `<strong>${escapeHtml(restaurant.name)}</strong><br/><span style="font-size:12px;">${escapeHtml(
          restaurant.address.formatted
        )}</span><br/><span style="font-size:11px;opacity:0.8;">Haversine: ${escapeHtml(
          formatHaversineDistance(restaurant.distanceMeters)
        )} (${escapeHtml(restaurant.compassDirection)})</span>`
      );

      if (hasDistinctOrigin && originLocation) {
        const originIcon = L.divIcon({
          className: "foodlette-osm-origin",
          html: `<div style="
            width: 22px;
            height: 22px;
            border-radius: 9999px;
            background: var(--md-sys-color-tertiary);
            border: 3px solid var(--md-sys-color-surface-container-lowest);
            box-shadow: 0 3px 10px rgba(0,0,0,0.28);
          "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([originLocation.lat, originLocation.lon], {
          icon: originIcon,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(
              originLocation.label
            )}</strong><br/><span style="font-size:11px;">Starting point</span>`
          );

        // Draw Haversine Geodesic Great-Circle Vector Line on OpenStreetMap
        const geodesicLine = L.polyline(
          [
            [originLocation.lat, originLocation.lon],
            [restaurant.lat, restaurant.lon],
          ],
          {
            color: "#8F4C38",
            weight: 3.5,
            dashArray: "8, 8",
            opacity: 0.85,
          }
        ).addTo(map);

        if (viewMode === "haversine") {
          map.fitBounds(geodesicLine.getBounds(), {
            padding: [42, 42],
            maxZoom: 17,
          });
        } else {
          map.setView([restaurant.lat, restaurant.lon], 17);
        }
      } else {
        map.setView([restaurant.lat, restaurant.lon], 17);
      }
    }

    mountMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    restaurant.id,
    restaurant.lat,
    restaurant.lon,
    restaurant.name,
    restaurant.primaryIcon,
    restaurant.address.formatted,
    restaurant.distanceMeters,
    restaurant.compassDirection,
    hasDistinctOrigin,
    originLocation,
    viewMode,
  ]);

  return (
    <div
      className="rounded-[24px] overflow-hidden border"
      style={{
        borderColor: "var(--md-sys-color-outline-variant)",
        backgroundColor: "var(--md-sys-color-surface-container)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-rounded filled text-[17px]"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            map
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            OpenStreetMap Cartography
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasDistinctOrigin && (
            <button
              type="button"
              onClick={() =>
                setViewMode((m) => (m === "haversine" ? "venue" : "haversine"))
              }
              className="m3-expressive-btn px-2.5 py-1 text-[11px] font-bold"
              style={{
                backgroundColor: "var(--md-sys-color-secondary-container)",
                color: "var(--md-sys-color-on-secondary-container)",
              }}
            >
              {viewMode === "haversine"
                ? "Zoom to Street"
                : "Show Haversine Vector"}
            </button>
          )}

          <a
            href={restaurant.contact.osmUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold hover:underline inline-flex items-center gap-1"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            <span>OpenStreetMap</span>
            <span className="material-symbols-rounded text-[14px]">
              open_in_new
            </span>
          </a>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-56 z-0"
        aria-label={`OpenStreetMap of ${restaurant.name}`}
      />
    </div>
  );
}
