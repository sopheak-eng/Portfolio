import type { Metadata } from "next";
import { Geist, Geist_Mono, Kantumruy_Pro, Poppins } from "next/font/google";
import { SpaceBackground } from "@/components/background/SpaceBackground";
import { CursorWeb } from "@/components/effects/CursorWeb";
import { IntroLoader } from "@/components/intro/IntroLoader";
import { AOSProvider } from "@/components/providers/AOSProvider";
import { introSeenScript } from "@/config/intro";
import { en } from "@/i18n/en";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["700", "800"] });
// Khmer glyphs (tall stacked vowels and subscripts); used for Khmer text in both languages' font stacks.
const kantumruy = Kantumruy_Pro({ variable: "--font-khmer", subsets: ["khmer", "latin"] });

// Server-rendered metadata is English; LanguageProvider swaps the title and description in the browser.
export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  openGraph: {
    title: en.meta.title,
    description: en.meta.description,
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script adds data-intro-seen / data-intro-lock before React hydrates.
    // Font variables live on <html> so the design tokens in globals.css (@theme on :root) can resolve them.
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable} ${poppins.variable} ${kantumruy.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: introSeenScript }} />
        <noscript>
          {/* Without JS: no intro, and AOS elements must not stay hidden at opacity 0. */}
          <style>{".intro-overlay{display:none!important}[data-aos]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {/* Root layout: mounted once, persists across navigation. */}
        <SpaceBackground />
        {/* Above the content (z-60, click-through). Turns itself on only once the intro has released the page
            (and never on touch / reduced motion). */}
        <CursorWeb />
        <LanguageProvider>
          <IntroLoader />
          {children}
        </LanguageProvider>
        <AOSProvider />
      </body>
    </html>
  );
}
