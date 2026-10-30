"use client";

import React from "react";
import { useQuotaStats } from "@/hooks/useQuotaStats";
import { BrandLockup } from "@/components/header/BrandLockup";

interface ThemeToolbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasActiveApiKey: boolean;
  onOpenApiKeyDialog: () => void;
}

export function ThemeToolbar({
  isDark,
  onToggleDark,
  soundEnabled,
  onToggleSound,
  hasActiveApiKey,
  onOpenApiKeyDialog,
}: ThemeToolbarProps) {
  const quota = useQuotaStats();

  return (
    <header className="w-full flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-2 max-w-[1520px] mx-auto">
      {/* Brand Lockup with M3 Expressive Morphing Shape Badge */}
      <BrandLockup />

      {/* M3 Expressive Floating Toolbar Pill */}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full border"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container-high)",
          borderColor: "var(--md-sys-color-outline-variant)",
        }}
      >
        {/* Foursquare API Key + Live Session Quota Counter Button */}
        <button
          type="button"
          onClick={onOpenApiKeyDialog}
          title="Configure Foursquare Places API key & inspect quota-saver cache"
          className="m3-expressive-btn flex items-center gap-1.5 px-3 py-1 text-xs m3-label-large-emphasized"
          style={{
            backgroundColor: hasActiveApiKey
              ? "var(--md-sys-color-primary-container)"
              : "var(--md-sys-color-error-container)",
            color: hasActiveApiKey
              ? "var(--md-sys-color-on-primary-container)"
              : "var(--md-sys-color-on-error-container)",
          }}
        >
          <span className="material-symbols-rounded filled text-[15px]">
            {hasActiveApiKey ? "eco" : "vpn_key"}
          </span>
          <span>
            {hasActiveApiKey
              ? `FSQ: ${quota.upstreamCalls} ${
                  quota.upstreamCalls === 1 ? "call" : "calls"
                }${quota.cacheHits > 0 ? ` • ${quota.cacheHits} cached` : ""}`
              : "Set Foursquare Key"}
          </span>
        </button>

        {/* Wheel Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? "Mute wheel ticks" : "Enable wheel ticks"}
          className="m3-expressive-btn w-8 h-8 flex items-center justify-center"
          style={{
            backgroundColor: soundEnabled
              ? "var(--md-sys-color-secondary-container)"
              : "var(--md-sys-color-surface-container-highest)",
            color: soundEnabled
              ? "var(--md-sys-color-on-secondary-container)"
              : "var(--md-sys-color-on-surface-variant)",
          }}
        >
          <span
            className={`material-symbols-rounded text-[18px] ${
              soundEnabled ? "filled" : ""
            }`}
          >
            {soundEnabled ? "volume_up" : "volume_off"}
          </span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDark}
          title={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
          className="m3-expressive-btn flex items-center gap-1.5 px-3 py-1 h-8 text-xs m3-label-large-emphasized"
          style={{
            backgroundColor: "var(--md-sys-color-tertiary-container)",
            color: "var(--md-sys-color-on-tertiary-container)",
          }}
        >
          <span className="material-symbols-rounded filled text-[17px]">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}
