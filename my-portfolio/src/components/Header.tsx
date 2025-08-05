"use client";

import LoginToggle from "@/components/LoginToggle";

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
        <a href="/" style={{ margin: "0 1rem" }}>
          Home
        </a>
        <a href="/projects" style={{ margin: "0 1rem" }}>
          Projects
        </a>
      </nav>
    </header>
  );
}
