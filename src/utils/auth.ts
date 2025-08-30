"use client";

export function isAdmin() {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("auth=true");
}

export async function logout() {
  await fetch("/api/logout", { method: "POST" });
  document.cookie = "auth=; Max-Age=0";
  window.location.href = "/login";
}
