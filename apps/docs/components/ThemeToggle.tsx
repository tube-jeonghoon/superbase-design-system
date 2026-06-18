"use client";
import { useEffect, useState } from "react";
import { Switch } from "@superbase/react";
import { STORAGE_KEY } from "../lib/theme";

function applyTheme(isDark: boolean) {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initial = localStorage.getItem(STORAGE_KEY) === "dark";
    setDark(initial);
    applyTheme(initial);
  }, []);

  function handleChange(next: boolean) {
    setDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  return (
    <Switch checked={dark} onChange={handleChange} aria-label="다크 모드 토글" />
  );
}
