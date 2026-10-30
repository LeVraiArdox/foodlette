"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExpressiveShapeBadge } from "@/components/ui/ExpressiveShapeBadge";
import { clearAllFoodletteCache } from "@/lib/client-cache";
import { useQuotaStats } from "@/hooks/useQuotaStats";

interface ApiKeyDialogProps {
  open: boolean;
  hasServerKey: boolean;
  currentClientKey: string;
  errorMessage?: string | null;
  onSaveKey: (key: string) => void;
  onClearClientKey: () => void;
  onClose: () => void;
}

export function ApiKeyDialog({
  open,
  hasServerKey,
  currentClientKey,
  errorMessage,
  onSaveKey,
  onClearClientKey,
  onClose,
}: ApiKeyDialogProps) {
  const [draft, setDraft] = React.useState(currentClientKey);
  const [visible, setVisible] = React.useState(false);
  const [cacheClearedMsg, setCacheClearedMsg] = React.useState(false);
  const quota = useQuotaStats();

  React.useEffect(() => {
    setDraft(currentClientKey);
    setCacheClearedMsg(false);
  }, [currentClientKey, open]);

  if (!open) return null;

  const canDismiss = hasServerKey || Boolean(currentClientKey.trim());

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-dialog-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (canDismiss) onClose();
          }}
          className="fixed inset-0 bg-black/55 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 14 }}
          transition={{ type: "spring", stiffness: 390, damping: 26 }}
          className="relative z-10 w-full max-w-lg p-6 sm:p-7 border shadow-2xl flex flex-col gap-4"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container-low)",
            borderColor: "var(--md-sys-color-outline-variant)",
            borderRadius: "var(--md-sys-shape-corner-extra-large-increased)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <ExpressiveShapeBadge
                shape="cookie12"
                hoverShape="sunny8"
                size={52}
                fill="var(--md-sys-color-primary-container)"
              >
                <span
                  className="material-symbols-rounded filled text-[24px]"
                  style={{ color: "var(--md-sys-color-on-primary-container)" }}
                >
                  storefront
                </span>
              </ExpressiveShapeBadge>
              <div>
                <h2
                  id="api-key-dialog-title"
                  className="m3-headline-medium-emphasized text-xl sm:text-2xl"
                  style={{ color: "var(--md-sys-color-on-surface)" }}
                >
                  Foursquare Places API Key
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                >
                  100% Independent Stack: BAN (data.gouv.fr) • Foursquare •
                  OpenStreetMap • Haversine
                </p>
              </div>
            </div>

            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="m3-expressive-btn w-9 h-9 flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--md-sys-color-surface-container-high)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                <span className="material-symbols-rounded text-[19px]">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Live Session Quota Counter Card */}
          <div
            className="p-3.5 rounded-[20px] flex items-center justify-between gap-3"
            style={{
              backgroundColor: "var(--md-sys-color-tertiary-container)",
              color: "var(--md-sys-color-on-tertiary-container)",
            }}
          >
            <div className="text-xs">
              <div className="font-bold uppercase tracking-wider text-[11px]">
                This Session&apos;s Foursquare Usage
              </div>
              <div className="mt-0.5">
                <strong>{quota.upstreamCalls}</strong> upstream Foursquare{" "}
                {quota.upstreamCalls === 1 ? "request" : "requests"} •{" "}
                <strong>{quota.cacheHits}</strong> served from 24h cache (0
                calls)
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAllFoodletteCache();
                setCacheClearedMsg(true);
              }}
              className="m3-expressive-btn px-3 py-1.5 text-[11px] font-bold shrink-0"
              style={{
                backgroundColor: "var(--md-sys-color-surface-container-lowest)",
                color: "var(--md-sys-color-on-surface)",
              }}
            >
              {cacheClearedMsg ? "Browser Cache Cleared" : "Clear Browser Cache"}
            </button>
          </div>

          {errorMessage && (
            <div
              className="p-3.5 rounded-[18px] text-xs sm:text-sm flex items-start gap-2.5"
              style={{
                backgroundColor: "var(--md-sys-color-error-container)",
                color: "var(--md-sys-color-on-error-container)",
              }}
            >
              <span className="material-symbols-rounded text-[18px] shrink-0 mt-0.5">
                warning
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {hasServerKey && (
            <div
              className="p-3.5 rounded-[18px] text-xs sm:text-sm flex items-center gap-2.5"
              style={{
                backgroundColor: "var(--md-sys-color-secondary-container)",
                color: "var(--md-sys-color-on-secondary-container)",
              }}
            >
              <span className="material-symbols-rounded filled text-[18px]">
                verified
              </span>
              <span>
                A server key (<code className="font-mono">FOURSQUARE_API_KEY</code>)
                is active in <code className="font-mono">.env</code> /{" "}
                <code className="font-mono">.env.local</code>. You can optionally
                override it below.
              </span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              onSaveKey(draft.trim());
              onClose();
            }}
            className="flex flex-col gap-3"
          >
            <label
              className="text-xs font-bold uppercase tracking-wider px-1"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              Paste your Foursquare Places API Key
            </label>

            <div
              className="flex items-center gap-2 px-4 h-13 rounded-full border"
              style={{
                backgroundColor: "var(--md-sys-color-surface-container-high)",
                borderColor: "var(--md-sys-color-outline)",
              }}
            >
              <span
                className="material-symbols-rounded text-[19px]"
                style={{ color: "var(--md-sys-color-primary)" }}
              >
                key
              </span>
              <input
                type={visible ? "text" : "password"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Service API Key or fsq3..."
                autoFocus={!canDismiss}
                className="flex-1 bg-transparent outline-none text-sm font-mono min-w-0"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="cursor-pointer flex items-center"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                title={visible ? "Hide key" : "Show key"}
              >
                <span className="material-symbols-rounded text-[19px]">
                  {visible ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div
              className="p-3.5 rounded-[20px] text-xs leading-relaxed flex flex-col gap-1"
              style={{
                backgroundColor: "var(--md-sys-color-surface-container)",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <div>
                <strong>Architecture Summary:</strong>
              </div>
              <div>
                • <strong>Geocoding (Free, 0 keys)</strong>: Base Adresse
                Nationale (<code className="font-mono">data.gouv.fr</code> /{" "}
                <code className="font-mono">data.geopf.fr/geocodage</code>).
              </div>
              <div>
                • <strong>Address &amp; Venue Infos</strong>: Foursquare Places API
                (supports both modern Service API Keys &amp; legacy{" "}
                <code className="font-mono">fsq3</code> keys, cached 24h).
              </div>
              <div>
                • <strong>Cartography &amp; Distance</strong>: Interactive
                OpenStreetMap tiles + pure Haversine geodesic distance &amp; travel
                time calculus.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-1">
              {currentClientKey && (
                <button
                  type="button"
                  onClick={() => {
                    onClearClientKey();
                    setDraft("");
                    if (hasServerKey) onClose();
                  }}
                  className="m3-expressive-btn px-4 py-2.5 text-xs font-semibold"
                  style={{
                    backgroundColor:
                      "var(--md-sys-color-surface-container-highest)",
                    color: "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  Clear Saved Key
                </button>
              )}

              <button
                type="submit"
                disabled={!draft.trim()}
                className="m3-expressive-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm m3-label-large-emphasized disabled:opacity-40"
                style={{
                  backgroundColor: "var(--md-sys-color-primary)",
                  color: "var(--md-sys-color-on-primary)",
                }}
              >
                <span className="material-symbols-rounded filled text-[18px]">
                  check
                </span>
                <span>Save Foursquare Key</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
