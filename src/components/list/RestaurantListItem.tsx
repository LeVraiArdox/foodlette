"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/types/restaurant";
import type { WheelSlicePalette } from "@/lib/m3-theme";
import { getShapeForIndex } from "@/lib/shape-paths";
import { ExpressiveShapeBadge } from "@/components/ui/ExpressiveShapeBadge";
import { formatHaversineDistance } from "@/lib/haversine";

interface RestaurantListItemProps {
  restaurant: Restaurant;
  index: number;
  totalCount: number;
  isSelected: boolean;
  isHighlighted: boolean;
  sliceIdx?: number;
  slicePalette?: WheelSlicePalette;
  onInspect: (restaurant: Restaurant) => void;
  onToggle: (id: string) => void;
  itemRef?: (el: HTMLDivElement | null) => void;
}

export function RestaurantListItem({
  restaurant,
  index,
  totalCount,
  isSelected,
  isHighlighted,
  sliceIdx,
  slicePalette,
  onInspect,
  onToggle,
  itemRef,
}: RestaurantListItemProps) {
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  let borderRadius = "14px";
  if (isHighlighted || isSelected) {
    borderRadius = isHighlighted ? "26px" : "20px";
  } else if (isFirst && isLast) {
    borderRadius = "24px";
  } else if (isFirst) {
    borderRadius = "24px 24px 12px 12px";
  } else if (isLast) {
    borderRadius = "12px 12px 24px 24px";
  }

  return (
    <motion.div
      ref={itemRef}
      layout="position"
      className="group flex items-center gap-3 p-3 transition-all mx-2"
      style={{
        borderRadius,
        backgroundColor: isHighlighted
          ? "var(--md-sys-color-primary-container)"
          : isSelected
          ? "var(--md-sys-color-surface-container-highest)"
          : "var(--md-sys-color-surface-container)",
        boxShadow: isHighlighted
          ? "0 0 0 2px var(--md-sys-color-primary)"
          : "none",
        opacity: isSelected ? 1 : 0.72,
        transition:
          "border-radius var(--md-sys-motion-spring-fast-spatial), background-color var(--md-sys-motion-spring-fast-effects), opacity var(--md-sys-motion-spring-fast-effects)",
      }}
    >
      {/* Matching M3 Expressive Shape Avatar */}
      <button
        type="button"
        onClick={() => onInspect(restaurant)}
        title="View full restaurant details"
        className="cursor-pointer shrink-0"
      >
        <ExpressiveShapeBadge
          shape={getShapeForIndex(sliceIdx ?? index)}
          hoverShape="sunny8"
          size={44}
          fill={
            slicePalette
              ? slicePalette.fill
              : "var(--md-sys-color-surface-variant)"
          }
        >
          <span
            className="material-symbols-rounded filled text-[20px]"
            style={{
              color: slicePalette
                ? slicePalette.text
                : "var(--md-sys-color-on-surface-variant)",
            }}
          >
            {restaurant.primaryIcon}
          </span>
        </ExpressiveShapeBadge>
      </button>

      {/* Restaurant Info */}
      <button
        type="button"
        onClick={() => onInspect(restaurant)}
        className="flex-1 min-w-0 text-left cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <span
            className="m3-title-medium-emphasized text-sm truncate"
            style={{
              color: isHighlighted
                ? "var(--md-sys-color-on-primary-container)"
                : "var(--md-sys-color-on-surface)",
            }}
          >
            {restaurant.name}
          </span>
          {restaurant.openStatus.isOpen === true && (
            <span
              className="w-2 h-2 rounded-full shrink-0 bg-emerald-500"
              title={restaurant.openStatus.label}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {restaurant.rating !== undefined && (
            <span
              className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--md-sys-color-tertiary-container)",
                color: "var(--md-sys-color-on-tertiary-container)",
              }}
            >
              <span>★ {restaurant.rating.toFixed(1)}/10</span>
            </span>
          )}

          {restaurant.priceLabel && (
            <span
              className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--md-sys-color-surface-container-low)",
                color: "var(--md-sys-color-primary)",
              }}
            >
              {restaurant.priceLabel}
            </span>
          )}

          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[125px]"
            style={{
              backgroundColor: "var(--md-sys-color-secondary-container)",
              color: "var(--md-sys-color-on-secondary-container)",
            }}
          >
            {restaurant.cuisines[0]}
          </span>

          <span
            className="text-[11px]"
            style={{
              color: "var(--md-sys-color-on-surface-variant)",
            }}
            title={`Haversine geodesic: ${restaurant.distanceMeters} m (${restaurant.bearingDegrees}° ${restaurant.compassDirection})`}
          >
            {formatHaversineDistance(restaurant.distanceMeters)} • ~
            {restaurant.walkMinutes}m
          </span>
        </div>
      </button>

      {/* Right Controls: Info + Toggle on Wheel */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onInspect(restaurant)}
          title="Open details & OpenStreetMap popup"
          className="m3-expressive-btn w-8 h-8 flex items-center justify-center opacity-75 group-hover:opacity-100"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container-low)",
            color: "var(--md-sys-color-on-surface-variant)",
          }}
        >
          <span className="material-symbols-rounded text-[18px]">
            visibility
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggle(restaurant.id)}
          title={
            isSelected
              ? "Remove from roulette wheel"
              : "Add to roulette wheel"
          }
          className="m3-expressive-btn w-8 h-8 flex items-center justify-center"
          style={{
            backgroundColor: isSelected
              ? "var(--md-sys-color-primary)"
              : "var(--md-sys-color-surface-variant)",
            color: isSelected
              ? "var(--md-sys-color-on-primary)"
              : "var(--md-sys-color-on-surface-variant)",
          }}
        >
          <span
            className={`material-symbols-rounded text-[18px] ${
              isSelected ? "filled" : ""
            }`}
          >
            {isSelected ? "check" : "add"}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
