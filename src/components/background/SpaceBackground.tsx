"use client";

import { useRef, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import type { RGB } from "@/lib/color";
import { createGlowSprite, createStarSprite, drawShootingStar, type ShootingStar } from "./stars";
import { useCanvasLoop, type FrameInfo } from "./useCanvasLoop";

const MOBILE_BREAKPOINT = 768;
// Kept deliberately calm: few stars, slow twinkle, a rare shooting star.
const STAR_COUNT = { desktop: 120, mobile: 60 } as const;
/** Gaps between shooting stars, ms (about one every 15 s). */
const SHOOTING_GAP: readonly [number, number] = [14000, 18000];
/** Twinkle period range, s. */
const TWINKLE_PERIOD: readonly [number, number] = [8, 14];
/** Drift direction: diagonal, down-left (unit vector). */
const DRIFT_DIR = { x: -Math.SQRT1_2, y: Math.SQRT1_2 } as const;

type Range = readonly [number, number];

interface Layer {
  share: number;
  radius: Range;
  alpha: Range;
  /** Drift speed, px/s. */
  drift: number;
  /** Fraction of the scroll distance this layer moves. */
  scroll: number;
  glow: boolean;
}

/** Far → near. Nearer layers are bigger, brighter, drift faster and move more with scroll. Quiet on black: 0.2–0.6. */
const LAYERS: readonly Layer[] = [
  { share: 0.6, radius: [0.8, 1.2], alpha: [0.2, 0.35], drift: 1.5, scroll: 0.01, glow: false },
  { share: 0.3, radius: [1.2, 1.8], alpha: [0.3, 0.5], drift: 3, scroll: 0.025, glow: false },
  { share: 0.1, radius: [1.8, 2.2], alpha: [0.45, 0.6], drift: 5, scroll: 0.05, glow: true },
];

/** White only — no coloured stars. */
const PALETTE: ReadonlyArray<{ color: RGB; weight: number }> = [{ color: [255, 255, 255], weight: 1 }];
const GLOW_COLOR: RGB = [255, 255, 255];

interface Star {
  /** Position in CSS px before parallax offsets. */
  x: number;
  y: number;
  layer: number;
  radius: number;
  alpha: number;
  color: number;
  /** Twinkle angular speed (rad/s) from TWINKLE_PERIOD, and its phase. */
  speed: number;
  phase: number;
}

interface Sprites {
  stars: HTMLCanvasElement[];
  glow: HTMLCanvasElement;
}

interface Sim {
  width: number;
  height: number;
  mobile: boolean;
  stars: Star[];
  sprites: Sprites;
  shooting: { star: ShootingStar; start: number } | null;
  nextShootAt: number;
  staticKey: string;
}

const rand = ([min, max]: Range) => min + Math.random() * (max - min);

function pickColor() {
  let roll = Math.random();
  for (let i = 0; i < PALETTE.length; i += 1) {
    roll -= PALETTE[i].weight;
    if (roll <= 0) return i;
  }
  return 0;
}

function createSiteStars(width: number, height: number, mobile: boolean): Star[] {
  const count = mobile ? STAR_COUNT.mobile : STAR_COUNT.desktop;
  const stars: Star[] = [];
  LAYERS.forEach((layer, index) => {
    const n = index === LAYERS.length - 1 ? count - stars.length : Math.round(count * layer.share);
    for (let i = 0; i < n; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        layer: index,
        radius: rand(layer.radius),
        alpha: rand(layer.alpha),
        color: pickColor(),
        speed: (Math.PI * 2) / rand(TWINKLE_PERIOD),
        phase: Math.random() * Math.PI * 2,
      });
    }
  });
  return stars;
}

function randomShootingStar(): ShootingStar {
  const leftward = Math.random() < 0.4;
  return {
    from: [leftward ? rand([0.5, 0.92]) : rand([0.08, 0.5]), rand([0.04, 0.5])],
    dir: [leftward ? -1 : 1, rand([0.3, 0.65])],
    life: 1100,
    speed: 0.45,
    tail: 0.18,
  };
}

const wrap = (value: number, size: number, margin: number) => {
  const span = size + margin * 2;
  return ((((value + margin) % span) + span) % span) - margin;
};

const noopSubscribe = () => () => {};

/** Site-wide night sky: one canvas of calm, slowly drifting stars. Mounted once in the root layout. */
export function SpaceBackground() {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="space-sky pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      {mounted && <SpaceStars reduced={reduced} />}
      <div className="site-grain" />
    </div>
  );
}

function SpaceStars({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);

  const onFrame = ({ ctx, width, height, now, dt }: FrameInfo) => {
    // While the intro fully covers the page, nothing here is visible.
    if (document.documentElement.hasAttribute("data-intro-cover")) return;

    const mobile = width < MOBILE_BREAKPOINT;
    let sim = simRef.current;
    if (!sim || sim.mobile !== mobile) {
      sim = {
        width,
        height,
        mobile,
        stars: createSiteStars(width, height, mobile),
        sprites: {
          stars: PALETTE.map(({ color }) => createStarSprite(color)),
          glow: createGlowSprite(GLOW_COLOR, 0.25),
        },
        shooting: null,
        nextShootAt: now + rand([10000, 15000]),
        staticKey: "",
      };
      simRef.current = sim;
    } else if (sim.width !== width || sim.height !== height) {
      // Resize: keep the same stars, stretched to the new viewport.
      for (const star of sim.stars) {
        star.x *= width / sim.width;
        star.y *= height / sim.height;
      }
      sim.width = width;
      sim.height = height;
      sim.staticKey = "";
    }

    if (reduced) {
      // Static stars: draw once per size, no drift, twinkle, parallax or shooting stars.
      const key = `${width}x${height}`;
      if (sim.staticKey === key) return;
      sim.staticKey = key;
    } else {
      if (!sim.shooting && now >= sim.nextShootAt) sim.shooting = { star: randomShootingStar(), start: now };
    }

    ctx.clearRect(0, 0, width, height);
    const seconds = now / 1000;
    const scrollY = reduced ? 0 : window.scrollY;
    const { sprites } = sim;

    for (const star of sim.stars) {
      const layer = LAYERS[star.layer];
      if (!reduced) {
        star.x = wrap(star.x + DRIFT_DIR.x * layer.drift * dt, width, 0);
        star.y = wrap(star.y + DRIFT_DIR.y * layer.drift * dt, height, 0);
      }
      // Gentle depth: layers scroll at slightly different rates.
      const margin = star.radius * 8;
      const x = wrap(star.x, width, margin);
      const y = wrap(star.y - scrollY * layer.scroll, height, margin);
      const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(seconds * star.speed + star.phase);
      const alpha = star.alpha * pulse;

      if (layer.glow) {
        const halo = star.radius * 3;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites.glow, x - halo, y - halo, halo * 2, halo * 2);
      }
      // The sprite's soft edge starts at ~55% of its size, so draw it a little larger than 2r.
      const size = star.radius * 2.6;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprites.stars[star.color], x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    if (sim.shooting && !drawShootingStar(ctx, sim.shooting.star, now - sim.shooting.start, width, height)) {
      sim.shooting = null;
      sim.nextShootAt = now + rand(SHOOTING_GAP);
    }
  };

  useCanvasLoop(canvasRef, onFrame);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
