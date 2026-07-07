"use client";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";
import { ThemeToggle } from "../ThemeToggle";

const NAV = [
  { href: "/#principles", label: "원칙", match: "/#" },
  { href: "/foundations", label: "파운데이션", match: "/foundations" },
  { href: "/components", label: "컴포넌트", match: "/components" },
  { href: "/releases", label: "릴리즈", match: "/releases" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <a href="/" className={styles.brand}>
        <span className={styles.dot} />
        SDS<span className={styles.brandAccent}>.design</span>
      </a>
      <nav className={styles.nav}>
        {NAV.map((n) => {
          const active = n.match !== "/#" && pathname.startsWith(n.match);
          return (
            <a key={n.href} href={n.href} className={`${styles.link} ${active ? styles.active : ""}`}>
              {n.label}
            </a>
          );
        })}
      </nav>
      <div className={styles.right}>
        <a href="/components" className={styles.cta}>Get started</a>
        <ThemeToggle />
      </div>
    </header>
  );
}
