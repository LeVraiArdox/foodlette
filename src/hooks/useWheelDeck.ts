"use client";

import React from "react";
import type { CategoryFilter, Restaurant } from "@/types/restaurant";
import { DEFAULT_WHEEL_COUNT, MAX_WHEEL_SLICES } from "@/constants/foodlette";

/**
 * Manages restaurant category filtering, roulette wheel slice selection,
 * Shuffle-N / Top-N deck presets, and skip-and-respin exclusion.
 */
export function useWheelDeck(allRestaurants: Restaurant[]) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] =
    React.useState<CategoryFilter>("all");

  const filterByCategory = React.useCallback(
    (list: Restaurant[], cat: CategoryFilter) => {
      if (cat === "all") return list;
      return list.filter((r) => r.amenityCategory === cat);
    },
    []
  );

  const resetDeckForRestaurants = React.useCallback((list: Restaurant[]) => {
    setCategoryFilter("all");
    setSelectedIds(
      new Set(list.slice(0, DEFAULT_WHEEL_COUNT).map((r) => r.id))
    );
  }, []);

  const clearDeck = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleCategoryChange = React.useCallback(
    (cat: CategoryFilter) => {
      setCategoryFilter(cat);
      const matching = filterByCategory(allRestaurants, cat);
      setSelectedIds(
        new Set(matching.slice(0, DEFAULT_WHEEL_COUNT).map((r) => r.id))
      );
    },
    [allRestaurants, filterByCategory]
  );

  const handleToggleRestaurant = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_WHEEL_SLICES) {
          const first = next.values().next().value;
          if (first) next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectTopN = React.useCallback(
    (n: number) => {
      const pool = filterByCategory(allRestaurants, categoryFilter);
      setSelectedIds(new Set(pool.slice(0, n).map((r) => r.id)));
    },
    [allRestaurants, categoryFilter, filterByCategory]
  );

  const handleShuffleN = React.useCallback(
    (n: number) => {
      const pool = [...filterByCategory(allRestaurants, categoryFilter)];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      setSelectedIds(new Set(pool.slice(0, n).map((r) => r.id)));
    },
    [allRestaurants, categoryFilter, filterByCategory]
  );

  const excludeRestaurant = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const activeWheelRestaurants = React.useMemo(
    () => allRestaurants.filter((r) => selectedIds.has(r.id)),
    [allRestaurants, selectedIds]
  );

  return {
    selectedIds,
    categoryFilter,
    activeWheelRestaurants,
    resetDeckForRestaurants,
    clearDeck,
    handleCategoryChange,
    handleToggleRestaurant,
    handleSelectTopN,
    handleShuffleN,
    excludeRestaurant,
  };
}
