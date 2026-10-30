"use client";

import React from "react";
import type { Restaurant } from "@/types/restaurant";
import { ExpressiveShapeBadge } from "@/components/ui/ExpressiveShapeBadge";

interface PopupHeaderSummaryProps {
  restaurant: Restaurant;
  rating?: number;
  ratingCount?: number;
  priceLabel?: string;
  openStatus: {
    isOpen: boolean | null;
    label: string;
  };
  tastes: string[];
  description?: string;
}

export function PopupHeaderSummary({
  restaurant,
  rating,
  ratingCount,
  priceLabel,
  openStatus,
  tastes,
  description,
}: PopupHeaderSummaryProps) {
  return (
    <>
      {/* Editorial Title + Foursquare 10-pt Rating, Price & Open Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--md-sys-color-secondary-container)",
                color: "var(--md-sys-color-on-secondary-container)",
              }}
            >
              {restaurant.amenityLabel}
            </span>

            {rating !== undefined && (
              <span
                className="inline-flex items-center gap-1 text-xs m3-label-large-emphasized px-3 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--md-sys-color-tertiary-container)",
                  color: "var(--md-sys-color-on-tertiary-container)",
                }}
              >
                <span>★ {rating.toFixed(1)} / 10</span>
                {ratingCount !== undefined && (
                  <span className="opacity-80 font-medium">
                    ({ratingCount.toLocaleString()} ratings)
                  </span>
                )}
              </span>
            )}

            {priceLabel && (
              <span
                className="text-xs m3-label-large-emphasized px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    "var(--md-sys-color-surface-container-highest)",
                  color: "var(--md-sys-color-primary)",
                }}
              >
                {priceLabel}
              </span>
            )}

            {openStatus.isOpen !== null && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: openStatus.isOpen
                    ? "var(--md-sys-color-primary-container)"
                    : "var(--md-sys-color-error-container)",
                  color: openStatus.isOpen
                    ? "var(--md-sys-color-on-primary-container)"
                    : "var(--md-sys-color-on-error-container)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {openStatus.label}
              </span>
            )}
          </div>

          <h2
            id="popup-restaurant-title"
            className="m3-headline-large-emphasized text-2xl sm:text-3xl break-words"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            {restaurant.name}
          </h2>
        </div>

        <ExpressiveShapeBadge
          shape="cookie12"
          hoverShape="sunny8"
          size={60}
          fill="var(--md-sys-color-primary-container)"
        >
          <span
            className="material-symbols-rounded filled text-[28px]"
            style={{
              color: "var(--md-sys-color-on-primary-container)",
            }}
          >
            {restaurant.primaryIcon}
          </span>
        </ExpressiveShapeBadge>
      </div>

      {/* Foursquare Editorial Description */}
      {description && (
        <div
          className="p-4 rounded-[22px] text-sm leading-relaxed"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container)",
            color: "var(--md-sys-color-on-surface)",
          }}
        >
          {description}
        </div>
      )}
    </>
  );
}
