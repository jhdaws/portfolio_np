"use client";

import { useEffect, useState } from "react";
import { isAdmin, logout } from "@/utils/auth";
import { useRouter } from "next/navigation";
import styles from "@/styles/components/LoginToggle.module.css";

export default function LoginToggle() {
  const [admin, setAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  const handleClick = () => {
    if (admin) {
      logout();
    } else {
      router.push("/login");
    }
  };

  return (
    <button onClick={handleClick} className={styles.button}>
      {admin ? "Logout" : "Login"}
    </button>
  );
}
