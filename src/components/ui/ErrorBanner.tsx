"use client";

import React from "react";

interface ErrorBannerProps {
  message: string;
  onOpenApiKeyDialog: () => void;
  onRetry: () => void;
}

export function ErrorBanner({
  message,
  onOpenApiKeyDialog,
  onRetry,
}: ErrorBannerProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-[20px] text-sm"
      style={{
        backgroundColor: "var(--md-sys-color-error-container)",
        color: "var(--md-sys-color-on-error-container)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-rounded text-[20px] shrink-0">
          error
        </span>
        <span className="break-words">{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenApiKeyDialog}
          className="m3-expressive-btn px-3 py-1 text-xs m3-label-large-emphasized"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container-lowest)",
            color: "var(--md-sys-color-on-surface)",
          }}
        >
          Foursquare Key
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="m3-expressive-btn px-3 py-1 text-xs m3-label-large-emphasized"
          style={{
            backgroundColor: "var(--md-sys-color-error)",
            color: "var(--md-sys-color-on-error)",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
