"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { en, type Dictionary } from "./en";
import { km } from "./km";

export type Lang = "en" | "km";

/** Text kept in config files: a plain string (names, brands — never translated) or one string per language. */
export type Translatable = string | Record<Lang, string>;

export const dictionaries: Record<Lang, Dictionary> = { en, km };
const STORAGE_KEY = "cdv-lang";

/** Fills {placeholders}: format("Hi {name}", { name: "Ana" }). */
export const format = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/* ---------- Store: the saved language, read once on the client and shared by every subscriber ---------- */

let current: Lang | null = null;
const listeners = new Set<() => void>();

function readSaved(): Lang {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "km" ? "km" : "en";
  } catch {
    return "en"; // Storage blocked: default language, nothing is remembered.
  }
}

const store = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: (): Lang => (current ??= readSaved()),
  // The server (and the first hydration pass) always renders English; the saved choice applies right after.
  getServer: (): Lang => "en",
  set(lang: Lang) {
    current = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Not persisted, but the switch still works for this visit.
    }
    listeners.forEach((listener) => listener());
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** The whole dictionary for the current language: t.nav.home, t.contact.send, … */
  t: Dictionary;
  /** Resolves a config value (plain string or { en, km }). */
  tr: (value: Translatable) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Client-side English / Khmer switch for the whole site. Mounted once in the root layout. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(store.subscribe, store.get, store.getServer);

  // Keep <html lang>, the tab title and the description in step with the language.
  useEffect(() => {
    const { meta } = dictionaries[lang];
    document.documentElement.lang = lang;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang: store.set,
      t: dictionaries[lang],
      tr: (text) => (typeof text === "string" ? text : text[lang]),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return value;
}
