"use client";

import { useEffect, useState } from "react";
import { isAdmin, logout } from "@/utils/auth";
import { useRouter } from "next/navigation";
import styles from "@/styles/components/LoginToggle.module.css";

export default function LoginToggle() {
  const [admin, setAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = () => setAdmin(isAdmin());
    checkAdmin();
    window.addEventListener("focus", checkAdmin);
    const interval = setInterval(checkAdmin, 500);
    return () => {
      window.removeEventListener("focus", checkAdmin);
      clearInterval(interval);
    };
  }, []);

  const handleClick = async () => {
    if (admin) {
      await logout();
      setAdmin(false);
      router.refresh();
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.button} ${admin ? styles.logout : styles.login}`}
      aria-label={admin ? "Logout" : "Login"}
    >
      {admin ? (
        // Lock icon (logout state)
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        // Lock with dot (login prompt)
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      )}
      <span className="sr-only">{admin ? "Logout" : "Login"}</span>
    </button>
  );
}
