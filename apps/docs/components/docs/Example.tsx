import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import styles from "./Example.module.css";

export interface ExampleProps {
  title?: string;
  description?: ReactNode;
  code: string;
  children: ReactNode;
}

export function Example({ title, description, code, children }: ExampleProps) {
  return (
    <section className={styles.example}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {description ? <p className={styles.desc}>{description}</p> : null}
      <div className={styles.canvas}>{children}</div>
      <div className={styles.codeGap}>
        <CodeBlock code={code} />
      </div>
    </section>
  );
}
