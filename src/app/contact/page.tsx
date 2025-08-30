export const metadata = {
  title: "Contact Me",
};

import styles from "@/styles/pages/Contact.module.css";
import { Mail, Linkedin, Instagram } from "lucide-react"; // icon set

export default function ContactPage() {
  const contacts = [
    {
      label: "Email",
      icon: Mail,
      href: "mailto:nikhil.k.patel@vanderbilt.edu",
      display: "nikhil.k.patel@vanderbilt.edu",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/nikhil-patel-2523601b5/",
      display: "linkedin.com/in/nikhil-patel-2523601b5",
    },
    {
      label: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/yourusername/",
      display: "@yourusername",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contact Me</h1>
      <p className={styles.subtitle}>
        Feel free to reach out via any of the platforms below.
      </p>
      <ul className={styles.list}>
        {contacts.map(({ label, icon: Icon, href, display }) => (
          <li key={label} className={styles.item}>
            <Icon className={styles.icon} size={28} />
            <div className={styles.info}>
              <span className={styles.label}>{label}</span>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {display}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
