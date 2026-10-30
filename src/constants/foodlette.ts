import type { CategoryFilter, GeoLocation } from "@/types/restaurant";

export const DEFAULT_WHEEL_COUNT = 14;
export const MAX_WHEEL_SLICES = 24;
export const STORAGE_KEY_FSQ_API = "foodlette_foursquare_api_key";

export const RADIUS_OPTIONS: { value: number; label: string }[] = [
  { value: 600, label: "600m" },
  { value: 1500, label: "1.5 km" },
  { value: 3000, label: "3 km" },
  { value: 5000, label: "5 km" },
];

export const CATEGORY_TABS: {
  id: CategoryFilter;
  label: string;
  icon: string;
}[] = [
  { id: "all", label: "All", icon: "restaurant_menu" },
  { id: "dining", label: "Dining", icon: "dinner_dining" },
  { id: "quick", label: "Fast", icon: "lunch_dining" },
  { id: "cafe", label: "Cafés", icon: "local_cafe" },
];

export const QUICK_LOCATIONS: GeoLocation[] = [
  {
    lat: 48.8592,
    lon: 2.3622,
    label: "Le Marais, Paris",
    subtitle: "75004 Paris • Île-de-France",
    source: "preset",
  },
  {
    lat: 45.7623,
    lon: 4.8275,
    label: "Vieux Lyon",
    subtitle: "69005 Lyon • Auvergne-Rhône-Alpes",
    source: "preset",
  },
  {
    lat: 44.8528,
    lon: -0.5705,
    label: "Les Chartrons, Bordeaux",
    subtitle: "33000 Bordeaux • Nouvelle-Aquitaine",
    source: "preset",
  },
  {
    lat: 43.2951,
    lon: 5.3744,
    label: "Vieux-Port, Marseille",
    subtitle: "13001 Marseille • Provence-Alpes-Côte d'Azur",
    source: "preset",
  },
  {
    lat: 43.6045,
    lon: 1.4442,
    label: "Capitole, Toulouse",
    subtitle: "31000 Toulouse • Occitanie",
    source: "preset",
  },
  {
    lat: 50.6412,
    lon: 3.0626,
    label: "Vieux-Lille",
    subtitle: "59800 Lille • Hauts-de-France",
    source: "preset",
  },
  {
    lat: 48.5809,
    lon: 7.7414,
    label: "Petite France, Strasbourg",
    subtitle: "67000 Strasbourg • Grand Est",
    source: "preset",
  },
  {
    lat: 47.2153,
    lon: -1.5535,
    label: "Bouffay, Nantes",
    subtitle: "44000 Nantes • Pays de la Loire",
    source: "preset",
  },
];
