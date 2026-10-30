"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  M3_EXPRESSIVE_PATHS,
  type ExpressiveShapeName,
} from "@/lib/shape-paths";

interface WheelCenterHubProps {
  isSpinning: boolean;
  hovered: boolean;
}

export function WheelCenterHub({ isSpinning, hovered }: WheelCenterHubProps) {
  const hubShape: ExpressiveShapeName = isSpinning
    ? "sunny8"
    : hovered
    ? "clover4"
    : "cookie12";

  return (
    <motion.div
      whileHover={isSpinning ? {} : { scale: 1.07 }}
      whileTap={isSpinning ? {} : { scale: 0.91 }}
      transition={{ type: "spring", stiffness: 440, damping: 20 }}
      className="absolute z-20 w-[112px] h-[112px] sm:w-[126px] sm:h-[126px] flex items-center justify-center"
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full drop-shadow-md"
        animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isSpinning
            ? { repeat: Infinity, duration: 3.2, ease: "linear" }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
      >
        <motion.path
          animate={{ d: M3_EXPRESSIVE_PATHS[hubShape] }}
          initial={false}
          transition={{ type: "spring", stiffness: 360, damping: 20 }}
          fill="var(--md-sys-color-primary)"
          stroke="var(--md-sys-color-surface-container-lowest)"
          strokeWidth="3.5"
        />
      </motion.svg>

      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ color: "var(--md-sys-color-on-primary)" }}
      >
        <span className="material-symbols-rounded filled text-[24px] sm:text-[28px]">
          {isSpinning ? "autorenew" : "casino"}
        </span>
        <span className="m3-label-large-emphasized text-xs sm:text-sm uppercase tracking-wider mt-0.5">
          {isSpinning ? "Spinning" : "Spin!"}
        </span>
      </div>
    </motion.div>
  );
}
