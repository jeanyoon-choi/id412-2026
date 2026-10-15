"use client";

import { useEffect, useState } from "react";
import styles from "./theme-toggle.module.css";

type Theme = "system" | "light" | "dark";
const order: Theme[] = ["system", "light", "dark"];

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Theme | null;
      if (saved && order.includes(saved)) setTheme(saved);
    } catch {}
  }, []);

  const change = (next: Theme) => {
    setTheme(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <div className={styles.group} role="group" aria-label="Theme">
      {order.map((option) => (
        <button
          key={option}
          type="button"
          className={option === theme ? styles.active : styles.option}
          onClick={() => change(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
