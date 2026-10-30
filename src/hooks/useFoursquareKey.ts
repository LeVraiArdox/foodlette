"use client";

import React from "react";
import { STORAGE_KEY_FSQ_API } from "@/constants/foodlette";

/**
 * Manages Foursquare Places API key state across server (`FOURSQUARE_API_KEY` in `.env`)
 * and optional tab-scoped `sessionStorage` BYOK overrides when no server key is configured.
 */
export function useFoursquareKey() {
  const [clientApiKey, setClientApiKey] = React.useState<string>("");
  const [hasServerKey, setHasServerKey] = React.useState<boolean>(false);
  const [keyStatusChecked, setKeyStatusChecked] = React.useState<boolean>(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = React.useState<boolean>(false);
  const [apiKeyErrorMsg, setApiKeyErrorMsg] = React.useState<string | null>(
    null
  );

  // Check server .env key status on mount, and purge any legacy persistent localStorage key
  React.useEffect(() => {
    let sessionKey = "";
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY_FSQ_API);
        sessionKey = window.sessionStorage.getItem(STORAGE_KEY_FSQ_API) || "";
      } catch {
        // Ignore storage access errors
      }
    }
    if (sessionKey) {
      setClientApiKey(sessionKey);
    }

    fetch("/api/geocode?status=1")
      .then((res) => (res.ok ? res.json() : { hasServerKey: false }))
      .then((data: { hasServerKey?: boolean }) => {
        const srv = Boolean(data.hasServerKey);
        setHasServerKey(srv);
        if (srv) {
          // Server key is active; clear any tab-stored client key so secrets aren't kept in browser storage
          setClientApiKey("");
          try {
            window.sessionStorage.removeItem(STORAGE_KEY_FSQ_API);
          } catch {
            // Ignore
          }
        } else if (!sessionKey) {
          setApiKeyDialogOpen(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        setKeyStatusChecked(true);
      });
  }, []);

  const apiHeaders = React.useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (!hasServerKey && clientApiKey.trim()) {
      headers["x-foursquare-api-key"] = clientApiKey.trim();
    }
    return headers;
  }, [hasServerKey, clientApiKey]);

  const hasActiveApiKey = hasServerKey || Boolean(clientApiKey.trim());

  const saveClientKey = React.useCallback((newKey: string) => {
    const trimmed = newKey.trim();
    setClientApiKey(trimmed);
    setApiKeyErrorMsg(null);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(STORAGE_KEY_FSQ_API, trimmed);
      } catch {
        // Ignore
      }
    }
  }, []);

  const clearClientKey = React.useCallback(() => {
    setClientApiKey("");
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY_FSQ_API);
        window.localStorage.removeItem(STORAGE_KEY_FSQ_API);
      } catch {
        // Ignore
      }
    }
  }, []);

  return {
    clientApiKey,
    hasServerKey,
    setHasServerKey,
    keyStatusChecked,
    hasActiveApiKey,
    apiHeaders,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    apiKeyErrorMsg,
    setApiKeyErrorMsg,
    saveClientKey,
    clearClientKey,
  };
}
