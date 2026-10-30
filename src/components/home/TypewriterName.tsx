"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Timings, ms. */
const TYPE_MS = 120;
const DELETE_MS = 60;
const HOLD_MS = 2000;
const EMPTY_MS = 500;

type Phase = "typing" | "holding" | "deleting" | "empty";

interface State {
  phase: Phase;
  /** Letters currently shown. */
  count: number;
}

/** The loop: type → hold → delete → pause → type… */
function next({ phase, count }: State, length: number): State {
  switch (phase) {
    case "typing":
      return count < length ? { phase, count: count + 1 } : { phase: "holding", count };
    case "holding":
      return { phase: "deleting", count };
    case "deleting":
      return count > 0 ? { phase, count: count - 1 } : { phase: "empty", count };
    case "empty":
      return { phase: "typing", count };
  }
}

/** How long to stay in a state before taking the next step. */
function delayFor({ phase, count }: State, length: number) {
  switch (phase) {
    case "typing":
      return count < length ? TYPE_MS : 0;
    case "holding":
      return HOLD_MS;
    case "deleting":
      return count > 0 ? DELETE_MS : 0;
    case "empty":
      return EMPTY_MS;
  }
}

/**
 * Types the name letter by letter in pink, holds it, deletes it and starts again, with a blinking caret.
 * An invisible copy of the full text reserves the space, so nothing below moves; the loop pauses off-screen.
 */
export function TypewriterName({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState<State>({ phase: "typing", count: 0 });
  const letters = Array.from(text);

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = window.setTimeout(() => setState(next(state, letters.length)), delayFor(state, letters.length));
    return () => window.clearTimeout(timer);
  }, [state, inView, reduced, letters.length]);

  const shown = reduced ? letters.length : state.count;

  return (
    // The wrapper carries the name for screen readers; everything visual inside is hidden from them.
    <span ref={ref} aria-label={text}>
      <span className="relative inline-block whitespace-nowrap">
        <span className="invisible" aria-hidden="true">
          {text}
        </span>
        <span className="absolute top-0 left-0 whitespace-nowrap text-accent" aria-hidden="true">
          {letters.slice(0, shown).map((letter, index) => (
            <motion.span
              // Keyed by position, so a letter re-animates each time it is typed again.
              key={index}
              className="inline-block"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {letter === " " ? " " : letter}
            </motion.span>
          ))}
          {!reduced && <span className="typewriter-caret" />}
        </span>
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
