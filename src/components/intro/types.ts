/** Shared master clock: every part of the intro reads elapsed time from here. */
export interface IntroClock {
  /** Milliseconds since the intro started (includes any skip offset). */
  elapsed: () => number;
}

/** Written by the lightning each frame, read by the starfield so stars near the bolt light up. */
export interface Illumination {
  /** 0..1 strength of the current sky flash. */
  glow: number;
  /** Main-channel x (fraction of width) sampled at evenly spaced heights; empty until a bolt exists. */
  boltX: number[];
}
