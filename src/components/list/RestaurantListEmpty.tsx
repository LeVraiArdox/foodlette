"use client";

import React from "react";
import { ExpressiveShapeBadge } from "@/components/ui/ExpressiveShapeBadge";

export function RestaurantListLoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center gap-2">
      <span
        className="text-sm font-medium"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        Querying Foursquare Places API...
      </span>
    </div>
  );
}

export function RestaurantListEmptyState() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-[24px]"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container)",
      }}
    >
      <ExpressiveShapeBadge
        shape="clover4"
        size={54}
        fill="var(--md-sys-color-secondary-container)"
      >
        <span
          className="material-symbols-rounded text-[26px]"
          style={{ color: "var(--md-sys-color-on-secondary-container)" }}
        >
          no_meals
        </span>
      </ExpressiveShapeBadge>
      <p
        className="m3-title-medium-emphasized text-base mt-3"
        style={{ color: "var(--md-sys-color-on-surface)" }}
      >
        No spots loaded yet
      </p>
      <p
        className="text-xs mt-1 max-w-[250px]"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        Set your Foursquare Places API key in the top bar and pick any French
        address via BAN above.
      </p>
    </div>
  );
}
