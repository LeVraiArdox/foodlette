"use client";

import React from "react";
import type { GeoLocation, LocationSuggestion } from "@/types/restaurant";
import { getRecentLocations, pushRecentLocation } from "@/lib/client-cache";

interface UseBanAutocompleteOptions {
  currentLocation: GeoLocation | null;
  onSelectLocation: (loc: GeoLocation) => void;
}

/**
 * Manages debounced BAN (Base Adresse Nationale — data.gouv.fr) live address
 * and commune autocomplete, recent addresses history, and outside-click dismissal.
 */
export function useBanAutocomplete({
  currentLocation,
  onSelectLocation,
}: UseBanAutocompleteOptions) {
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>(
    []
  );
  const [searching, setSearching] = React.useState(false);
  const [recentLocations, setRecentLocations] = React.useState<GeoLocation[]>(
    []
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setRecentLocations(getRecentLocations());
  }, [currentLocation]);

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Debounced BAN (Base Adresse Nationale) live address & commune autocomplete
  // Only fires while input is focused and has >= 3 characters.
  React.useEffect(() => {
    if (!focused) return;
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // Ignore aborted requests
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, focused]);

  const chooseBanSuggestion = React.useCallback(
    (s: LocationSuggestion) => {
      const loc: GeoLocation = {
        lat: s.lat,
        lon: s.lon,
        label: s.shortName,
        subtitle: s.subtitle,
        banId: s.banId,
        source: "search",
      };
      pushRecentLocation(loc);
      setRecentLocations(getRecentLocations());
      setFocused(false);
      setQuery("");
      setSuggestions([]);
      onSelectLocation(loc);
    },
    [onSelectLocation]
  );

  const chooseQuickOrRecent = React.useCallback(
    (loc: GeoLocation) => {
      onSelectLocation(loc);
      setQuery("");
      setFocused(false);
    },
    [onSelectLocation]
  );

  const clearQuery = React.useCallback(() => {
    setQuery("");
    setSuggestions([]);
  }, []);

  const handleFormSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      if (suggestions.length > 0) {
        chooseBanSuggestion(suggestions[0]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = await res.json();
          const first: LocationSuggestion | undefined = data.suggestions?.[0];
          if (first) {
            chooseBanSuggestion(first);
          }
        }
      } finally {
        setSearching(false);
      }
    },
    [query, suggestions, chooseBanSuggestion]
  );

  const showDropdown =
    focused &&
    (suggestions.length > 0 || searching || query.trim().length < 3);

  return {
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
  };
}
