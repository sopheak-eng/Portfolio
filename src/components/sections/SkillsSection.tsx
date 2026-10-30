import { AboutToolkit } from "@/components/about/AboutContent";
import { SkillBars } from "@/components/skills/SkillBars";
import { Section } from "./Section";

export function SkillsSection({ id }: { id: string }) {
  return (
    <Section id={id} labelledBy="skills-title">
      <SkillBars />
      <AboutToolkit />
    </Section>
  );
}
