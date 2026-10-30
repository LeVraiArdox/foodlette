"use client";

import React from "react";
import { motion } from "framer-motion";

interface WheelFlapperPointerProps {
  pointerKick: number;
}

export function WheelFlapperPointer({ pointerKick }: WheelFlapperPointerProps) {
  return (
    <motion.div
      key={pointerKick}
      initial={pointerKick > 0 ? { rotate: -26, scale: 1.08 } : false}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 560, damping: 16 }}
      style={{ transformOrigin: "50% 14%" }}
      className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md"
    >
      <svg width="46" height="56" viewBox="0 0 46 56">
        <path
          d="M23 54 C20 44, 5 28, 5 17 A18 18 0 1 1 41 17 C41 28, 26 44, 23 54 Z"
          fill="var(--md-sys-color-primary)"
          stroke="var(--md-sys-color-surface-container-lowest)"
          strokeWidth="3.5"
        />
        <circle
          cx="23"
          cy="17"
          r="6.5"
          fill="var(--md-sys-color-on-primary)"
        />
      </svg>
    </motion.div>
  );
}
