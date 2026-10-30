"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  M3_EXPRESSIVE_PATHS,
  type ExpressiveShapeName,
} from "@/lib/shape-paths";

const LOADER_SEQUENCE: ExpressiveShapeName[] = [
  "cookie12",
  "squircle",
  "clover4",
  "sunny8",
  "flower6",
  "circle",
];

/**
 * Authentic Material 3 Expressive Shape-Morphing Loading Indicator.
 * Fluidly morphs through geometric polygons while rotating with spring-like cadence.
 */
export function M3ExpressiveLoader({
  size = 64,
  label,
}: {
  size?: number;
  label?: string;
}) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % LOADER_SEQUENCE.length);
    }, 620);
    return () => clearInterval(timer);
  }, []);

  const currentShape = LOADER_SEQUENCE[step];

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size + 20,
          height: size + 20,
          backgroundColor: "var(--md-sys-color-primary-container)",
        }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          style={{ width: size, height: size }}
          animate={{ rotate: step * 65 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
        >
          <motion.path
            animate={{ d: M3_EXPRESSIVE_PATHS[currentShape] }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 20,
            }}
            fill="var(--md-sys-color-primary)"
          />
        </motion.svg>
        <span
          className="material-symbols-rounded absolute text-[22px]"
          style={{
            color: "var(--md-sys-color-on-primary)",
            fontVariationSettings: "'FILL' 1, 'wght' 600",
          }}
        >
          restaurant
        </span>
      </div>
      {label && (
        <span
          className="text-sm tracking-wide font-semibold"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
