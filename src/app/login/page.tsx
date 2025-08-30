"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/Login.module.css";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Admin Login</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter admin password"
        required
      />
      <button type="submit">Login</button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
