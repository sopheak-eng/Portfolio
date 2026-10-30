import { rgba, type RGB } from "@/lib/color";

/** Shared star model + drawing, used by the intro starfield and the site-wide SpaceBackground. */
export interface Star {
  /** Position relative to the screen centre, -1..1 on each axis. */
  x: number;
  y: number;
  size: number;
  alpha: number;
  phase: number;
  /** Twinkle speed, radians per second. */
  speed: number;
  /** 0..1 — lets a caller reveal stars progressively (density ramps). */
  tier: number;
  /** 0 = white, 1 = light blue. */
  tint: number;
}

type Range = readonly [number, number];

export interface StarOptions {
  size: Range;
  alpha: Range;
  speed: Range;
  tint: Range;
  /** Chance of a larger, brighter star. */
  brightChance?: number;
  brightSize?: Range;
  brightAlpha?: number;
  tierFor?: (index: number) => number;
}

export const STAR_WHITE: RGB = [235, 242, 255];
export const STAR_BLUE: RGB = [170, 200, 255];
export const STAR_HEAD: RGB = [255, 255, 255];

const pick = ([min, max]: Range) => min + Math.random() * (max - min);

export function createStars(count: number, options: StarOptions): Star[] {
  const { brightChance = 0, brightSize = options.size, brightAlpha = options.alpha[1], tierFor } = options;
  return Array.from({ length: count }, (_, index) => {
    const bright = Math.random() < brightChance;
    return {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      size: pick(bright ? brightSize : options.size),
      alpha: bright ? brightAlpha : pick(options.alpha),
      phase: Math.random() * Math.PI * 2,
      speed: pick(options.speed),
      tier: tierFor ? tierFor(index) : Math.random(),
      tint: pick(options.tint),
    };
  });
}

/** Twinkle multiplier: oscillates between 1 - depth and 1. */
export const twinkle = (star: Star, seconds: number, depth: number) =>
  1 - depth + depth * (0.5 + 0.5 * Math.sin(seconds * star.speed + star.phase));

export function starColor(tint: number, alpha: number) {
  const mix = (i: 0 | 1 | 2) => Math.round(STAR_WHITE[i] + (STAR_BLUE[i] - STAR_WHITE[i]) * tint);
  return rgba([mix(0), mix(1), mix(2)], alpha);
}

/* ---------- Pre-rendered sprites (drawn once, reused with drawImage) ---------- */

/** Sprite resolution; drawn scaled down, so this is plenty even at DPR 2. */
const SPRITE = 64;

function sprite(paint: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE;
  canvas.height = SPRITE;
  const ctx = canvas.getContext("2d");
  if (ctx) paint(ctx, SPRITE);
  return canvas;
}

/** A round star with a slightly soft edge, in the given colour. Draw it 2r wide. */
export function createStarSprite([r, g, b]: RGB) {
  return sprite((ctx, size) => {
    const c = size / 2;
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
    gradient.addColorStop(0, rgba([r, g, b], 1));
    gradient.addColorStop(0.55, rgba([r, g, b], 1));
    gradient.addColorStop(1, rgba([r, g, b], 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
}

/** Soft halo for bright stars. Draw it ~3× the star's radius. */
export function createGlowSprite(color: RGB, alpha: number) {
  return sprite((ctx, size) => {
    const c = size / 2;
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
}

export interface ShootingStar {
  /** Start, as a fraction of the viewport. */
  from: readonly [number, number];
  /** Direction (normalised on use). */
  dir: readonly [number, number];
  /** Lifetime in ms. */
  life: number;
  /** Speed as a fraction of the viewport diagonal per second. */
  speed: number;
  /** Tail length as a fraction of the shorter viewport side. */
  tail: number;
}

/** Draws a shooting star `age` ms into its life; a pure function of time. Returns false once it's over. */
export function drawShootingStar(ctx: CanvasRenderingContext2D, star: ShootingStar, age: number, width: number, height: number) {
  if (age < 0 || age >= star.life) return false;
  const norm = Math.hypot(star.dir[0], star.dir[1]) || 1;
  const dx = star.dir[0] / norm;
  const dy = star.dir[1] / norm;
  const travelled = Math.hypot(width, height) * star.speed * (age / 1000);
  const x = star.from[0] * width + dx * travelled;
  const y = star.from[1] * height + dy * travelled;
  const progress = age / star.life;
  const alpha = Math.min(1, age / 80) * (progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1);
  const tail = Math.min(width, height) * star.tail * Math.min(1, age / 180);
  const tx = x - dx * tail;
  const ty = y - dy * tail;

  const gradient = ctx.createLinearGradient(tx, ty, x, y);
  gradient.addColorStop(0, rgba(STAR_WHITE, 0));
  gradient.addColorStop(1, rgba(STAR_WHITE, alpha));
  ctx.lineCap = "round";
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.fillStyle = rgba(STAR_HEAD, alpha);
  ctx.beginPath();
  ctx.arc(x, y, 1.8, 0, Math.PI * 2);
  ctx.fill();
  return true;
}
