"use client";

import React from "react";
import { motion } from "framer-motion";
import type { RestaurantImage } from "@/types/restaurant";

interface PopupPhotoCarouselProps {
  galleryImages: RestaurantImage[];
  activeImgIdx: number;
  onChangeActiveIdx: React.Dispatch<React.SetStateAction<number>>;
  onImageError: (url: string) => void;
  isWinnerPopup: boolean;
  loadingDetails: boolean;
  onClose: () => void;
}

export function PopupPhotoCarousel({
  galleryImages,
  activeImgIdx,
  onChangeActiveIdx,
  onImageError,
  isWinnerPopup,
  loadingDetails,
  onClose,
}: PopupPhotoCarouselProps) {
  const currentImg =
    galleryImages[Math.min(activeImgIdx, galleryImages.length - 1)] ||
    galleryImages[0];

  return (
    <div
      className="relative w-full h-64 sm:h-80 overflow-hidden"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container-highest)",
      }}
    >
      {currentImg && (
        <motion.img
          key={currentImg.url}
          src={currentImg.url}
          alt={currentImg.caption}
          initial={{ opacity: 0.4, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          onError={() => onImageError(currentImg.url)}
          className="w-full h-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />

      {/* Carousel Navigation Arrows */}
      {galleryImages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() =>
              onChangeActiveIdx(
                (i) => (i - 1 + galleryImages.length) % galleryImages.length
              )
            }
            className="m3-expressive-btn absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 text-white backdrop-blur-xs"
          >
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() =>
              onChangeActiveIdx((i) => (i + 1) % galleryImages.length)
            }
            className="m3-expressive-btn absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 text-white backdrop-blur-xs"
          >
            <span className="material-symbols-rounded">chevron_right</span>
          </button>
        </>
      )}

      {/* Bottom Overlay Row: Photo Attribution & Dots */}
      <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-wrap items-end justify-between gap-2">
        {galleryImages.length > 1 && (
          <div className="flex items-center gap-1.5 bg-black/45 px-2.5 py-1.5 rounded-full backdrop-blur-xs">
            {galleryImages.map((img, i) => (
              <button
                key={img.url}
                type="button"
                aria-label={`View photo ${i + 1}`}
                onClick={() => onChangeActiveIdx(i)}
                className="h-2 rounded-full transition-all cursor-pointer"
                style={{
                  width: i === activeImgIdx ? 20 : 8,
                  backgroundColor:
                    i === activeImgIdx
                      ? "var(--md-sys-color-primary-container)"
                      : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
