"use client";

import LoginToggle from "@/components/LoginToggle";
import Link from "next/link";
import styles from "@/styles/components/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <LoginToggle />
      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="/projects" className={styles.link}>
          Projects
        </Link>
        <Link href="/bookshelf" className={styles.link}>
          Bookshelf
        </Link>
        <Link href="/music" className={styles.link}>
          Music
        </Link>
        <Link href="/contact" className={styles.link}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
