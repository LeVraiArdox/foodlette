"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  M3_EXPRESSIVE_PATHS,
  type ExpressiveShapeName,
} from "@/lib/shape-paths";

export interface ExpressiveShapeBadgeProps {
  shape: ExpressiveShapeName;
  hoverShape?: ExpressiveShapeName;
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  spinSlowly?: boolean;
}

export function ExpressiveShapeBadge({
  shape,
  hoverShape,
  size = 44,
  fill = "var(--md-sys-color-secondary-container)",
  stroke,
  strokeWidth = 0,
  className = "",
  children,
  spinSlowly = false,
}: ExpressiveShapeBadgeProps) {
  const [hovered, setHovered] = React.useState(false);
  const activeShape = hovered && hoverShape ? hoverShape : shape;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full overflow-visible"
        animate={spinSlowly ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spinSlowly
            ? { repeat: Infinity, duration: 18, ease: "linear" }
            : { type: "spring", stiffness: 320, damping: 22 }
        }
      >
        <motion.path
          animate={{ d: M3_EXPRESSIVE_PATHS[activeShape] }}
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </motion.svg>
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
