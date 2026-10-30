"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  GeoLocation,
  Restaurant,
  RestaurantEnrichment,
} from "@/types/restaurant";
import { useRestaurantDetails } from "@/hooks/useRestaurantDetails";
import { PopupPhotoCarousel } from "@/components/popup/PopupPhotoCarousel";
import { PopupHeaderSummary } from "@/components/popup/PopupHeaderSummary";
import { PopupAddressHaversineGrid } from "@/components/popup/PopupAddressHaversineGrid";
import { PopupContactAmenities } from "@/components/popup/PopupContactAmenities";
import { PopupTipsSection } from "@/components/popup/PopupTipsSection";
import { OpenStreetMapCard } from "@/components/popup/OpenStreetMapCard";
import { PopupActionFooter } from "@/components/popup/PopupActionFooter";

interface RestaurantPopupProps {
  restaurant: Restaurant | null;
  originLocation?: GeoLocation | null;
  isWinnerPopup: boolean;
  apiHeaders: Record<string, string>;
  onEnriched?: (fsqId: string, enrichment: RestaurantEnrichment) => void;
  onClose: () => void;
  onSpinAgain: () => void;
  onExcludeAndSpin?: (id: string) => void;
  canExclude?: boolean;
}

export function RestaurantPopup({
  restaurant,
  originLocation,
  isWinnerPopup,
  apiHeaders,
  onEnriched,
  onClose,
  onSpinAgain,
  onExcludeAndSpin,
  canExclude = false,
}: RestaurantPopupProps) {
  const {
    enrichment,
    loadingDetails,
    galleryImages,
    activeImgIdx,
    setActiveImgIdx,
    markImageFailed,
    featureBadges,
  } = useRestaurantDetails({
    restaurant,
    apiHeaders,
    onEnriched,
  });

  React.useEffect(() => {
    if (!restaurant) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restaurant, onClose]);

  if (!restaurant) return null;

  const finalRating = enrichment?.rating ?? restaurant.rating;
  const finalRatingCount =
    enrichment?.userRatingCount ?? restaurant.userRatingCount;
  const finalOpenStatus = enrichment?.openStatus ?? restaurant.openStatus;
  const finalWebsite = restaurant.contact.website || enrichment?.website;
  const finalPhone = restaurant.contact.phone || enrichment?.phone;
  const finalEmail = restaurant.contact.email || enrichment?.email;
  const finalInstagram = restaurant.contact.instagram || enrichment?.instagram;
  const finalDescription = restaurant.description || enrichment?.summary;
  const finalWeekdayHours =
    enrichment?.weekdayDescriptions || restaurant.weekdayDescriptions;
  const finalPriceLabel = restaurant.priceLabel || enrichment?.priceLabel;
  const tastes = enrichment?.tastes || restaurant.tastes || [];
  const reviews = enrichment?.reviews || [];

  // Pure OpenStreetMap Directions URL (OSRM Foot Routing when origin is known)
  const osmDirectionsUrl = originLocation
    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${originLocation.lat}%2C${originLocation.lon}%3B${restaurant.lat}%2C${restaurant.lon}`
    : restaurant.contact.osmUri;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-restaurant-title"
      >
        {/* Scrim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/55 backdrop-blur-xs"
        />

        {/* M3 Expressive Dialog Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 26 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 18 }}
          transition={{ type: "spring", stiffness: 370, damping: 26 }}
          className="relative z-10 w-full max-w-3xl max-h-[91vh] flex flex-col overflow-hidden shadow-2xl border"
          style={{
            backgroundColor: "var(--md-sys-color-surface-container-low)",
            borderColor: "var(--md-sys-color-outline-variant)",
            borderRadius: "var(--md-sys-shape-corner-extra-large-increased)",
          }}
        >
          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1">
            {/* Hero Foursquare / Panoramax / Cuisine Photo Carousel */}
            <PopupPhotoCarousel
              galleryImages={galleryImages}
              activeImgIdx={activeImgIdx}
              onChangeActiveIdx={setActiveImgIdx}
              onImageError={markImageFailed}
              isWinnerPopup={isWinnerPopup}
              loadingDetails={loadingDetails}
              onClose={onClose}
            />

            {/* Body Content */}
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <PopupHeaderSummary
                restaurant={restaurant}
                rating={finalRating}
                ratingCount={finalRatingCount}
                priceLabel={finalPriceLabel}
                openStatus={finalOpenStatus}
                tastes={tastes}
                description={finalDescription}
              />

              {/* Bento Info Grid: Foursquare Address + Haversine Distance & Travel Time Calculus */}
              <PopupAddressHaversineGrid
                restaurant={restaurant}
                weekdayHours={finalWeekdayHours}
              />

              {/* Contact Links + Venue Services & Amenities Chips */}
              <PopupContactAmenities
                contact={restaurant.contact}
                phone={finalPhone}
                website={finalWebsite}
                instagram={finalInstagram}
                email={finalEmail}
                featureBadges={featureBadges}
              />

              {/* Foursquare Visitor Tips Section */}
              <PopupTipsSection reviews={reviews} />

              {/* Interactive OpenStreetMap Cartography + Haversine Geodesic Vector */}
              <OpenStreetMapCard
                restaurant={restaurant}
                originLocation={originLocation}
              />
            </div>
          </div>

          {/* Sticky M3 Expressive Bottom Action Footer */}
          <PopupActionFooter
            restaurantId={restaurant.id}
            osmDirectionsUrl={osmDirectionsUrl}
            onSpinAgain={onSpinAgain}
            canExclude={canExclude}
            onExcludeAndSpin={onExcludeAndSpin}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
