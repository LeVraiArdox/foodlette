export type CategoryFilter = "all" | "dining" | "quick" | "cafe";

export interface VenueFeatureBadge {
  icon: string;
  label: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  label: string;
  subtitle?: string;
  banId?: string;
  source: "gps" | "search" | "preset";
  /** True when position comes from coarse ISP IP geolocation rather than GPS or Wi-Fi triangulation */
  approximate?: boolean;
  /** Estimated horizontal accuracy radius in meters when available */
  accuracyMeters?: number;
}

export interface LocationSuggestion {
  id: string;
  banId: string;
  shortName: string;
  subtitle: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
}

export interface RestaurantImage {
  url: string;
  caption: string;
  source: "Foursquare Photo" | "Panoramax Street View" | "Cuisine Preview";
  attribution?: string;
  authorUri?: string;
}

export interface RestaurantReview {
  authorName: string;
  rating?: number;
  relativeTime: string;
  text: string;
}

export interface RestaurantAddress {
  formatted: string;
  street?: string;
  postcode?: string;
  city?: string;
  country?: string;
}

export interface RestaurantContact {
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  foursquareUri: string;
  osmUri: string;
}

export interface RestaurantFeatures {
  dineIn?: boolean;
  takeaway?: boolean;
  delivery?: boolean;
  reservable?: boolean;
  outdoorSeating?: boolean;
  vegetarian?: boolean;
  wheelchairEntrance?: boolean;
  acceptsCards?: boolean;
  wifi?: boolean;
}

export interface HaversineMetrics {
  /** Straight-line great-circle geodesic distance in meters */
  distanceMeters: number;
  /** Urban street-grid adjusted distance estimate in meters (circuity factor 1.28) */
  estimatedRouteMeters: number;
  /** Walking duration in minutes derived from Haversine calculus (~4.8 km/h) */
  walkMinutes: number;
  /** Cycling duration in minutes derived from Haversine calculus (~15 km/h) */
  bikeMinutes: number;
  /** Urban driving duration in minutes derived from Haversine calculus (~24 km/h) */
  driveMinutes: number;
  /** Initial geodesic forward azimuth in degrees (0-359) */
  bearingDegrees: number;
  /** 8-wind cardinal compass direction (N, NE, E, SE, S, SW, W, NW) */
  compassDirection: string;
}

export interface Restaurant {
  id: string;
  fsqId: string;
  name: string;
  primaryType: string;
  amenityCategory: "dining" | "quick" | "cafe";
  amenityLabel: string;
  cuisines: string[];
  primaryIcon: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  estimatedRouteMeters: number;
  walkMinutes: number;
  bikeMinutes: number;
  driveMinutes: number;
  bearingDegrees: number;
  compassDirection: string;
  /** Foursquare 10-point rating (e.g. 8.6 / 10) */
  rating?: number;
  userRatingCount?: number;
  priceLabel?: string;
  address: RestaurantAddress;
  contact: RestaurantContact;
  weekdayDescriptions?: string[];
  openStatus: {
    isOpen: boolean | null;
    label: string;
  };
  features: RestaurantFeatures;
  tastes?: string[];
  description?: string;
  chains?: string[];
}

export interface RestaurantEnrichment {
  images: RestaurantImage[];
  reviews: RestaurantReview[];
  rating?: number;
  userRatingCount?: number;
  openStatus?: {
    isOpen: boolean | null;
    label: string;
  };
  features?: RestaurantFeatures;
  tastes?: string[];
  summary?: string;
  weekdayDescriptions?: string[];
  priceLabel?: string;
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  cached?: boolean;
}
