"use client";

import React from "react";
import type { GeoLocation } from "@/types/restaurant";
import { useBanAutocomplete } from "@/hooks/useBanAutocomplete";
import { SearchDropdown } from "@/components/search/SearchDropdown";
import { LocationStatusRadiusBar } from "@/components/search/LocationStatusRadiusBar";

interface LocationSearchBarProps {
  currentLocation: GeoLocation | null;
  onSelectLocation: (loc: GeoLocation) => void;
  onRequestGps: () => void;
  gpsLoading: boolean;
  gpsNotice?: string | null;
  radius: number;
  onChangeRadius: (radius: number) => void;
  lastLoadCached?: boolean;
}

/**
 * Location Search Bar powered by the French National Address Database:
 * API Adresse — Base Adresse Nationale (BAN — data.gouv.fr / data.geopf.fr/geocodage).
 * 100% Free Open Data, zero API key required, returning exact WGS84 coordinates.
 */
export function LocationSearchBar({
  currentLocation,
  onSelectLocation,
  onRequestGps,
  gpsLoading,
  gpsNotice,
  radius,
  onChangeRadius,
  lastLoadCached,
}: LocationSearchBarProps) {
  const {
    containerRef,
    query,
    setQuery,
    focused,
    setFocused,
    suggestions,
    searching,
    recentLocations,
    showDropdown,
    clearQuery,
    chooseBanSuggestion,
    chooseQuickOrRecent,
    handleFormSubmit,
  } = useBanAutocomplete({
    currentLocation,
    onSelectLocation,
  });

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main M3 Expressive Search Bar Container */}
      <div ref={containerRef} className="relative w-full z-30">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 px-3 sm:px-4 h-[60px] border transition-all"
          style={{
            backgroundColor: focused
              ? "var(--md-sys-color-surface-container-highest)"
              : "var(--md-sys-color-surface-container-high)",
            borderColor: focused
              ? "var(--md-sys-color-primary)"
              : "var(--md-sys-color-outline-variant)",
            borderRadius: showDropdown ? "28px 28px 14px 14px" : "9999px",
            transition:
              "border-radius var(--md-sys-motion-spring-fast-spatial), background-color var(--md-sys-motion-spring-fast-effects), border-color var(--md-sys-motion-spring-fast-effects)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: focused
                ? "var(--md-sys-color-primary)"
                : "var(--md-sys-color-secondary-container)",
              color: focused
                ? "var(--md-sys-color-on-primary)"
                : "var(--md-sys-color-on-secondary-container)",
              transition: "all var(--md-sys-motion-spring-fast-effects)",
            }}
          >
            <span className="material-symbols-rounded text-[21px]">search</span>
          </div>

          <input
            type="text"
            value={query}
            onFocus={() => setFocused(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!focused) setFocused(true);
            }}
            placeholder={
              currentLocation
                ? `Searching near ${currentLocation.label}`
                : "Search a French address, street, postal code, or city (BAN data.gouv.fr)..."
            }
            aria-label="Search location via Base Adresse Nationale"
            className="flex-1 bg-transparent outline-none text-sm sm:text-base font-medium min-w-0 placeholder:opacity-75"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Clear search"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer shrink-0"
              style={{
                backgroundColor: "var(--md-sys-color-surface-variant)",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <span className="material-symbols-rounded text-[18px]">close</span>
            </button>
          )}

          {/* Share GPS Location Button */}
          <button
            type="button"
            onClick={onRequestGps}
            disabled={gpsLoading}
            className="m3-expressive-btn flex items-center gap-1.5 px-3.5 sm:px-4 h-10 text-xs sm:text-sm m3-label-large-emphasized shrink-0"
            style={{
              backgroundColor:
                currentLocation?.source === "gps"
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-primary-container)",
              color:
                currentLocation?.source === "gps"
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-on-primary-container)",
            }}
          >
            <span
              className={`material-symbols-rounded text-[18px] ${
                currentLocation?.source === "gps" ? "filled" : ""
              } ${gpsLoading ? "animate-spin" : ""}`}
            >
              {gpsLoading ? "progress_activity" : "my_location"}
            </span>
            <span className="hidden sm:inline">
              {gpsLoading ? "Locating..." : "Near Me"}
            </span>
          </button>
        </form>

        {/* Expressive Spring BAN Autocomplete Dropdown */}
        <SearchDropdown
          open={showDropdown}
          searching={searching}
          query={query}
          suggestions={suggestions}
          recentLocations={recentLocations}
          onChooseSuggestion={chooseBanSuggestion}
          onChoosePresetOrRecent={chooseQuickOrRecent}
        />
      </div>

      {/* Sub-bar: Active Location Badge + Cache Hit Badge + M3 Connected Radius Group */}
      <LocationStatusRadiusBar
        currentLocation={currentLocation}
        lastLoadCached={lastLoadCached}
        gpsNotice={gpsNotice}
        radius={radius}
        onChangeRadius={onChangeRadius}
      />
    </div>
  );
}
