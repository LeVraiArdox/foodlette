export interface CuisineMeta {
  label: string;
  icon: string;
  mealDbArea?: string;
  mealDbCategory?: string;
  fallbackImages: { url: string; caption: string }[];
}

const DEFAULT_FALLBACK_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    caption: "Warm dining room ambiance",
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
    caption: "Chef's freshly prepared table spread",
  },
];

export const CUISINE_CATALOG: Record<string, CuisineMeta> = {
  italian: {
    label: "Italian",
    icon: "local_pizza",
    mealDbArea: "Italian",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=1000&q=80",
        caption: "Artisanal Italian pasta & herbs",
      },
      {
        url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80",
        caption: "Wood-fired Neapolitan Margherita",
      },
    ],
  },
  pizza: {
    label: "Pizzeria",
    icon: "local_pizza",
    mealDbArea: "Italian",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
        caption: "Stone-baked artisan pizza",
      },
    ],
  },
  japanese: {
    label: "Japanese",
    icon: "ramen_dining",
    mealDbArea: "Japanese",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80",
        caption: "Fresh nigiri & maki sushi platter",
      },
      {
        url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
        caption: "Steaming bowl of rich Japanese ramen",
      },
    ],
  },
  sushi: {
    label: "Sushi",
    icon: "set_meal",
    mealDbArea: "Japanese",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=80",
        caption: "Omakase sushi selection",
      },
    ],
  },
  ramen: {
    label: "Ramen",
    icon: "ramen_dining",
    mealDbArea: "Japanese",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
        caption: "Hand-pulled noodles in savoury broth",
      },
    ],
  },
  french: {
    label: "French",
    icon: "dinner_dining",
    mealDbArea: "French",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1000&q=80",
        caption: "Classic French bistro cuisine",
      },
      {
        url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80",
        caption: "Brasserie table & seasonal plating",
      },
    ],
  },
  burger: {
    label: "Burger",
    icon: "lunch_dining",
    mealDbArea: "American",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
        caption: "Gourmet smashed burger on brioche",
      },
    ],
  },
  american: {
    label: "American",
    icon: "lunch_dining",
    mealDbArea: "American",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80",
        caption: "Classic American grill favourites",
      },
    ],
  },
  chinese: {
    label: "Chinese",
    icon: "ramen_dining",
    mealDbArea: "Chinese",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
        caption: "Steamed bamboo basket dim sum",
      },
    ],
  },
  indian: {
    label: "Indian",
    icon: "soup_kitchen",
    mealDbArea: "Indian",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80",
        caption: "Spiced Indian curries & tandoori naan",
      },
    ],
  },
  mexican: {
    label: "Mexican",
    icon: "tapas",
    mealDbArea: "Mexican",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80",
        caption: "Street-style Mexican tacos with lime & cilantro",
      },
    ],
  },
  thai: {
    label: "Thai",
    icon: "ramen_dining",
    mealDbArea: "Thai",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1000&q=80",
        caption: "Fragrant Pad Thai with crushed peanuts & lime",
      },
    ],
  },
  vietnamese: {
    label: "Vietnamese",
    icon: "soup_kitchen",
    mealDbArea: "Vietnamese",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80",
        caption: "Aromatic Vietnamese Pho with fresh herbs",
      },
    ],
  },
  korean: {
    label: "Korean",
    icon: "bento",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1000&q=80",
        caption: "Sizzling Korean bibimbap & banchan",
      },
    ],
  },
  kebab: {
    label: "Kebab & Grill",
    icon: "kebab_dining",
    mealDbArea: "Turkish",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1000&q=80",
        caption: "Charcoal-grilled Mediterranean skewers & flatbread",
      },
    ],
  },
  turkish: {
    label: "Turkish",
    icon: "kebab_dining",
    mealDbArea: "Turkish",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
        caption: "Anatolian mezze & wood-fired grill",
      },
    ],
  },
  lebanese: {
    label: "Lebanese",
    icon: "tapas",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1000&q=80",
        caption: "Levantine mezze platter with hummus & falafel",
      },
    ],
  },
  mediterranean: {
    label: "Mediterranean",
    icon: "tapas",
    mealDbArea: "Greek",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
        caption: "Sun-ripened Mediterranean dishes",
      },
    ],
  },
  seafood: {
    label: "Seafood",
    icon: "set_meal",
    mealDbCategory: "Seafood",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=1000&q=80",
        caption: "Fresh coastal catch & shellfish",
      },
    ],
  },
  steak_house: {
    label: "Steakhouse",
    icon: "dinner_dining",
    mealDbCategory: "Beef",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1000&q=80",
        caption: "Prime flame-seared steak cut",
      },
    ],
  },
  coffee_shop: {
    label: "Coffee & Café",
    icon: "local_cafe",
    mealDbCategory: "Dessert",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80",
        caption: "Specialty pour-over & latte art",
      },
    ],
  },
  bakery: {
    label: "Bakery & Pastry",
    icon: "bakery_dining",
    mealDbCategory: "Dessert",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
        caption: "Golden flaky artisan pastries & sourdough",
      },
    ],
  },
  vegetarian: {
    label: "Vegetarian",
    icon: "eco",
    mealDbCategory: "Vegetarian",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
        caption: "Vibrant seasonal harvest bowl",
      },
    ],
  },
  vegan: {
    label: "Plant-Based",
    icon: "eco",
    mealDbCategory: "Vegan",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
        caption: "Colorful plant-based culinary bowl",
      },
    ],
  },
  ice_cream: {
    label: "Gelato & Ice Cream",
    icon: "icecream",
    mealDbCategory: "Dessert",
    fallbackImages: [
      {
        url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80",
        caption: "Handcrafted small-batch gelato scoops",
      },
    ],
  },
};

export function formatAmenityLabel(amenity: string): string {
  const map: Record<string, string> = {
    restaurant: "Restaurant",
    fast_food: "Fast Casual",
    cafe: "Café & Bistro",
    bar: "Bar & Kitchen",
    pub: "Gastropub",
    food_court: "Food Hall",
    biergarten: "Beer Garden",
    ice_cream: "Gelateria",
  };
  return (
    map[amenity] ||
    amenity
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

export function parseCuisines(
  rawCuisine: string | undefined,
  amenity: string
): { cuisines: string[]; primaryIcon: string; meta: CuisineMeta } {
  const tokens = (rawCuisine || "")
    .split(/[;,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  let matchedMeta: CuisineMeta | undefined;
  const labels: string[] = [];

  for (const token of tokens) {
    const cleanKey = token.replace(/\s+/g, "_");
    const found =
      CUISINE_CATALOG[cleanKey] ||
      Object.entries(CUISINE_CATALOG).find(([k]) => cleanKey.includes(k))?.[1];
    if (found) {
      if (!matchedMeta) matchedMeta = found;
      if (!labels.includes(found.label)) labels.push(found.label);
    } else {
      const pretty = token
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (!labels.includes(pretty)) labels.push(pretty);
    }
  }

  if (!matchedMeta) {
    if (amenity === "cafe") matchedMeta = CUISINE_CATALOG.coffee_shop;
    else if (amenity === "ice_cream") matchedMeta = CUISINE_CATALOG.ice_cream;
    else if (amenity === "fast_food") matchedMeta = CUISINE_CATALOG.burger;
  }

  const defaultIconMap: Record<string, string> = {
    restaurant: "restaurant",
    fast_food: "lunch_dining",
    cafe: "local_cafe",
    bar: "local_bar",
    pub: "sports_bar",
    food_court: "storefront",
    biergarten: "deck",
    ice_cream: "icecream",
  };

  const finalMeta: CuisineMeta = matchedMeta || {
    label: formatAmenityLabel(amenity),
    icon: defaultIconMap[amenity] || "restaurant",
    fallbackImages: DEFAULT_FALLBACK_IMAGES,
  };

  if (labels.length === 0) {
    labels.push(formatAmenityLabel(amenity));
  }

  return {
    cuisines: labels.slice(0, 4),
    primaryIcon: finalMeta.icon,
    meta: finalMeta,
  };
}

/**
 * Lightweight evaluator for common OpenStreetMap opening_hours strings.
 */
export function evaluateOpeningHours(openingHours?: string): {
  isOpen: boolean | null;
  label: string;
} {
  if (!openingHours) {
    return { isOpen: null, label: "Hours not listed" };
  }
  const trimmed = openingHours.trim();
  if (trimmed === "24/7") {
    return { isOpen: true, label: "Open 24/7" };
  }

  try {
    const now = new Date();
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const todayIdx = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const rules = trimmed.split(";").map((r) => r.trim()).filter(Boolean);
    let matchedDayRule = false;

    for (const rule of rules) {
      if (/\boff\b|\bclosed\b/i.test(rule)) {
        const dayPart = rule.split(/\s+/)[0];
        if (matchesDay(dayPart, todayIdx, dayNames)) {
          return { isOpen: false, label: "Closed today" };
        }
        continue;
      }

      const match = rule.match(
        /^([A-Za-z,-]+)?\s*(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)$/
      );
      if (!match) continue;

      const daySpec = match[1];
      const timeRanges = match[2];

      if (!daySpec || matchesDay(daySpec, todayIdx, dayNames)) {
        matchedDayRule = true;
        const ranges = timeRanges.split(",");
        for (const range of ranges) {
          const [startStr, endStr] = range.split("-").map((s) => s.trim());
          const startMin = toMinutes(startStr);
          let endMin = toMinutes(endStr);
          if (startMin === null || endMin === null) continue;
          if (endMin <= startMin) {
            // Spans midnight
            if (currentMinutes >= startMin || currentMinutes <= endMin) {
              return { isOpen: true, label: `Open now • until ${endStr}` };
            }
          } else if (currentMinutes >= startMin && currentMinutes <= endMin) {
            return { isOpen: true, label: `Open now • until ${endStr}` };
          }
        }
      }
    }

    if (matchedDayRule) {
      return { isOpen: false, label: "Currently closed" };
    }
  } catch {
    // Fallback gracefully
  }

  return { isOpen: null, label: trimmed };
}

function toMinutes(hhmm: string): number | null {
  const parts = hhmm.split(":");
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function matchesDay(spec: string, todayIdx: number, dayNames: string[]): boolean {
  const segments = spec.split(",");
  for (const seg of segments) {
    if (seg.includes("-")) {
      const [startD, endD] = seg.split("-");
      const sIdx = dayNames.indexOf(startD);
      const eIdx = dayNames.indexOf(endD);
      if (sIdx === -1 || eIdx === -1) continue;
      if (sIdx <= eIdx) {
        if (todayIdx >= sIdx && todayIdx <= eIdx) return true;
      } else {
        if (todayIdx >= sIdx || todayIdx <= eIdx) return true;
      }
    } else {
      if (dayNames.indexOf(seg) === todayIdx) return true;
    }
  }
  return false;
}
