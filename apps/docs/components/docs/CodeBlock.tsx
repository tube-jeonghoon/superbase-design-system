"use client";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import styles from "./CodeBlock.module.css";

export interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <span>CODE</span>
        <button
          type="button"
          className={styles.copy}
          onClick={copy}
          aria-label={copied ? "코드 복사됨" : "코드 복사"}
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre className={styles.pre} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
