"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, Ref } from "react";

interface SectionProps {
  id: string;
  children: ReactNode;
  labelledBy?: string;
  ref?: Ref<HTMLElement>;
  /** Fade the whole section in on first view. Off where its content animates itself (About uses AOS). */
  reveal?: boolean;
}

/**
 * One block of the single-page site: same padding and width everywhere, offset for the fixed navbar.
 * Fades in once (opacity + 16px) the first time it scrolls into view; nothing inside animates on its own.
 */
export function Section({ id, children, labelledBy, ref, reveal = true }: SectionProps) {
  const reduced = useReducedMotion() ?? false;
  const animate = reveal && !reduced;

  return (
    <motion.section
      ref={ref}
      id={id}
      data-reveal={reveal || undefined}
      aria-labelledby={labelledBy}
      className="relative flex min-h-screen scroll-mt-24 flex-col justify-center py-24 md:py-32"
      initial={animate ? { opacity: 0, y: 16 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      // Trigger when the section's top edge is 20% into the viewport. An `amount` fraction would never be reached
      // by sections much taller than the screen (About on mobile).
      viewport={{ once: true, amount: "some", margin: "0px 0px -20% 0px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>
    </motion.section>
  );
}

/** Centred section title. */
export function SectionHeading({ id, title, children, aos }: { id?: string; title?: string; children?: ReactNode; aos?: boolean }) {
  return (
    <div className="mx-auto mb-12 w-full text-center" {...(aos && { "data-aos": "fade-up", "data-aos-duration": "1000" })}>
      <h2 id={id} className="section-title">{children ?? title}</h2>
    </div>
  );
}
