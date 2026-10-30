import materialTheme from "@/constants/material-theme.json";

export interface WheelSlicePalette {
  fill: string;
  text: string;
  badgeFill: string;
  badgeText: string;
}

export interface GeneratedM3Theme {
  cssVars: Record<string, string>;
  wheelSlices: WheelSlicePalette[];
  confettiColors: string[];
}

function toKebabCase(camelKey: string): string {
  return camelKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Resolves the exported Material Theme Builder JSON scheme (`#B33B15` seed)
 * into `--md-sys-color-*` CSS variables, 6 alternating roulette wheel slice
 * palettes, and confetti colors for Light and Dark modes.
 */
export function getMaterialTheme(isDark: boolean): GeneratedM3Theme {
  const scheme = isDark
    ? materialTheme.schemes.dark
    : materialTheme.schemes.light;
  const { primary: pPal, secondary: sPal, tertiary: tPal } =
    materialTheme.palettes;

  const cssVars: Record<string, string> = {};
  for (const [key, hex] of Object.entries(scheme)) {
    cssVars[`--md-sys-color-${toKebabCase(key)}`] = hex;
  }

  // Build 6 distinct tonal wheel slice palettes from the Material Theme JSON
  // so adjacent slices alternate hue and contrast cleanly in Light & Dark modes.
  const wheelSlices: WheelSlicePalette[] = isDark
    ? [
        {
          fill: scheme.primaryContainer,
          text: scheme.onPrimaryContainer,
          badgeFill: pPal["40"],
          badgeText: pPal["95"],
        },
        {
          fill: scheme.tertiaryContainer,
          text: scheme.onTertiaryContainer,
          badgeFill: tPal["40"],
          badgeText: tPal["95"],
        },
        {
          fill: scheme.secondaryContainer,
          text: scheme.onSecondaryContainer,
          badgeFill: sPal["40"],
          badgeText: sPal["95"],
        },
        {
          fill: pPal["25"],
          text: pPal["90"],
          badgeFill: pPal["35"],
          badgeText: pPal["98"],
        },
        {
          fill: tPal["30"],
          text: tPal["90"],
          badgeFill: tPal["40"],
          badgeText: tPal["98"],
        },
        {
          fill: sPal["25"],
          text: sPal["90"],
          badgeFill: sPal["35"],
          badgeText: sPal["98"],
        },
      ]
    : [
        {
          fill: scheme.primaryContainer,
          text: scheme.onPrimaryFixed,
          badgeFill: scheme.primary,
          badgeText: scheme.onPrimary,
        },
        {
          fill: scheme.tertiaryContainer,
          text: scheme.onTertiaryFixed,
          badgeFill: scheme.tertiary,
          badgeText: scheme.onTertiary,
        },
        {
          fill: scheme.secondaryFixedDim,
          text: scheme.onSecondaryFixed,
          badgeFill: scheme.secondary,
          badgeText: scheme.onSecondary,
        },
        {
          fill: scheme.primaryFixedDim,
          text: scheme.onPrimaryFixed,
          badgeFill: pPal["35"],
          badgeText: pPal["100"],
        },
        {
          fill: scheme.tertiaryFixedDim,
          text: scheme.onTertiaryFixed,
          badgeFill: tPal["35"],
          badgeText: tPal["100"],
        },
        {
          fill: scheme.surfaceVariant,
          text: scheme.onSecondaryFixed,
          badgeFill: sPal["40"],
          badgeText: sPal["100"],
        },
      ];

  const confettiColors = [
    pPal["60"],
    tPal["70"],
    sPal["60"],
    scheme.primary,
    tPal["80"],
  ];

  return { cssVars, wheelSlices, confettiColors };
}
