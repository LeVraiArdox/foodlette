"use client";

import React from "react";
import type { CategoryFilter, Restaurant } from "@/types/restaurant";
import type { WheelSlicePalette } from "@/lib/m3-theme";
import { CategoryFilterTabs } from "@/components/list/CategoryFilterTabs";
import {
  RestaurantListEmptyState,
  RestaurantListLoadingState,
} from "@/components/list/RestaurantListEmpty";
import { RestaurantListItem } from "@/components/list/RestaurantListItem";

interface RestaurantListPaneProps {
  allRestaurants: Restaurant[];
  selectedIds: Set<string>;
  onToggleRestaurant: (id: string) => void;
  onSelectTopN: (n: number) => void;
  onShuffleN: (n: number) => void;
  onInspectRestaurant: (restaurant: Restaurant) => void;
  activeWheelRestaurants: Restaurant[];
  highlightedWheelId: string | null;
  wheelSlices: WheelSlicePalette[];
  loading: boolean;
  categoryFilter: CategoryFilter;
  onChangeCategoryFilter: (cat: CategoryFilter) => void;
}

export function RestaurantListPane({
  allRestaurants,
  selectedIds,
  onToggleRestaurant,
  onSelectTopN,
  onShuffleN,
  onInspectRestaurant,
  activeWheelRestaurants,
  highlightedWheelId,
  wheelSlices,
  loading,
  categoryFilter,
  onChangeCategoryFilter,
}: RestaurantListPaneProps) {
  const [filterText, setFilterText] = React.useState("");
  const itemRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    if (!highlightedWheelId) return;
    const node = itemRefs.current[highlightedWheelId];
    if (node) {
      node.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedWheelId]);

  const wheelIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    activeWheelRestaurants.forEach((r, idx) => map.set(r.id, idx));
    return map;
  }, [activeWheelRestaurants]);

  const visibleRestaurants = React.useMemo(() => {
    return allRestaurants.filter((r) => {
      if (categoryFilter !== "all" && r.amenityCategory !== categoryFilter) {
        return false;
      }

      if (filterText.trim()) {
        const q = filterText.toLowerCase();
        const inName = r.name.toLowerCase().includes(q);
        const inCuisine = r.cuisines.some((c) => c.toLowerCase().includes(q));
        const inAddr = r.address.formatted.toLowerCase().includes(q);
        return inName || inCuisine || inAddr;
      }
      return true;
    });
  }, [allRestaurants, categoryFilter, filterText]);

  return (
    <aside
      className="w-full lg:w-[410px] xl:w-[440px] shrink-0 flex flex-col p-4 sm:p-5 lg:h-[calc(100vh-112px)] lg:sticky lg:top-4 overflow-hidden"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container-low)",
        borderRadius: "var(--md-sys-shape-corner-extra-large-increased)",
      }}
      aria-label="Nearby restaurants list"
    >
      {/* Editorial Header */}
      <div className="flex items-start justify-between gap-2 mb-3.5">
        <div>
          <h2
            className="m3-headline-medium-emphasized text-xl sm:text-2xl"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Nearby Spots
          </h2>
        </div>

        {/* Deck Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onShuffleN(12)}
            disabled={allRestaurants.length === 0}
            title="Pick 12 random nearby spots for the wheel"
            className="m3-expressive-btn flex items-center gap-1 px-3 py-1.5 text-xs m3-label-large-emphasized disabled:opacity-40"
            style={{
              backgroundColor: "var(--md-sys-color-secondary-container)",
              color: "var(--md-sys-color-on-secondary-container)",
            }}
          >
            <span className="material-symbols-rounded text-[16px]">shuffle</span>
            <span>Shuffle 12</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTopN(12)}
            disabled={allRestaurants.length === 0}
            title="Select the 12 closest spots by Haversine distance"
            className="m3-expressive-btn px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40"
            style={{
              backgroundColor: "var(--md-sys-color-surface-container-highest)",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            Closest 12
          </button>
        </div>
      </div>

      {/* Category Filter Connected Group + Quick Text Filter */}
      <CategoryFilterTabs
        categoryFilter={categoryFilter}
        onChangeCategoryFilter={onChangeCategoryFilter}
        filterText={filterText}
        onChangeFilterText={setFilterText}
      />

      {/* Scrollable M3 Expressive Restaurant List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 min-h-[260px] py-2">
        {loading ? (
          <RestaurantListLoadingState />
        ) : visibleRestaurants.length === 0 ? (
          <RestaurantListEmptyState />
        ) : (
          visibleRestaurants.map((restaurant, idx) => {
            const sliceIdx = wheelIndexMap.get(restaurant.id);
            const slicePalette =
              sliceIdx !== undefined
                ? wheelSlices[sliceIdx % wheelSlices.length]
                : undefined;

            return (
              <RestaurantListItem
                key={restaurant.id}
                restaurant={restaurant}
                index={idx}
                totalCount={visibleRestaurants.length}
                isSelected={selectedIds.has(restaurant.id)}
                isHighlighted={highlightedWheelId === restaurant.id}
                sliceIdx={sliceIdx}
                slicePalette={slicePalette}
                onInspect={onInspectRestaurant}
                onToggle={onToggleRestaurant}
                itemRef={(el) => {
                  itemRefs.current[restaurant.id] = el;
                }}
              />
            );
          })
        )}
      </div>
    </aside>
  );
}
