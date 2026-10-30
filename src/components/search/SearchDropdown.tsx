"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GeoLocation, LocationSuggestion } from "@/types/restaurant";
import { QUICK_LOCATIONS } from "@/constants/foodlette";

interface SearchDropdownProps {
  open: boolean;
  searching: boolean;
  query: string;
  suggestions: LocationSuggestion[];
  recentLocations: GeoLocation[];
  onChooseSuggestion: (s: LocationSuggestion) => void;
  onChoosePresetOrRecent: (loc: GeoLocation) => void;
}

export function SearchDropdown({
  open,
  searching,
  query,
  suggestions,
  recentLocations,
  onChooseSuggestion,
  onChoosePresetOrRecent,
}: SearchDropdownProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 4, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="absolute left-0 right-0 mt-1 p-2.5 border shadow-xl overflow-hidden flex flex-col gap-2"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container-high)",
            borderColor: "var(--md-sys-color-outline-variant)",
            borderRadius: "16px 16px 28px 28px",
          }}
        >
          {searching && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              <span className="material-symbols-rounded animate-spin text-[18px]">
                progress_activity
              </span>
              <span>
                Searching Base Adresse Nationale (BAN data.gouv.fr)...
              </span>
            </div>
          )}

          {!searching && suggestions.length > 0 && (
            <div className="flex flex-col gap-1">
              <div
                className="px-3 py-1 text-[11px] uppercase tracking-wider font-bold flex items-center justify-between"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                <span>Base Adresse Nationale (BAN)</span>
                <span>data.gouv.fr • Free Open Data</span>
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChooseSuggestion(s)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[18px] transition-all cursor-pointer hover:translate-x-0.5"
                  style={{
                    backgroundColor:
                      "var(--md-sys-color-surface-container-lowest)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        "var(--md-sys-color-tertiary-container)",
                      color: "var(--md-sys-color-on-tertiary-container)",
                    }}
                  >
                    <span className="material-symbols-rounded text-[19px]">
                      location_on
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="m3-title-medium-emphasized text-sm truncate"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      {s.shortName}
                    </div>
                    {s.subtitle && (
                      <div
                        className="text-xs truncate"
                        style={{
                          color: "var(--md-sys-color-on-surface-variant)",
                        }}
                      >
                        {s.subtitle}
                      </div>
                    )}
                  </div>
                  <span
                    className="material-symbols-rounded text-[18px]"
                    style={{ color: "var(--md-sys-color-primary)" }}
                  >
                    north_west
                  </span>
                </button>
              ))}
            </div>
          )}

          {!searching && query.trim().length < 3 && (
            <div className="p-1.5 flex flex-col gap-2">
              {recentLocations.length > 0 && (
                <div>
                  <div
                    className="px-2 pb-1.5 text-[11px] uppercase tracking-wider font-bold"
                    style={{
                      color: "var(--md-sys-color-on-surface-variant)",
                    }}
                  >
                    Recent Addresses
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentLocations.map((rec) => (
                      <button
                        key={`rec-${rec.label}`}
                        type="button"
                        onClick={() => onChoosePresetOrRecent(rec)}
                        className="m3-expressive-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                        style={{
                          backgroundColor:
                            "var(--md-sys-color-tertiary-container)",
                          color: "var(--md-sys-color-on-tertiary-container)",
                        }}
                      >
                        <span className="material-symbols-rounded text-[15px]">
                          history
                        </span>
                        <span>{rec.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div
                  className="px-2 pb-1.5 text-[11px] uppercase tracking-wider font-bold"
                  style={{
                    color: "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  French Foodie Neighborhoods (Instant Pick)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_LOCATIONS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onChoosePresetOrRecent(preset)}
                      className="m3-expressive-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor:
                          "var(--md-sys-color-secondary-container)",
                        color: "var(--md-sys-color-on-secondary-container)",
                      }}
                    >
                      <span className="material-symbols-rounded text-[15px]">
                        explore
                      </span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
