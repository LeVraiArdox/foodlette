"use client";

import React from "react";

/**
 * Synthesizes tactile Web Audio API peg ticks and C-major celebratory win chimes
 * for the Material 3 Expressive roulette wheel without external audio assets.
 */
export function useWheelAudio(soundEnabled: boolean) {
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const soundEnabledRef = React.useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const ensureAudioReady = React.useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playPegTick = React.useCallback(
    (speedRatio: number) => {
      if (!soundEnabledRef.current) return;
      const ctx = ensureAudioReady();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const baseFreq = 380 + Math.min(1, speedRatio) * 320;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.032);
        gain.gain.setValueAtTime(0.065, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.038);
      } catch {
        // Ignore audio errors
      }
    },
    [ensureAudioReady]
  );

  const playWinChime = React.useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = ensureAudioReady();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.075;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {
      // Ignore audio errors
    }
  }, [ensureAudioReady]);

  return {
    ensureAudioReady,
    playPegTick,
    playWinChime,
  };
}
