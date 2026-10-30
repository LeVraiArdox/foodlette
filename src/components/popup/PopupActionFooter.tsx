"use client";

import React from "react";

interface PopupActionFooterProps {
  restaurantId: string;
  osmDirectionsUrl: string;
  onSpinAgain: () => void;
  canExclude?: boolean;
  onExcludeAndSpin?: (id: string) => void;
}

export function PopupActionFooter({
  restaurantId,
  osmDirectionsUrl,
  onSpinAgain,
  canExclude = false,
  onExcludeAndSpin,
}: PopupActionFooterProps) {
  return (
    <div
      className="p-4 sm:px-6 border-t flex flex-wrap items-center justify-between gap-2.5"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container)",
        borderColor: "var(--md-sys-color-outline-variant)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSpinAgain}
          className="m3-expressive-btn inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm m3-label-large-emphasized"
          style={{
            backgroundColor: "var(--md-sys-color-secondary-container)",
            color: "var(--md-sys-color-on-secondary-container)",
          }}
        >
          <span className="material-symbols-rounded text-[19px]">casino</span>
          <span>Spin Again</span>
        </button>

        {canExclude && onExcludeAndSpin && (
          <button
            type="button"
            onClick={() => onExcludeAndSpin(restaurantId)}
            className="m3-expressive-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold"
            style={{
              backgroundColor:
                "var(--md-sys-color-surface-container-highest)",
              color: "var(--md-sys-color-on-surface-variant)",
            }}
          >
            <span className="material-symbols-rounded text-[18px]">
              remove_circle_outline
            </span>
            <span>Skip &amp; Re-spin</span>
          </button>
        )}
      </div>

      <a
        href={osmDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="m3-expressive-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm m3-label-large-emphasized shadow-xs"
        style={{
          backgroundColor: "var(--md-sys-color-primary)",
          color: "var(--md-sys-color-on-primary)",
        }}
      >
        <span className="material-symbols-rounded filled text-[19px]">
          directions
        </span>
        <span>OpenStreetMap Route</span>
      </a>
    </div>
  );
}
