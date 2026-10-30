/**
 * Isomorphic (client + server) sanitization helpers for untrusted external strings,
 * crowd-sourced venue URLs, contact fields, and Leaflet HTML fragments.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

/**
 * Ensures a Material Symbols ligature name contains only safe lowercase identifier chars.
 */
export function sanitizeMaterialIconName(
  icon?: string | null,
  fallback = "restaurant"
): string {
  if (!icon) return fallback;
  const trimmed = icon.trim();
  return /^[a-z0-9_]{1,40}$/.test(trimmed) ? trimmed : fallback;
}

/**
 * Validates external URLs (such as crowd-sourced venue websites or photo URLs)
 * and strictly blocks `javascript:`, `data:`, `vbscript:`, `file:`, and `blob:` schemes.
 */
export function sanitizeExternalHttpUrl(
  raw?: string | null,
  options?: { httpsOnly?: boolean }
): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) return undefined;

  // Reject any explicit non-HTTP(S) scheme before attempting domain normalization
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return undefined;
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (options?.httpsOnly) {
      if (parsed.protocol !== "https:") return undefined;
    } else if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return undefined;
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function sanitizePhoneHref(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[^0-9+()\-.\s]/g, "").trim();
  if (cleaned.length < 3 || cleaned.length > 32) return undefined;
  return `tel:${cleaned}`;
}

export function sanitizeEmailHref(email?: string | null): string | undefined {
  if (!email) return undefined;
  const trimmed = email.trim();
  if (
    trimmed.length > 254 ||
    !/^[^\s@<>:"'\\]+@[^\s@<>:"'\\]+\.[^\s@<>:"'\\]+$/.test(trimmed)
  ) {
    return undefined;
  }
  return `mailto:${trimmed}`;
}

export function sanitizeInstagramHandle(
  raw?: string | null
): string | undefined {
  if (!raw) return undefined;
  const stripped = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(stripped)) {
    return undefined;
  }
  return stripped;
}
