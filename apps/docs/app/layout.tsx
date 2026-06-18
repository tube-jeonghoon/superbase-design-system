import type { ReactNode } from "react";
import "@superbase/tokens/css";
import "@superbase/react/styles.css";
import "./globals.css";
import { AppShell } from "../components/AppShell";

export const metadata = {
  title: "Superbase Design System",
  description: "디자인 시스템 문서 사이트",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
