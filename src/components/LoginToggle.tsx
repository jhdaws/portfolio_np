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
      className={styles.button}
    >
      {admin ? "Logout" : "Login"}
    </button>
  );
}
