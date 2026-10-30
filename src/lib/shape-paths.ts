export type ExpressiveShapeName =
  | "cookie12"
  | "sunny8"
  | "clover4"
  | "flower6"
  | "squircle"
  | "softBurst10"
  | "circle"
  | "gem4";

const VERTEX_COUNT = 96;

/**
 * Generates normalized SVG path strings (viewBox 0 0 100 100) with an identical
 * 96-vertex command structure so any M3 Expressive shape can smoothly morph into any other.
 */
function buildPolarPath(radiusFn: (theta: number) => number): string {
  const pts: string[] = [];
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const theta = (i / VERTEX_COUNT) * Math.PI * 2 - Math.PI / 2;
    const r = radiusFn(theta);
    const x = 50 + r * Math.cos(theta);
    const y = 50 + r * Math.sin(theta);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

export const M3_EXPRESSIVE_PATHS: Record<ExpressiveShapeName, string> = {
  circle: buildPolarPath(() => 46),
  cookie12: buildPolarPath((t) => 41.5 + 5.2 * Math.cos(12 * t)),
  sunny8: buildPolarPath((t) => 40.5 + 6.5 * Math.cos(8 * t)),
  clover4: buildPolarPath((t) => 39.2 + 7.8 * Math.cos(4 * t)),
  flower6: buildPolarPath((t) => 40.2 + 6.6 * Math.cos(6 * t)),
  softBurst10: buildPolarPath((t) => 41.0 + 5.6 * Math.cos(10 * t)),
  squircle: buildPolarPath((t) => {
    const c = Math.abs(Math.cos(t));
    const s = Math.abs(Math.sin(t));
    const denom = Math.pow(Math.pow(c, 4.2) + Math.pow(s, 4.2), 1 / 4.2);
    return 44.5 / (denom || 1);
  }),
  gem4: buildPolarPath((t) => 41.5 + 5.5 * Math.cos(4 * (t - Math.PI / 4))),
};

export const EXPRESSIVE_SHAPE_CYCLE: ExpressiveShapeName[] = [
  "cookie12",
  "clover4",
  "sunny8",
  "squircle",
  "flower6",
  "softBurst10",
  "gem4",
];

export function getShapeForIndex(index: number): ExpressiveShapeName {
  return EXPRESSIVE_SHAPE_CYCLE[index % EXPRESSIVE_SHAPE_CYCLE.length];
}
