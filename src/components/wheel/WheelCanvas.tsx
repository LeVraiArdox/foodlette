"use client";

import React from "react";
import type { Restaurant } from "@/types/restaurant";
import type { WheelSlicePalette } from "@/lib/m3-theme";
import {
  describeSlice,
  polarToCartesian,
  truncateLabel,
} from "@/components/wheel/wheel-geometry";

interface WheelCanvasProps {
  restaurants: Restaurant[];
  wheelSlices: WheelSlicePalette[];
  rotation: number;
}

const CX = 260;
const CY = 260;
const OUTER_RIM_RADIUS = 250;
const WHEEL_RADIUS = 234;

export function WheelCanvas({
  restaurants,
  wheelSlices,
  rotation,
}: WheelCanvasProps) {
  const count = restaurants.length;
  const delta = 360 / count;

  return (
    <svg
      viewBox="0 0 520 520"
      className="w-full h-full overflow-visible drop-shadow-sm"
    >
      {/* Outer Expressive Tonal Rim */}
      <circle
        cx={CX}
        cy={CY}
        r={OUTER_RIM_RADIUS}
        fill="var(--md-sys-color-surface-container-highest)"
        stroke="var(--md-sys-color-outline-variant)"
        strokeWidth="2.5"
      />

      {/* Rotating Wheel Group */}
      <g transform={`rotate(${rotation.toFixed(3)} ${CX} ${CY})`}>
        {restaurants.map((restaurant, idx) => {
          // Ensure last slice never shares exact same palette as slice 0 when count % len === 1
          let paletteIdx = idx % wheelSlices.length;
          if (
            count > 1 &&
            idx === count - 1 &&
            paletteIdx === 0 &&
            wheelSlices.length > 1
          ) {
            paletteIdx = 1;
          }
          const palette = wheelSlices[paletteIdx];

          const startAngle = -90 + idx * delta;
          const endAngle = startAngle + delta;
          const midAngle = startAngle + delta / 2;
          const pathData = describeSlice(
            CX,
            CY,
            WHEEL_RADIUS,
            startAngle,
            endAngle
          );

          // Position text radially along midAngle from center toward outer rim
          const labelRadius = WHEEL_RADIUS * 0.63;
          const labelPos = polarToCartesian(CX, CY, labelRadius, midAngle);
          const pegPos = polarToCartesian(
            CX,
            CY,
            OUTER_RIM_RADIUS - 7.5,
            startAngle
          );

          const fontSize =
            count >= 20 ? 9.5 : count >= 15 ? 11 : count >= 10 ? 12.5 : 14;

          return (
            <g key={restaurant.id}>
              <path
                d={pathData}
                fill={palette.fill}
                stroke="var(--md-sys-color-surface-container-low)"
                strokeWidth={count > 1 ? "2.5" : "0"}
              />

              {/* Restaurant Name along Slice Ray */}
              <g
                transform={`translate(${labelPos.x.toFixed(
                  2
                )}, ${labelPos.y.toFixed(2)}) rotate(${midAngle.toFixed(2)})`}
              >
                <text
                  x={10}
                  y={0}
                  fill={palette.text}
                  fontSize={fontSize}
                  fontWeight={750}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily:
                      '"Roboto Flex Variable", "Roboto Flex", sans-serif',
                    letterSpacing: "-0.01em",
                  }}
                >
                  {truncateLabel(restaurant.name, count)}
                </text>
              </g>

              {/* Outer Rim Peg Stud at Slice Boundary */}
              <circle
                cx={pegPos.x}
                cy={pegPos.y}
                r="4.2"
                fill="var(--md-sys-color-primary)"
                stroke="var(--md-sys-color-surface-container-lowest)"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
