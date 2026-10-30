"use client";

import React from "react";
import type { Restaurant } from "@/types/restaurant";
import { formatHaversineDistance } from "@/lib/haversine";

interface PopupAddressHaversineGridProps {
  restaurant: Restaurant;
  weekdayHours?: string[];
}

export function PopupAddressHaversineGrid({
  restaurant,
  weekdayHours,
}: PopupAddressHaversineGridProps) {
  const [copiedAddr, setCopiedAddr] = React.useState(false);

  React.useEffect(() => {
    setCopiedAddr(false);
  }, [restaurant.id]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Foursquare Address Card */}
      <div
        className="p-4 rounded-[24px] flex flex-col justify-between gap-3"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container-high)",
        }}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--md-sys-color-primary-container)",
                color: "var(--md-sys-color-on-primary-container)",
              }}
            >
              <span className="material-symbols-rounded filled text-[20px]">
                location_on
              </span>
            </div>
            <div className="min-w-0">
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                Address
              </div>
              <div
                className="m3-title-medium-emphasized text-sm mt-0.5 break-words"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                {restaurant.address.formatted}
              </div>
              <div
                className="text-[11px] font-mono mt-1 opacity-75"
                style={{
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                WGS84: {restaurant.lat.toFixed(5)}, {restaurant.lon.toFixed(5)}
              </div>
            </div>
          </div>

          {weekdayHours && weekdayHours.length > 0 && (
            <div
              className="pt-2.5 border-t text-xs flex flex-col gap-0.5"
              style={{
                borderColor: "var(--md-sys-color-outline-variant)",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <strong style={{ color: "var(--md-sys-color-on-surface)" }}>
                Opening Hours:
              </strong>
              {weekdayHours.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(restaurant.address.formatted)
              .then(() => {
                setCopiedAddr(true);
                setTimeout(() => setCopiedAddr(false), 2000);
              })
              .catch(() => {});
          }}
          className="m3-expressive-btn self-start inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container-lowest)",
            color: "var(--md-sys-color-primary)",
          }}
        >
          <span className="material-symbols-rounded text-[15px]">
            {copiedAddr ? "check" : "content_copy"}
          </span>
          <span>{copiedAddr ? "Address copied!" : "Copy address"}</span>
        </button>
      </div>

      {/* Haversine Geodesic Distance & Travel Time Calculus Card */}
      <div
        className="p-4 rounded-[24px] flex flex-col justify-between gap-3"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container-high)",
        }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--md-sys-color-secondary-container)",
                color: "var(--md-sys-color-on-secondary-container)",
              }}
            >
              <span className="material-symbols-rounded filled text-[20px]">
                explore
              </span>
            </div>
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                Distance &amp; Time
              </div>
              <div
                className="m3-title-medium-emphasized text-sm mt-0.5"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                {formatHaversineDistance(restaurant.distanceMeters)} geodesic (
                {restaurant.bearingDegrees}° {restaurant.compassDirection})
              </div>
            </div>
          </div>

          <div
            className="text-xs mt-2"
            style={{
              color: "var(--md-sys-color-on-surface-variant)",
            }}
          >
            Estimated street path:{" "}
            <strong style={{ color: "var(--md-sys-color-on-surface)" }}>
              ~{formatHaversineDistance(restaurant.estimatedRouteMeters)}
            </strong>
          </div>
        </div>

        {/* Walk / Bike / Drive Haversine Pills */}
        <div className="grid grid-cols-3 gap-1.5">
          <div
            className="p-2 rounded-[16px] flex flex-col items-center text-center"
            style={{
              backgroundColor: "var(--md-sys-color-surface-container-lowest)",
            }}
          >
            <span
              className="material-symbols-rounded text-[18px]"
              style={{ color: "var(--md-sys-color-primary)" }}
            >
              directions_walk
            </span>
            <span
              className="text-xs font-bold mt-0.5"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              ~{restaurant.walkMinutes} min
            </span>
            <span
              className="text-[10px]"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              Walk
            </span>
          </div>

          <div
            className="p-2 rounded-[16px] flex flex-col items-center text-center"
            style={{
              backgroundColor: "var(--md-sys-color-surface-container-lowest)",
            }}
          >
            <span
              className="material-symbols-rounded text-[18px]"
              style={{ color: "var(--md-sys-color-secondary)" }}
            >
              directions_bike
            </span>
            <span
              className="text-xs font-bold mt-0.5"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              ~{restaurant.bikeMinutes} min
            </span>
            <span
              className="text-[10px]"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              Bike
            </span>
          </div>

          <div
            className="p-2 rounded-[16px] flex flex-col items-center text-center"
            style={{
              backgroundColor: "var(--md-sys-color-surface-container-lowest)",
            }}
          >
            <span
              className="material-symbols-rounded text-[18px]"
              style={{ color: "var(--md-sys-color-tertiary)" }}
            >
              directions_car
            </span>
            <span
              className="text-xs font-bold mt-0.5"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              ~{restaurant.driveMinutes} min
            </span>
            <span
              className="text-[10px]"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              Drive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
