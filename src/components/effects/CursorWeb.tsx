"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { INTRO_UNLOCK_EVENT } from "@/config/intro";

const DOT_COUNT = 70;
const DOT_RADIUS: Range = [1.8, 2.5];
/** Drift speed, px per 60 fps frame. */
const DOT_SPEED: Range = [0.1, 0.3];
const DOT_COLOR = "255, 255, 255";
const DOT_ALPHA = 0.45;
/** Dots within this distance of the mouse join the web. */
const MOUSE_RADIUS = 200;
/** Two web dots closer than this get a faint thread between them. */
const LINK_RADIUS = 110;
const MAX_LINE_ALPHA = 0.9;
const LINE_WIDTH = 1.5;
const LINK_ALPHA = 0.3;
const LINK_WIDTH = 1;
const CENTER_RADIUS = 3;
/** A dot leans toward the mouse by up to this many px (less the farther it is), at most PULL_SPEED px per frame. */
const MAX_PULL = 40;
const PULL_SPEED = 2;
/** Never pull a dot closer to the cursor than this, so the web keeps its shape instead of collapsing. */
const MIN_GAP = 14;
/** How fast the web fades in / out when the mouse enters or leaves the window (per 60 fps frame). */
const FADE_STEP = 0.06;
const FRAME_MS = 1000 / 60;

type Range = readonly [number, number];

interface Dot {
  /** Drifting "home" position; the pull is an offset on top of it so dots drift back when released. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  radius: number;
}

const rand = ([min, max]: Range) => min + Math.random() * (max - min);

/* ---------- When the web may run ---------- */

const FINE_POINTER = "(pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(FINE_POINTER), window.matchMedia(REDUCED_MOTION)];
  queries.forEach((query) => query.addEventListener("change", onChange));
  window.addEventListener(INTRO_UNLOCK_EVENT, onChange);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
    window.removeEventListener(INTRO_UNLOCK_EVENT, onChange);
  };
}

/** Mouse/trackpad only, motion allowed, and the intro has released the page. */
const getEnabled = () =>
  window.matchMedia(FINE_POINTER).matches &&
  !window.matchMedia(REDUCED_MOTION).matches &&
  !document.documentElement.hasAttribute("data-intro-lock");

/** Faint drifting dots that spin a white web around the mouse. Mounted once in the root layout, above the content. */
export function CursorWeb() {
  const enabled = useSyncExternalStore(subscribe, getEnabled, () => false);
  return enabled ? <CursorWebCanvas /> : null;
}

function CursorWebCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let dots: Dot[] = [];
    const mouse = { x: 0, y: 0, inside: false };
    /** 0..1 — eases toward 1 while the mouse is in the window, toward 0 after it leaves. */
    let presence = 0;

    const createDots = () =>
      Array.from({ length: DOT_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(DOT_SPEED);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ox: 0,
          oy: 0,
          radius: rand(DOT_RADIUS),
        };
      });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const prevWidth = width;
      const prevHeight = height;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Resizing the canvas resets its state, so set the cap here.
      ctx.lineCap = "round";
      if (dots.length === 0) {
        dots = createDots();
      } else {
        // Keep the same dots, stretched to the new viewport.
        for (const dot of dots) {
          dot.x *= width / prevWidth;
          dot.y *= height / prevHeight;
        }
      }
    };

    /** Moves `value` toward `target` by at most `limit`. */
    const approach = (value: number, target: number, limit: number) =>
      value + Math.max(-limit, Math.min(limit, target - value));

    const frame = (now: number) => {
      const step = Math.min(now - last, 50) / FRAME_MS;
      last = now;
      presence = approach(presence, mouse.inside ? 1 : 0, FADE_STEP * step);
      ctx.clearRect(0, 0, width, height);

      // Move every dot; collect the ones inside the mouse radius (with their closeness, 0..1).
      const web: { dot: Dot; px: number; py: number; near: number }[] = [];
      for (const dot of dots) {
        dot.x += dot.vx * step;
        dot.y += dot.vy * step;
        // Soft bounce off the edges.
        if (dot.x < 0 || dot.x > width) dot.vx = -dot.vx;
        if (dot.y < 0 || dot.y > height) dot.vy = -dot.vy;
        dot.x = Math.max(0, Math.min(width, dot.x));
        dot.y = Math.max(0, Math.min(height, dot.y));

        // Pull: lean toward the cursor while it's near, drift back to home otherwise.
        let targetX = 0;
        let targetY = 0;
        let near = 0;
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        // Cheap box check before the square root.
        if (presence > 0 && Math.abs(dx) < MOUSE_RADIUS && Math.abs(dy) < MOUSE_RADIUS) {
          const distance = Math.hypot(dx, dy);
          if (distance < MOUSE_RADIUS && distance > 0) {
            near = 1 - distance / MOUSE_RADIUS;
            const pull = Math.min(MAX_PULL * near, Math.max(0, distance - MIN_GAP)) * presence;
            targetX = (dx / distance) * pull;
            targetY = (dy / distance) * pull;
          }
        }
        dot.ox = approach(dot.ox, targetX, PULL_SPEED * step);
        dot.oy = approach(dot.oy, targetY, PULL_SPEED * step);

        const px = dot.x + dot.ox;
        const py = dot.y + dot.oy;
        if (near > 0) web.push({ dot, px, py, near });

        // Caught dots go solid white (back to the idle alpha as the web fades out).
        ctx.fillStyle = `rgba(${DOT_COLOR}, ${near > 0 ? DOT_ALPHA + (1 - DOT_ALPHA) * presence : DOT_ALPHA})`;
        ctx.beginPath();
        ctx.arc(px, py, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (web.length > 0) {
        // Threads between web dots (only the handful near the cursor, so pairs stay cheap).
        ctx.lineWidth = LINK_WIDTH;
        ctx.strokeStyle = `rgba(${DOT_COLOR}, ${LINK_ALPHA * presence})`;
        ctx.beginPath();
        for (let i = 0; i < web.length; i += 1) {
          for (let j = i + 1; j < web.length; j += 1) {
            const dx = web[i].px - web[j].px;
            const dy = web[i].py - web[j].py;
            if (Math.abs(dx) > LINK_RADIUS || Math.abs(dy) > LINK_RADIUS || dx * dx + dy * dy > LINK_RADIUS * LINK_RADIUS) continue;
            ctx.moveTo(web[i].px, web[i].py);
            ctx.lineTo(web[j].px, web[j].py);
          }
        }
        ctx.stroke();

        // Spokes from the cursor: closer = stronger, fading to nothing at the radius.
        ctx.lineWidth = LINE_WIDTH;
        for (const { px, py, near } of web) {
          ctx.strokeStyle = `rgba(${DOT_COLOR}, ${MAX_LINE_ALPHA * near * presence})`;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }

      if (presence > 0) {
        ctx.fillStyle = `rgba(${DOT_COLOR}, ${presence})`;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, CENTER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || document.visibilityState !== "visible") return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.inside = true;
    };
    // Leaving the window: relatedTarget is null when the pointer goes outside the document.
    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) mouse.inside = false;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden="true" />;
}
