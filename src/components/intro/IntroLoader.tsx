"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, stagger, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { INTRO_UNLOCK_EVENT, introConfig } from "@/config/intro";
import { useLanguage, type Lang } from "@/i18n/LanguageProvider";
import { clamp01 } from "@/lib/color";
import { Lightning } from "./Lightning";
import { Starfield } from "./Starfield";
import type { Illumination, IntroClock } from "./types";

const { storageKey, timeline } = introConfig;

/** Stage boundaries on the master clock; React only re-renders when one is crossed. */
const STAGES = [0, timeline.leader, timeline.stroke, timeline.welcome, timeline.title, timeline.loaderStart, timeline.exit, timeline.fade] as const;
const STAGE = { welcome: 3, title: 4, loader: 5, exit: 6, fade: 7 } as const;

const stageAt = (t: number) => {
  let stage = 0;
  for (let i = 0; i < STAGES.length; i += 1) if (t >= STAGES[i]) stage = i;
  return stage;
};

/** Longest we hold the dark sky waiting for the page's `load` event before starting the clock. */
const START_WAIT_MAX = 1500;

const easeInOutQuad = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

interface MasterClock extends IntroClock {
  start: () => void;
  startedAt: () => number;
  /** Moves the clock forward to `ms` (never backwards). */
  jumpTo: (ms: number) => void;
}

function createClock(): MasterClock {
  let origin = -1;
  let offset = 0;
  const elapsed = () => (origin < 0 ? 0 : performance.now() - origin + offset);
  return {
    elapsed,
    start: () => {
      origin = performance.now();
    },
    startedAt: () => origin,
    jumpTo: (ms) => {
      const now = elapsed();
      if (now < ms) offset += ms - now;
    },
  };
}

const noopSubscribe = () => () => {};

// Read once per page load and cached, so writing the flag mid-intro doesn't flip the snapshot.
let playedSnapshot: boolean | null = null;
function getPlayedSnapshot() {
  if (playedSnapshot === null) {
    try {
      playedSnapshot = window.sessionStorage.getItem(storageKey) === "1";
    } catch {
      playedSnapshot = false;
    }
  }
  return playedSnapshot;
}

function markPlayed() {
  try {
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Storage blocked (private mode, disabled cookies) — the intro just plays again next load.
  }
}

const LETTER_STAGGER = 0.03;
const letterVariants: Variants = {
  hidden: { opacity: 0, y: "0.35em", filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};
/**
 * Pieces of the welcome line that animate one by one. Latin goes letter by letter; Khmer goes word by word, because
 * splitting it into characters would tear vowel signs and subscript consonants off the letters they belong to.
 */
const welcomePieces = (welcome: string, lang: Lang) => (lang === "km" ? welcome.split(/(\s+)/).filter(Boolean) : Array.from(welcome));

export function IntroLoader() {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const alreadyPlayed = useSyncExternalStore(noopSubscribe, getPlayedSnapshot, () => false);
  const reduced = useReducedMotion() ?? false;
  const { lang, t } = useLanguage();
  const text = t.intro;

  const [clock] = useState(createClock);
  const illuminationRef = useRef<Illumination>({ glow: 0, boltX: [] });
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const progress = useMotionValue(0);
  const percent = useTransform(progress, (value) => `${Math.floor(value)}%`);
  const barScale = useTransform(progress, [0, 100], [0, 1]);
  const textScale = useMotionValue(1);
  const textOpacity = useMotionValue(1);
  const overlayOpacity = useMotionValue(1);

  // Master clock: one rAF loop drives the loader, the exit and the unmount; the canvases read the same clock.
  useEffect(() => {
    if (!mounted || alreadyPlayed) return;
    const root = document.documentElement;
    let raf = 0;
    let current = -1;
    // Start once the page has finished loading (capped), and only on a frame after the canvases
    // have built their first bolt — load and setup jank never eats into the 5 seconds.
    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad, { once: true });
    const waitUntil = performance.now() + START_WAIT_MAX;

    const tick = () => {
      if (clock.startedAt() < 0) {
        if (!loaded && performance.now() < waitUntil) {
          raf = requestAnimationFrame(tick);
          return;
        }
        clock.start();
        if (overlayRef.current) overlayRef.current.dataset.introStart = String(clock.startedAt());
      }
      const t = clock.elapsed();

      progress.set(100 * easeInOutQuad(clamp01((t - timeline.loaderStart) / (timeline.exit - timeline.loaderStart))));
      const exit = clamp01((t - timeline.exit) / (timeline.fade - timeline.exit));
      textScale.set(reduced ? 1 : 1 + 0.14 * exit * exit);
      textOpacity.set(1 - exit);
      overlayOpacity.set(1 - clamp01((t - timeline.fade) / (timeline.end - timeline.fade)));

      const next = stageAt(t);
      if (next !== current) {
        current = next;
        setStage(next);
        // Plain attributes on <html> (not :has()) so toggling them only restyles what they target.
        // Cover: skip rendering the page while it's fully hidden. Lock: no scrolling until the fade;
        // scrollbar-gutter: stable means unlocking doesn't relayout the page.
        root.toggleAttribute("data-intro-cover", next < STAGE.exit);
        root.toggleAttribute("data-intro-lock", next < STAGE.fade);
        if (next >= STAGE.exit) markPlayed();
        // Lets deep links (/#about) scroll to their section now that the page is scrollable again.
        if (next >= STAGE.fade) window.dispatchEvent(new Event(INTRO_UNLOCK_EVENT));
      }

      if (t >= timeline.end) {
        root.removeAttribute("data-intro-lock");
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      root.removeAttribute("data-intro-cover");
    };
  }, [mounted, alreadyPlayed, reduced, clock, progress, textScale, textOpacity, overlayOpacity]);

  // Release the scroll lock (set by the inline script before first paint) if this component goes away.
  useEffect(() => () => document.documentElement.removeAttribute("data-intro-lock"), []);

  if (alreadyPlayed || done) return null;

  const exiting = stage >= STAGE.exit;

  return (
    <motion.div
      ref={overlayRef}
      className={`intro-overlay space-sky fixed inset-0 z-[100] overflow-hidden ${stage >= STAGE.fade ? "pointer-events-none" : ""}`}
      // Same sky as the site (.space-sky), so fading the overlay only removes the lightning and text.
      style={{ opacity: overlayOpacity }}
      role="status"
      aria-label={text.srLabel}
    >
      {mounted && <Starfield clock={clock} reduced={reduced} illuminationRef={illuminationRef} />}
      {mounted && <Lightning clock={clock} reduced={reduced} illuminationRef={illuminationRef} />}

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center"
        style={{ scale: textScale, opacity: textOpacity }}
      >
        {stage >= STAGE.welcome && (
          <motion.p
            className="intro-heading intro-welcome-glow text-4xl font-bold leading-tight text-zinc-200 md:text-6xl"
            initial={reduced ? { opacity: 0 } : "hidden"}
            animate={reduced ? { opacity: 1 } : "show"}
            variants={{ hidden: {}, show: { transition: { delayChildren: stagger(LETTER_STAGGER) } } }}
          >
            {/* The letters are aria-hidden for the animation; screen readers get the whole phrase (aria-label isn't allowed on <p>). */}
            <span className="sr-only">{text.welcome}</span>
            {welcomePieces(text.welcome, lang).map((letter, index) => (
              <motion.span
                className="inline-block"
                key={`${letter}-${index}`}
                variants={reduced ? undefined : letterVariants}
                aria-hidden="true"
              >
                {/^\s+$/.test(letter) ? " " : letter}
              </motion.span>
            ))}
          </motion.p>
        )}

        {/* Reserve the title's space so line 1 doesn't jump when it mounts. */}
        <div className="mt-2 min-h-[1.25em] text-5xl md:mt-3 md:text-7xl">
          {stage >= STAGE.title && (
            <motion.p
              className="intro-heading intro-title-glow font-bold leading-tight text-blue-600"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {text.title}
            </motion.p>
          )}
        </div>

        <div className="intro-mono mt-8 h-8 w-64 text-xs text-zinc-300 md:mt-10" aria-hidden="true">
          {stage >= STAGE.loader && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <div className="mb-2 flex items-center justify-between tracking-[0.12em]">
                <span>{text.loading}</span>
                <motion.span className="tabular-nums">{percent}</motion.span>
              </div>
              <div className="h-[2px] w-64 overflow-hidden rounded-full bg-white/15">
                <motion.div className="intro-progress-fill h-full origin-left bg-white" style={{ scaleX: barScale }} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {!exiting && (
        <button
          type="button"
          className="intro-mono absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-300 transition-colors hover:border-white/40 hover:text-white md:right-8 md:top-6"
          onClick={() => clock.jumpTo(timeline.exit)}
        >
          {text.skip}
        </button>
      )}
    </motion.div>
  );
}
