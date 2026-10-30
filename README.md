# Eng Sopheak — Personal Portfolio Website

Personal portfolio of **ENG SOPHEAK** (Junior Developer). This is a frontend-only, single-page website: Home → About → Skills → Projects → Blog → Contact are sections of `/`. The old routes `/about`, `/skills`, `/projects`, `/blog` and `/contact` redirect to `/#about`, `/#skills`, … (see `next.config.ts`).

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Language | **TypeScript** (strict mode), TSX/JSX, CSS | TS 6.0 |
| Framework | **Next.js** (App Router) | 16.4 |
| UI library | **React** | 19.3 |
| Styling | **Tailwind CSS** v4 (via `@tailwindcss/postcss`) + custom CSS in `src/app/globals.css` | 4.3 |
| Animation | **Motion** (`motion/react`, formerly Framer Motion) | 14.0 |
| Icons | **lucide-react**, **react-icons** | — |
| Fonts | Geist, Geist Mono, Poppins (via `next/font/google`) | — |
| Images | `next/image` (optimized, qualities 75 / 92) | — |
| Linting | ESLint 9 + `eslint-config-next` | 9.39 |
| Runtime / package manager | Node.js + npm (`package-lock.json`) | — |

### Frontend
- Everything is built with React components rendered by Next.js.
- Interactive pieces use `"use client"`: navbar (smooth anchor scrolling + scroll spy that updates the URL hash), scroll progress bar, back-to-top button, star field, scroll reveals.
- The look is deliberately calm: a black starry background shared by every section, solid cards, no glow or gradients, one blue accent, and a single fade-in per section. The lightning intro is the one signature effect. Shared design tokens (colours, radius, shadow, durations, type scale) live in `@theme` / `:root` at the top of `src/app/globals.css`.

### Backend
- **None.** The project has no API routes (`app/api`), no server actions and no external API calls.
- Next.js only serves and pre-renders the pages.

### Database
- **None.** All content is static and stored in TypeScript config files:
  - `src/config/portfolio.ts`: navigation, social links, contact email
  - `src/config/about.ts`: About page content
  - `src/config/skills.ts`: skill groups and levels
  - `src/config/intro.ts`: intro texts, colors and timeline (`TOTAL_MS = 5000`)
- "Supabase" appears on the site only as a skill badge. It is not connected.

### Contact
- The Contact section has a plain form. With no backend, "Send message" opens the visitor's email app addressed to `contactEmail` in `src/config/portfolio.ts` (still the placeholder `hello@example.com`).
- Social links in `src/config/portfolio.ts` are still placeholders (`https://github.com`, `mailto:` …). Replace them with your real profile URLs.

## Project structure

```
src/
  app/
    layout.tsx          # root layout, fonts, metadata
    page.tsx            # the single page: all six sections in order
    globals.css         # Tailwind import + all custom styles
  components/
    sections/           # Section wrapper (one fade-in) and Hero/About/Skills/Projects/Blog/Contact sections
    layout/             # Navbar (scroll spy), ScrollProgress, BackToTop, Footer
    contact/            # ContactForm (opens the visitor's email app; no backend)
    home/               # HeroPortrait, AboutMe card (+ columns), SocialLinks
    about/              # AboutContent blocks (journey, what I do, toolkit) + contact copy
    skills/             # SkillBars, SkillBar, icon map
    background/         # SpaceBackground (site-wide star canvas) + shared star code
    intro/              # 5 s intro overlay: IntroLoader (master clock), Starfield, Lightning (canvas)
  config/               # portfolio.ts, about.ts  (site content / data)
  types/portfolio.ts    # shared TypeScript types
public/images/          # portraits and reference images
portfolio-hero.html     # standalone HTML prototype of the hero (not used by Next.js)
```

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server → http://localhost:3000
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Notes
- Dependencies are pinned to `"latest"` in `package.json`, so a fresh install can pull in breaking versions. Consider pinning exact versions.
- This Next.js version (16.x) has breaking changes from older versions. Check `node_modules/next/dist/docs/` before changing framework code (see `AGENTS.md`).
- The images in `public/images/` (`about-portrait-sunglasses.png`, `developer-profile*.png`, `portfolio-reference.png`) are not used by the site and can be removed.
- Natural deployment target: **Vercel**.
