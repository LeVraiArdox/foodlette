"use client";

import React from "react";
import confetti from "canvas-confetti";
import type { Restaurant } from "@/types/restaurant";
import type { WheelSlicePalette } from "@/lib/m3-theme";
import { M3_EXPRESSIVE_PATHS } from "@/lib/shape-paths";
import { useWheelAudio } from "@/hooks/useWheelAudio";
import {
  WheelEmptyStage,
  WheelLoadingStage,
} from "@/components/wheel/WheelStatusStates";
import { WheelFlapperPointer } from "@/components/wheel/WheelFlapperPointer";
import { WheelCanvas } from "@/components/wheel/WheelCanvas";
import { WheelCenterHub } from "@/components/wheel/WheelCenterHub";

interface RouletteWheelProps {
  restaurants: Restaurant[];
  wheelSlices: WheelSlicePalette[];
  confettiColors: string[];
  loading: boolean;
  soundEnabled: boolean;
  onActiveRestaurantChange: (id: string | null) => void;
  onWinner: (restaurant: Restaurant) => void;
  spinTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

export function RouletteWheel({
  restaurants,
  wheelSlices,
  confettiColors,
  loading,
  soundEnabled,
  onActiveRestaurantChange,
  onWinner,
  spinTriggerRef,
}: RouletteWheelProps) {
  const [rotation, setRotation] = React.useState(0);
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [pointerKick, setPointerKick] = React.useState(0);
  const [hubHovered, setHubHovered] = React.useState(false);

  const rotationRef = React.useRef(0);
  const animFrameRef = React.useRef<number | null>(null);

  const { ensureAudioReady, playPegTick, playWinChime } =
    useWheelAudio(soundEnabled);

  React.useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Keep activeIndex valid when restaurant deck changes
  React.useEffect(() => {
    if (restaurants.length === 0) {
      setActiveIndex(0);
      onActiveRestaurantChange(null);
      return;
    }
    const delta = 360 / restaurants.length;
    const normOffset = ((-rotationRef.current % 360) + 360) % 360;
    const idx = Math.floor(normOffset / delta) % restaurants.length;
    setActiveIndex(idx);
    onActiveRestaurantChange(restaurants[idx]?.id ?? null);
  }, [restaurants, onActiveRestaurantChange]);

  const startSpin = React.useCallback(() => {
    if (isSpinning || restaurants.length === 0) return;

    setIsSpinning(true);
    ensureAudioReady();

    const count = restaurants.length;
    const delta = 360 / count;

    // Pick a uniformly random winning slice
    const winnerIdx = Math.floor(Math.random() * count);

    // Organic landing jitter strictly inside the winning slice boundaries
    const jitter = (Math.random() - 0.5) * 0.56 * delta;
    const desiredOffset = (winnerIdx + 0.5) * delta + jitter;
    const targetMod = (360 - (desiredOffset % 360) + 360) % 360;

    const startR = rotationRef.current;
    const currentMod = ((startR % 360) + 360) % 360;
    let forwardDelta = (targetMod - currentMod + 360) % 360;
    if (forwardDelta < 45) forwardDelta += 360;

    const fullSpins = 6 + Math.floor(Math.random() * 3); // 6 to 8 full exhilarating rotations
    const totalRotationDelta = fullSpins * 360 + forwardDelta;
    const targetR = startR + totalRotationDelta;

    const durationMs = 4900;
    const startTime = performance.now();
    let prevSliceIdx =
      Math.floor((((-startR % 360) + 360) % 360) / delta) % count;

    // Smooth quintic deceleration curve with energetic launch and suspenseful final crawl
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 4.6);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutQuint(t);
      const currentR = startR + totalRotationDelta * eased;

      rotationRef.current = currentR;
      setRotation(currentR);

      const normOffset = ((-currentR % 360) + 360) % 360;
      const curIdx = Math.floor(normOffset / delta) % count;

      if (curIdx !== prevSliceIdx) {
        prevSliceIdx = curIdx;
        setActiveIndex(curIdx);
        onActiveRestaurantChange(restaurants[curIdx]?.id ?? null);
        setPointerKick((k) => k + 1);
        playPegTick(1 - t);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        rotationRef.current = targetR;
        setRotation(targetR);
        setActiveIndex(winnerIdx);
        const winningSpot = restaurants[winnerIdx];
        onActiveRestaurantChange(winningSpot?.id ?? null);
        setIsSpinning(false);
        playWinChime();

        try {
          confetti({
            particleCount: 85,
            spread: 74,
            origin: { y: 0.56 },
            colors: confettiColors,
          });
        } catch {
          // Ignore confetti errors in headless/SSR
        }

        if (winningSpot) {
          setTimeout(() => {
            onWinner(winningSpot);
          }, 320);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [
    isSpinning,
    restaurants,
    ensureAudioReady,
    onActiveRestaurantChange,
    playPegTick,
    playWinChime,
    confettiColors,
    onWinner,
  ]);

  React.useEffect(() => {
    if (spinTriggerRef) {
      spinTriggerRef.current = startSpin;
    }
  }, [spinTriggerRef, startSpin]);

  if (loading) {
    return <WheelLoadingStage />;
  }

  if (restaurants.length === 0) {
    return <WheelEmptyStage />;
  }

  const count = restaurants.length;
  const activeSpot = restaurants[activeIndex] || restaurants[0];

  return (
    <div
      className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-7 rounded-[36px] relative overflow-hidden"
      style={{
        backgroundColor: "var(--md-sys-color-surface-container-low)",
      }}
    >
      {/* Decorative Expressive Background Blobs */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 opacity-25"
      >
        <path
          d={M3_EXPRESSIVE_PATHS.clover4}
          fill="var(--md-sys-color-tertiary-container)"
        />
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -bottom-20 -left-16 w-72 h-72 opacity-25"
      >
        <path
          d={M3_EXPRESSIVE_PATHS.flower6}
          fill="var(--md-sys-color-secondary-container)"
        />
      </svg>

      {/* Live Pointer Readout Pill */}
      <div
        className="relative z-10 flex items-center gap-2.5 px-4 py-2 rounded-full mb-4 max-w-full border"
        style={{
          backgroundColor: "var(--md-sys-color-surface-container-high)",
          borderColor: "var(--md-sys-color-outline-variant)",
        }}
      >
        <span
          className="material-symbols-rounded filled text-[19px] shrink-0"
          style={{ color: "var(--md-sys-color-primary)" }}
        >
          {activeSpot?.primaryIcon || "restaurant"}
        </span>
        <span
          className="m3-title-medium-emphasized text-sm sm:text-base truncate max-w-[240px] sm:max-w-[340px]"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          {activeSpot?.name}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold"
          style={{
            backgroundColor: "var(--md-sys-color-secondary-container)",
            color: "var(--md-sys-color-on-secondary-container)",
          }}
        >
          {activeSpot?.cuisines[0]}
        </span>
      </div>

      {/* Interactive Wheel Stage (Clicking anywhere on the wheel spins it!) */}
      <div className="relative flex items-center justify-center w-full max-w-[520px] aspect-square select-none">
        {/* Top 12-o'clock Spring-Loaded Flapper Pointer */}
        <WheelFlapperPointer pointerKick={pointerKick} />

        {/* Clickable Wheel SVG + Center Morphing Hub */}
        <div
          role="button"
          tabIndex={0}
          aria-label={
            isSpinning
              ? "Roulette wheel is spinning"
              : "Click wheel to spin for a random nearby restaurant"
          }
          onClick={startSpin}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startSpin();
            }
          }}
          onMouseEnter={() => setHubHovered(true)}
          onMouseLeave={() => setHubHovered(false)}
          className={`relative w-full h-full flex items-center justify-center rounded-full ${
            isSpinning ? "cursor-grabbing" : "cursor-pointer"
          }`}
        >
          <WheelCanvas
            restaurants={restaurants}
            wheelSlices={wheelSlices}
            rotation={rotation}
          />
          <WheelCenterHub isSpinning={isSpinning} hovered={hubHovered} />
        </div>
      </div>

      {/* Bottom Helper Caption */}
      <p
        className="relative z-10 text-xs sm:text-sm mt-3 text-center font-medium"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        {isSpinning
          ? "Hold tight — picking your next meal..."
          : `Tap anywhere on the wheel to spin across ${count} ${
              count === 1 ? "spot" : "spots"
            }`}
      </p>
    </div>
  );
}
