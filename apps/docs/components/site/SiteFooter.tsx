import styles from "./SiteFooter.module.css";

const GITHUB = "https://github.com/tube-jeonghoon/superbase-design-system";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>© 2026 Superbase Design System</span>
      <nav className={styles.links}>
        <a href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
        <a href="#">Figma</a>
        <a href="#">Changelog RSS</a>
      </nav>
    </footer>
  );
}
