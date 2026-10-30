"use client";

import React from "react";
import type { RestaurantReview } from "@/types/restaurant";
import { getShapeForIndex } from "@/lib/shape-paths";
import { ExpressiveShapeBadge } from "@/components/ui/ExpressiveShapeBadge";

interface PopupTipsSectionProps {
  reviews: RestaurantReview[];
}

export function PopupTipsSection({ reviews }: PopupTipsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <div>
      <h3
        className="text-xs font-bold uppercase tracking-wider mb-2.5 px-1"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        Foursquare Community Tips
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {reviews.map((rv, idx) => (
          <div
            key={`${rv.authorName}-${idx}`}
            className="p-3.5 rounded-[22px] flex flex-col gap-2"
            style={{
              backgroundColor: "var(--md-sys-color-surface-container)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ExpressiveShapeBadge
                  shape={getShapeForIndex(idx)}
                  size={30}
                  fill="var(--md-sys-color-secondary-container)"
                >
                  <span
                    className="material-symbols-rounded text-[15px]"
                    style={{
                      color: "var(--md-sys-color-on-secondary-container)",
                    }}
                  >
                    chat_bubble
                  </span>
                </ExpressiveShapeBadge>
                <div
                  className="text-xs font-bold truncate"
                  style={{
                    color: "var(--md-sys-color-on-surface)",
                  }}
                >
                  {rv.authorName}
                </div>
              </div>
              {rv.relativeTime && (
                <span
                  className="text-[11px]"
                  style={{
                    color: "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  {rv.relativeTime}
                </span>
              )}
            </div>

            <p
              className="text-xs leading-relaxed line-clamp-4"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              &ldquo;{rv.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
