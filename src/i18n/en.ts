/**
 * English UI copy. km.ts must have exactly the same shape (it is typed as `Dictionary`), so no key can go missing.
 * Not translated anywhere: the name ENG SOPHEAK, brand / tech names, the email address and URLs.
 * Placeholders like {name} are filled in with `format()`.
 */
export const en = {
  meta: {
    title: "Eng Sopheak — Junior Developer",
    description: "Junior developer building modern digital experiences with thoughtful code and AI-assisted tools.",
  },
  nav: {
    home: "Home",
    about: "About",
    skills: "Skills",
    projects: "Projects",
    contact: "Contact",
    primary: "Primary navigation",
    logo: "Eng Sopheak – back to top",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    language: "Change language",
  },
  hero: {
    available: "Open to Opportunities",
    greeting: "Hi, I'm",
    roles: ["Vibe Coder", "AI-Assisted Developer", "Development Team Member"],
    summary: "I build modern websites, mobile applications, and meaningful digital experiences using modern technologies and AI tools.",
    explore: "Explore Projects",
    social: "Social links",
  },
  about: {
    title: "About Me",
    lead: "I'm a passionate developer who enjoys building modern websites, mobile applications, and meaningful digital experiences using modern technologies and AI-powered tools.",
    focusTitle: "My Focus",
    focus: [
      "Modern Web Development",
      "Mobile Application Development",
      "AI-Assisted Development",
      "Creative UI/UX Design",
      "Team Collaboration",
    ],
    explore: "Explore My Projects",
  },
  journey: {
    title: "My Journey",
    now: "Now",
  },
  whatIDo: {
    title: "What I do",
    items: [
      { title: "Web Development", text: "Fast, responsive websites built with modern frameworks and clean, maintainable code." },
      { title: "UI / UX Design", text: "Thoughtful interfaces that are clear, accessible, and pleasant to use across devices." },
      { title: "Mobile Apps", text: "Cross-platform mobile experiences with intuitive navigation and polished detail." },
    ],
  },
  skills: {
    /** "My Skills": the highlighted word can sit at either end, so the title is split in three. */
    title: { before: "My ", highlight: "Skills", after: "" },
    level: "{name} skill level",
    toolkitTitle: "Skills & tech stack",
  },
  projects: {
    title: "Featured projects",
    placeholderTitle: "Case studies are on the way",
    placeholderText: "I'm writing up my best projects with screenshots, the problems they solve, and what I learned building them.",
    github: "See my code on GitHub",
  },
  contact: {
    title: "Let's work together",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    message: "Message",
    messagePlaceholder: "Tell me a little about your project",
    send: "Send message",
    note: "Opens your email app with the message ready to send.",
    required: "Please fill out this field.",
    invalidEmail: "Please enter a valid email address.",
    subject: "Portfolio message from {name}",
  },
  footer: {
    builtWith: "Built with Next.js.",
  },
  backToTop: "Back to top",
  intro: {
    welcome: "Welcome To My",
    title: "Portfolio Website",
    loading: "Loading",
    skip: "Skip",
    srLabel: "Loading portfolio",
  },
};

export type Dictionary = typeof en;
