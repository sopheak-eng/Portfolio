"use client";

import type { FormEvent } from "react";
import { contactEmail } from "@/config/portfolio";
import { format, useLanguage } from "@/i18n/LanguageProvider";

type Field = HTMLInputElement | HTMLTextAreaElement;

/**
 * Plain contact form. There is no backend, so sending opens the visitor's email app with the message filled in
 * (to `contactEmail` in src/config/portfolio.ts). Native validation, with the messages in the page's language.
 */
export function ContactForm() {
  const { t } = useLanguage();

  // Browsers word these bubbles in their own UI language; swap in ours.
  const onInvalid = (event: FormEvent<Field>) => {
    const field = event.currentTarget;
    field.setCustomValidity(field.validity.valueMissing ? t.contact.required : field.validity.typeMismatch ? t.contact.invalidEmail : "");
  };
  // Clear the custom message as soon as the visitor edits, or the field would stay invalid.
  const onInput = (event: FormEvent<Field>) => event.currentTarget.setCustomValidity("");
  const validation = { onInvalid, onInput };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = format(t.contact.subject, { name });
    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="card contact-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="contact-name">{t.contact.name}</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder={t.contact.namePlaceholder} {...validation} />
      </div>
      <div className="field">
        <label htmlFor="contact-email">{t.contact.email}</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" {...validation} />
      </div>
      <div className="field">
        <label htmlFor="contact-message">{t.contact.message}</label>
        <textarea id="contact-message" name="message" required placeholder={t.contact.messagePlaceholder} {...validation} />
      </div>
      <button className="submit-button" type="submit">{t.contact.send}</button>
      <p className="form-note">{t.contact.note}</p>
    </form>
  );
}
