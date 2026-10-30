"use client";

import React from "react";
import { STORAGE_KEY_FSQ_API } from "@/constants/foodlette";

/**
 * Manages Foursquare Places API key state across both server (.env / .env.local)
 * and browser localStorage overrides, along with key dialog visibility & errors.
 */
export function useFoursquareKey() {
  const [clientApiKey, setClientApiKey] = React.useState<string>("");
  const [hasServerKey, setHasServerKey] = React.useState<boolean>(false);
  const [keyStatusChecked, setKeyStatusChecked] = React.useState<boolean>(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = React.useState<boolean>(false);
  const [apiKeyErrorMsg, setApiKeyErrorMsg] = React.useState<string | null>(
    null
  );

  // Load saved Foursquare API key on mount, and check server .env key status
  React.useEffect(() => {
    const storedKey =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY_FSQ_API) || ""
        : "";
    if (storedKey) {
      setClientApiKey(storedKey);
    }

    fetch("/api/geocode?status=1")
      .then((res) => (res.ok ? res.json() : { hasServerKey: false }))
      .then((data: { hasServerKey?: boolean }) => {
        const srv = Boolean(data.hasServerKey);
        setHasServerKey(srv);
        if (!srv && !storedKey) {
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
    if (clientApiKey.trim()) {
      headers["x-foursquare-api-key"] = clientApiKey.trim();
    }
    return headers;
  }, [clientApiKey]);

  const hasActiveApiKey = hasServerKey || Boolean(clientApiKey.trim());

  const saveClientKey = React.useCallback((newKey: string) => {
    setClientApiKey(newKey);
    setApiKeyErrorMsg(null);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_FSQ_API, newKey);
    }
  }, []);

  const clearClientKey = React.useCallback(() => {
    setClientApiKey("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_FSQ_API);
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
