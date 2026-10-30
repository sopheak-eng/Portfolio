"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export interface FrameInfo {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Device pixel ratio the canvas is scaled by (shadowBlur is not affected by transforms). */
  dpr: number;
  /** rAF timestamp (ms, same clock as performance.now()). */
  now: number;
  /** Seconds since the previous frame, clamped so a background tab doesn't cause a jump. */
  dt: number;
}

/**
 * Runs `onFrame` on every animation frame against a full-size, DPR-scaled (max 2) 2D canvas.
 * Pauses while the tab is hidden, handles resize, and tears everything down on unmount.
 */
export function useCanvasLoop(canvasRef: RefObject<HTMLCanvasElement | null>, onFrame: (frame: FrameInfo) => void) {
  const frameRef = useRef(onFrame);

  useLayoutEffect(() => {
    frameRef.current = onFrame;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      frameRef.current({ ctx, width, height, dpr, now, dt });
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [canvasRef]);
}
