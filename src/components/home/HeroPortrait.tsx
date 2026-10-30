"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/** Intrinsic size of public/images/eng-sopheak-portrait.png — update both numbers if the file is replaced. */
const PORTRAIT = { src: "/images/eng-sopheak-portrait.png", width: 463, height: 697 };

/**
 * Right column of the hero: the transparent cut-out portrait in its natural colours. A single fade-in, then static
 * (opacity only, so the photo is never resampled).
 * From lg it is pinned in the right half of the hero shell: top 24px below the navbar, bottom flush with the hero's
 * bottom edge, so its fade ends exactly there. It is capped to the column width (object-bottom keeps the feet on the
 * edge), so on very tall screens it shrinks rather than overlapping the text.
 */
export function HeroPortrait() {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      className="relative order-first mx-auto flex w-full max-w-[260px] justify-center lg:absolute lg:inset-y-0 lg:top-6 lg:right-6 lg:left-1/2 lg:order-none lg:mx-0 lg:w-auto lg:max-w-none lg:items-end"
      data-reveal
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      {/* Full width when stacked so the image's aspect ratio reserves its space before it loads (no layout shift).
          Desktop: nudged 40px right with a plain offset on this wrapper, not a transform on the motion element. */}
      <div className="w-full lg:relative lg:left-10 lg:h-full lg:w-auto lg:max-w-full">
        <Image
          src={PORTRAIT.src}
          alt="Eng Sopheak"
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          priority
          quality={95}
          sizes="(min-width:1024px) 520px, 260px"
          className="h-auto w-full object-contain [image-rendering:auto] lg:h-full lg:w-auto lg:max-w-full lg:object-bottom"
        />
      </div>
    </motion.div>
  );
}
