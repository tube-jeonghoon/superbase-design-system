import StyleDictionary from "style-dictionary";
StyleDictionary.registerTransform({
  name: "size/px-to-number",
  type: "value",
  transitive: true,
  filter: (token) =>
    typeof token.value === "string" && /^-?\d*\.?\d+px$/.test(token.value),
  transform: (token) => parseFloat(token.value),
});
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { lightConfig, darkConfig } from "./style-dictionary.config.mjs";
import { shadowCssLines, shadowNativeObject } from "./src/shadows.mjs";

const DIST = process.env.TOKENS_DIST || "dist";

rmSync(DIST, { recursive: true, force: true });

// 1) light: web :root + native flat + tokens.light.json
const light = new StyleDictionary(lightConfig);
await light.buildAllPlatforms();
const lightCss = readFileSync(`${DIST}/web/variables.css`, "utf8");
const lightJson = JSON.parse(readFileSync(`${DIST}/native/tokens.light.json`, "utf8"));

// 2) dark: web [data-theme] (overwrites variables.css) + tokens.dark.json
const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();
const darkCss = readFileSync(`${DIST}/web/variables.css`, "utf8");
const darkJson = JSON.parse(readFileSync(`${DIST}/native/tokens.dark.json`, "utf8"));

// 3) shadow :root 블록 주입 후 최종 CSS 작성
const shadowBlock = `:root {\n${shadowCssLines()}\n}`;
writeFileSync(`${DIST}/web/variables.css`, `${lightCss}\n${shadowBlock}\n${darkCss}`);

// 4) RN 테마 객체 조립
writeFileSync(`${DIST}/native/theme.js`, themeModule(buildTheme(lightJson), buildTheme(darkJson)));
writeFileSync(`${DIST}/native/theme.d.ts`, themeDts());

// --- helpers ---

// json/nested leaf 값 변환: "120ms"→120, cubic-bezier(...)→[..], 숫자문자열→number, 그 외 string 유지
function convertLeaf(v) {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return v;
  const s = v.trim();
  const bez = s.match(/^cubic-bezier\(([^)]+)\)$/);
  if (bez) return bez[1].split(",").map((n) => parseFloat(n.trim()));
  if (/^-?\d*\.?\d+ms$/.test(s)) return parseFloat(s);
  if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s);
  return s; // 색(hex/rgba), "-0.02em" 등은 문자열 유지
}

// json/nested 트리에서 leaf 값을 변환값으로 치환한 순수 객체 생성.
// SD의 json/nested 포맷은 토큰을 이미 원시값(string/number)으로 펼쳐 출력하므로
// leaf 판별은 "원시값이면 leaf"로 한다(객체면 그룹 노드 → 재귀).
function strip(node) {
  if (node === null || typeof node !== "object") {
    return convertLeaf(node);
  }
  const out = {};
  for (const [k, child] of Object.entries(node)) out[k] = strip(child);
  return out;
}

// 테마 객체 재구조화: 웹전용 제거, motion 묶기, shadow 주입
function buildTheme(json) {
  const t = strip(json);
  const motion = { duration: t.duration, easing: t.easing };
  delete t.duration;
  delete t.easing;
  delete t.zIndex;
  delete t.focusRing;
  delete t.letterSpacing;
  t.motion = motion;
  t.shadow = shadowNativeObject();
  return t;
}

function themeModule(lightTheme, darkTheme) {
  return (
    "/** Do not edit directly, this file was auto-generated. */\n" +
    `export const lightTheme = ${JSON.stringify(lightTheme, null, 2)};\n\n` +
    `export const darkTheme = ${JSON.stringify(darkTheme, null, 2)};\n`
  );
}

function themeDts() {
  return `/** Do not edit directly, this file was auto-generated. */
export interface Theme {
  color: {
    text: { primary: string; secondary: string; disabled: string };
    background: { default: string; subtle: string; scrim: string };
    brand: { primary: string; pressed: string };
    border: { default: string };
    status: { info: string; success: string; warning: string; danger: string };
  };
  spacing: Record<"0" | "1" | "2" | "3" | "4" | "6" | "8", number>;
  radius: { sm: number; md: number; lg: number; full: number };
  font: {
    size: { caption: number; body: number; title: number; display: number };
    weight: { regular: number; medium: number; bold: number };
  };
  lineHeight: { caption: number; body: number; title: number; display: number };
  borderWidth: { thin: number; medium: number };
  opacity: { disabled: number; pressed: number };
  motion: {
    duration: { fast: number; base: number; slow: number };
    easing: {
      standard: [number, number, number, number];
      decelerate: [number, number, number, number];
      accelerate: [number, number, number, number];
    };
  };
  shadow: Record<"sm" | "md" | "lg" | "xl", {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  }>;
  size: {
    control: number;
    controlSm: number;
    field: number;
    fieldSm: number;
    fieldLg: number;
    button: { sm: number; md: number; lg: number };
    switch: { width: number; height: number; thumb: number };
    switchSm: { width: number; height: number; thumb: number };
    icon: { xs: number; sm: number; md: number; lg: number };
    avatar: { sm: number; md: number; lg: number };
    modal: { sm: number; md: number; lg: number };
  };
}
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export type ColorScheme = "light" | "dark";
`;
}
