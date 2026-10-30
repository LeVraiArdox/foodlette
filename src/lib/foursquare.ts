import { NextRequest } from "next/server";
import type { RestaurantImage } from "@/types/restaurant";
import { sanitizeExternalHttpUrl } from "@/lib/sanitize";

export const FOURSQUARE_MODERN_BASE = "https://places-api.foursquare.com";
export const FOURSQUARE_LEGACY_V3_BASE = "https://api.foursquare.com/v3";
export const FOURSQUARE_API_VERSION = "2025-06-17";

/**
 * Foursquare Food, Restaurant, Café, Bakery, Coffee & Dessert Category IDs:
 * - Modern `places-api.foursquare.com` (`fsq_category_ids` BSON IDs):
 *   4d4b7105d754a06374d81259 = Food / Restaurant (parent tree covering restaurants, fast food, pizzerias, bistros, etc.)
 *   4bf58dd8d48988d16d941735 = Café
 *   4bf58dd8d48988d1e0931735 = Coffee Shop
 *   4bf58dd8d48988d16a941735 = Bakery
 *   4bf58dd8d48988d1c9941735 = Ice Cream Shop
 * - Legacy `api.foursquare.com/v3` (`categories` integer IDs):
 *   13065 = Restaurant, 13032 = Cafe/Coffee/Tea, 13002 = Bakery, 13040 = Dessert Shop
 */
export const FSQ_ALLOWED_FOOD_CATEGORY_LIST = [
  "4bf58dd8d48988d107941735",
  "4bf58dd8d48988d108941735",
  "4bf58dd8d48988d109941735",
  "4bf58dd8d48988d10a941735",
  "4bf58dd8d48988d10b941735",
  "4bf58dd8d48988d10c941735",
  "4bf58dd8d48988d10d941735",
  "4bf58dd8d48988d10e941735",
  "4bf58dd8d48988d10f941735",
  "4bf58dd8d48988d110941735",
  "4bf58dd8d48988d111941735",
  "4bf58dd8d48988d113941735",
  "4bf58dd8d48988d115941735",
  "4bf58dd8d48988d142941735",
  "4bf58dd8d48988d144941735",
  "4bf58dd8d48988d145941735",
  "4bf58dd8d48988d146941735",
  "4bf58dd8d48988d147941735",
  "4bf58dd8d48988d149941735",
  "4bf58dd8d48988d14a941735",
  "4bf58dd8d48988d14c941735",
  "4bf58dd8d48988d14d941735",
  "4bf58dd8d48988d14e941735",
  "4bf58dd8d48988d14f941735",
  "4bf58dd8d48988d150941735",
  "4bf58dd8d48988d151941735",
  "4bf58dd8d48988d152941735",
  "4bf58dd8d48988d153941735",
  "4bf58dd8d48988d154941735",
  "4bf58dd8d48988d155941735",
  "4bf58dd8d48988d156941735",
  "4bf58dd8d48988d157941735",
  "4bf58dd8d48988d158941735",
  "4bf58dd8d48988d169941735",
  "4bf58dd8d48988d16b941735",
  "4bf58dd8d48988d16c941735",
  "4bf58dd8d48988d16e941735",
  "4bf58dd8d48988d16f941735",
  "4bf58dd8d48988d17a941735",
  "4bf58dd8d48988d1bd941735",
  "4bf58dd8d48988d1be941735",
  "4bf58dd8d48988d1bf941735",
  "4bf58dd8d48988d1c0941735",
  "4bf58dd8d48988d1c1941735",
  "4bf58dd8d48988d1c2941735",
  "4bf58dd8d48988d1c3941735",
  "4bf58dd8d48988d1c4941735",
  "4bf58dd8d48988d1c5941735",
  "4bf58dd8d48988d1c6941735",
  "4bf58dd8d48988d1c8941735",
  "4bf58dd8d48988d1ca941735",
  "4bf58dd8d48988d1cc941735",
  "4bf58dd8d48988d1cd941735",
  "4bf58dd8d48988d1ce941735",
  "4bf58dd8d48988d1d1941735",
  "4bf58dd8d48988d1d2941735",
  "4bf58dd8d48988d1d3941735",
  "4bf58dd8d48988d1db931735",
  "4bf58dd8d48988d1dd931735",
  "4bf58dd8d48988d1df931735",
  "4bf58dd8d48988d1f5931735",
  "4c2cd86ed066bed06c3c5209",
  "4d4ae6fc7a7b7dea34424761",
  "4d4b7105d754a06374d81259",
  "4deefc054765f83613cdba6f",
  "4def73e84765ae376e57713a",
  "4eb1bd1c3b7b55596b4a748f",
  "4eb1bfa43b7b52c0e1adc2e8",
  "4eb1d5724b900d56c88a45fe",
  "4edd64a0c7ddd24ca188df1a",
  "4f04af1f2fb6e1c99f3db0bb",
  "503288ae91d4c4b30a586d67",
  "5283c7b4e4b094cb91ec88d4",
  "5283c7b4e4b094cb91ec88d5",
  "5283c7b4e4b094cb91ec88d6",
  "5283c7b4e4b094cb91ec88d7",
  "5283c7b4e4b094cb91ec88d8",
  "5283c7b4e4b094cb91ec88d9",
  "5283c7b4e4b094cb91ec88da",
  "5283c7b4e4b094cb91ec88db",
  "52939a643cf9994f4e043a33",
  "52939a7d3cf9994f4e043a34",
  "52939a8c3cf9994f4e043a35",
  "52939a9e3cf9994f4e043a36",
  "52939aae3cf9994f4e043a37",
  "52939ab93cf9994f4e043a38",
  "52939ac53cf9994f4e043a39",
  "52939ad03cf9994f4e043a3a",
  "52939ae13cf9994f4e043a3b",
  "52939aed3cf9994f4e043a3c",
  "52939af83cf9994f4e043a3d",
  "5293a7563cf9994f4e043a44",
  "5293a7d53cf9994f4e043a45",
  "5294c55c3cf9994f4e043a61",
  "5294c7523cf9994f4e043a62",
  "5294cbda3cf9994f4e043a63",
  "52960bac3cf9994f4e043ac4",
  "52960eda3cf9994f4e043ac5",
  "52960eda3cf9994f4e043ac6",
  "52960eda3cf9994f4e043ac7",
  "52960eda3cf9994f4e043ac8",
  "52960eda3cf9994f4e043ac9",
  "52960eda3cf9994f4e043aca",
  "52960eda3cf9994f4e043acb",
  "52960eda3cf9994f4e043acc",
  "52af0bd33cf9994f4e043bdd",
  "52af39fb3cf9994f4e043be9",
  "52af3a5e3cf9994f4e043bea",
  "52af3a673cf9994f4e043beb",
  "52af3a723cf9994f4e043bec",
  "52af3a7c3cf9994f4e043bed",
  "52af3a903cf9994f4e043bee",
  "52af3a9f3cf9994f4e043bef",
  "52af3aaa3cf9994f4e043bf0",
  "52af3ab53cf9994f4e043bf1",
  "52af3abe3cf9994f4e043bf2",
  "52af3ac83cf9994f4e043bf3",
  "52af3ad23cf9994f4e043bf4",
  "52af3add3cf9994f4e043bf5",
  "52af3ae63cf9994f4e043bf6",
  "52af3af23cf9994f4e043bf7",
  "52af3afc3cf9994f4e043bf8",
  "52af3b053cf9994f4e043bf9",
  "52af3b213cf9994f4e043bfa",
  "52af3b293cf9994f4e043bfb",
  "52af3b343cf9994f4e043bfc",
  "52af3b3b3cf9994f4e043bfd",
  "52af3b463cf9994f4e043bfe",
  "52af3b513cf9994f4e043bff",
  "52af3b593cf9994f4e043c00",
  "52af3b633cf9994f4e043c01",
  "52af3b6e3cf9994f4e043c02",
  "52af3b773cf9994f4e043c03",
  "52af3b813cf9994f4e043c04",
  "52af3b893cf9994f4e043c05",
  "52af3b913cf9994f4e043c06",
  "52af3b9a3cf9994f4e043c07",
  "52af3ba23cf9994f4e043c08",
  "52e81612bcbc57f1066b79f1",
  "52e81612bcbc57f1066b79f3",
  "52e81612bcbc57f1066b79f4",
  "52e81612bcbc57f1066b79f7",
  "52e81612bcbc57f1066b79f8",
  "52e81612bcbc57f1066b79f9",
  "52e81612bcbc57f1066b79fa",
  "52e81612bcbc57f1066b79fb",
  "52e81612bcbc57f1066b79fc",
  "52e81612bcbc57f1066b79fd",
  "52e81612bcbc57f1066b79fe",
  "52e81612bcbc57f1066b79ff",
  "52e81612bcbc57f1066b7a00",
  "52e81612bcbc57f1066b7a01",
  "52e81612bcbc57f1066b7a02",
  "52e81612bcbc57f1066b7a03",
  "52e81612bcbc57f1066b7a04",
  "52e81612bcbc57f1066b7a05",
  "52e81612bcbc57f1066b7a09",
  "52e928d0bcbc57f1066b7e96",
  "52e928d0bcbc57f1066b7e97",
  "52e928d0bcbc57f1066b7e98",
  "52e928d0bcbc57f1066b7e9a",
  "52e928d0bcbc57f1066b7e9b",
  "52e928d0bcbc57f1066b7e9c",
  "52e928d0bcbc57f1066b7e9d",
  "52f2ae52bcbc57f1066b8b81",
  "530faca9bcbc57f1066bc2f2",
  "530faca9bcbc57f1066bc2f3",
  "530faca9bcbc57f1066bc2f4",
  "53d6c1b0e4b02351e88a83d2",
  "53d6c1b0e4b02351e88a83d4",
  "53d6c1b0e4b02351e88a83d6",
  "53d6c1b0e4b02351e88a83d8",
  "53d6c1b0e4b02351e88a83da",
  "53d6c1b0e4b02351e88a83dc",
  "53d6c1b0e4b02351e88a83de",
  "53d6c1b0e4b02351e88a83e0",
  "53d6c1b0e4b02351e88a83e2",
  "53d6c1b0e4b02351e88a83e4",
  "53d6c1b0e4b02351e88a83e6",
  "53d6c1b0e4b02351e88a83e8",
  "54135bf5e4b08f3d2429dfdd",
  "54135bf5e4b08f3d2429dfde",
  "54135bf5e4b08f3d2429dfdf",
  "54135bf5e4b08f3d2429dfe0",
  "54135bf5e4b08f3d2429dfe1",
  "54135bf5e4b08f3d2429dfe2",
  "54135bf5e4b08f3d2429dfe3",
  "54135bf5e4b08f3d2429dfe4",
  "54135bf5e4b08f3d2429dfe5",
  "54135bf5e4b08f3d2429dfe6",
  "54135bf5e4b08f3d2429dfe7",
  "54135bf5e4b08f3d2429dfe8",
  "54135bf5e4b08f3d2429dfe9",
  "54135bf5e4b08f3d2429dfea",
  "54135bf5e4b08f3d2429dfeb",
  "54135bf5e4b08f3d2429dfec",
  "54135bf5e4b08f3d2429dfed",
  "54135bf5e4b08f3d2429dfee",
  "54135bf5e4b08f3d2429dfef",
  "54135bf5e4b08f3d2429dff0",
  "54135bf5e4b08f3d2429dff1",
  "54135bf5e4b08f3d2429dff2",
  "54135bf5e4b08f3d2429dff3",
  "54135bf5e4b08f3d2429dff4",
  "54135bf5e4b08f3d2429dff5",
  "54135bf5e4b08f3d2429dff6",
  "5413605de4b0ae91d18581a9",
  "55a59a31e4b013909087cb00",
  "55a59af1e4b013909087cb03",
  "55a59bace4b013909087cb06",
  "55a59bace4b013909087cb09",
  "55a59bace4b013909087cb0c",
  "55a59bace4b013909087cb0f",
  "55a59bace4b013909087cb12",
  "55a59bace4b013909087cb15",
  "55a59bace4b013909087cb18",
  "55a59bace4b013909087cb1b",
  "55a59bace4b013909087cb1e",
  "55a59bace4b013909087cb21",
  "55a59bace4b013909087cb24",
  "55a59bace4b013909087cb27",
  "55a59bace4b013909087cb2a",
  "55a59bace4b013909087cb2d",
  "55a59bace4b013909087cb30",
  "55a59bace4b013909087cb33",
  "55a59bace4b013909087cb36",
  "55a5a1ebe4b013909087cb74",
  "55a5a1ebe4b013909087cb79",
  "55a5a1ebe4b013909087cb7c",
  "55a5a1ebe4b013909087cb7f",
  "55a5a1ebe4b013909087cb83",
  "55a5a1ebe4b013909087cb86",
  "55a5a1ebe4b013909087cb89",
  "55a5a1ebe4b013909087cb8c",
  "55a5a1ebe4b013909087cb8f",
  "55a5a1ebe4b013909087cb92",
  "55a5a1ebe4b013909087cb95",
  "55a5a1ebe4b013909087cb98",
  "55a5a1ebe4b013909087cb9b",
  "55a5a1ebe4b013909087cb9e",
  "55a5a1ebe4b013909087cba1",
  "55a5a1ebe4b013909087cba4",
  "55a5a1ebe4b013909087cba7",
  "55a5a1ebe4b013909087cbaa",
  "55a5a1ebe4b013909087cbad",
  "55a5a1ebe4b013909087cbb0",
  "55a5a1ebe4b013909087cbb3",
  "55a5a1ebe4b013909087cbb6",
  "55a5a1ebe4b013909087cbb9",
  "55a5a1ebe4b013909087cbbc",
  "55a5a1ebe4b013909087cbbf",
  "55a5a1ebe4b013909087cbc2",
  "55d25775498e9f6a0816a37a",
  "56aa371ae4b08b9a8d5734ba",
  "56aa371be4b08b9a8d5734bd",
  "56aa371be4b08b9a8d5734bf",
  "56aa371be4b08b9a8d5734c1",
  "56aa371be4b08b9a8d5734c7",
  "56aa371be4b08b9a8d5734e4",
  "56aa371be4b08b9a8d5734e7",
  "56aa371be4b08b9a8d5734ea",
  "56aa371be4b08b9a8d5734ed",
  "56aa371be4b08b9a8d5734f0",
  "56aa371be4b08b9a8d5734f3",
  "56aa371be4b08b9a8d573502",
  "56aa371be4b08b9a8d57350e",
  "56aa371be4b08b9a8d573529",
  "56aa371be4b08b9a8d573535",
  "56aa371be4b08b9a8d573538",
  "56aa371be4b08b9a8d573558",
  "56aa371be4b08b9a8d57355a",
  "56aa371be4b08b9a8d573568",
  "56aa371ce4b08b9a8d573572",
  "56aa371ce4b08b9a8d573574",
  "56aa371ce4b08b9a8d573576",
  "56aa371ce4b08b9a8d573578",
  "56aa371ce4b08b9a8d57357b",
  "56aa371ce4b08b9a8d57357f",
  "56aa371ce4b08b9a8d573583",
  "56aa371ce4b08b9a8d573587",
  "56aa371ce4b08b9a8d57358b",
  "56aa371ce4b08b9a8d57358e",
  "56aa371ce4b08b9a8d573592",
  "5744ccdde4b0c0459246b4a3",
  "5744ccdfe4b0c0459246b4a6",
  "5744ccdfe4b0c0459246b4a8",
  "5744ccdfe4b0c0459246b4ca",
  "5744ccdfe4b0c0459246b4d0",
  "5744ccdfe4b0c0459246b4d3",
  "5745c7ac498e5d0483112fdb",
  "57558b35e4b065ecebd306ad",
  "57558b36e4b065ecebd306b0",
  "57558b36e4b065ecebd306b2",
  "57558b36e4b065ecebd306b4",
  "57558b36e4b065ecebd306b6",
  "57558b36e4b065ecebd306b8",
  "57558b36e4b065ecebd306ba",
  "57558b36e4b065ecebd306bc",
  "57558b36e4b065ecebd306c0",
  "57558b36e4b065ecebd306c5",
  "57558b36e4b065ecebd306cb",
  "57558b36e4b065ecebd306ce",
  "57558b36e4b065ecebd306d1",
  "57558b36e4b065ecebd306d4",
  "57558b36e4b065ecebd306d7",
  "57558b36e4b065ecebd306da",
  "58daa1558bbb0b01f18ec1bc",
  "58daa1558bbb0b01f18ec1c0",
  "58daa1558bbb0b01f18ec1c4",
  "58daa1558bbb0b01f18ec1c7",
  "58daa1558bbb0b01f18ec1cd",
  "58daa1558bbb0b01f18ec1d3",
  "58daa1558bbb0b01f18ec1d9",
  "58daa1558bbb0b01f18ec1dc",
  "58daa1558bbb0b01f18ec1df",
  "58daa1558bbb0b01f18ec1e2",
  "58daa1558bbb0b01f18ec1ee",
  "58daa1558bbb0b01f18ec1f4",
  "5ae9595eb77c77002c2f9f26",
  "5bae9231bedf3950379f89d4",
  "5bae9231bedf3950379f89da",
  "5bae9231bedf3950379f89e1",
  "5bae9231bedf3950379f89e4",
  "5bae9231bedf3950379f89e7",
  "5bae9231bedf3950379f89ea",
  "5e179ee74ae8e90006e9a746",
  "5f2c1c31b6d05514c704334c",
  "5f2c239eb6d05514c70441ee",
  "5f2c2436b6d05514c704433e",
  "5f2c2abab6d05514c70446e4",
  "5f2c2b7db6d05514c7044837",
  "5f2c32587ff30c0d7ac09638",
  "5f2c344a5b4c177b9a6dc011",
  "5f2c3f6b5b4c177b9a6dc388",
  "5f2c430e5b4c177b9a6dcabd",
] as const;

export const FSQ_ALLOWED_FOOD_CATEGORY_SET: ReadonlySet<string> = new Set(
  FSQ_ALLOWED_FOOD_CATEGORY_LIST
);

/**
 * Root Restaurant category ID (`63be6904847c3692a84b9bb5`) used in the upstream
 * GET query URL to avoid HTTP 414 URI Too Long (9 KB query string), paired with
 * server-side filtering against `FSQ_ALLOWED_FOOD_CATEGORY_SET` above.
 */
export const FSQ_MODERN_FOOD_CATEGORIES = "63be6904847c3692a84b9bb5";

export const FSQ_V3_FOOD_CATEGORIES = "13065,13032,13002,13040";

/**
 * Resolves the Foursquare Places API key from either:
 * 1) Request header `x-foursquare-api-key` (configured via the in-app M3 Expressive modal), or
 * 2) Environment variable `FOURSQUARE_API_KEY` / `NEXT_PUBLIC_FOURSQUARE_API_KEY`.
 */
function getConfiguredServerFoursquareKey(): string | null {
  const envKey = (process.env.FOURSQUARE_API_KEY || "")
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (envKey && envKey !== "YOUR_FOURSQUARE_API_KEY_HERE") {
    return envKey;
  }
  return null;
}

export function resolveFoursquareApiKey(request: NextRequest): {
  apiKey: string | null;
  fromEnv: boolean;
} {
  // Always prioritize server-only FOURSQUARE_API_KEY when configured so untrusted
  // client headers cannot override or probe server key behavior in production.
  const serverKey = getConfiguredServerFoursquareKey();
  if (serverKey) {
    return { apiKey: serverKey, fromEnv: true };
  }

  const headerKey = request.headers
    .get("x-foursquare-api-key")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (headerKey && /^[\x21-\x7E]{12,128}$/.test(headerKey)) {
    return { apiKey: headerKey, fromEnv: false };
  }

  return { apiKey: null, fromEnv: false };
}

export function hasServerFoursquareKey(): boolean {
  return Boolean(getConfiguredServerFoursquareKey());
}

/**
 * Executes a Foursquare Places API GET request supporting BOTH:
 * - Modern Service API Keys (`https://places-api.foursquare.com/places/...` with `Authorization: Bearer <KEY>` + `X-Places-Api-Version: 2025-06-17`)
 * - Legacy v3 `fsq3...` API Keys (`https://api.foursquare.com/v3/places/...` with `Authorization: <KEY>`)
 */
export async function fetchFoursquareJson<T = unknown>(
  apiKey: string,
  modernPathWithQuery: string,
  legacyV3PathWithQuery: string,
  timeoutMs = 7000
): Promise<{ ok: boolean; status: number; data: T | null; errorMsg?: string }> {
  const isLegacyFsq3 = apiKey.startsWith("fsq3");

  const callModern = async () => {
    const res = await fetch(`${FOURSQUARE_MODERN_BASE}${modernPathWithQuery}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Places-Api-Version": FOURSQUARE_API_VERSION,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const json = await res.json().catch(() => null);
    return { res, json };
  };

  const callLegacyV3 = async () => {
    const res = await fetch(
      `${FOURSQUARE_LEGACY_V3_BASE}${legacyV3PathWithQuery}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: apiKey,
        },
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
    const json = await res.json().catch(() => null);
    return { res, json };
  };

  let attempt = isLegacyFsq3 ? await callLegacyV3() : await callModern();

  // Cross-version automatic retry if 401 occurs due to key format differences
  if (attempt.res.status === 401) {
    const fallback = isLegacyFsq3 ? await callModern() : await callLegacyV3();
    if (fallback.res.ok || fallback.res.status !== 401) {
      attempt = fallback;
    }
  }

  if (!attempt.res.ok) {
    const msg =
      (attempt.json as { message?: string } | null)?.message ||
      `Foursquare Places API returned HTTP ${attempt.res.status}`;
    return {
      ok: false,
      status: attempt.res.status,
      data: null,
      errorMsg: msg,
    };
  }

  return {
    ok: true,
    status: attempt.res.status,
    data: attempt.json as T,
  };
}

export function formatFoursquarePrice(priceTier?: number): string | undefined {
  switch (priceTier) {
    case 1:
      return "€";
    case 2:
      return "€€";
    case 3:
      return "€€€";
    case 4:
      return "€€€€";
    default:
      return undefined;
  }
}

export interface FoursquareCategoryRaw {
  id?: string | number;
  fsq_category_id?: string;
  name?: string;
  short_name?: string;
}

export function classifyFoursquareCategories(
  categories: FoursquareCategoryRaw[] = []
): {
  amenityCategory: "dining" | "quick" | "cafe";
  primaryCategoryName: string;
  rawCuisineHint: string;
} {
  const names = categories
    .map((c) => (c.short_name || c.name || "").trim())
    .filter(Boolean);
  const primaryCategoryName = names[0] || "Restaurant";
  const joined = names.join(" ").toLowerCase();

  let amenityCategory: "dining" | "quick" | "cafe" = "dining";
  if (
    /caf[eé]|coffee|bakery|boulangerie|p[aâ]tisserie|tea|ice cream|glacier|dessert|donut|creperie|cr[eê]perie|bagel|juice/i.test(
      joined
    )
  ) {
    amenityCategory = "cafe";
  } else if (
    /fast food|burger|sandwich|food truck|snack|kebab|taco|burrito|fried chicken|hot dog|falafel|takeaway|deli/i.test(
      joined
    )
  ) {
    amenityCategory = "quick";
  }

  const cuisineHints = names.map((n) =>
    n
      .replace(/\s+(restaurant|joint|place|spot|house|shop|bar)$/i, "")
      .toLowerCase()
  );

  return {
    amenityCategory,
    primaryCategoryName,
    rawCuisineHint: cuisineHints.join(";"),
  };
}

/**
 * Queries Panoramax (`api.panoramax.xyz` — official IGN & OpenStreetMap France
 * free street-level imagery STAC API, zero API keys!) around `(lat, lon)` as a
 * graceful open-data fallback when a Foursquare Free-tier key doesn't include
 * Premium venue photos.
 */
export async function fetchPanoramaxStreetPhotos(
  lat: number,
  lon: number,
  venueName: string
): Promise<RestaurantImage[]> {
  try {
    const d = 0.00045; // ~45m bounding box around venue coordinates
    const bbox = `${(lon - d).toFixed(6)},${(lat - d).toFixed(6)},${(
      lon + d
    ).toFixed(6)},${(lat + d).toFixed(6)}`;

    const res = await fetch(
      `https://api.panoramax.xyz/api/search?bbox=${bbox}&limit=2`,
      { signal: AbortSignal.timeout(3500) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    const imgs: RestaurantImage[] = [];
    for (const feat of features) {
      const rawHref =
        feat?.assets?.sd?.href ||
        feat?.assets?.hd?.href ||
        feat?.assets?.thumb?.href;
      const safeHref =
        typeof rawHref === "string"
          ? sanitizeExternalHttpUrl(rawHref, { httpsOnly: true })
          : undefined;
      if (safeHref) {
        const provider =
          feat?.providers?.[0]?.name || "Panoramax / IGN / OpenStreetMap";
        imgs.push({
          url: safeHref,
          caption: `Street view near ${venueName} (${provider})`,
          source: "Panoramax Street View",
          attribution: provider,
        });
      }
      if (imgs.length >= 2) break;
    }
    return imgs;
  } catch {
    return [];
  }
}
