"use client";

import React from "react";
import type { GeoLocation } from "@/types/restaurant";
import { RADIUS_OPTIONS } from "@/constants/foodlette";

interface LocationStatusRadiusBarProps {
  currentLocation: GeoLocation | null;
  lastLoadCached?: boolean;
  gpsNotice?: string | null;
  radius: number;
  onChangeRadius: (radius: number) => void;
}

export function LocationStatusRadiusBar({
  currentLocation,
  lastLoadCached,
  gpsNotice,
  radius,
  onChangeRadius,
}: LocationStatusRadiusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        {currentLocation ? (
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm max-w-full"
            style={{
              backgroundColor: "var(--md-sys-color-tertiary-container)",
              color: "var(--md-sys-color-on-tertiary-container)",
            }}
          >
            <span className="material-symbols-rounded filled text-[16px] shrink-0">
              {currentLocation.source === "gps" ? "my_location" : "pin_drop"}
            </span>
            <span className="m3-label-large-emphasized truncate">
              {currentLocation.label}
            </span>
            {currentLocation.subtitle && (
              <span className="opacity-75 text-xs hidden md:inline truncate max-w-[220px]">
                • {currentLocation.subtitle}
              </span>
            )}
          </div>
        ) : (
          <span
            className="text-xs px-2"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Click &ldquo;Near Me&rdquo;, pick a neighborhood, or search any
            address via BAN above
          </span>
        )}

        {gpsNotice && (
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "var(--md-sys-color-secondary-container)",
              color: "var(--md-sys-color-on-secondary-container)",
            }}
          >
            {gpsNotice}
          </span>
        )}
      </div>

      {/* M3 Expressive Connected Button Group for Radius */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold hidden sm:inline"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          Radius
        </span>
        <div
          className="m3-connected-group"
          role="group"
          aria-label="Search radius"
        >
          {RADIUS_OPTIONS.map((opt) => {
            const active = radius === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                data-active={active}
                onClick={() => onChangeRadius(opt.value)}
                className="m3-connected-item px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: active
                    ? "var(--md-sys-color-primary)"
                    : "var(--md-sys-color-surface-container-high)",
                  color: active
                    ? "var(--md-sys-color-on-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
