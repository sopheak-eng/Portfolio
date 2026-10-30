export type RGB = readonly [number, number, number];

export const rgba = ([r, g, b]: RGB, alpha: number) => `rgba(${r},${g},${b},${alpha})`;

/** "#RRGGBB" → [r, g, b]. */
export const hexToRgb = (hex: string): RGB => {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
