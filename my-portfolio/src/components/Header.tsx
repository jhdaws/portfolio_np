"use client";

import LoginToggle from "@/components/LoginToggle";
import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ccc",
        position: "relative",
      }}
    >
      <LoginToggle />
      <nav style={{ textAlign: "center" }}>
        <Link href="/" style={{ margin: "0 1rem" }}>
          Home
        </Link>
        <Link href="/projects" style={{ margin: "0 1rem" }}>
          Projects
        </Link>
        <Link href="/bookshelf" style={{ margin: "0 1rem" }}>
          Bookshelf
        </Link>
        <Link href="/music" style={{ margin: "0 1rem" }}>
          Music
        </Link>
        <Link href="/contact" style={{ margin: "0 1rem" }}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
