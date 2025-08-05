"use client";

import { useEffect, useState } from "react";
import { isAdmin, logout } from "@/utils/auth";
import { useRouter } from "next/navigation";

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
    <button
      onClick={handleClick}
      style={{ position: "absolute", top: "1rem", left: "1rem" }}
    >
      {admin ? "Logout" : "Login"}
    </button>
  );
}
