"use client";

import { ContactForm } from "@/components/contact/ContactForm";
import { ContactIconRow, ContactTree } from "@/components/contact/ContactTree";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Section, SectionHeading } from "./Section";

export function ContactSection({ id }: { id: string }) {
  const { t } = useLanguage();
  return (
    <Section id={id} labelledBy="contact-title">
      {/* Heading above the grid so it centres on the page like every other section. */}
      <SectionHeading id="contact-title" title={t.contact.title} />
      <div className="contact-grid">
        {/* Same breakpoint as the grid (900px): the tree beside the form, or a row of icons above it. */}
        <div className="hidden min-[900px]:block">
          <ContactTree />
        </div>
        <div className="min-[900px]:hidden">
          <ContactIconRow />
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
