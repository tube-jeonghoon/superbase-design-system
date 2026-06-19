"use client";
import { useEffect, useState } from "react";

export function useTokenValue(cssVar: string): string {
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () =>
      setValue(
        getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim(),
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [cssVar]);

  return value;
}
