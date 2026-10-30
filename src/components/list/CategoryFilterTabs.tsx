"use client";

import React from "react";
import type { CategoryFilter } from "@/types/restaurant";
import { CATEGORY_TABS } from "@/constants/foodlette";

interface CategoryFilterTabsProps {
  categoryFilter: CategoryFilter;
  onChangeCategoryFilter: (cat: CategoryFilter) => void;
  filterText: string;
  onChangeFilterText: (text: string) => void;
}

export function CategoryFilterTabs({
  categoryFilter,
  onChangeCategoryFilter,
  filterText,
  onChangeFilterText,
}: CategoryFilterTabsProps) {
  return (
    <>
      {/* M3 Expressive Connected Button Group for Category Filtering */}
      <div className="m3-connected-group w-full mb-3" role="tablist">
        {CATEGORY_TABS.map((tab) => {
          const active = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active}
              onClick={() => onChangeCategoryFilter(tab.id)}
              className="m3-connected-item flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs"
              style={{
                backgroundColor: active
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-surface-container-high)",
                color: active
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <span
                className={`material-symbols-rounded text-[16px] ${
                  active ? "filled" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Filter Input */}
      <div
        className="flex items-center gap-2 px-3.5 h-10 rounded-full mb-3"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container-high)",
        }}
      >
        <span
          className="material-symbols-rounded text-[18px]"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          filter_list
        </span>
        <input
          type="text"
          value={filterText}
          onChange={(e) => onChangeFilterText(e.target.value)}
          placeholder="Filter by name, street, or cuisine..."
          className="flex-1 bg-transparent outline-none text-xs sm:text-sm min-w-0"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        />
        {filterText && (
          <button
            type="button"
            onClick={() => onChangeFilterText("")}
            className="cursor-pointer flex items-center"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            <span className="material-symbols-rounded text-[16px]">close</span>
          </button>
        )}
      </div>
    </>
  );
}
