"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { INTRO_UNLOCK_EVENT } from "@/config/intro";

/** Scroll animations for elements marked with data-aos (About Me). Mounted once in the root layout. */
export function AOSProvider() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      // With reduced motion AOS strips the data-aos attributes, so everything simply shows.
      disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    // While the intro covers the page its layout is skipped, so positions measured at init are off: re-measure.
    const refresh = () => AOS.refresh();
    window.addEventListener(INTRO_UNLOCK_EVENT, refresh);
    return () => window.removeEventListener(INTRO_UNLOCK_EVENT, refresh);
  }, []);

  return null;
}
