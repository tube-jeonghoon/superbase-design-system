"use client";
import { usePathname } from "next/navigation";
import { componentNav } from "./docs/componentNav";
import styles from "./SideNav.module.css";

const TOP = [
  { href: "/", label: "Getting Started" },
  { href: "/foundations", label: "Foundations" },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {TOP.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={styles.link}
          data-active={pathname === item.href}
        >
          {item.label}
        </a>
      ))}
      <a
        href="/components"
        className={styles.group}
        data-active={pathname.startsWith("/components")}
      >
        Components
      </a>
      {componentNav.map((item) => {
        const href = `/components/${item.slug}`;
        return (
          <a
            key={item.slug}
            href={href}
            className={styles.item}
            data-active={pathname === href}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
