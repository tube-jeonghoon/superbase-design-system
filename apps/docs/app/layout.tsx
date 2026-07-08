import type { ReactNode } from "react";
import "@superbase/tokens/css";
import "@superbase/react/styles.css";
import "./globals.css";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { STORAGE_KEY } from "../lib/theme";

export const metadata = {
  title: "Superbase Design System",
  description: "디자인 시스템 문서 사이트",
};

// Runs before first paint to avoid a flash of the wrong theme (FOUC) for
// users who previously chose dark. ThemeToggle re-syncs after hydration.
const themeInitScript = `try{if(localStorage.getItem('${STORAGE_KEY}')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUITE@2/fonts/variable/woff2/SUITE-Variable.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SiteHeader />
        <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", padding: "var(--spacing-8)", width: "100%" }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
