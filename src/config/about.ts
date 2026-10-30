import {
  Blocks,
  BrainCircuit,
  PenTool,
  GitBranch,
  Layers3,
  Lightbulb,
  PanelsTopLeft,
  RefreshCw,
  Rocket,
  Smartphone,
  Users,
  Workflow,
} from "lucide-react";

export const services = [
  { title: "Web Development", description: "Fast, responsive websites built with modern web technologies.", icon: PanelsTopLeft },
  { title: "Mobile Apps", description: "Thoughtful mobile experiences with clean, intuitive interfaces.", icon: Smartphone },
  { title: "AI-Assisted Development", description: "Practical AI workflows that accelerate ideas without sacrificing quality.", icon: BrainCircuit },
  { title: "UI Implementation", description: "Precise interfaces translated from concept into polished code.", icon: Layers3 },
  { title: "API Integration", description: "Reliable connections between products, services, and data.", icon: Workflow },
  { title: "Problem Solving", description: "Clear thinking for complex technical and product challenges.", icon: Lightbulb },
];

export const journey = [
  { step: "01", title: "Started with curiosity", description: "Began learning programming fundamentals and how digital products work." },
  { step: "02", title: "Built personal projects", description: "Turned lessons into working websites, applications, and practical experiments." },
  { step: "03", title: "Developed a design eye", description: "Focused on UI detail, usability, responsive layouts, and consistent systems." },
  { step: "04", title: "Learned through collaboration", description: "Joined development team workflows and grew through shared problem solving." },
  { step: "05", title: "Explored AI-assisted work", description: "Adopted AI tools to research, iterate, and build more effectively." },
  { step: "06", title: "Continuing to grow", description: "Still learning, shipping, and improving one thoughtful project at a time." },
];

export const skills = ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Flutter", "Git", "Figma", "Supabase", "REST API"];

export const values = [
  { title: "Continuous Learning", icon: RefreshCw },
  { title: "Clean UI Thinking", icon: PenTool },
  { title: "Collaboration", icon: Users },
  { title: "Problem Solving", icon: Blocks },
  { title: "Consistency", icon: GitBranch },
  { title: "Growth Mindset", icon: Rocket },
];
