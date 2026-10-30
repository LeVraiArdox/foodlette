"use client";

import React from "react";
import type { RestaurantContact, VenueFeatureBadge } from "@/types/restaurant";

interface PopupContactAmenitiesProps {
  contact: RestaurantContact;
  phone?: string;
  website?: string;
  instagram?: string;
  email?: string;
  featureBadges: VenueFeatureBadge[];
}

export function PopupContactAmenities({
  contact,
  phone,
  website,
  instagram,
  email,
  featureBadges,
}: PopupContactAmenitiesProps) {
  return (
    <>
      {/* Contact, Foursquare & OpenStreetMap Links Row */}
      <div
        className="p-4 rounded-[24px] flex flex-wrap items-center gap-2"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container)",
        }}
      >
        {phone && (
          <a
            href={`tel:${phone}`}
            className="m3-expressive-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs m3-label-large-emphasized"
            style={{
              backgroundColor: "var(--md-sys-color-secondary-container)",
              color: "var(--md-sys-color-on-secondary-container)",
            }}
          >
            <span className="material-symbols-rounded filled text-[16px]">
              call
            </span>
            <span>{phone}</span>
          </a>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="m3-expressive-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs m3-label-large-emphasized"
            style={{
              backgroundColor: "var(--md-sys-color-primary-container)",
              color: "var(--md-sys-color-on-primary-container)",
            }}
          >
            <span className="material-symbols-rounded text-[16px]">
              language
            </span>
            <span>Official Website</span>
          </a>
        )}

        {instagram && (
          <a
            href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="m3-expressive-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs m3-label-large-emphasized"
            style={{
              backgroundColor:
                "var(--md-sys-color-surface-container-highest)",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            <span className="material-symbols-rounded text-[16px]">
              photo_camera
            </span>
            <span>@{instagram.replace(/^@/, "")}</span>
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="m3-expressive-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs m3-label-large-emphasized"
            style={{
              backgroundColor:
                "var(--md-sys-color-surface-container-highest)",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            <span className="material-symbols-rounded text-[16px]">mail</span>
            <span>{email}</span>
          </a>
        )}

        <a
          href={contact.osmUri}
          target="_blank"
          rel="noopener noreferrer"
          className="m3-expressive-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-xs m3-label-large-emphasized"
          style={{
            backgroundColor: "var(--md-sys-color-secondary-container)",
            color: "var(--md-sys-color-on-secondary-container)",
          }}
        >
          <span className="material-symbols-rounded text-[16px]">public</span>
          <span>View on OpenStreetMap</span>
        </a>
      </div>

      {/* Dining, Amenities & Accessibility Chips */}
      {featureBadges.length > 0 && (
        <div>
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Venue Services &amp; Amenities
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {featureBadges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor:
                    "var(--md-sys-color-surface-container-highest)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                <span
                  className="material-symbols-rounded text-[16px]"
                  style={{ color: "var(--md-sys-color-primary)" }}
                >
                  {b.icon}
                </span>
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
