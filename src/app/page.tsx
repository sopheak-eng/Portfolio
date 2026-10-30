import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      {/* One wrapper for the page body: while the intro covers the page it is skipped as a whole
          (content-visibility on body children), so nothing inside — like the footer's border — can jump when it ends. */}
      <div>
        <main>
          <HeroSection id="home" />
          <AboutSection id="about" />
          <SkillsSection id="skills" />
          <ProjectsSection id="projects" />
          <ContactSection id="contact" />
        </main>
        <Footer />
      </div>
      <BackToTop />
    </>
  );
}
