import type { RGB } from "@/lib/color";

/** Total intro length — the overlay unmounts exactly here. */
export const TOTAL_MS = 5000;

/** Fired on window when the intro releases the scroll lock (the page is laid out and scrollable again). */
export const INTRO_UNLOCK_EVENT = "cdv:intro-unlock";

export interface IntroConfig {
  /** sessionStorage key — the intro plays once per browser session. */
  storageKey: string;
  // The intro's words live in src/i18n (t.intro) so they follow the chosen language.
  colors: {
    outerGlow: RGB;
    midGlow: RGB;
    innerGlow: RGB;
    core: RGB;
    skyFlash: RGB;
    flash: RGB;
  };
  /** Milliseconds on the master clock (0 = intro start). */
  timeline: {
    /** Stepped leader starts growing down from the top. */
    leader: number;
    /** Return stroke — bolt at full brightness, sky flash. */
    stroke: number;
    /** "Welcome To My" fades in; the bolt settles into flicker + re-strikes. */
    welcome: number;
    /** "Portfolio Website" slides up. */
    title: number;
    /** Loader starts counting. */
    loaderStart: number;
    /** Loader hits 100% — final strike, white flash, text exits. Skip jumps here. */
    exit: number;
    /** Overlay starts fading out. */
    fade: number;
    /** Overlay is gone. */
    end: number;
    /** Re-strikes along the same channel during the hold phase. */
    restrikes: readonly number[];
  };
  lightning: {
    /** Midpoint-displacement iterations for the main channel. */
    iterations: number;
    branches: { desktop: readonly [number, number]; mobile: readonly [number, number] };
    /** Sky glow decay after each strike. */
    skyFlashMs: number;
  };
  stars: {
    calmCount: number;
    denseCount: number;
    /** Multiplier applied below the mobile breakpoint. */
    mobileFactor: number;
  };
  mobileBreakpoint: number;
}

export const introConfig = {
  storageKey: "cdv-intro-played",
  colors: {
    outerGlow: [47, 123, 255],
    midGlow: [80, 160, 255],
    innerGlow: [170, 215, 255],
    core: [255, 255, 255],
    skyFlash: [150, 195, 255],
    flash: [220, 235, 255],
  },
  timeline: {
    leader: 800,
    stroke: 1000,
    welcome: 1200,
    title: 1600,
    loaderStart: 1800,
    exit: 4200,
    fade: 4600,
    end: TOTAL_MS,
    restrikes: [1750, 2600, 3450],
  },
  lightning: {
    iterations: 7,
    branches: { desktop: [5, 8], mobile: [2, 4] },
    skyFlashMs: 200,
  },
  stars: {
    calmCount: 90,
    denseCount: 520,
    mobileFactor: 0.55,
  },
  mobileBreakpoint: 768,
} satisfies IntroConfig;

/**
 * Inline script for the root layout, run before first paint: hides the overlay on repeat visits,
 * otherwise locks page scroll for the intro.
 */
export const introSeenScript = `(function(d){var seen=false;try{seen=sessionStorage.getItem(${JSON.stringify(introConfig.storageKey)})==="1"}catch(e){}d.setAttribute(seen?"data-intro-seen":"data-intro-lock","")})(document.documentElement)`;
