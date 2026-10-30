"use client";

import React from "react";
import { M3_EXPRESSIVE_PATHS } from "@/lib/shape-paths";
import { M3ExpressiveLoader } from "@/components/ui/M3ExpressiveLoader";

export function WheelLoadingStage() {
  return (
    <div
      className="w-full flex-1 min-h-[460px] flex flex-col items-center justify-center p-8 rounded-[36px]"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container-low)",
      }}
    >
      <M3ExpressiveLoader
        size={72}
        label="Finding delicious restaurants nearby..."
      />
    </div>
  );
}

export function WheelEmptyStage() {
  return (
    <div
      className="w-full flex-1 min-h-[460px] flex flex-col items-center justify-center p-8 text-center rounded-[36px]"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container-low)",
      }}
    >
      <svg viewBox="0 0 100 100" className="w-20 h-20 mb-4">
        <path
          d={M3_EXPRESSIVE_PATHS.sunny8}
          fill="var(--md-sys-color-tertiary-container)"
        />
      </svg>
      <h3
        className="m3-headline-medium-emphasized text-2xl"
        style={{ color: "var(--md-sys-color-on-surface)" }}
      >
        Wheel is Hungry!
      </h3>
      <p
        className="text-sm mt-2 max-w-md"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        Search a city or street in the bar above, tap <strong>Near Me</strong>,
        or toggle restaurants back onto the wheel from the list on the left.
      </p>
    </div>
  );
}
