"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { INTRO_UNLOCK_EVENT } from "@/config/intro";
import { navigation } from "@/config/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

const sectionId = (href: string) => href.slice(href.indexOf("#") + 1);
const SECTION_IDS = navigation.map((item) => sectionId(item.href));
const HOME_ID = SECTION_IDS[0];
/** Fallback for browsers without `scrollend`: how long a smooth scroll may take. */
const SCROLL_LOCK_MS = 1500;

/** Show the section in the URL without a reload or a new history entry. Home keeps the bare path. */
function replaceHash(id: string) {
  const hash = id === HOME_ID ? "" : `#${id}`;
  if (window.location.hash === hash) return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
}

/**
 * Scroll so the section starts just under the navbar (its scroll-margin-top). Uses layout position, not
 * scrollIntoView: a section that hasn't revealed yet is still shifted by its slide-up transform.
 */
function scrollToSection(section: HTMLElement, behavior: ScrollBehavior) {
  const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
  window.scrollTo({ top: section.offsetTop - margin, behavior });
}

/** Shared focus ring for every control in the pill. */
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent/60";
/** Past this scroll offset the glass gets a little more opaque. */
const SCROLLED_AT = 20;
/** The active-link pill slides between links: fast spring, no wobble. */
const PILL_SPRING = { type: "spring", stiffness: 400, damping: 32 } as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [activeId, setActiveId] = useState(HOME_ID);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const onHome = pathname === "/";
  /** While a click-triggered smooth scroll runs, the spy must not flick through the sections in between. */
  const scrollingTo = useRef<string | null>(null);

  // Deep link (/#about, or /about redirected here): on a first visit the intro hides and locks the page, so the
  // browser's own jump to the anchor can't happen. Jump when the intro unlocks; the spy waits so it can't clear the
  // hash first. Declared before the spy so the pause is in place when the spy's first callback fires.
  useEffect(() => {
    if (!onHome) return;
    const id = window.location.hash.slice(1);
    const target = SECTION_IDS.includes(id) ? document.getElementById(id) : null;
    if (!target) return;
    scrollingTo.current = id;
    const jump = () => {
      scrollToSection(target, "instant");
      scrollingTo.current = null;
    };
    // Set by the inline script in layout.tsx when the intro was already played this session.
    if (document.documentElement.hasAttribute("data-intro-seen")) return jump();
    window.addEventListener(INTRO_UNLOCK_EVENT, jump, { once: true });
    return () => window.removeEventListener(INTRO_UNLOCK_EVENT, jump);
  }, [onHome]);

  // Scroll spy: the active section is the one crossing a thin band near the middle of the viewport.
  useEffect(() => {
    if (!onHome) return;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter((el) => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingTo.current) return;
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;
        setActiveId(hit.target.id);
        replaceHash(hit.target.id);
      },
      // A fraction threshold would never be met by sections taller than the band, so any overlap counts.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));

    // The band can miss the ends of the page: the top always means Home, the very bottom always means Contact.
    const onEdges = () => {
      if (scrollingTo.current) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const id = window.scrollY < SCROLLED_AT ? HOME_ID : atBottom ? SECTION_IDS[SECTION_IDS.length - 1] : null;
      if (!id) return;
      setActiveId(id);
      replaceHash(id);
    };
    window.addEventListener("scroll", onEdges, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onEdges);
    };
  }, [onHome]);

  // Slightly more opaque glass once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: close on Escape (focus back on the hamburger) or a click outside the pill/panel; lock page scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // On the home page, anchor links scroll smoothly instead of navigating. Elsewhere (any other page) they go to /#id.
  const goTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);
    if (!onHome) return;
    const id = sectionId(href);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();

    scrollingTo.current = id;
    setActiveId(id);
    replaceHash(id);
    const release = () => {
      scrollingTo.current = null;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release);
    window.setTimeout(release, SCROLL_LOCK_MS);

    scrollToSection(target, reduceMotion ? "instant" : "smooth");
  };

  const isActive = (href: string) => onHome && activeId === sectionId(href);
  const homeHref = navigation[0].href;
  // Thin cream glass (30%) the night sky shows through: soft edge + 1px inner highlight + one shadow to lift it.
  const glass = `border border-white/25 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(0,0,0,0.25)] transition-colors duration-200 ${
    scrolled || open ? "bg-cream/[0.34]" : "bg-cream/30"
  }`;
  // Active: white on the pink pill. Inactive: white/70 on the glass, with a faint white hover (never pink).
  const linkTone = (href: string) => (isActive(href) ? "text-white" : "text-white/70 hover:bg-white/10 hover:text-white");

  return (
    // Floating pill, centred with auto margins (no translate, so the load animation's transform can't displace it).
    <motion.header
      ref={headerRef}
      data-reveal
      className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-32px)] max-w-5xl"
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <nav className={`flex h-14 items-center justify-between rounded-full pr-2 pl-5 lg:h-16 lg:pl-6 ${glass}`} aria-label={t.nav.primary}>
        <Link
          className={`flex shrink-0 items-center rounded-full transition-opacity duration-200 hover:opacity-85 ${FOCUS}`}
          href={homeHref}
          aria-label={t.nav.logo}
          onClick={(event) => goTo(event, homeHref)}
        >
          {/* Gold signature: amber is too dim on the see-through glass. Height drives the size; width follows. */}
          <Image src="/images/signature-gold.png" alt="Eng Sopheak" width={1427} height={409} priority quality={95} sizes="128px" className="h-9 w-auto" />
        </Link>

        {/* Five links + the language switch need ~800px, so the full layout starts at lg; narrower screens use the menu. */}
        <LayoutGroup>
          <ul className="m-0 hidden list-none items-center gap-1 p-0 lg:flex">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${FOCUS} ${linkTone(item.href)}`}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={(event) => goTo(event, item.href)}
                >
                  {/* One shared pill: when the active link changes it slides and resizes to the new one. */}
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{t.nav[item.key]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </LayoutGroup>

        <div className="flex items-center gap-2">
          <LanguageSwitcher id="lang-desktop" className="hidden lg:flex" />
          <button
            ref={menuButtonRef}
            type="button"
            className={`grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/10 text-cream transition-colors duration-200 hover:bg-white/20 lg:hidden ${FOCUS}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className={`mt-2 rounded-2xl p-2 lg:hidden ${glass}`}>
          <ul className="m-0 list-none p-0">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  // Active item: the same pink pill, full width. (Static here: the menu closes on tap.)
                  className={`flex items-center rounded-full px-4 py-3 text-base font-medium transition-colors duration-200 ${FOCUS} ${
                    isActive(item.href) ? "bg-accent text-white" : linkTone(item.href)
                  }`}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={(event) => goTo(event, item.href)}
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
          <LanguageSwitcher id="lang-mobile" className="mx-auto mt-2 w-fit" />
        </div>
      )}
    </motion.header>
  );
}
