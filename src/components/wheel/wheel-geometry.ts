export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function describeSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const span = endAngle - startAngle;
  if (span >= 359.9) {
    // Full circle fallback for N = 1
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${
      cy + r
    } A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = span > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

export function truncateLabel(name: string, sliceCount: number): string {
  const maxChars = sliceCount >= 18 ? 13 : sliceCount >= 12 ? 16 : 20;
  if (name.length <= maxChars) return name;
  return `${name.slice(0, maxChars - 1).trim()}…`;
}
