"use client";

import { useRef, type RefObject } from "react";
import { createStars, drawShootingStar, starColor, twinkle, type ShootingStar, type Star } from "@/components/background/stars";
import { useCanvasLoop, type FrameInfo } from "@/components/background/useCanvasLoop";
import { introConfig } from "@/config/intro";
import { clamp01 } from "@/lib/color";
import type { Illumination, IntroClock } from "./types";

/** Scheduled shooting stars, keyed by start time (ms on the master clock). */
const SHOOTING_STARS: Array<{ at: number; star: ShootingStar }> = [
  { at: 150, star: { from: [0.06, 0.04], dir: [1, 0.55], life: 850, speed: 0.7, tail: 0.24 } },
  { at: 1400, star: { from: [0.58, 0.55], dir: [1, 0.6], life: 850, speed: 0.7, tail: 0.24 } },
];

const { stars: starConfig, timeline, mobileBreakpoint } = introConfig;
const CALM_FRACTION = starConfig.calmCount / starConfig.denseCount;
const DENSITY_RAMP = 900;
const FADE_IN = 600;
const WARP_SPEED = 9;

const createIntroStars = () =>
  createStars(starConfig.denseCount, {
    size: [0.45, 1.2],
    alpha: [0.3, 0.8],
    speed: [0.5, 1.9],
    tint: [0, 0.35],
    brightChance: 0.07,
    brightSize: [1.3, 2.2],
    brightAlpha: 0.95,
    // The first `calmCount` stars make up the sparse Scene 1 sky; the rest fade in after the strike.
    tierFor: (index) => (index < starConfig.calmCount ? (index / starConfig.calmCount) * CALM_FRACTION : Math.random()),
  });

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function Starfield({ clock, reduced, illuminationRef }: { clock: IntroClock; reduced: boolean; illuminationRef: RefObject<Illumination> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[] | null>(null);

  const onFrame = ({ ctx, width, height }: FrameInfo) => {
    const t = clock.elapsed();
    const seconds = t / 1000;
    starsRef.current ??= createIntroStars();
    const stars = starsRef.current;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const mobile = width < mobileBreakpoint;
    const visibleCount = mobile ? Math.round(stars.length * starConfig.mobileFactor) : stars.length;
    const fadeIn = clamp01(t / FADE_IN);
    const density = reduced
      ? 1
      : CALM_FRACTION + (1 - CALM_FRACTION) * easeOut(clamp01((t - timeline.stroke) / DENSITY_RAMP));

    const warpTime = reduced ? 0 : Math.max(0, t - timeline.exit) / 1000;
    const warping = warpTime > 0;
    const zoom = 1 + warpTime * warpTime * WARP_SPEED;
    const tailZoom = 1 + Math.max(0, warpTime - 0.07) ** 2 * WARP_SPEED;

    const { glow, boltX } = illuminationRef.current;
    const lit = glow > 0.01 && boltX.length > 0;

    for (let i = 0; i < visibleCount; i += 1) {
      const star = stars[i];
      if (star.tier >= density) continue;
      const reveal = Math.min(1, (density - star.tier) / 0.04);
      let alpha = star.alpha * (reduced ? 1 : twinkle(star, seconds, 0.45)) * reveal * fadeIn;
      let size = star.size;
      const ox = star.x * cx;
      const oy = star.y * cy;

      if (lit && !warping) {
        // Stars close to the channel catch the flash.
        const sample = boltX[Math.round(((oy + cy) / height) * (boltX.length - 1))] ?? 0.5;
        const near = clamp01(1 - Math.abs((ox + cx) / width - sample) / 0.22);
        alpha = Math.min(1, alpha + glow * near * 0.8);
        size += glow * near * 0.8;
      }

      if (warping) {
        const x = cx + ox * zoom;
        const y = cy + oy * zoom;
        if (x < -40 || x > width + 40 || y < -40 || y > height + 40) continue;
        ctx.strokeStyle = starColor(star.tint, Math.min(1, alpha + warpTime));
        ctx.lineWidth = size * (1 + warpTime * 1.5);
        ctx.beginPath();
        ctx.moveTo(cx + ox * tailZoom, cy + oy * tailZoom);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.fillStyle = starColor(star.tint, alpha);
        ctx.fillRect(cx + ox - size / 2, cy + oy - size / 2, size, size);
      }
    }

    if (reduced) return;
    // Shooting stars are a pure function of the clock — no state, always in sync.
    for (const { at, star } of SHOOTING_STARS) drawShootingStar(ctx, star, t - at, width, height);
  };

  useCanvasLoop(canvasRef, onFrame);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
