import type { ComponentType, CSSProperties } from "react";
import { BrainCircuit, PanelsTopLeft, PenTool, Sparkles, Users, Webhook } from "lucide-react";
import {
  SiCss,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import type { SkillIconName } from "@/config/skills";

type IconComponent = ComponentType<{ size?: number | string; className?: string; style?: CSSProperties; "aria-hidden"?: boolean }>;

/** Maps the string keys used in src/config/skills.ts and toolkit.ts to icon components (Simple Icons logos, lucide for the rest). */
export const skillIcons: Record<SkillIconName, IconComponent> = {
  html5: SiHtml5,
  css: SiCss,
  javascript: SiJavascript,
  typescript: SiTypescript,
  react: SiReact,
  nextjs: SiNextdotjs,
  tailwind: SiTailwindcss,
  nodejs: SiNodedotjs,
  supabase: SiSupabase,
  python: SiPython,
  git: SiGit,
  github: SiGithub,
  figma: SiFigma,
  // No official brand for these two: neutral lucide icons.
  restApi: Webhook,
  aiTools: Sparkles,
  webDesign: PanelsTopLeft,
  uiux: PenTool,
  ai: BrainCircuit,
  team: Users,
};
