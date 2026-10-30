"use client";

import React from "react";
import { ExpressiveShapeBadge } from "@/components/ui/ExpressiveShapeBadge";

export function BrandLockup() {
  return (
    <div className="flex items-center gap-3.5">
      <ExpressiveShapeBadge
        shape="cookie12"
        hoverShape="sunny8"
        size={48}
        fill="var(--md-sys-color-primary)"
      >
        <span
          className="material-symbols-rounded filled text-[24px]"
          style={{ color: "var(--md-sys-color-on-primary)" }}
        >
          casino
        </span>
      </ExpressiveShapeBadge>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1
            className="m3-headline-medium-emphasized text-2xl sm:text-[28px] tracking-tight"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Foodlette
          </h1>
        </div>
      </div>
    </div>
  );
}
