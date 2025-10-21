import styles from "@/styles/components/Footer.module.css";

const links = [
  {
    label: "GitHub",
    href: "https://github.com/jhdaws/portfolio_np",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.note}>© {year} Jack Dawson.</p>
        <div className={styles.links}>
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
