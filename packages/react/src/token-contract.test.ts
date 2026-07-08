// @vitest-environment node
// 순수 파일시스템 검사라 jsdom이 필요 없다. jsdom에서는 import.meta.url이
// file: URL이 아니라서 fileURLToPath가 던진다.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 토큰 계약 테스트.
 *
 * CSS 커스텀 프로퍼티 오타는 typecheck에도 vitest 렌더 테스트에도 걸리지 않는다.
 * 정의되지 않은 var(--x)는 조용히 무효화되고 색이 사라지거나 상속값으로 바뀔 뿐이다.
 * (실제로 그린 리브랜딩이 primitives에서 `white`를 지웠을 때 Button/Badge/Checkbox/
 * Switch가 전부 깨졌는데 turbo 15/15가 통과했다.)
 *
 * 그래서 이 테스트는 컴포넌트가 참조하는 모든 토큰 변수가 @superbase/tokens가
 * 실제로 내보내는 변수인지 대조한다.
 */

const SRC = fileURLToPath(new URL(".", import.meta.url));
const TOKENS_CSS = fileURLToPath(
  new URL("../../tokens/dist/web/variables.css", import.meta.url),
);

/** tokens가 실제로 선언하는 변수 이름 집합 (`--color-brand-primary: #1d9e6b;`) */
function declaredTokens(): Set<string> {
  const css = readFileSync(TOKENS_CSS, "utf8");
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
}

/** src 하위의 모든 스타일 소스 (.module.css + 인라인 var()를 쓰는 .tsx) */
function styleSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...styleSources(path));
    else if (/\.module\.css$/.test(entry.name)) out.push(path);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

/**
 * 폴백 없는 var(--x) 참조만 수집한다.
 * `var(--spinner-color, var(--color-brand-primary))`처럼 폴백이 있는 변수는
 * 런타임(인라인 style)에 주입되는 값이라 tokens에 없어도 정상이다.
 */
function referencedTokens(file: string): string[] {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => m[1]);
}

describe("토큰 계약", () => {
  const declared = declaredTokens();
  const files = styleSources(SRC);

  it("tokens dist에서 변수를 읽어온다 (경로 회귀 방지)", () => {
    expect(declared.size).toBeGreaterThan(20);
    expect(declared.has("--color-brand-primary")).toBe(true);
  });

  it("컴포넌트가 참조하는 모든 var(--x)가 tokens에 정의돼 있다", () => {
    const undefinedRefs: string[] = [];
    for (const file of files) {
      for (const name of referencedTokens(file)) {
        if (!declared.has(name)) {
          undefinedRefs.push(`${file.replace(SRC, "src/")}: ${name}`);
        }
      }
    }
    expect(undefinedRefs).toEqual([]);
  });
});
