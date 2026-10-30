import type { Translatable } from "@/i18n/LanguageProvider";

export type Experience = {
  /** Stable key (React key, never shown). */
  id: string;
  period: Translatable;
  role: Translatable;
  org: Translatable;
  description: Translatable;
  highlights: Translatable[];
  /** The role I'm in now: gets the "Now" pill, pink bullets, and comes first on mobile. */
  current?: boolean;
};

/** "My Journey" cards, oldest first (left → right on desktop). */
export const experiences: Experience[] = [
  {
    id: "teacher",
    period: { en: "2023 – 2026", km: "២០២៣ – ២០២៦" },
    role: { en: "Computer Teacher", km: "គ្រូបង្រៀនកុំព្យូទ័រ" },
    org: { en: "Lower Secondary School", km: "សាលាអនុវិទ្យាល័យ" },
    description: {
      en: "Taught computer skills to lower secondary students, turning technical topics into simple, hands-on lessons.",
      km: "បង្រៀនជំនាញកុំព្យូទ័រដល់សិស្សអនុវិទ្យាល័យ ដោយបំប្លែងប្រធានបទបច្ចេកទេសឱ្យទៅជាមេរៀនសាមញ្ញ និងអនុវត្តផ្ទាល់។",
    },
    highlights: [
      { en: "Taught computer basics, Microsoft Office and internet safety", km: "បង្រៀនមូលដ្ឋានគ្រឹះកុំព្យូទ័រ Microsoft Office និងសុវត្ថិភាពលើអ៊ីនធឺណិត" },
      { en: "Prepared lesson plans, exercises and practical tests", km: "រៀបចំផែនការបង្រៀន លំហាត់ និងការប្រឡងអនុវត្ត" },
      { en: "Helped students build confidence using technology", km: "ជួយសិស្សឱ្យមានទំនុកចិត្តក្នុងការប្រើប្រាស់បច្ចេកវិទ្យា" },
    ],
  },
  {
    id: "coder",
    period: { en: "2026 – Present", km: "២០២៦ – បច្ចុប្បន្ន" },
    role: { en: "Junior Vibe Coder", km: "Vibe Coder កម្រិតដំបូង" },
    org: { en: "Development Team", km: "ក្រុមអភិវឌ្ឍន៍" },
    current: true,
    description: {
      en: "Building modern web and mobile apps with an AI-assisted workflow, working closely with the development team.",
      km: "បង្កើតកម្មវិធីគេហទំព័រ និងទូរស័ព្ទទំនើប ដោយប្រើវិធីការងារដែលមានជំនួយពី AI និងសហការយ៉ាងជិតស្និទ្ធជាមួយក្រុមអភិវឌ្ឍន៍។",
    },
    highlights: [
      { en: "Build UI with Next.js, React, TypeScript and Tailwind", km: "បង្កើត UI ដោយប្រើ Next.js, React, TypeScript និង Tailwind" },
      { en: "Use AI tools to research, prototype and ship faster", km: "ប្រើឧបករណ៍ AI ដើម្បីស្រាវជ្រាវ បង្កើតគំរូ និងចេញផលិតផលបានលឿនជាងមុន" },
      { en: "Collaborate with Git/GitHub, code reviews and team tasks", km: "សហការតាមរយៈ Git/GitHub ការពិនិត្យកូដ និងកិច្ចការក្រុម" },
    ],
  },
];
