import type { ReactNode } from "react";
import styles from "./ComponentDoc.module.css";

export interface ComponentDocProps {
  title: string;
  lead: string;
  children: ReactNode;
}

export function ComponentDoc({ title, lead, children }: ComponentDocProps) {
  return (
    <article>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
      {children}
    </article>
  );
}
