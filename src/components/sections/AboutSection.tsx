import { AboutJourney, AboutWhatIDo } from "@/components/about/AboutContent";
import { AboutMe } from "@/components/home/AboutMe";
import { Section } from "./Section";

export function AboutSection({ id }: { id: string }) {
  // No section fade: About Me animates its own parts with AOS, so it would animate twice.
  return (
    <Section id={id} labelledBy="home-about-title" reveal={false}>
      <AboutMe />
      <AboutJourney />
      <AboutWhatIDo />
    </Section>
  );
}
