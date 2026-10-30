"use client";

import { useRef, type RefObject } from "react";
import { useCanvasLoop, type FrameInfo } from "@/components/background/useCanvasLoop";
import { introConfig } from "@/config/intro";
import { clamp01, rgba, type RGB } from "@/lib/color";
import type { Illumination, IntroClock } from "./types";

interface Pt {
  x: number;
  y: number;
}

/** One stroke of the bolt (main channel or a branch) with its taper. */
interface Channel {
  pts: Pt[];
  /** Core width at the start and the tip, in CSS px. */
  width0: number;
  width1: number;
  alpha0: number;
  alpha1: number;
}

/** Where a branch sits, kept between re-strikes so the bolt keeps its structure. */
interface BranchSpec {
  /** Position along the parent, 0..1. */
  at: number;
  /** Signed rotation away from the parent direction, radians. */
  angle: number;
  /** Length as a fraction of the main channel. */
  length: number;
  children: BranchSpec[];
}

interface Bolt {
  main: Pt[];
  specs: BranchSpec[];
  channels: Channel[];
  /** Main-channel x (fraction of width) at evenly spaced heights. */
  samples: number[];
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
}

type StrikeKind = "stroke" | "restrike" | "final";

interface Sim {
  width: number;
  height: number;
  dpr: number;
  mobile: boolean;
  bolt: Bolt;
  layer: HTMLCanvasElement;
  scratch: HTMLCanvasElement;
  events: Array<{ at: number; kind: StrikeKind }>;
  lastT: number;
  /** Leader step times (ms) and how far down the bolt each step reaches. */
  leaderSteps: Array<{ at: number; reach: number }>;
  strikeAt: number;
  strikeKind: StrikeKind | null;
  skyPeak: number;
  noise: number;
  noiseAt: number;
  sparks: Spark[];
}

const { colors, lightning, timeline, mobileBreakpoint } = introConfig;

const MAIN_CORE_TOP = 3.6;
const MAIN_CORE_BOTTOM = 1.3;
const RUN = 6;
const SAMPLE_COUNT = 33;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const deg = (value: number) => (value * Math.PI) / 180;

/** Recursive midpoint displacement; displacement halves (~0.52) each iteration → fractal, not zig-zag. */
function fractalLine(a: Pt, b: Pt, offset: number, iterations: number): Pt[] {
  let pts = [a, b];
  let spread = offset;
  for (let it = 0; it < iterations; it += 1) {
    const next: Pt[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i += 1) {
      const p = pts[i];
      const q = pts[i + 1];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const shift = rand(-spread, spread);
      next.push({ x: (p.x + q.x) / 2 + (-dy / len) * shift, y: (p.y + q.y) / 2 + (dx / len) * shift }, q);
    }
    pts = next;
    spread *= 0.52;
  }
  return pts;
}

function pathLength(pts: Pt[]) {
  let length = 0;
  for (let i = 1; i < pts.length; i += 1) length += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return length;
}

function directionAt(pts: Pt[], index: number) {
  const a = pts[Math.max(0, index - 3)];
  const b = pts[Math.min(pts.length - 1, index + 3)];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
}

function createSpecs(mobile: boolean): BranchSpec[] {
  const [min, max] = mobile ? lightning.branches.mobile : lightning.branches.desktop;
  const count = Math.round(rand(min, max));
  return Array.from({ length: count }, () => {
    const side = Math.random() < 0.5 ? -1 : 1;
    const subCount = mobile ? 0 : Math.floor(rand(0, 2.6));
    return {
      at: rand(0.08, 0.72),
      angle: side * deg(rand(20, 50)),
      length: rand(0.15, 0.4),
      children: Array.from({ length: subCount }, () => ({
        at: rand(0.2, 0.7),
        angle: (Math.random() < 0.5 ? -1 : 1) * deg(rand(20, 50)),
        length: rand(0.3, 0.5),
        children: [],
      })),
    };
  });
}

/** Grows a branch from `parent`, keeping it heading downward. */
function growBranch(parent: Pt[], spec: BranchSpec, length: number) {
  const index = Math.floor(spec.at * (parent.length - 1));
  const origin = parent[index];
  const dir = directionAt(parent, index);
  const cos = Math.cos(spec.angle);
  const sin = Math.sin(spec.angle);
  let dx = dir.x * cos - dir.y * sin;
  let dy = dir.x * sin + dir.y * cos;
  if (dy < 0.25) {
    dy = 0.25;
    const norm = Math.hypot(dx, dy);
    dx /= norm;
    dy /= norm;
  }
  const end = { x: origin.x + dx * length, y: origin.y + dy * length };
  return fractalLine(origin, end, length * 0.2, length > 120 ? 5 : 4);
}

function buildChannels(main: Pt[], specs: BranchSpec[]): Channel[] {
  const mainLength = pathLength(main);
  const channels: Channel[] = [
    { pts: main, width0: MAIN_CORE_TOP, width1: MAIN_CORE_BOTTOM, alpha0: 1, alpha1: 0.85 },
  ];
  for (const spec of specs) {
    const length = mainLength * spec.length;
    const pts = growBranch(main, spec, length);
    const width0 = lerp(1.5, 1.1, spec.at);
    channels.push({ pts, width0, width1: 0.3, alpha0: 0.9, alpha1: 0.04 });
    for (const child of spec.children) {
      const childPts = growBranch(pts, child, length * child.length);
      channels.push({ pts: childPts, width0: width0 * 0.7, width1: 0.25, alpha0: 0.6, alpha1: 0 });
    }
  }
  return channels;
}

function sampleMain(main: Pt[], width: number, height: number) {
  return Array.from({ length: SAMPLE_COUNT }, (_, i) => {
    const y = (i / (SAMPLE_COUNT - 1)) * height;
    let best = main[0];
    for (const p of main) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p;
    return best.x / width;
  });
}

function createBolt(width: number, height: number, mobile: boolean): Bolt {
  const start = { x: width * (0.5 + rand(-0.06, 0.06)), y: -12 };
  const end = { x: width * (0.5 + rand(-0.1, 0.1)), y: height + 12 };
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  const main = fractalLine(start, end, length * 0.17, lightning.iterations).map((p) => ({
    x: Math.min(width * 0.88, Math.max(width * 0.12, p.x)),
    y: p.y,
  }));
  const specs = createSpecs(mobile);
  return { main, specs, channels: buildChannels(main, specs), samples: sampleMain(main, width, height) };
}

/** Re-strike: same channel, only the fine detail and the branch wiggle change. */
function varyBolt(bolt: Bolt, width: number, height: number): Bolt {
  const main = bolt.main.map((p, i) =>
    i === 0 || i === bolt.main.length - 1 ? p : { x: p.x + rand(-1.4, 1.4), y: p.y + rand(-1.4, 1.4) },
  );
  return { main, specs: bolt.specs, channels: buildChannels(main, bolt.specs), samples: sampleMain(main, width, height) };
}

interface GlowPass {
  width: number | null;
  color: RGB;
  alpha: number;
  blur: number;
}

const PASSES: GlowPass[] = [
  { width: 24, color: colors.outerGlow, alpha: 0.08, blur: 60 },
  { width: 10, color: colors.midGlow, alpha: 0.25, blur: 25 },
  { width: 5, color: colors.innerGlow, alpha: 0.6, blur: 10 },
  { width: null, color: colors.core, alpha: 1, blur: 0 },
];

/** Strokes a channel in short runs so width and alpha taper along its length (no blur here). */
function strokeTapered(ctx: CanvasRenderingContext2D, channel: Channel, pass: GlowPass, widthScale: number) {
  const { pts } = channel;
  ctx.lineCap = pass.width === null ? "round" : "butt";
  for (let i = 0; i < pts.length - 1; i += RUN) {
    const t = Math.min(1, (i + RUN / 2) / (pts.length - 1));
    const core = lerp(channel.width0, channel.width1, t);
    const alpha = lerp(channel.alpha0, channel.alpha1, t) * pass.alpha;
    if (alpha <= 0.002) continue;
    ctx.lineWidth = pass.width === null ? core : pass.width * widthScale * Math.max(0.25, core / MAIN_CORE_TOP);
    ctx.strokeStyle = rgba(pass.color, alpha);
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    for (let j = i + 1; j <= Math.min(pts.length - 1, i + RUN); j += 1) ctx.lineTo(pts[j].x, pts[j].y);
    ctx.stroke();
  }
}

/**
 * Renders the full multi-pass glow once per bolt shape; frames just blit `sim.layer`.
 * Each pass is stroked unblurred onto a scratch canvas, then composited with its shadow
 * as the glow — one blur per pass instead of one per stroke, which keeps re-strikes cheap.
 */
function renderLayer(sim: Sim) {
  const { layer, scratch, width, height, dpr, mobile, bolt } = sim;
  for (const canvas of [layer, scratch]) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = layer.getContext("2d");
  const pass2d = scratch.getContext("2d");
  if (!ctx || !pass2d) return;
  ctx.globalCompositeOperation = "lighter";
  pass2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  pass2d.lineJoin = "round";
  const widthScale = mobile ? 0.75 : 1;
  const blurScale = (mobile ? 0.6 : 1) * dpr;
  for (const pass of PASSES) {
    pass2d.clearRect(0, 0, width, height);
    for (const channel of bolt.channels) strokeTapered(pass2d, channel, pass, widthScale);
    ctx.shadowBlur = pass.blur * blurScale;
    ctx.shadowColor = pass.blur > 0 ? rgba(pass.color, 1) : "transparent";
    ctx.drawImage(scratch, 0, 0);
  }
  ctx.shadowBlur = 0;
}

function createSim(width: number, height: number, dpr: number, t: number): Sim {
  const mobile = width < mobileBreakpoint;
  const leaderSpan = 160;
  const stepCount = 7;
  const leaderSteps = Array.from({ length: stepCount }, (_, i) => ({
    at: timeline.leader + (leaderSpan * i) / stepCount + rand(-6, 6),
    reach: Math.min(0.96, ((i + 1) / stepCount) * 0.96 + rand(-0.03, 0.03)),
  }));
  const sim: Sim = {
    width,
    height,
    dpr,
    mobile,
    bolt: createBolt(width, height, mobile),
    layer: document.createElement("canvas"),
    scratch: document.createElement("canvas"),
    events: [
      { at: timeline.stroke, kind: "stroke" },
      ...timeline.restrikes.map((at) => ({ at: at + rand(-80, 80), kind: "restrike" as const })),
      { at: timeline.exit, kind: "final" },
    ],
    lastT: t,
    leaderSteps,
    strikeAt: -Infinity,
    strikeKind: null,
    skyPeak: 0,
    noise: 1,
    noiseAt: 0,
    sparks: [],
  };
  renderLayer(sim);
  return sim;
}

function emitSparks(sim: Sim, t: number) {
  const count = sim.mobile ? 12 : 26;
  const { main } = sim.bolt;
  for (let i = 0; i < count; i += 1) {
    const origin = main[Math.floor(Math.random() * main.length)];
    const angle = rand(0, Math.PI * 2);
    const speed = rand(80, 260);
    sim.sparks.push({ x: origin.x, y: origin.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, born: t, life: rand(150, 300) });
  }
}

function fire(sim: Sim, kind: StrikeKind, t: number) {
  if (kind === "final") {
    sim.bolt = createBolt(sim.width, sim.height, sim.mobile);
    renderLayer(sim);
  } else if (kind === "restrike") {
    sim.bolt = varyBolt(sim.bolt, sim.width, sim.height);
    renderLayer(sim);
  }
  sim.strikeAt = t;
  sim.strikeKind = kind;
  sim.skyPeak = kind === "restrike" ? rand(0.3, 0.45) : 0.6;
  sim.noise = 1;
  sim.noiseAt = t + 30;
  emitSparks(sim, t);
}

/** Rapid random flicker: a new intensity sample every few tens of ms. */
function sampleNoise(sim: Sim, t: number, fast: boolean) {
  if (t >= sim.noiseAt) {
    sim.noise = Math.random();
    sim.noiseAt = t + (fast ? rand(25, 45) : rand(55, 95));
  }
  return sim.noise;
}

/** Bolt brightness for this moment, 0..1. */
function boltIntensity(sim: Sim, t: number) {
  if (t < timeline.leader || t >= timeline.fade) return 0;
  if (t < timeline.stroke) return 0.28 + 0.12 * sampleNoise(sim, t, true);

  const since = t - sim.strikeAt;
  const afterglow = 0.16 + 0.14 * sampleNoise(sim, t, since < 120);
  if (sim.strikeKind === "final") {
    if (since < 120) return 0.4 + 0.6 * sim.noise;
    return lerp(0.75, 0, clamp01((since - 120) / (timeline.fade - timeline.exit - 120)));
  }
  if (since < 30) return 1;
  if (since < 120) return 0.4 + 0.6 * sim.noise;
  if (since < 400) return lerp(0.75, afterglow, (since - 120) / 280);
  return afterglow;
}

function leaderReach(sim: Sim, t: number) {
  let reach = 0;
  for (const step of sim.leaderSteps) if (t >= step.at) reach = step.reach;
  return reach;
}

export function Lightning({ clock, reduced, illuminationRef }: { clock: IntroClock; reduced: boolean; illuminationRef: RefObject<Illumination> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);

  const onFrame = ({ ctx, width, height, dpr }: FrameInfo) => {
    const t = clock.elapsed();
    let sim = simRef.current;
    if (!sim || sim.width !== width || sim.height !== height || sim.dpr !== dpr) {
      sim = createSim(width, height, dpr, t);
      simRef.current = sim;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1;

    if (reduced) {
      // One static, softly glowing bolt: fades in, holds, fades out with the text.
      const alpha = 0.55 * clamp01((t - timeline.leader) / 400) * (1 - clamp01((t - timeline.exit) / (timeline.fade - timeline.exit)));
      ctx.globalAlpha = alpha;
      ctx.drawImage(sim.layer, 0, 0, width, height);
      ctx.globalAlpha = 1;
      illuminationRef.current.glow = 0;
      illuminationRef.current.boltX = sim.bolt.samples;
      return;
    }

    // Fire the latest strike crossed since last frame (a skip may cross several at once).
    let pending: StrikeKind | null = null;
    for (const event of sim.events) if (event.at > sim.lastT && event.at <= t) pending = event.kind;
    sim.lastT = t;
    if (pending) fire(sim, pending, t);

    // Sky illumination — radial blue-white glow centred on the bolt, ~200ms decay.
    const skyGlow = sim.skyPeak * clamp01(1 - (t - sim.strikeAt) / lightning.skyFlashMs);
    if (skyGlow > 0.005) {
      const cx = sim.bolt.samples[Math.floor(SAMPLE_COUNT * 0.4)] * width;
      const cy = height * 0.4;
      const radius = Math.max(width, height) * 0.75;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, rgba(colors.skyFlash, skyGlow));
      gradient.addColorStop(0.4, rgba(colors.skyFlash, skyGlow * 0.35));
      gradient.addColorStop(1, rgba(colors.skyFlash, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // The bolt itself.
    const intensity = boltIntensity(sim, t);
    if (intensity > 0.005) {
      const leading = t < timeline.stroke;
      const reach = height * leaderReach(sim, t);
      if (leading) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, reach);
        ctx.clip();
      }
      ctx.globalAlpha = intensity;
      ctx.drawImage(sim.layer, 0, 0, width, height);
      if (intensity > 0.8) {
        // Over-bright at the peak of a strike.
        ctx.globalAlpha = (intensity - 0.8) * 2.5;
        ctx.drawImage(sim.layer, 0, 0, width, height);
      }
      ctx.globalAlpha = 1;
      if (leading) {
        // Fade the leader's growing tip instead of ending it on a hard edge.
        const tip = ctx.createLinearGradient(0, reach - 60, 0, reach);
        tip.addColorStop(0, "rgba(0,0,0,0)");
        tip.addColorStop(1, "rgba(0,0,0,1)");
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = tip;
        ctx.fillRect(0, reach - 60, width, 60);
        ctx.globalCompositeOperation = "lighter";
        ctx.restore();
      }
    }

    // Sparks popping off the channel, gone within 300ms.
    sim.sparks = sim.sparks.filter((spark) => {
      const age = t - spark.born;
      if (age >= spark.life || age < 0) return false;
      const s = age / 1000;
      const x = spark.x + spark.vx * s;
      const y = spark.y + spark.vy * s + 140 * s * s;
      ctx.fillStyle = rgba(colors.core, 1 - age / spark.life);
      ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
      return true;
    });

    // Final strike: full-screen white-blue flash.
    let white = 0;
    if (t >= timeline.exit && t < timeline.fade) {
      const since = t - timeline.exit;
      white = since < 30 ? (since / 30) * 0.9 : 0.9 * (1 - clamp01((since - 30) / 350));
      if (white > 0.005) {
        ctx.fillStyle = rgba(colors.flash, white);
        ctx.fillRect(0, 0, width, height);
      }
    }

    illuminationRef.current.glow = Math.min(1, skyGlow + white * 0.5 + intensity * 0.12);
    illuminationRef.current.boltX = sim.bolt.samples;
  };

  useCanvasLoop(canvasRef, onFrame);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
