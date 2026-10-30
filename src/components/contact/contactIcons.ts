import type { ComponentType, CSSProperties } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiGithub, SiGmail, SiTelegram } from "react-icons/si";
import type { ContactIconName } from "@/config/contact";

type IconComponent = ComponentType<{ size?: number | string; style?: CSSProperties; "aria-hidden"?: boolean }>;

/** Brand logos for the contact links. LinkedIn is no longer in Simple Icons, so it comes from Font Awesome. */
export const contactIcons: Record<ContactIconName, IconComponent> = {
  telegram: SiTelegram,
  gmail: SiGmail,
  linkedin: FaLinkedin,
  github: SiGithub,
};
