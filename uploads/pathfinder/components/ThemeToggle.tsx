"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  useEffect(() => { try { const t = localStorage.getItem("pf-theme"); if (t === "dark" || t === "light") setTheme(t); } catch {} }, []);
  function cycle() {
    const next = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    try { if (next === "system") { localStorage.removeItem("pf-theme"); document.documentElement.removeAttribute("data-theme"); } else { localStorage.setItem("pf-theme", next); document.documentElement.setAttribute("data-theme", next); } } catch {}
  }
  return <button type="button" className="btn btn-ghost btn-sm" onClick={cycle} title="Theme">{theme === "system" ? "Auto" : theme === "dark" ? "Ink" : "Paper"}</button>;
}
