"use client";

import React from "react";
import {
  getQuotaStats,
  subscribeQuotaStats,
  type QuotaStats,
} from "@/lib/client-cache";

/**
 * Subscribes to live session Foursquare Places API usage vs 24h cache hit statistics.
 */
export function useQuotaStats(): QuotaStats {
  const [quota, setQuota] = React.useState<QuotaStats>(() => getQuotaStats());

  React.useEffect(() => {
    return subscribeQuotaStats(setQuota);
  }, []);

  return quota;
}
