import styles from "@/styles/components/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        © 2025 Jack Dawson.{' '}
        <a href="https://github.com/jackdawson" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </p>
    </footer>
  );
}
