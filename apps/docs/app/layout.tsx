import type { ReactNode } from "react";
import "@superbase/tokens/css";
import "@superbase/react/styles.css";
import "./globals.css";
import { AppShell } from "../components/AppShell";
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
